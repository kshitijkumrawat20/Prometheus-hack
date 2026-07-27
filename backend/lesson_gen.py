import json
import logging
import os
from google import genai

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_lesson(concept: dict, prereq_labels: list[str], misconception_context: str = None) -> dict:
    """Uses Gemini to generate a concise micro-lesson for a concept."""
    
    reteach_instruction = ""
    if misconception_context:
        reteach_instruction = f"""
        TARGETED RE-TEACHING CONTEXT:
        The student previously struggled with this concept because: "{misconception_context}".
        Be sure to address this specific distinction or mistake directly in the explanation!
        """

    prompt = f"""
    You are an expert adaptive tutor delivering a quick, clear micro-lesson to a student.
    
    Concept: {concept['label']}
    Description: {concept.get('description', '')}
    Prerequisites: {', '.join(prereq_labels) if prereq_labels else 'Basic foundational concepts'}
    {reteach_instruction}
    
    INSTRUCTIONS:
    1. Keep the explanation short (2-4 sentences max). Focus on core intuition.
    2. Provide ONE fully worked example with step-by-step reasoning shown.
    3. Include a short, relatable real-world analogy or visual mental model if helpful.
    
    Output strictly valid JSON with no markdown formatting or code blocks:
    {{
      "explanation": "2-4 sentence core explanation of the concept",
      "worked_example": "Problem statement and step-by-step solution",
      "analogy": "A short, relatable comparison or intuition hook"
    }}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    
    content = response.text
    try:
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        json_str = content[start_idx:end_idx]
        return json.loads(json_str)
    except Exception as e:
        logger.error(f"Failed to parse Gemini lesson output: {content}")
        raise ValueError("Invalid JSON response from Gemini for lesson generation")
