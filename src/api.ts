import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://chan-stock-theory.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持cookies
});

// 请求拦截器
api.interceptors.request.use(
  (config: any) => {
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// 基础API endpoints
export const getHealth = () => api.get('/');

// 股票分析API
export const analyzeStock = (data: { symbol: string; start_date: string; end_date: string; timeframe: string }) => 
  api.post('/analyze', data);
export const validateAccuracy = (data: { symbol: string; start_date: string; end_date: string; validation_date: string }) => 
  api.post('/validate', data);

// 用户认证API
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/api/auth/register', data);
export const login = (data: { username: string; password: string }) =>
  api.post('/api/auth/login', data);
export const logout = () => api.post('/api/auth/logout');
export const getCurrentUser = () => api.get('/api/auth/me');

// 股票工具API
export const formatStockSymbol = (data: { symbol: string }) =>
  api.post('/api/stock/format', data);
export const searchStocks = (data: { query: string }) =>
  api.post('/api/stock/search', data);

// 关注列表API
export const getWatchlist = () => api.get('/api/watchlist');
export const addToWatchlist = (data: { symbol: string; display_name?: string }) =>
  api.post('/api/watchlist', data);
export const removeFromWatchlist = (symbol: string) =>
  api.delete(`/api/watchlist/${symbol}`);

// 研究历史API
export const getResearchHistory = (limit?: number) =>
  api.get(`/api/history${limit ? `?limit=${limit}` : ''}`);
export const deleteResearchHistory = (historyId: string) =>
  api.delete(`/api/history/${historyId}`);

export default api;
