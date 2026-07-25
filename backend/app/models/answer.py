from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    transcription = Column(Text)  # Raw speech transcription
    technical_score = Column(Float)
    completeness_score = Column(Float)
    communication_score = Column(Float)
    overall_score = Column(Float)
    strengths = Column(JSON)  # JSON array
    gaps = Column(JSON)  # JSON array
    model_answer_concepts = Column(JSON)  # JSON array
    feedback_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    question = relationship("Question", back_populates="answer")
    session = relationship("Session", back_populates="answers")
