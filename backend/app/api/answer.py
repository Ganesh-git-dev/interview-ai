from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session as InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.schemas.answer import AnswerSubmit, AnswerFeedback
from app.services.answer_evaluator import AnswerEvaluatorService

router = APIRouter(prefix="/api/answer", tags=["Answer Evaluation"])


@router.post("/submit", response_model=AnswerFeedback)
async def submit_answer(
    request: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an answer and get AI evaluation."""
    # Verify question exists and belongs to user's session
    question = db.query(Question).filter(Question.id == request.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    session = db.query(InterviewSession).filter(
        InterviewSession.id == question.session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if answer already exists — update it instead of rejecting
    existing_answer = db.query(Answer).filter(Answer.question_id == request.question_id).first()
    if existing_answer:
        # Re-evaluate with new transcription
        evaluator = AnswerEvaluatorService()
        evaluation = await evaluator.evaluate(
            question_text=question.question_text,
            question_type=question.question_type,
            domain=question.domain,
            transcription=request.transcription,
            jd_parsed=session.jd_parsed
        )
        existing_answer.transcription = request.transcription
        existing_answer.technical_score = evaluation["technical_score"]
        existing_answer.completeness_score = evaluation["completeness_score"]
        existing_answer.communication_score = evaluation["communication_score"]
        existing_answer.overall_score = evaluation["overall_score"]
        existing_answer.strengths = evaluation["strengths"]
        existing_answer.gaps = evaluation["gaps"]
        existing_answer.model_answer_concepts = evaluation["model_answer_concepts"]
        existing_answer.feedback_text = evaluation["feedback_text"]
        db.commit()
        db.refresh(existing_answer)
        return AnswerFeedback.model_validate(existing_answer)

    # Evaluate answer with AI
    evaluator = AnswerEvaluatorService()
    evaluation = await evaluator.evaluate(
        question_text=question.question_text,
        question_type=question.question_type,
        domain=question.domain,
        transcription=request.transcription,
        jd_parsed=session.jd_parsed
    )

    # Save answer
    answer = Answer(
        question_id=request.question_id,
        session_id=session.id,
        transcription=request.transcription,
        technical_score=evaluation["technical_score"],
        completeness_score=evaluation["completeness_score"],
        communication_score=evaluation["communication_score"],
        overall_score=evaluation["overall_score"],
        strengths=evaluation["strengths"],
        gaps=evaluation["gaps"],
        model_answer_concepts=evaluation["model_answer_concepts"],
        feedback_text=evaluation["feedback_text"]
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    # Check if all questions are answered and mark session as completed
    total_questions = db.query(Question).filter(Question.session_id == session.id).count()
    answered_count = db.query(Answer).filter(Answer.session_id == session.id).count()
    if answered_count >= total_questions and session.status != "completed":
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        db.commit()

    return AnswerFeedback.model_validate(answer)


@router.get("/{answer_id}/feedback", response_model=AnswerFeedback)
def get_feedback(
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed feedback for an answer."""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    # Verify ownership
    session = db.query(InterviewSession).filter(
        InterviewSession.id == answer.session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=403, detail="Not authorized")

    return AnswerFeedback.model_validate(answer)
