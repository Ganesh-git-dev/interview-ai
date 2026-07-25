from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session as InterviewSession
from app.schemas.jd import JDParseRequest, JDParsedResponse
from app.services.jd_parser import JDParserService

router = APIRouter(prefix="/api", tags=["JD Parser"])


@router.post("/parse-jd", response_model=JDParsedResponse)
async def parse_job_description(
    request: JDParseRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Parse a job description and extract structured data.
    Returns role title, skills, certifications, domain focus, etc.
    """
    parser = JDParserService()
    parsed = await parser.parse(request.jd_text)
    return parsed


@router.get("/jd/{session_id}")
def get_parsed_jd(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get parsed JD for a specific session."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"jd_parsed": session.jd_parsed}
