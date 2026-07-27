import json
import logging
import os
from google import genai

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_question(concept: dict, mastery_level: str, related_concepts: list[str], guided: bool = False) -> dict:
    """Uses Gemini to generate an interactive practice question for a concept."""
    
    guided_instruction = ""
    if guided:
        guided_instruction = """
        This is a GUIDED PRACTICE question. Include a helpful "hint" field with a scaffold, key formula, or step-by-step cue that helps the student apply what they learned without giving away the final answer directly.
        """

    prompt = f"""
    You are an expert tutor creating a practice question for a student.
    
    Concept: {concept['label']}
    Description: {concept.get('description', '')}
    Current Student Mastery Level: {mastery_level}
    Related Prerequisites/Topics: {', '.join(related_concepts) if related_concepts else 'None'}
    {guided_instruction}
    
    CRITICAL INSTRUCTIONS:
    1. DO NOT create multiple-choice questions (e.g., "Which of the following..."). The student will type their answer into a text box.
    2. Make the question DIRECT, self-contained, and explicit. If asking about an equation or property, include the mathematical expressions directly in the prompt.
    3. Adapt difficulty to mastery level ({mastery_level}):
       - novice: fundamental concept, straightforward recall/application
       - developing: multi-step problem, basic application
       - proficient/mastered: advanced application, synthesis, or edge cases
    
    Output strictly valid JSON with no markdown formatting or code blocks:
    {{
      "question": "The complete, self-contained question prompt with explicit equations if applicable",
      "correct_answer": "The expected correct answer or core mathematical expression",
      "explanation": "Clear explanation of how to arrive at the answer",
      "hint": "{'A helpful scaffold hint or formula' if guided else ''}"
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
        logger.error(f"Failed to parse Gemini output: {content}")
        raise ValueError("Invalid JSON response from Gemini")

def evaluate_answer(question_prompt: str, correct_answer: str, student_answer: str) -> dict:
    """Uses Gemini to evaluate an answer AND classify errors (misconception classifier)."""
    prompt = f"""
    Evaluate the student's answer to the practice question below and classify any mistakes.
    
    Question: {question_prompt}
    Expected Answer: {correct_answer}
    Student's Answer: {student_answer}
    
    Guidelines for evaluation:
    - Focus on conceptual correctness and mathematical accuracy.
    - Be flexible with equivalent algebraic expressions (e.g., '3+5=5+3' vs '5+3=3+5').
    - Minor formatting differences or typos are acceptable if mathematical intent is correct.
    
    Misconception Classifier (if incorrect):
    Classify the error_type into EXACTLY ONE of:
    - "careless_slip": Small arithmetic typo or oversight, but student clearly understands the main concept.
    - "conceptual_gap": Fundamental misunderstanding of this concept's core rules or logic.
    - "wrong_prerequisite": Confusion stemming from a prerequisite topic rather than this current concept.
    
    Output strictly valid JSON with no markdown formatting or code blocks:
    {{
      "correct": true or false,
      "explanation": "Clear explanation of why the answer is correct or incorrect",
      "feedback": "Encouraging, constructive feedback for the student",
      "error_type": "careless_slip" | "conceptual_gap" | "wrong_prerequisite"
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
        logger.error(f"Failed to parse Gemini output: {content}")
        raise ValueError("Invalid JSON response from Gemini")
