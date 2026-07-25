from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    confidence_score = Column(Float)
    filler_words_count = Column(Integer)
    avg_response_length = Column(Float)
    keyword_coverage = Column(JSON)  # {skill: covered/not_covered}
    domain_scores = Column(JSON)  # {domain: score}
    role_readiness = Column(JSON)  # {role: percentage}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("Session", back_populates="analytics")
