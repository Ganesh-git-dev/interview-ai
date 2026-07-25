from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session as InterviewSession
from app.models.question import Question
from app.schemas.session import SessionCreate, SessionResponse, SessionListResponse
from app.schemas.question import QuestionResponse, QuestionListResponse
from app.services.jd_parser import JDParserService
from app.services.question_generator import QuestionGeneratorService

router = APIRouter(prefix="/api/session", tags=["Interview Session"])


@router.post("/create", response_model=SessionResponse)
async def create_session(
    request: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview session with a job description."""
    # Parse the JD
    parser = JDParserService()
    jd_parsed = await parser.parse(request.jd_text)

    # Create session
    session = InterviewSession(
        user_id=current_user.id,
        jd_text=request.jd_text,
        jd_parsed=jd_parsed.model_dump(),
        status="created"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/list", response_model=SessionListResponse)
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all sessions for current user."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    return SessionListResponse(sessions=sessions, total=len(sessions))


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get session details."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.post("/{session_id}/start", response_model=QuestionListResponse)
async def start_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start interview and generate questions."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "created":
        raise HTTPException(status_code=400, detail="Session already started")

    # Generate questions
    generator = QuestionGeneratorService()
    questions = await generator.generate(
        jd_parsed=session.jd_parsed,
        session_id=session.id
    )

    # Save questions to DB
    for i, q in enumerate(questions):
        db_question = Question(
            session_id=session.id,
            question_text=q["text"],
            question_type=q["type"],
            domain=q["domain"],
            order_num=i + 1
        )
        db.add(db_question)

    # Update session status
    session.status = "active"
    db.commit()

    # Return questions
    db_questions = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.order_num).all()

    return QuestionListResponse(
        questions=[QuestionResponse.model_validate(q) for q in db_questions],
        total=len(db_questions),
        current_index=0
    )


@router.get("/{session_id}/questions", response_model=QuestionListResponse)
def get_questions(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all questions for a session."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.order_num).all()

    return QuestionListResponse(
        questions=[QuestionResponse.model_validate(q) for q in questions],
        total=len(questions),
        current_index=0
    )


@router.get("/{session_id}/current-question")
def get_current_question(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current question (next unanswered)."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Find first unanswered question
    questions = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.order_num).all()

    from app.models.answer import Answer
    for q in questions:
        answer = db.query(Answer).filter(Answer.question_id == q.id).first()
        if not answer:
            return QuestionResponse.model_validate(q)

    # All questions answered
    return {"message": "All questions answered", "completed": True}
