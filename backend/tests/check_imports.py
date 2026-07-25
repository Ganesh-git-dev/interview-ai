import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.services.gemini_client import fast_client, pro_client, GeminiClient, _parse_json
from app.prompts.jd_analyzer import JD_ANALYZER_SYSTEM, JD_ANALYZER_PROMPT
from app.prompts.question_generator import QUESTION_GENERATOR_SYSTEM, QUESTION_GENERATOR_PROMPT
from app.prompts.technical_evaluator import TECHNICAL_EVALUATOR_SYSTEM, TECHNICAL_EVALUATOR_PROMPT
from app.prompts.communication_coach import COMMUNICATION_COACH_SYSTEM, COMMUNICATION_COACH_PROMPT
from app.prompts.star_coach import STAR_COACH_SYSTEM, STAR_COACH_PROMPT
from app.prompts.learning_path import LEARNING_PATH_SYSTEM, LEARNING_PATH_PROMPT
from app.services.jd_parser import JDParserService
from app.services.question_generator import QuestionGeneratorService
from app.services.answer_evaluator import AnswerEvaluatorService

print("All imports successful!")
print(f"Fast model: {fast_client.model_name}")
print(f"Pro model: {pro_client.model_name}")

# Test JSON parser
test1 = _parse_json('{"a": 1}')
assert test1 == {"a": 1}, f"Direct parse failed: {test1}"

test2 = _parse_json('```json\n{"b": 2}\n```')
assert test2 == {"b": 2}, f"Fence parse failed: {test2}"

test3 = _parse_json('Here is the result: {"c": 3} hope this helps')
assert test3 == {"c": 3}, f"Inline parse failed: {test3}"

test4 = _parse_json('[{"id": 1}, {"id": 2}]')
assert test4 == [{"id": 1}, {"id": 2}], f"Array parse failed: {test4}"

print("JSON parser tests passed!")
print("ALL CHECKS PASSED")
