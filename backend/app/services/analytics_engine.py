import re
import math
from sqlalchemy.orm import Session
from app.models.analytics import Analytics
from app.models.recommendation import Recommendation
from app.models.answer import Answer


_FILLER_PATTERNS = re.compile(
    r"\b(um|uh|like|you know|basically|actually|so|I mean|sort of|kind of)\b",
    re.IGNORECASE,
)

_HEDGE_PATTERNS = re.compile(
    r"\b(I think|I guess|maybe|probably|I'm not sure|I suppose|might be|could be)\b",
    re.IGNORECASE,
)

_STRONG_PATTERNS = re.compile(
    r"\b(I implemented|I configured|I built|I deployed|I investigated|I led|I designed|I created)\b",
    re.IGNORECASE,
)


class AnalyticsEngineService:
    """Service for generating analytics and insights from interview sessions."""

    def generate(self, session_id: int, db: Session) -> Analytics | None:
        answers = db.query(Answer).filter(Answer.session_id == session_id).all()
        if not answers:
            return None

        from app.models.session import Session as InterviewSession

        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        jd_parsed = session.jd_parsed if session else {}

        confidence_data = self.calculate_confidence(answers)
        keyword_data = self.calculate_keyword_coverage(answers, jd_parsed)
        domain_scores = self.calculate_domain_scores(answers)
        role_readiness = self.calculate_role_readiness(answers, jd_parsed)

        analytics = Analytics(
            session_id=session_id,
            confidence_score=confidence_data["score"],
            filler_words_count=confidence_data.get("filler_words_count", 0),
            avg_response_length=confidence_data.get("avg_response_length", 0),
            keyword_coverage={item["skill"]: item["covered"] for item in keyword_data},
            domain_scores=domain_scores,
            role_readiness={item["role"]: item["percentage"] for item in role_readiness},
        )

        db.add(analytics)
        self.generate_recommendations(session_id, domain_scores, jd_parsed, db)
        db.commit()
        db.refresh(analytics)

        return analytics

    def calculate_confidence(self, answers: list[Answer]) -> dict:
        if not answers:
            return {"score": 0, "factors": {}}

        total_words = 0
        filler_count = 0
        hedge_count = 0
        strong_count = 0

        for answer in answers:
            if answer.transcription:
                text = answer.transcription
                words = text.split()
                total_words += len(words)
                filler_count += len(_FILLER_PATTERNS.findall(text))
                hedge_count += len(_HEDGE_PATTERNS.findall(text))
                strong_count += len(_STRONG_PATTERNS.findall(text))

        avg_length = total_words / len(answers) if answers else 0

        length_score = min(100, (avg_length / 60) * 100)
        filler_penalty = min(25, filler_count * 2.5)
        hedge_penalty = min(15, hedge_count * 3)
        strong_bonus = min(15, strong_count * 3)
        score_consistency = self._calculate_score_consistency(answers)

        confidence_score = max(
            0,
            min(100, (length_score * 0.25 + score_consistency * 0.55 + strong_bonus) - filler_penalty - hedge_penalty),
        )

        return {
            "score": round(confidence_score, 1),
            "filler_words_count": filler_count,
            "avg_response_length": round(avg_length, 1),
            "factors": {
                "avg_response_length": round(avg_length, 1),
                "filler_words_count": filler_count,
                "hedge_words_count": hedge_count,
                "strong_language_count": strong_count,
                "score_consistency": round(score_consistency, 1),
                "length_score": round(length_score, 1),
            },
        }

    def _calculate_score_consistency(self, answers: list[Answer]) -> float:
        scores = [a.overall_score for a in answers if a.overall_score is not None]
        if not scores:
            return 50
        avg = sum(scores) / len(scores)
        variance = sum((s - avg) ** 2 for s in scores) / len(scores)
        std_dev = math.sqrt(variance)
        return max(0, 100 - (std_dev * 2))

    def calculate_keyword_coverage(self, answers: list[Answer], jd_parsed: dict) -> list[dict]:
        required_skills = jd_parsed.get("required_skills", [])
        if not required_skills:
            return []

        all_text = " ".join([a.transcription.lower() for a in answers if a.transcription])

        coverage = []
        for skill in required_skills:
            skill_lower = skill.lower()
            covered = skill_lower in all_text or any(
                word in all_text for word in skill_lower.split() if len(word) > 2
            )
            coverage.append({"skill": skill, "covered": covered})

        return coverage

    def calculate_domain_scores(self, answers: list[Answer]) -> dict:
        domain_scores: dict[str, list[float]] = {}

        for answer in answers:
            if answer.question and answer.question.domain:
                domain = answer.question.domain
                if domain not in domain_scores:
                    domain_scores[domain] = []
                domain_scores[domain].append(answer.overall_score or 0)

        return {
            domain: round(sum(scores) / len(scores), 1)
            for domain, scores in domain_scores.items()
        }

    def calculate_role_readiness(self, answers: list[Answer], jd_parsed: dict) -> list[dict]:
        domain_scores = self.calculate_domain_scores(answers)

        roles = [
            {"role": "SOC Analyst", "required_domains": ["SOC/SIEM", "Log Analysis", "Threat Detection"]},
            {"role": "Penetration Tester", "required_domains": ["Web Security", "Network Security", "Exploitation"]},
            {"role": "DFIR Analyst", "required_domains": ["DFIR", "Memory Forensics", "Incident Response"]},
            {"role": "Threat Hunter", "required_domains": ["Threat Hunting", "IOC Analysis", "Behavioral Analysis"]},
            {"role": "Security Engineer", "required_domains": ["Cloud Security", "Network Security", "Application Security"]},
        ]

        readiness = []
        for role_info in roles:
            relevant_scores = []
            for domain in role_info["required_domains"]:
                for key, score in domain_scores.items():
                    if domain.lower() in key.lower():
                        relevant_scores.append(score)

            percentage = round(sum(relevant_scores) / len(relevant_scores)) if relevant_scores else 50
            status = "Ready" if percentage >= 70 else "Needs Practice" if percentage >= 50 else "Significant Gaps"
            readiness.append({"role": role_info["role"], "percentage": percentage, "status": status})

        return readiness

    def generate_recommendations(self, session_id: int, domain_scores: dict, jd_parsed: dict, db: Session):
        weak_domains = [domain for domain, score in domain_scores.items() if score < 70]

        lab_recommendations = {
            "SOC/SIEM": [
                {"lab": "SIEM Log Analysis Lab", "hours": 3},
                {"lab": "Sigma Rule Writing Lab", "hours": 4},
                {"lab": "Alert Triage Workshop", "hours": 2},
            ],
            "Web Security": [
                {"lab": "SQL Injection Exploitation", "hours": 3},
                {"lab": "XSS Attack & Defense", "hours": 2},
                {"lab": "IDOR Vulnerability Lab", "hours": 2},
            ],
            "DFIR": [
                {"lab": "Memory Forensics with Volatility", "hours": 4},
                {"lab": "Disk Forensics Analysis", "hours": 3},
                {"lab": "Incident Timeline Reconstruction", "hours": 3},
            ],
            "Network Security": [
                {"lab": "Packet Analysis with Wireshark", "hours": 3},
                {"lab": "Network Intrusion Detection", "hours": 4},
            ],
            "Threat Hunting": [
                {"lab": "IOC Analysis Workshop", "hours": 3},
                {"lab": "Behavioral Threat Detection", "hours": 4},
            ],
            "Malware Analysis": [
                {"lab": "Static Malware Analysis", "hours": 4},
                {"lab": "Dynamic Analysis Sandbox", "hours": 3},
            ],
        }

        for domain in weak_domains[:3]:
            if domain in lab_recommendations:
                for lab_info in lab_recommendations[domain][:2]:
                    rec = Recommendation(
                        session_id=session_id,
                        lab_name=lab_info["lab"],
                        lab_domain=domain,
                        priority="high",
                        reason=f"Improve skills in {domain}",
                        estimated_hours=lab_info["hours"],
                    )
                    db.add(rec)

        role = jd_parsed.get("role_title", "")
        if "SOC" in role or "Security Operations" in role:
            rec = Recommendation(
                session_id=session_id,
                lab_name="SOC Analyst Bootcamp",
                lab_domain="SOC/SIEM",
                priority="high",
                reason="Role-specific skill development",
                estimated_hours=8,
            )
            db.add(rec)
