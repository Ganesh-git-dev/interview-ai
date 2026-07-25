import json
import re
import logging
from google import genai
from google.genai import types
from app.core.config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


DEFAULT_GEN_CONFIG = types.GenerateContentConfig(
    temperature=0.3,
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
)


class GeminiClient:
    """Wrapper for Google Gemini API calls with robust JSON handling."""

    def __init__(self, model: str = None):
        self.model_name = model or settings.GEMINI_MODEL_FAST

    async def generate_content(self, prompt: str, system_instruction: str = None) -> str:
        try:
            config = types.GenerateContentConfig(
                temperature=DEFAULT_GEN_CONFIG.temperature,
                top_p=DEFAULT_GEN_CONFIG.top_p,
                top_k=DEFAULT_GEN_CONFIG.top_k,
                max_output_tokens=DEFAULT_GEN_CONFIG.max_output_tokens,
            )
            if system_instruction:
                config.system_instruction = system_instruction

            client = _get_client()
            response = await client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return response.text
        except Exception as e:
            logger.error("Gemini API error: %s", e)
            raise Exception(f"Gemini API error: {e}") from e

    async def generate_json(self, prompt: str, system_instruction: str = None) -> dict | list:
        json_instruction = (system_instruction or "") + (
            "\n\nCRITICAL: Respond ONLY with valid JSON. "
            "No markdown code fences, no explanation, no preamble, no trailing text. "
            "The very first character of your response must be '{' or '['."
        )
        raw = await self.generate_content(prompt, json_instruction)
        return _parse_json(raw)


def _parse_json(raw: str) -> dict | list:
    """Robustly extract JSON from Gemini response, handling markdown wraps and partial text."""
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
    raise json.JSONDecodeError("Could not extract valid JSON from Gemini response", raw, 0)


fast_client = GeminiClient(settings.GEMINI_MODEL_FAST)
pro_client = GeminiClient(settings.GEMINI_MODEL_PRO)
