from app.services.gemini_client import pro_client
from app.prompts.question_generator import QUESTION_GENERATOR_SYSTEM, QUESTION_GENERATOR_PROMPT


class QuestionGeneratorService:
    """Service for generating interview questions based on JD."""

    async def generate(self, jd_parsed: dict, session_id: int) -> list[dict]:
        """Generate tailored interview questions."""
        prompt = QUESTION_GENERATOR_PROMPT.format(
            role_title=jd_parsed.get("role_title", "Cybersecurity Professional"),
            seniority_level=jd_parsed.get("seniority_level", "Mid"),
            required_skills=", ".join(jd_parsed.get("required_skills", [])),
            domain_focus=", ".join(jd_parsed.get("domain_focus", [])),
            responsibilities=", ".join(jd_parsed.get("responsibilities", [])[:5])
        )

        result = await pro_client.generate_json(
            prompt=prompt,
            system_instruction=QUESTION_GENERATOR_SYSTEM
        )

        # Ensure we have a list of questions
        if isinstance(result, list):
            questions = result
        elif isinstance(result, dict) and "questions" in result:
            questions = result["questions"]
        else:
            questions = [result]

        # Ensure minimum questions
        while len(questions) < 6:
            questions.append({
                "text": "Tell me about your experience with cybersecurity tools and methodologies.",
                "type": "technical",
                "domain": "General",
                "difficulty": "medium",
                "follow_up_hint": "Can you give a specific example?"
            })

        return questions[:10]  # Max 10 questions
