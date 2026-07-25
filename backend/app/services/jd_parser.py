from app.services.gemini_client import fast_client
from app.prompts.jd_analyzer import JD_ANALYZER_SYSTEM, JD_ANALYZER_PROMPT
from app.schemas.jd import JDParsedResponse


class JDParserService:
    """Service for parsing job descriptions using Gemini AI."""

    async def parse(self, jd_text: str) -> JDParsedResponse:
        if not jd_text or not jd_text.strip():
            raise ValueError("Job description text cannot be empty")

        prompt = JD_ANALYZER_PROMPT.format(jd_text=jd_text.strip())

        result = await fast_client.generate_json(
            prompt=prompt,
            system_instruction=JD_ANALYZER_SYSTEM,
        )

        if isinstance(result, list):
            result = result[0] if result else {}

        return JDParsedResponse(
            role_title=result.get("role_title", "Cybersecurity Professional"),
            seniority_level=result.get("seniority_level", "Mid"),
            required_skills=result.get("required_skills", []),
            preferred_certifications=result.get("preferred_certifications", []),
            domain_focus=result.get("domain_focus", []),
            responsibilities=result.get("responsibilities", []),
            experience_years=result.get("experience_years"),
        )
