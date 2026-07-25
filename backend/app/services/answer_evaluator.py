import logging
import asyncio
from app.services.gemini_client import pro_client, fast_client
from app.prompts.technical_evaluator import TECHNICAL_EVALUATOR_SYSTEM, TECHNICAL_EVALUATOR_PROMPT
from app.prompts.communication_coach import COMMUNICATION_COACH_SYSTEM, COMMUNICATION_COACH_PROMPT
from app.prompts.star_coach import STAR_COACH_SYSTEM, STAR_COACH_PROMPT

logger = logging.getLogger(__name__)


class AnswerEvaluatorService:
    """Service for evaluating interview answers using multiple AI agents concurrently."""

    async def evaluate(
        self,
        question_text: str,
        question_type: str,
        domain: str,
        transcription: str,
        jd_parsed: dict,
    ) -> dict:
        required_skills = ", ".join(jd_parsed.get("required_skills", []))

        tech_prompt = TECHNICAL_EVALUATOR_PROMPT.format(
            question_text=question_text,
            question_type=question_type,
            domain=domain,
            transcription=transcription,
            required_skills=required_skills,
        )

        comm_prompt = COMMUNICATION_COACH_PROMPT.format(
            question_text=question_text,
            transcription=transcription,
        )

        tech_coro = pro_client.generate_json(
            prompt=tech_prompt,
            system_instruction=TECHNICAL_EVALUATOR_SYSTEM,
        )

        comm_coro = fast_client.generate_json(
            prompt=comm_prompt,
            system_instruction=COMMUNICATION_COACH_SYSTEM,
        )

        if question_type == "behavioural":
            star_prompt = STAR_COACH_PROMPT.format(
                question_text=question_text,
                transcription=transcription,
            )
            star_coro = fast_client.generate_json(
                prompt=star_prompt,
                system_instruction=STAR_COACH_SYSTEM,
            )
            tech_result, comm_result, star_result = await asyncio.gather(
                tech_coro, comm_coro, star_coro
            )
        else:
            tech_result, comm_result = await asyncio.gather(tech_coro, comm_coro)
            star_result = None

        technical_score = tech_result.get("overall_score", 70) if isinstance(tech_result, dict) else 70
        completeness_score = tech_result.get("completeness_score", 70) if isinstance(tech_result, dict) else 70
        communication_score = comm_result.get("communication_score", 70) if isinstance(comm_result, dict) else 70

        if question_type == "behavioural" and star_result and isinstance(star_result, dict):
            star_score = star_result.get("star_score", 70)
            overall_score = (
                technical_score * 0.30
                + completeness_score * 0.20
                + communication_score * 0.20
                + star_score * 0.30
            )
        else:
            overall_score = (
                technical_score * 0.40
                + completeness_score * 0.30
                + communication_score * 0.30
            )

        strengths = []
        gaps = []
        if isinstance(tech_result, dict):
            strengths.extend(tech_result.get("strengths", []))
            gaps.extend(tech_result.get("gaps", []))
        if isinstance(comm_result, dict):
            strengths.extend(comm_result.get("communication_strengths", []))
            gaps.extend(comm_result.get("communication_improvements", []))

        feedback_text = ""
        if isinstance(tech_result, dict):
            feedback_text = tech_result.get("feedback_text", "")
        if isinstance(comm_result, dict) and comm_result.get("communication_strengths"):
            feedback_text += f"\n\nCommunication: {', '.join(comm_result['communication_strengths'])}"
        if isinstance(star_result, dict) and star_result.get("star_feedback"):
            feedback_text += f"\n\nSTAR Structure: {star_result['star_feedback']}"

        return {
            "technical_score": round(technical_score, 1),
            "completeness_score": round(completeness_score, 1),
            "communication_score": round(communication_score, 1),
            "overall_score": round(overall_score, 1),
            "strengths": strengths[:5],
            "gaps": gaps[:5],
            "model_answer_concepts": (tech_result.get("model_answer_concepts", []) if isinstance(tech_result, dict) else []),
            "feedback_text": feedback_text.strip(),
            "star_analysis": star_result,
        }
