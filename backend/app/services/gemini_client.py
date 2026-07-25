import json
import re
import logging
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)

_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


class GeminiClient:
    """Wrapper for LLM API calls with robust JSON handling. Uses Groq backend."""

    def __init__(self, model: str = None):
        self.model_name = model or settings.GROQ_MODEL_FAST

    async def generate_content(self, prompt: str, system_instruction: str = None) -> str:
        try:
            client = _get_client()
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            response = await client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.3,
                top_p=0.95,
                max_tokens=8192,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error("LLM API error: %s", e)
            raise Exception(f"LLM API error: {e}") from e

    async def generate_json(self, prompt: str, system_instruction: str = None) -> dict | list:
        json_instruction = (system_instruction or "") + (
            "\n\nCRITICAL: Respond ONLY with valid JSON. "
            "No markdown code fences, no explanation, no preamble, no trailing text. "
            "The very first character of your response must be '{' or '['."
        )
        raw = await self.generate_content(prompt, json_instruction)
        return _parse_json(raw)


def _parse_json(raw: str) -> dict | list:
    """Robustly extract JSON from LLM response, handling markdown wraps and partial text."""
    cleaned = raw.strip()

    fence_re = re.compile(r"^```(?:json)?\s*\n?", re.IGNORECASE)
    cleaned = fence_re.sub("", cleaned)
    end_fence = re.compile(r"\n?```\s*$")
    cleaned = end_fence.sub("", cleaned)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    first_brace = cleaned.find("{")
    first_bracket = cleaned.find("[")

    start = -1
    if first_brace >= 0 and first_bracket >= 0:
        start = min(first_brace, first_bracket)
    elif first_brace >= 0:
        start = first_brace
    elif first_bracket >= 0:
        start = first_bracket

    if start >= 0:
        last_brace = cleaned.rfind("}")
        last_bracket = cleaned.rfind("]")
        end = max(last_brace, last_bracket)
        if end > start:
            candidate = cleaned[start : end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

    logger.error("Failed to parse JSON from response: %.200s", raw)
    raise json.JSONDecodeError("Could not extract valid JSON from LLM response", raw, 0)


fast_client = GeminiClient(settings.GROQ_MODEL_FAST)
pro_client = GeminiClient(settings.GROQ_MODEL_PRO)
