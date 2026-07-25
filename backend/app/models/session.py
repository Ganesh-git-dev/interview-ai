from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    jd_text = Column(Text, nullable=False)
    jd_parsed = Column(JSON)  # Structured JD data
    status = Column(String, default="created")  # created/active/completed
    overall_score = Column(Float)
    recommendation = Column(String)  # Hire/Consider/Pass
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session", order_by="Question.order_num")
    answers = relationship("Answer", back_populates="session")
    analytics = relationship("Analytics", back_populates="session", uselist=False)
    recommendations = relationship("Recommendation", back_populates="session")
