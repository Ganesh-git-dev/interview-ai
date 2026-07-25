from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String)  # technical/scenario/behavioural/lab
    domain = Column(String)  # cybersecurity domain
    order_num = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("Session", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False)
