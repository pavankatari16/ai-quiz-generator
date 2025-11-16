import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Any

def _collapse_whitespace(text: str) -> str:
    """Collapse multiple whitespace into single spaces."""
    return re.sub(r"\s+", " ", text).strip()

def _extract_summary(soup) -> str:
    """Extract first 3-6 sentences from lead section (before first h2)."""
    # Find all paragraphs before the first h2
    paragraphs = []
    for elem in soup.find_all(['p', 'h2']):
        if elem.name == 'h2':
            break
        if elem.name == 'p':
            paragraphs.append(elem.get_text(strip=True))
    
    # Combine and limit to first 3-6 sentences
    text = ' '.join(paragraphs)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    summary = ' '.join(sentences[:6])
    return _collapse_whitespace(summary)

def _extract_sections(soup) -> List[str]:
    """Extract all h2 headings as section titles."""
    sections = []
    for h2 in soup.find_all('h2'):
        title = h2.get_text(strip=True)
        if title and not title.startswith('['):
            sections.append(title)
    return sections

def _extract_people(text: str) -> List[str]:
    """Simple heuristic: find capitalized words appearing frequently (likely proper nouns)."""
    words = text.split()
    capitalized = {}
    
    for word in words:
        # Remove punctuation
        clean_word = re.sub(r'[^\w]', '', word)
        if clean_word and clean_word[0].isupper() and len(clean_word) > 2:
            capitalized[clean_word] = capitalized.get(clean_word, 0) + 1
    
    # Return words appearing 2+ times, sorted by frequency
    people = [w for w, count in sorted(capitalized.items(), key=lambda x: -x[1]) if count >= 2]
    return people[:10]  # Limit to 10

def _extract_organizations(text: str) -> List[str]:
    """Find organizations using keyword patterns."""
    patterns = [
        r'\b[\w\s]+(?:University|Institute|Company|Corporation|Foundation|Lab|Laboratory|Department)\b',
        r'\b(?:MIT|NASA|UN|IBM|Google|Microsoft|Apple|OpenAI|DeepMind)\b'
    ]
    
    orgs = set()
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        orgs.update(matches)
    
    return list(orgs)[:10]  # Limit to 10

def _extract_locations(text: str) -> List[str]:
    """Simple location extraction using common patterns."""
    countries = [
        'United States', 'United Kingdom', 'China', 'Russia', 'India', 'Germany', 
        'France', 'Japan', 'Canada', 'Brazil', 'Australia', 'Mexico', 'Spain', 'Italy'
    ]
    cities = [
        'New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Madrid', 'Rome', 'Moscow',
        'Beijing', 'Shanghai', 'Toronto', 'Sydney', 'San Francisco', 'Los Angeles'
    ]
    
    locations = set()
    for country in countries:
        if country.lower() in text.lower():
            locations.add(country)
    
    for city in cities:
        if city.lower() in text.lower():
            locations.add(city)
    
    return list(locations)

def scrape_url(url: str) -> Dict[str, Any]:
    """
    Scrape a Wikipedia article and extract structured content.
    
    Returns a dict with:
    - title: Article title from <title> or <h1>
    - summary: First 3-6 sentences from lead section
    - clean_text: Full text with references/footnotes removed
    - sections: List of section headings
    - key_entities: Dict with people, organizations, locations
    - raw_html: Original HTML
    """
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    raw_html = response.text
    
    soup = BeautifulSoup(raw_html, "html.parser")
    
    # Extract title
    title = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    
    if not title:
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text(strip=True)
    
    if not title:
        title = url
    
    # Remove unwanted elements
    for elem in soup.find_all(['script', 'style', 'noscript', 'sup']):
        elem.decompose()
    
    # Remove reference markers like [1], [2], etc.
    text_with_refs = soup.get_text(separator=" ")
    clean_text = re.sub(r'\[\d+\]', '', text_with_refs)
    clean_text = re.sub(r'\[\w+\]', '', clean_text)  # Remove [citation needed] etc
    clean_text = _collapse_whitespace(clean_text)
    
    # Extract structured data
    summary = _extract_summary(soup)
    sections = _extract_sections(soup)
    
    # Entity extraction
    key_entities = {
        "people": _extract_people(clean_text),
        "organizations": _extract_organizations(clean_text),
        "locations": _extract_locations(clean_text)
    }
    
    return {
        "title": title,
        "summary": summary,
        "clean_text": clean_text,
        "sections": sections,
        "key_entities": key_entities,
        "raw_html": raw_html
    }

