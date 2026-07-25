from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.answer import AnswerFeedback


class AnalyticsResponse(BaseModel):
    confidence_score: float
    filler_words_count: int
    avg_response_length: float
    keyword_coverage: dict
    domain_scores: dict
    role_readiness: dict

    model_config = ConfigDict(from_attributes=True)


class ConfidenceResponse(BaseModel):
    score: float
    factors: dict


class KeywordCoverageResponse(BaseModel):
    required_skills: list[dict]


class RoleReadinessResponse(BaseModel):
    roles: list[dict]


class RecommendationResponse(BaseModel):
    lab_name: str
    lab_domain: str
    priority: str
    reason: str
    estimated_hours: float

    model_config = ConfigDict(from_attributes=True)


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
