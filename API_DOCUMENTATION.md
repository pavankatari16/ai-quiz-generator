# API Documentation

Complete reference for the AI Quiz Generator REST API endpoints.

## Base URL

```
http://localhost:8000
```

For production, replace with your deployed backend URL.

## Interactive Documentation

Once the backend is running:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Authentication

No authentication required (future enhancement).

## Response Format

All responses are JSON with the following structure:

### Success Response

```json
{
  "id": 1,
  "url": "https://...",
  "title": "...",
  "date_generated": "2025-11-16T10:30:45.123456",
  "full_quiz_data": {...}
}
```

### Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Endpoints

---

## 1. Generate Quiz

Generate a quiz from any article URL.

### Request

**Method:** `POST`

**Endpoint:** `/generate_quiz`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}
```

### Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing - Wikipedia",
  "date_generated": "2025-11-16T10:30:45.123456",
  "full_quiz_data": {
    "title": "Generated Quiz",
    "questions": [
      {
        "question": "Who was Alan Turing?",
        "choices": [
          "A famous mathematician",
          "A computer scientist",
          "Both A and B",
          "Neither"
        ],
        "answer": 2
      },
      {
        "question": "What is the Turing test used for?",
        "choices": [
          "Testing computer memory",
          "Measuring artificial intelligence",
          "Debugging software",
          "Compiling code"
        ],
        "answer": 1
      },
      {
        "question": "In which year was the Turing test proposed?",
        "choices": [
          "1945",
          "1950",
          "1955",
          "1960"
        ],
        "answer": 1
      },
      {
        "question": "What was Turing's nationality?",
        "choices": [
          "German",
          "American",
          "British",
          "French"
        ],
        "answer": 2
      },
      {
        "question": "Which machine did Turing work on?",
        "choices": [
          "ENIAC",
          "Colossus",
          "Mark 1",
          "UNIVAC"
        ],
        "answer": 1
      }
    ]
  }
}
```

### Error Cases

**400 Bad Request - Invalid URL:**
```json
{
  "detail": "Scrape failed: HTTPError('404')"
}
```

**400 Bad Request - Network Error:**
```json
{
  "detail": "Scrape failed: ConnectionError(...)"
}
```

**422 Unprocessable Entity - Missing URL:**
```json
{
  "detail": [
    {
      "loc": ["body", "url"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Example Requests

#### Using cURL

```bash
curl -X POST "http://localhost:8000/generate_quiz" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://en.wikipedia.org/wiki/Alan_Turing"}'
```

#### Using JavaScript/Axios

```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:8000/generate_quiz', {
  url: 'https://en.wikipedia.org/wiki/Alan_Turing'
});

console.log(response.data);
```

#### Using Python/Requests

```python
import requests

response = requests.post(
    'http://localhost:8000/generate_quiz',
    json={'url': 'https://en.wikipedia.org/wiki/Alan_Turing'}
)

print(response.json())
```

---

## 2. Get History

Retrieve all previously generated quizzes.

### Request

**Method:** `GET`

**Endpoint:** `/history`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Maximum number of quizzes to return |
| `offset` | integer | 0 | Number of quizzes to skip (for pagination) |

### Response

**Status Code:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 3,
    "url": "https://en.wikipedia.org/wiki/Neural_network",
    "title": "Neural network - Wikipedia",
    "date_generated": "2025-11-16T12:45:15.987654",
    "full_quiz_data": {
      "title": "Deep Learning and Neural Networks",
      "questions": [...]
    }
  },
  {
    "id": 2,
    "url": "https://en.wikipedia.org/wiki/Machine_learning",
    "title": "Machine learning - Wikipedia",
    "date_generated": "2025-11-16T11:15:30.654321",
    "full_quiz_data": {
      "title": "Machine Learning Fundamentals",
      "questions": [...]
    }
  },
  {
    "id": 1,
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "title": "Artificial intelligence - Wikipedia",
    "date_generated": "2025-11-16T10:30:45.123456",
    "full_quiz_data": {
      "title": "Artificial Intelligence Quiz",
      "questions": [...]
    }
  }
]
```

**Note:** Results are sorted by `date_generated` in descending order (newest first).

### Example Requests

#### Get Last 10 Quizzes

```bash
curl "http://localhost:8000/history?limit=10"
```

#### Get Quizzes 20-30 (Pagination)

```bash
curl "http://localhost:8000/history?limit=10&offset=20"
```

#### Using JavaScript/Axios

```javascript
const response = await axios.get('http://localhost:8000/history', {
  params: { limit: 10, offset: 0 }
});

console.log(response.data);
```

---

## 3. Get Quiz by ID

Retrieve a specific quiz by its ID.

### Request

**Method:** `GET`

