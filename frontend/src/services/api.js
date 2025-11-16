import axios from 'axios';
import { API_BASE_URL } from '../api';

// Use explicit API base constant from src/api.js
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // 60 second timeout for long-running requests
});

export const generateQuiz = (url) => {
  return apiClient.post('/generate_quiz', { url });
};

export const getHistory = (limit = 50, offset = 0) => {
  return apiClient.get('/history', { params: { limit, offset } });
};

export const getQuiz = (quizId) => {
  return apiClient.get(`/quiz/${quizId}`);
};

export default apiClient;
