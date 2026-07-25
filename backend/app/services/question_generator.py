import logging
from app.services.gemini_client import pro_client
from app.prompts.question_generator import QUESTION_GENERATOR_SYSTEM, QUESTION_GENERATOR_PROMPT

logger = logging.getLogger(__name__)

_FALLBACK_QUESTIONS = [
    {"text": "Describe your experience with the primary security tools mentioned in this role.", "type": "technical", "domain": "General", "difficulty": "medium", "follow_up_hint": "Which tool do you use most and why?"},
    {"text": "How do you stay current with the evolving cybersecurity threat landscape?", "type": "behavioural", "domain": "General", "difficulty": "easy", "follow_up_hint": "Can you give a specific example?"},
    {"text": "Walk me through a time you identified and remediated a security vulnerability.", "type": "scenario", "domain": "General", "difficulty": "medium", "follow_up_hint": "What was the business impact?"},
]

_REQUIRED_KEYS = {"text", "type", "domain", "difficulty", "follow_up_hint"}


class QuestionGeneratorService:
    """Service for generating interview questions based on JD."""

    async def generate(self, jd_parsed: dict, session_id: int) -> list[dict]:
        prompt = QUESTION_GENERATOR_PROMPT.format(
            role_title=jd_parsed.get("role_title", "Cybersecurity Professional"),
            seniority_level=jd_parsed.get("seniority_level", "Mid"),
            required_skills=", ".join(jd_parsed.get("required_skills", [])),
            domain_focus=", ".join(jd_parsed.get("domain_focus", [])),
            responsibilities=", ".join(jd_parsed.get("responsibilities", [])[:5]),
        )

        try:
            result = await pro_client.generate_json(
                prompt=prompt,
                system_instruction=QUESTION_GENERATOR_SYSTEM,
            )
        except Exception as e:
            logger.error("Question generation failed: %s", e)
            result = _FALLBACK_QUESTIONS

        questions = result if isinstance(result, list) else result.get("questions", [result]) if isinstance(result, dict) else _FALLBACK_QUESTIONS

        validated = []
        for q in questions:
            if isinstance(q, dict) and _REQUIRED_KEYS.issubset(q.keys()):
                validated.append(q)

        while len(validated) < 6:
            idx = len(validated) % len(_FALLBACK_QUESTIONS)
            validated.append(_FALLBACK_QUESTIONS[idx])

        return validated[:10]
