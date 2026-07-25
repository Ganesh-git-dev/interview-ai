from app.services.gemini_client import pro_client, _has_api_key
from app.prompts.question_generator import QUESTION_GENERATOR_SYSTEM, QUESTION_GENERATOR_PROMPT


def _mock_questions(jd_parsed: dict) -> list[dict]:
    role = jd_parsed.get("role_title", "Cybersecurity Professional")
    skills = jd_parsed.get("required_skills", [])
    return [
        {"text": f"Explain how you would use {skills[0] if skills else 'SIEM tools'} to detect a potential data exfiltration attempt.", "type": "technical", "domain": "SOC/SIEM", "difficulty": "medium", "follow_up_hint": "What specific queries would you run?"},
        {"text": f"Walk me through your incident response process when you receive a critical severity alert from {skills[1] if len(skills) > 1 else 'your SIEM'}.", "type": "technical", "domain": "Incident Response", "difficulty": "hard", "follow_up_hint": "How do you prioritize alerts?"},
        {"text": f"How do you stay current with the latest {skills[3] if len(skills) > 3 else 'threat landscape'} techniques and apply them to your detection strategy?", "type": "technical", "domain": "Threat Detection", "difficulty": "medium", "follow_up_hint": "Can you give an example of a recent threat you tracked?"},
        {"text": "A user reports receiving a suspicious email with an unusual attachment. The email passed through your security gateway. Walk me through your investigation process.", "type": "scenario", "domain": "SOC/SIEM", "difficulty": "medium", "follow_up_hint": "What indicators would you look for?"},
        {"text": f"Your SIEM is generating 500+ low-priority alerts per day, causing analyst fatigue. Design a solution to reduce noise while maintaining detection coverage.", "type": "scenario", "domain": "SOC/SIEM", "difficulty": "hard", "follow_up_hint": "How would you validate your changes?"},
        {"text": "Tell me about a time you identified a security incident that others had missed. What was your approach and what was the outcome?", "type": "behavioural", "domain": "Incident Response", "difficulty": "medium", "follow_up_hint": "What tools did you use?"},
        {"text": f"As a {role}, how would you go about setting up a detection rule for a new threat scenario? Walk through your methodology.", "type": "lab", "domain": "Threat Detection", "difficulty": "medium", "follow_up_hint": "How do you test your rules?"},
        {"text": "Describe your experience with log analysis. What tools and techniques do you use to identify patterns in large datasets?", "type": "technical", "domain": "Log Analysis", "difficulty": "easy", "follow_up_hint": "Can you show an example query?"},
    ]


class QuestionGeneratorService:
    async def generate(self, jd_parsed: dict, session_id: int) -> list[dict]:
        if not _has_api_key:
            return _mock_questions(jd_parsed)

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

        if isinstance(result, list):
            questions = result
        elif isinstance(result, dict) and "questions" in result:
            questions = result["questions"]
        else:
            questions = [result]

        while len(questions) < 6:
            questions.append({
                "text": "Tell me about your experience with cybersecurity tools and methodologies.",
                "type": "technical",
                "domain": "General",
                "difficulty": "medium",
                "follow_up_hint": "Can you give a specific example?"
            })

        return questions[:10]
