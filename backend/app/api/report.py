from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session as InterviewSession
from app.models.answer import Answer
from app.models.analytics import Analytics
from app.models.recommendation import Recommendation
from app.schemas.analytics import ReportResponse, RecommendationResponse
from app.schemas.answer import AnswerFeedback
from app.services.report_generator import ReportGeneratorService
from app.services.analytics_engine import AnalyticsEngineService

router = APIRouter(prefix="/api/session", tags=["Reports"])


@router.get("/{session_id}/report", response_model=ReportResponse)
def get_report(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full report data."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get answers with feedback
    answers = db.query(Answer).filter(Answer.session_id == session_id).all()
    answers_data = [AnswerFeedback.model_validate(a) for a in answers]

    # Calculate averages
    if answers:
        tech_avg = sum(a.technical_score or 0 for a in answers) / len(answers)
        comm_avg = sum(a.communication_score or 0 for a in answers) / len(answers)
        overall_avg = sum(a.overall_score or 0 for a in answers) / len(answers)
    else:
        tech_avg = comm_avg = overall_avg = 0

    # Get or generate analytics
    analytics = db.query(Analytics).filter(Analytics.session_id == session_id).first()
    if not analytics:
        engine = AnalyticsEngineService()
        analytics = engine.generate(session_id=session_id, db=db)

    # Get recommendations
    recommendations = db.query(Recommendation).filter(
        Recommendation.session_id == session_id
    ).all()

    # Determine recommendation
    if overall_avg >= 0.7:
        recommendation = "Hire"
    elif overall_avg >= 0.5:
        recommendation = "Consider"
    else:
        recommendation = "Pass"

    # Aggregate strengths and gaps
    all_strengths = []
    all_gaps = []
    for a in answers:
        if a.strengths:
            all_strengths.extend(a.strengths)
        if a.gaps:
            all_gaps.extend(a.gaps)

    return ReportResponse(
        session_id=session_id,
        overall_score=overall_avg,
        recommendation=recommendation,
        technical_average=tech_avg,
        communication_average=comm_avg,
        strengths=list(set(all_strengths)),
        gaps=list(set(all_gaps)),
        domain_scores=analytics.domain_scores if analytics else {},
        role_readiness=analytics.role_readiness if analytics else {},
        recommendations=[RecommendationResponse.model_validate(r) for r in recommendations],
        answers=answers_data
    )


@router.get("/{session_id}/pdf")
async def download_pdf(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download PDF report."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Generate PDF
    generator = ReportGeneratorService()
    pdf_buffer = await generator.generate_pdf(
        session_id=session_id,
        db=db,
        user=current_user
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=interview-report-{session_id}.pdf"
        }
    )


@router.get("/{session_id}/recommendations")
def get_recommendations(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get PWNDORA lab recommendations."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    recommendations = db.query(Recommendation).filter(
        Recommendation.session_id == session_id
    ).all()

    return [RecommendationResponse.model_validate(r) for r in recommendations]
