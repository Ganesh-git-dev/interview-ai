import google.generativeai as genai
from app.core.config import get_settings

settings = get_settings()

# Validate API key
if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
    import warnings
    warnings.warn("GEMINI_API_KEY is not set. AI features will fail.")

# Configure Gemini
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiClient:
    """Wrapper for Google Gemini API calls."""

    def __init__(self, model: str = None):
        self.model_name = model or settings.GEMINI_MODEL_FAST
        self.model = genai.GenerativeModel(self.model_name)

    async def generate_content(self, prompt: str, system_instruction: str = None) -> str:
        """Generate content with optional system instruction."""
        try:
            if system_instruction:
                model = genai.GenerativeModel(
                    self.model_name,
                    system_instruction=system_instruction
                )
            else:
                model = self.model

            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    async def generate_json(self, prompt: str, system_instruction: str = None) -> dict:
        """Generate JSON response."""
        import json

        json_instruction = (system_instruction or "") + "\n\nRespond ONLY with valid JSON. No markdown, no explanation."
        response = await self.generate_content(prompt, json_instruction)

        # Clean up response
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]

        return json.loads(response.strip())


# Singleton instances
fast_client = GeminiClient(settings.GEMINI_MODEL_FAST)
pro_client = GeminiClient(settings.GEMINI_MODEL_PRO)
