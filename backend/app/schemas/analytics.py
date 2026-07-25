from pydantic import BaseModel
from typing import Optional


class AnalyticsResponse(BaseModel):
    confidence_score: float
    filler_words_count: int
    avg_response_length: float
    keyword_coverage: dict
    domain_scores: dict
    role_readiness: dict

    class Config:
        from_attributes = True


class ConfidenceResponse(BaseModel):
    score: float
    factors: dict


class KeywordCoverageResponse(BaseModel):
    required_skills: list[dict]  # [{skill: str, covered: bool}]


class RoleReadinessResponse(BaseModel):
    roles: list[dict]  # [{role: str, percentage: float, status: str}]


class RecommendationResponse(BaseModel):
    lab_name: str
    lab_domain: str
    priority: str
    reason: str
    estimated_hours: float

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    session_id: int
    overall_score: float
    recommendation: str
    technical_average: float
    communication_average: float
    strengths: list[str]
    gaps: list[str]
    domain_scores: dict
    role_readiness: dict
    recommendations: list[RecommendationResponse]
    answers: list[AnswerFeedback]
