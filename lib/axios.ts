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

// Флаг для предотвращения повторных попыток рефреша
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Перехватчик ответов (Обработка 401 и автоматический рефреш)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и мы еще не пытались обновить токен для этого запроса
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Если уже идет рефреш - ждем его завершения
      if (isRefreshing) {
        try {
          await refreshPromise;
          // Повторяем оригинальный запрос с новым токеном
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } catch {
          // Рефреш провалился - редирект на логин
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Если нет рефреш токена - сразу на логин
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Начинаем рефреш
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const { data } = await api.post('/admin/auth/refresh', {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        } catch (refreshError: any) {
          // Рефреш токен протух или невалиден - чистим и редиректим
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw refreshError;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        await refreshPromise;
        // Рефреш успешен - повторяем оригинальный запрос
        const newToken = localStorage.getItem('access_token');
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch {
        // Рефреш провалился - уже редиректнули внутри refreshPromise
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
