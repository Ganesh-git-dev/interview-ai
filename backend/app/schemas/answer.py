from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AnswerSubmit(BaseModel):
    question_id: int
    transcription: str


class AnswerFeedback(BaseModel):
    id: int
    question_id: int
    transcription: str
    technical_score: float
    completeness_score: float
    communication_score: float
    overall_score: float
    strengths: list[str]
    gaps: list[str]
    model_answer_concepts: list[str]
    feedback_text: str

    model_config = ConfigDict(from_attributes=True)


class AnswerEvaluationRequest(BaseModel):
    answer_id: int
