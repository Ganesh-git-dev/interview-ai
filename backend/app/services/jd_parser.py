from app.services.gemini_client import fast_client, _has_api_key
from app.prompts.jd_analyzer import JD_ANALYZER_SYSTEM, JD_ANALYZER_PROMPT
from app.schemas.jd import JDParsedResponse


def _mock_parse(jd_text: str) -> JDParsedResponse:
    return JDParsedResponse(
        role_title="SOC Analyst",
        seniority_level="Mid",
        required_skills=["Splunk", "Log Analysis", "Incident Response", "MITRE ATT&CK", "SIEM"],
        preferred_certifications=["CEH", "CompTIA Security+"],
        domain_focus=["SOC/SIEM", "Threat Detection"],
        responsibilities=[
            "Monitor SIEM dashboards for security events",
            "Investigate and triage security alerts",
            "Perform log analysis and threat hunting",
            "Document incident response procedures",
            "Collaborate with threat intelligence teams"
        ],
        experience_years="2-3 years"
    )


class JDParserService:
    async def parse(self, jd_text: str) -> JDParsedResponse:
        if not _has_api_key:
            return _mock_parse(jd_text)

        prompt = JD_ANALYZER_PROMPT.format(jd_text=jd_text)
        result = await fast_client.generate_json(
            prompt=prompt,
            system_instruction=JD_ANALYZER_SYSTEM
        )

        return JDParsedResponse(
            role_title=result.get("role_title", "Cybersecurity Professional"),
            seniority_level=result.get("seniority_level", "Mid"),
            required_skills=result.get("required_skills", []),
            preferred_certifications=result.get("preferred_certifications", []),
            domain_focus=result.get("domain_focus", []),
            responsibilities=result.get("responsibilities", []),
            experience_years=result.get("experience_years")
        )
