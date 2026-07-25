import re
from sqlalchemy.orm import Session
from app.models.analytics import Analytics
from app.models.recommendation import Recommendation
from app.models.answer import Answer

HESITATION_WORDS = ["um", "uh", "like", "you know", "basically", "actually"]


class AnalyticsEngineService:
    """Service for generating analytics and insights from interview sessions."""

    def generate(self, session_id: int, db: Session) -> Analytics:
        """Generate analytics for a session."""
        answers = db.query(Answer).filter(Answer.session_id == session_id).all()

        if not answers:
            return None

        # Calculate confidence
        confidence_data = self.calculate_confidence(answers)

        # Calculate keyword coverage
        from app.models.session import Session as InterviewSession
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        keyword_data = self.calculate_keyword_coverage(answers, session.jd_parsed if session else {})

        # Calculate domain scores
        domain_scores = self.calculate_domain_scores(answers)

        # Calculate role readiness
        readiness_list = self.calculate_role_readiness(answers, session.jd_parsed if session else {})
        readiness_dict = {item["role"]: item["percentage"] for item in readiness_list}

        # Create analytics record
        analytics = Analytics(
            session_id=session_id,
            confidence_score=confidence_data["score"],
            filler_words_count=confidence_data.get("filler_words_count", 0),
            avg_response_length=confidence_data.get("avg_response_length", 0),
            keyword_coverage={item["skill"]: item["covered"] for item in keyword_data},
            domain_scores=domain_scores,
            role_readiness=readiness_dict
        )

        db.add(analytics)

        # Generate PWNDORA recommendations
        self.generate_recommendations(session_id, domain_scores, session.jd_parsed if session else {}, db)

        db.commit()
        db.refresh(analytics)

        return analytics

    def calculate_confidence(self, answers: list[Answer]) -> dict:
        """Calculate confidence score based on response patterns."""
        if not answers:
            return {"score": 0, "factors": {}}

        # Analyze response patterns
        total_length = 0
        filler_count = 0
        hesitation_words = HESITATION_WORDS

        for answer in answers:
            if answer.transcription:
                text = answer.transcription.lower()
                total_length += len(text.split())

                # Count filler words
                for filler in hesitation_words:
                    filler_count += text.count(filler)

        avg_length = total_length / len(answers) if answers else 0

        # Calculate confidence based on factors
        length_score = min(100, (avg_length / 50) * 100)  # 50 words = 100%
        filler_penalty = min(30, filler_count * 3)  # Max 30% penalty
        score_consistency = self._calculate_score_consistency(answers)

        confidence_score = max(0, min(100,
            (length_score * 0.3 + score_consistency * 0.7) - filler_penalty
        ))

        return {
            "score": round(confidence_score, 1),
            "factors": {
                "avg_response_length": avg_length,
                "filler_words_count": filler_count,
                "score_consistency": score_consistency
            }
        }

    def _calculate_score_consistency(self, answers: list[Answer]) -> float:
        """Calculate how consistent scores are across answers."""
        scores = [a.overall_score for a in answers if a.overall_score is not None]
        if not scores:
            return 50

        avg = sum(scores) / len(scores)
        variance = sum((s - avg) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5

        # Lower std dev = higher consistency
        consistency = max(0, 100 - (std_dev * 2))
        return consistency

    def calculate_keyword_coverage(self, answers: list[Answer], jd_parsed: dict) -> list[dict]:
        """Calculate keyword coverage from answers vs required skills."""
        required_skills = jd_parsed.get("required_skills", [])

        if not required_skills:
            return []

        # Combine all transcriptions
        all_text = " ".join([a.transcription.lower() for a in answers if a.transcription])

        coverage = []
        for skill in required_skills:
            skill_lower = skill.lower()
            # Check if skill is mentioned
            covered = skill_lower in all_text or any(
                word in all_text for word in skill_lower.split()
            )
            coverage.append({
                "skill": skill,
                "covered": covered
            })

        return coverage

    def calculate_domain_scores(self, answers: list[Answer]) -> dict:
        """Calculate scores by domain."""
        domain_scores = {}

        for answer in answers:
            if answer.question and answer.question.domain:
                domain = answer.question.domain
                if domain not in domain_scores:
                    domain_scores[domain] = []
                domain_scores[domain].append(answer.overall_score or 0)

        # Average scores per domain
        return {
            domain: round(sum(scores) / len(scores), 1)
            for domain, scores in domain_scores.items()
        }

    def calculate_role_readiness(self, answers: list[Answer], jd_parsed: dict) -> list[dict]:
        """Calculate role readiness based on performance."""
        domain_scores = self.calculate_domain_scores(answers)

        # Define role requirements
        roles = [
            {
                "role": "SOC Analyst",
                "required_domains": ["SOC/SIEM", "Log Analysis", "Threat Detection"]
            },
            {
                "role": "Penetration Tester",
                "required_domains": ["Web Security", "Network Security", "Exploitation"]
            },
            {
                "role": "DFIR Analyst",
                "required_domains": ["DFIR", "Memory Forensics", "Incident Response"]
            },
            {
                "role": "Threat Hunter",
                "required_domains": ["Threat Hunting", "IOC Analysis", "Behavioral Analysis"]
            }
        ]

        readiness = []
        for role_info in roles:
            # Calculate average score for required domains
            relevant_scores = []
            for domain in role_info["required_domains"]:
                for key, score in domain_scores.items():
                    if domain.lower() in key.lower():
                        relevant_scores.append(score)

            if relevant_scores:
                percentage = round(sum(relevant_scores) / len(relevant_scores))
            else:
                percentage = 50  # Default if no relevant data

            status = "Ready" if percentage >= 70 else "Needs Practice" if percentage >= 50 else "Significant Gaps"

            readiness.append({
                "role": role_info["role"],
                "percentage": percentage,
                "status": status
            })

        return readiness

    def generate_recommendations(
        self,
        session_id: int,
        domain_scores: dict,
        jd_parsed: dict,
        db: Session
    ):
        """Generate PWNDORA lab recommendations."""
        # Find weak domains
        weak_domains = [
            domain for domain, score in domain_scores.items()
            if score < 70
        ]

        # PWNDORA labs mapped to domains
        lab_recommendations = {
            "SOC/SIEM": [
                {"lab": "SIEM Log Analysis Lab", "hours": 3},
                {"lab": "Sigma Rule Writing Lab", "hours": 4},
                {"lab": "Alert Triage Workshop", "hours": 2}
            ],
            "Web Security": [
                {"lab": "SQL Injection Exploitation", "hours": 3},
                {"lab": "XSS Attack & Defense", "hours": 2},
                {"lab": "IDOR Vulnerability Lab", "hours": 2}
            ],
            "DFIR": [
                {"lab": "Memory Forensics with Volatility", "hours": 4},
                {"lab": "Disk Forensics Analysis", "hours": 3},
                {"lab": "Incident Timeline Reconstruction", "hours": 3}
            ],
            "Network Security": [
                {"lab": "Packet Analysis with Wireshark", "hours": 3},
                {"lab": "Network Intrusion Detection", "hours": 4}
            ],
            "Threat Hunting": [
                {"lab": "IOC Analysis Workshop", "hours": 3},
                {"lab": "Behavioral Threat Detection", "hours": 4}
            ],
            "Malware Analysis": [
                {"lab": "Static Malware Analysis", "hours": 4},
                {"lab": "Dynamic Analysis Sandbox", "hours": 3}
            ]
        }

        # Generate recommendations based on weak areas
        recommendations = []
        for domain in weak_domains[:3]:  # Top 3 weak areas
            if domain in lab_recommendations:
                for lab_info in lab_recommendations[domain][:2]:
                    rec = Recommendation(
                        session_id=session_id,
                        lab_name=lab_info["lab"],
                        lab_domain=domain,
                        priority="high",
                        reason=f"Improve skills in {domain}",
                        estimated_hours=lab_info["hours"]
                    )
                    db.add(rec)
                    recommendations.append(rec)

        # Add role-specific recommendations
        role = jd_parsed.get("role_title", "")
        if "SOC" in role or "Security Operations" in role:
            rec = Recommendation(
                session_id=session_id,
                lab_name="SOC Analyst Bootcamp",
                lab_domain="SOC/SIEM",
                priority="high",
                reason="Role-specific skill development",
                estimated_hours=8
            )
            db.add(rec)

        return recommendations
