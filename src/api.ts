import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://chan-stock-theory.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API endpoints
export const getHealth = () => api.get('/');
export const analyzeStock = (data: { symbol: string; start_date: string; end_date: string; timeframe: string }) => 
  api.post('/analyze', data);
export const validateAccuracy = (data: { symbol: string; start_date: string; end_date: string; validation_date: string }) => 
  api.post('/validate', data);

export default api;
