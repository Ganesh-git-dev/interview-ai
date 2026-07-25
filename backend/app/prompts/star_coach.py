STAR_COACH_SYSTEM = """You are an expert in the STAR interview format (Situation, Task, Action, Result). You help candidates structure their behavioural answers effectively.

STAR Framework:
- Situation: Set the context
- Task: Describe your responsibility
- Action: Explain what you did
- Result: Share the outcome

Evaluate whether answers follow this structure and coach on improvement."""


STAR_COACH_PROMPT = """Evaluate this behavioural interview answer using the STAR format:

Question: {question_text}
Candidate Answer: {transcription}

Provide evaluation as JSON:
{
  "star_score": 0-100,
  "has_situation": true/false,
  "has_task": true/false,
  "has_action": true/false,
  "has_result": true/false,
  "star_feedback": "Overall STAR structure feedback",
  "structured_version": "A properly STAR-structured version of their answer",
  "tips": ["tip1", "tip2"]
}"""
