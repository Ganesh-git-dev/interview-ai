from pydantic import BaseModel
from typing import Optional


class JDParseRequest(BaseModel):
    jd_text: str


class JDParsedResponse(BaseModel):
    role_title: str
    seniority_level: str
    required_skills: list[str]
    preferred_certifications: list[str]
    domain_focus: list[str]
    responsibilities: list[str]
    experience_years: Optional[str] = None
