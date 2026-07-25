from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    jd_text: str


class SessionResponse(BaseModel):
    id: int
    jd_text: str
    jd_parsed: Optional[dict] = None
    status: str
    overall_score: Optional[float] = None
    recommendation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]
    total: int
