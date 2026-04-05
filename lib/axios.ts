import axios, { type InternalAxiosRequestConfig } from 'axios';

// Запросы идут через Next.js rewrites (same-origin), бэкенд настраивается через API_BACKEND_URL на сервере
const API_BASE = '/api/proxy/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов (Добавляем Access Token)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    // Получаем токен из localStorage (или cookies, если используете SSR/SSR cookies)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов (Обработка 401 и автоматический рефреш)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и мы еще не пытались обновить токен для этого запроса
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            // Если нет рефреш токена, перекидываем на логин
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Пытаемся получить новый токен (через прокси)
        const { data } = await api.post('/admin/auth/refresh', {
          refresh_token: refreshToken,
        });

        // Сохраняем новые токены
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Обновляем заголовок и повторяем оригинальный 401 запрос
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Если рефреш тоже протух - разлогиниваем
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
