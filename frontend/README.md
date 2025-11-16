# AI Quiz Generator Frontend

React frontend for the AI Quiz Generator application.

## Features

- **Generate Quiz**: Submit article URLs to generate quizzes using AI
- **Quiz History**: View all previously generated quizzes
- **Quiz Details**: Modal view for detailed quiz questions and answers
- **Responsive Design**: Works on desktop and mobile devices
- **Environment Configuration**: Easy setup for different environments

## Setup

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
cd frontend
npm install
```

### Running Locally

```bash
npm start
```

The app will open at `http://localhost:3000`. By default, it connects to the backend at `http://localhost:8000`.

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

For production (Vercel), set this in Vercel's environment variables:
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Vercel Deployment

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable in Vercel dashboard:
   - Name: `REACT_APP_API_URL`
   - Value: Your backend URL (e.g., `https://api.example.com`)
4. Deploy

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GenerateQuiz.jsx
│   │   ├── GenerateQuiz.css
│   │   ├── History.jsx
│   │   ├── History.css
│   │   ├── Modal.jsx
│   │   └── Modal.css
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── .env.example
```

## Components

- **App.jsx**: Main app component with tab navigation
- **GenerateQuiz.jsx**: Form to generate quizzes from URLs
- **History.jsx**: Grid view of saved quizzes
- **Modal.jsx**: Detailed view modal for quiz questions

## API Service

The `src/services/api.js` file exports:
- `generateQuiz(url)` - POST /generate_quiz
- `getHistory(limit, offset)` - GET /history
- `getQuiz(quizId)` - GET /quiz/{id}

Uses environment variable `REACT_APP_API_URL` for flexible configuration.
