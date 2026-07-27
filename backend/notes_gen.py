import json
import logging
import os
import base64
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_slide_image(slide_title: str, bullets: list, key_info: str) -> str | None:
    """Generates an educational presentation slide graphic image using Gemini 3.1 Flash Lite Image model or Imagen fallback."""
    generation_config = {
        'temperature': 1,
        'max_output_tokens': 65536,
        'top_p': 0.95,
        'thinking_level': 'minimal',
        'image_config': {
            'image_size': '1K',
        },
    }

    bullets_text = " • ".join(bullets[:3]) if bullets else ""
    prompt = f"Educational 16:9 presentation slide card graphic. Dark background style. Title: '{slide_title}'. Notes: {bullets_text}. Details: {key_info}. High resolution infographic vector style."

    # Primary: User-specified client.interactions API with gemini-3.1-flash-lite-image
    try:
        if hasattr(client, 'interactions'):
            interaction = client.interactions.create(
                model='models/gemini-3.1-flash-lite-image',
                input=prompt,
                generation_config=generation_config,
                response_modalities=['image', 'text'],
            )
            for step in getattr(interaction, 'steps', []):
                if getattr(step, 'type', None) == 'model_output' and getattr(step, 'content', None):
                    for part in step.content:
                        if getattr(part, 'type', None) == 'image' and hasattr(part, 'data'):
                            b64_data = part.data
                            if isinstance(b64_data, bytes):
                                b64_str = base64.b64encode(b64_data).decode('utf-8')
                            else:
                                b64_str = str(b64_data)
                            return f"data:image/jpeg;base64,{b64_str}"
    except Exception as e:
        logger.warning(f"Interactions API gemini-3.1-flash-lite-image unavailable, falling back: {e}")

    # Fallback 1: client.models.generate_images
    try:
        response = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type='image/jpeg'
            )
        )
        if response.generated_images:
            img_bytes = response.generated_images[0].image.image_bytes
            b64_str = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_str}"
    except Exception as e:
        logger.warning(f"Imagen 3 image generation fallback unavailable: {e}")

    return None

def generate_lesson_notes(concept: dict, prereq_labels: list[str]) -> dict:
    """Uses Gemini to generate slide-by-slide structured study notes for a single concept."""
    prompt = f"""
    You are an expert curriculum designer creating a 4-slide presentation study deck for a student.
    
    Concept Title: {concept['label']}
    Description: {concept.get('description', '')}
    Prerequisites: {', '.join(prereq_labels) if prereq_labels else 'Basic foundations'}
    
    Format the notes into EXACTLY 4 structured presentation slides:
    - Slide 1: Introduction & Key Definitions
    - Slide 2: Core Principles & Formulas
    - Slide 3: Detailed Worked Problem
    - Slide 4: Summary Cheat Sheet & Flashcard Tips
    
    Output strictly valid JSON with no markdown formatting or code blocks:
    {{
      "concept_name": "{concept['label']}",
      "slides": [
        {{
          "slide_number": 1,
          "title": "Introduction & Key Terms",
          "content_bullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
          "key_term": "Important definition or formula to remember"
        }},
        {{
          "slide_number": 2,
          "title": "Core Principles & Formulas",
          "content_bullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
          "formula": "Primary formula or equation"
        }},
        {{
          "slide_number": 3,
          "title": "Step-by-Step Worked Example",
          "content_bullets": ["Problem setup", "Step 1 & 2 execution", "Final answer verification"],
          "worked_code": "Step 1: ... \\nStep 2: ... \\nAnswer: ..."
        }},
        {{
          "slide_number": 4,
          "title": "Summary Cheat Sheet",
          "content_bullets": ["Key takeaway 1", "Key takeaway 2", "Common mistake to avoid"],
          "summary_tip": "One gold nugget exam tip"
        }}
      ]
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
        notes_data = json.loads(json_str)
    except Exception as e:
        logger.error(f"Failed to parse Gemini notes output: {content}")
        raise ValueError("Invalid JSON response from Gemini for notes generation")

    for slide in notes_data.get("slides", []):
        key_info = slide.get("key_term") or slide.get("formula") or slide.get("summary_tip") or ""
        slide["image_url"] = generate_slide_image(slide.get("title", "Lesson Slide"), slide.get("content_bullets", []), key_info)

    return notes_data

def generate_level_notes(level_name: str, concepts: list[dict]) -> dict:
    """Uses Gemini to generate level-by-level presentation study deck covering all concepts in a tier."""
    concept_names = [c['label'] for c in concepts]
    concept_descriptions = [f"{c['label']}: {c.get('description', '')}" for c in concepts]
    
    prompt = f"""
    You are an expert curriculum designer creating a Level Presentation Study Deck for {level_name}.
    Concepts in this Level: {', '.join(concept_names)}
    
    Detailed Concept Breakdown:
    {chr(10).join(concept_descriptions)}
    
    Create a comprehensive presentation slide deck covering all concepts in this level.
    Format the notes into EXACTLY 5 structured presentation slides:
    - Slide 1: Level Overview & Core Blueprint ({level_name})
    - Slide 2: Key Vocabulary & Fundamental Terms
    - Slide 3: Essential Formulas & Technical Principles
    - Slide 4: Multi-Concept Worked Example & Problem Solving
    - Slide 5: Level Master Cheat Sheet & Exam Prep Summary
    
    Output strictly valid JSON with no markdown formatting or code blocks:
    {{
      "concept_name": "{level_name} Study Deck",
      "slides": [
        {{
          "slide_number": 1,
          "title": "{level_name} Overview & Blueprint",
          "content_bullets": ["Core scope of this level", "Why these concepts link together", "Target learning goals"],
          "key_term": "Primary objective of {level_name}"
        }},
        {{
          "slide_number": 2,
          "title": "Key Terminology & Definitions",
          "content_bullets": ["Essential definition 1", "Essential definition 2", "Essential definition 3"],
          "key_term": "Crucial glossary term"
        }},
        {{
          "slide_number": 3,
          "title": "Core Formulas & Mathematical Frameworks",
          "content_bullets": ["Formula 1 explanation", "Formula 2 breakdown", "Variable definitions"],
          "formula": "Main equation for this level"
        }},
        {{
          "slide_number": 4,
          "title": "Level-Wide Worked Problem",
          "content_bullets": ["Problem statement", "Step-by-step solution derivation", "Verification"],
          "worked_code": "Step 1: Setup... \\nStep 2: Calculate... \\nResult: ..."
        }},
        {{
          "slide_number": 5,
          "title": "{level_name} Master Cheat Sheet",
          "content_bullets": ["Gold nugget takeaway 1", "Gold nugget takeaway 2", "Common trap to avoid"],
          "summary_tip": "Top exam strategy for {level_name}"
        }}
      ]
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
        notes_data = json.loads(json_str)
    except Exception as e:
        logger.error(f"Failed to parse Gemini level notes output: {content}")
        raise ValueError("Invalid JSON response from Gemini for level notes generation")

    for slide in notes_data.get("slides", []):
        key_info = slide.get("key_term") or slide.get("formula") or slide.get("summary_tip") or ""
        slide["image_url"] = generate_slide_image(slide.get("title", "Level Presentation Slide"), slide.get("content_bullets", []), key_info)

    return notes_data
