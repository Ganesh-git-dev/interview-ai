from app.services.gemini_client import pro_client, fast_client, _has_api_key
from app.prompts.technical_evaluator import TECHNICAL_EVALUATOR_SYSTEM, TECHNICAL_EVALUATOR_PROMPT
from app.prompts.communication_coach import COMMUNICATION_COACH_SYSTEM, COMMUNICATION_COACH_PROMPT
from app.prompts.star_coach import STAR_COACH_SYSTEM, STAR_COACH_PROMPT


def _mock_evaluate(question_type: str = "technical") -> dict:
    return {
        "technical_score": 75.0,
        "completeness_score": 70.0,
        "communication_score": 80.0,
        "overall_score": 75.0,
        "strengths": ["Good technical knowledge demonstrated", "Clear communication", "Mentioned relevant tools"],
        "gaps": ["Could provide more specific examples", "Consider discussing alternative approaches"],
        "model_answer_concepts": ["SIEM alert triage process", "Log source correlation", "Escalation procedures"],
        "feedback_text": "The candidate demonstrated solid technical understanding. The answer was well-structured and covered key concepts. To improve, consider adding more specific real-world examples and discussing edge cases."
    }


class AnswerEvaluatorService:
    async def evaluate(
        self,
        question_text: str,
        question_type: str,
        domain: str,
        transcription: str,
        jd_parsed: dict
    ) -> dict:
        if not _has_api_key:
            return _mock_evaluate(question_type)

        required_skills = ", ".join(jd_parsed.get("required_skills", []))

        tech_prompt = TECHNICAL_EVALUATOR_PROMPT.format(
            question_text=question_text,
            question_type=question_type,
            domain=domain,
            transcription=transcription,
            required_skills=required_skills
        )

        tech_result = await pro_client.generate_json(
            prompt=tech_prompt,
            system_instruction=TECHNICAL_EVALUATOR_SYSTEM
        )

        comm_prompt = COMMUNICATION_COACH_PROMPT.format(
            question_text=question_text,
            transcription=transcription
        )

        comm_result = await fast_client.generate_json(
            prompt=comm_prompt,
            system_instruction=COMMUNICATION_COACH_SYSTEM
        )

        star_result = None
        if question_type == "behavioural":
            star_prompt = STAR_COACH_PROMPT.format(
                question_text=question_text,
                transcription=transcription
            )
            star_result = await fast_client.generate_json(
                prompt=star_prompt,
                system_instruction=STAR_COACH_SYSTEM
            )

        technical_score = tech_result.get("overall_score", 70)
        completeness_score = tech_result.get("completeness_score", 70)
        communication_score = comm_result.get("communication_score", 70)

        if question_type == "behavioural" and star_result:
            overall_score = (
                technical_score * 0.3 +
                completeness_score * 0.2 +
                communication_score * 0.2 +
                star_result.get("star_score", 70) * 0.3
            )
        else:
            overall_score = (
                technical_score * 0.4 +
                completeness_score * 0.3 +
                communication_score * 0.3
            )

        strengths = tech_result.get("strengths", []) + comm_result.get("communication_strengths", [])
        gaps = tech_result.get("gaps", []) + comm_result.get("communication_improvements", [])

        feedback_text = tech_result.get("feedback_text", "")
        if comm_result.get("communication_strengths"):
            feedback_text += f"\n\nCommunication: {', '.join(comm_result.get('communication_strengths', []))}"

        return {
            "technical_score": technical_score,
            "completeness_score": completeness_score,
            "communication_score": communication_score,
            "overall_score": round(overall_score, 1),
            "strengths": strengths[:5],
            "gaps": gaps[:5],
            "model_answer_concepts": tech_result.get("model_answer_concepts", []),
            "feedback_text": feedback_text
        }
