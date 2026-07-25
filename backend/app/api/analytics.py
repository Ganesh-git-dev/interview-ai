from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session as InterviewSession
from app.models.answer import Answer
from app.models.analytics import Analytics
from app.schemas.analytics import (
    AnalyticsResponse,
    ConfidenceResponse,
    KeywordCoverageResponse,
    RoleReadinessResponse,
)
from app.services.analytics_engine import AnalyticsEngineService

router = APIRouter(prefix="/api/session", tags=["Analytics"])


@router.get("/{session_id}/analytics", response_model=AnalyticsResponse)
def get_analytics(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full analytics for a session."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analytics = db.query(Analytics).filter(Analytics.session_id == session_id).first()
    if not analytics:
        # Generate analytics if not exists
        engine = AnalyticsEngineService()
        analytics = engine.generate(session_id=session_id, db=db)

    return AnalyticsResponse.model_validate(analytics)


@router.get("/{session_id}/confidence", response_model=ConfidenceResponse)
def get_confidence(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get confidence meter data."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db.query(Answer).filter(Answer.session_id == session_id).all()

    # Calculate confidence based on response patterns
    engine = AnalyticsEngineService()
    confidence = engine.calculate_confidence(answers)

    return ConfidenceResponse(**confidence)


@router.get("/{session_id}/keywords", response_model=KeywordCoverageResponse)
def get_keyword_coverage(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get keyword coverage analysis."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db.query(Answer).filter(Answer.session_id == session_id).all()

    engine = AnalyticsEngineService()
    coverage = engine.calculate_keyword_coverage(
        answers=answers,
        jd_parsed=session.jd_parsed
    )

    return KeywordCoverageResponse(required_skills=coverage)


@router.get("/{session_id}/role-readiness", response_model=RoleReadinessResponse)
def get_role_readiness(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get role readiness scores."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db.query(Answer).filter(Answer.session_id == session_id).all()

    engine = AnalyticsEngineService()
    readiness = engine.calculate_role_readiness(
        answers=answers,
        jd_parsed=session.jd_parsed
    )

    return RoleReadinessResponse(roles=readiness)
