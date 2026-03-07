import axios from 'axios';

// Извлекаем базовый URL для API (например, http://localhost:8000/api/v1)
// В Next.js .env переменные, доступные браузеру, должны начинаться с NEXT_PUBLIC_
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов (Добавляем Access Token)
api.interceptors.request.use(
  (config) => {
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

        // Пытаемся получить новый токен
        const { data } = await axios.post(`${API_URL}/admin/auth/refresh`, {
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
