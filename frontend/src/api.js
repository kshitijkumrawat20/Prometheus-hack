import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor to inject session token into headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('masterymap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const registerUser = (username, email, password) => 
  api.post('/auth/register', { username, email, password });

export const loginUser = (username, password) => 
  api.post('/auth/login', { username, password });

export const getMe = () => 
  api.get('/auth/me');

export const logoutUser = () => 
  api.post('/auth/logout');

// Application API
export const uploadSyllabus = (text, studentId = 'default') => 
  api.post('/syllabus/upload', { text, student_id: studentId });

export const getGraph = (studentId = 'default') => 
  api.get(`/graph/${studentId}`);

export const getNextAction = (studentId = 'default') => 
  api.get(`/next-action/${studentId}`);

export const advanceLessonStage = (conceptId, studentId = 'default') => 
  api.post('/lesson/advance', { concept_id: conceptId, student_id: studentId });

export const submitAnswer = (questionId, answer, studentId = 'default') => 
  api.post('/answer', { question_id: questionId, student_id: studentId, answer });

export const getConceptNotes = (conceptId) => 
  api.get(`/notes/${conceptId}`);

export const getLevelNotes = (levelName, conceptIds) => 
  api.post('/notes/level', { level_name: levelName, concept_ids: conceptIds });

export const getStudentSummary = (studentId = 'default') => 
  api.get(`/student/${studentId}/summary`);

export default api;
