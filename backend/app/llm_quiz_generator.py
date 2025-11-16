import os
from dotenv import load_dotenv
from typing import Dict, Any, List
import json

load_dotenv()

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Prompt template for Gemini
PROMPT_TEMPLATE = """You are an AI that generates strictly formatted JSON quizzes based only on the provided Wikipedia content.
Your output must be valid JSON with no markdown formatting or extra text.

Article Summary:
{summary}

Article Sections:
{sections}

Key Entities:
- People: {people}
- Organizations: {organizations}
- Locations: {locations}

Full Article Text:
{article_text}

Generate a quiz with 5-10 multiple choice questions covering the main concepts.
For each question:
- question: The question text
- options: Array of exactly 4 options (A, B, C, D)
- correct_answer: Index 0-3 of the correct option
- explanation: Brief explanation of why the answer is correct
- difficulty: "easy", "medium", or "hard"

Also provide related_topics: list of 3-5 topics the user should read about next.

Return ONLY valid JSON in this exact format:
{{
  "title": "Quiz Title",
  "quiz": [
    {{
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Explanation",
      "difficulty": "medium"
    }}
  ],
  "related_topics": ["Topic 1", "Topic 2", "Topic 3"]
}}"""


def _create_fallback_quiz(title: str) -> Dict[str, Any]:
    """Create a minimal fallback quiz when LLM fails."""
    return {
        "title": f"{title} - Quiz",
        "quiz": [
            {
                "question": "What is the main topic of this article?",
                "options": ["Topic A", "Topic B", "Topic C", "Topic D"],
                "correct_answer": 0,
                "explanation": "This was the best available choice based on the content.",
                "difficulty": "easy"
            },
            {
                "question": "Which of these is relevant to the article?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": 1,
                "explanation": "Based on the article content.",
                "difficulty": "medium"
            }
        ],
        "related_topics": ["Further Reading 1", "Further Reading 2"]
    }


def generate_quiz(
    article_text: str,
    summary: str,
    sections: List[str],
    key_entities: Dict[str, Any],
    article_title: str
) -> Dict[str, Any]:
    """
    Generate a quiz using Gemini LLM or fallback to mock.
    
    Args:
        article_text: Full cleaned article text
        summary: Article summary
        sections: List of section headings
        key_entities: Dict with people, organizations, locations
        article_title: Title of the article
    
    Returns:
        Dict with quiz structure including title, questions, and related topics
    """
    
    if not GEMINI_API_KEY:
        # No API key, use fallback
        return _create_fallback_quiz(article_title)
    
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        
        # Initialize Gemini
        llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            api_key=GEMINI_API_KEY,
            temperature=0.7
        )
        
        # Format the prompt
        sections_str = ", ".join(sections[:10]) if sections else "No sections"
        prompt = PROMPT_TEMPLATE.format(
            summary=summary[:500],
            sections=sections_str,
            people=", ".join(key_entities.get("people", [])[:5]),
            organizations=", ".join(key_entities.get("organizations", [])[:5]),
            locations=", ".join(key_entities.get("locations", [])[:5]),
            article_text=article_text[:3000]  # Limit to 3000 chars to avoid token limits
        )
        
        # Call Gemini
        message = HumanMessage(content=prompt)
        response = llm.invoke([message])
        response_text = response.content.strip()
        
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        quiz_data = json.loads(response_text)
        
        # Validate structure
        if "quiz" in quiz_data and "related_topics" in quiz_data:
            return quiz_data
        else:
            # Invalid structure, return fallback
            return _create_fallback_quiz(article_title)
    
    except ImportError:
        # LangChain/Gemini not installed
        return _create_fallback_quiz(article_title)
    
    except json.JSONDecodeError as e:
        # Failed to parse JSON
        print(f"JSON decode error: {e}")
        return _create_fallback_quiz(article_title)
    
    except Exception as e:
        # Any other error (API error, timeout, etc.)
        print(f"Error calling Gemini LLM: {e}")
        return _create_fallback_quiz(article_title)
