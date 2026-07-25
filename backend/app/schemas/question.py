from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    domain: str
    order_num: int

    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    questions: list[QuestionResponse]
    total: int
    current_index: int