**Endpoint:** `/quiz/{quiz_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `quiz_id` | integer | The unique ID of the quiz |

### Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
  "title": "Artificial intelligence - Wikipedia",
  "date_generated": "2025-11-16T10:30:45.123456",
  "full_quiz_data": {
    "title": "Artificial Intelligence Quiz",
    "questions": [...]
  }
}
```

### Error Cases

**404 Not Found - Quiz ID doesn't exist:**
```json
{
  "detail": "Quiz not found"
}
```

**422 Unprocessable Entity - Invalid quiz ID:**
```json
{
  "detail": [
    {
      "loc": ["path", "quiz_id"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

### Example Requests

#### Using cURL

```bash
curl "http://localhost:8000/quiz/1"
```

#### Using JavaScript/Axios

```javascript
const quizId = 1;
const response = await axios.get(`http://localhost:8000/quiz/${quizId}`);

console.log(response.data);
```

#### Using Python/Requests

```python
import requests

response = requests.get(f'http://localhost:8000/quiz/1')
print(response.json())
```

---

## Data Types

### Quiz Object

```typescript
interface Quiz {
  id: number;              // Unique identifier
  url: string;             // Source article URL
  title: string | null;    // Extracted article title
  date_generated: string;  // ISO 8601 timestamp
  full_quiz_data: {
    title: string;         // Quiz title
    questions: Question[]; // Array of 5 questions
  };
}
```

### Question Object

```typescript
interface Question {
  question: string;        // Question text
  choices: string[];       // Array of 4 answer choices
  answer: number;          // Index (0-3) of correct answer
}
```

---

## Common Workflows

### Generate a Quiz and View It

```javascript
// 1. Generate quiz
const generateResponse = await axios.post('/generate_quiz', {
  url: 'https://en.wikipedia.org/wiki/Python_(programming_language)'
});

const quizId = generateResponse.data.id;
console.log(`Quiz created with ID: ${quizId}`);

// 2. Later, retrieve the same quiz
const getResponse = await axios.get(`/quiz/${quizId}`);
console.log(getResponse.data);
```

### Fetch All Quizzes and Display

```javascript
const response = await axios.get('/history', {
  params: { limit: 50 }
});

response.data.forEach(quiz => {
  console.log(`${quiz.id}: ${quiz.title}`);
});
```

### Paginate Through Quizzes

```javascript
const limit = 10;
let offset = 0;
let hasMore = true;

while (hasMore) {
  const response = await axios.get('/history', {
    params: { limit, offset }
  });

  if (response.data.length < limit) {
    hasMore = false;
  }

  // Process quizzes
  response.data.forEach(quiz => {
    console.log(quiz.title);
  });

  offset += limit;
}
```

---

## Rate Limiting

Currently, there is **no rate limiting** implemented. Rate limiting may be added in future versions.

## CORS

The API allows requests from any origin (CORS enabled globally). For production, configure CORS more restrictively in `main.py`.

## Error Handling Best Practices

### Client-Side Error Handling

```javascript
try {
  const response = await axios.post('/generate_quiz', {
    url: userInput
  });
  
  // Handle success
  console.log('Quiz created:', response.data);
  
} catch (error) {
  if (error.response?.status === 400) {
    // Bad request (invalid URL, scrape failed)
    console.error('Invalid URL:', error.response.data.detail);
  } else if (error.response?.status === 422) {
    // Validation error
    console.error('Validation error:', error.response.data.detail);
  } else if (error.code === 'ECONNREFUSED') {
    // Backend not running
    console.error('Backend not available');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

---

## Performance Notes

- **Quiz Generation:** Takes 5-30 seconds depending on article length and LLM availability
- **History Retrieval:** Typically <100ms
- **Quiz Lookup:** Typically <50ms
- **Pagination:** Always use pagination for large datasets (limit=50 recommended)

---

## Versioning

Current API version: **v1** (implicit)

Future versions may include:
- Authentication
- User profiles
- Quiz ratings/feedback
- Advanced search/filtering

---

## Support

For API issues:
1. Check interactive docs at `/docs`
2. Check backend logs for errors
3. Verify database connection
4. Test with sample data in `/sample_data`

---

## Schema Validation

The backend validates:
- `url` must be a valid HTTP(S) URL
- Quiz data must have exactly 5 questions
- Each question must have 4 choices
- Answer index must be 0-3

Invalid requests return 422 Unprocessable Entity with detailed error messages.

---

## Deployment Considerations

### Production Checklist

- [ ] Set `DATABASE_URL` to production database
- [ ] Set `GEMINI_API_KEY` if using LLM
- [ ] Enable CORS only for frontend domain
- [ ] Set up logging and monitoring
- [ ] Implement rate limiting
- [ ] Add authentication (future)
- [ ] Enable HTTPS
- [ ] Set up backups

---

## Additional Examples

See `/sample_data/` directory for sample JSON responses:
- `sample_quiz_1.json`
- `sample_quiz_2.json`
- `sample_quiz_3.json`
- `history_response.json`
