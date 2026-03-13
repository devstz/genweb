import axios from 'axios';
import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';

interface AuthInitResponse {
    deep_link: string;
    token: string;
}

interface AuthStatusResponse {
    status: 'pending' | 'approved' | 'rejected' | 'not_found';
    access_token?: string;
    refresh_token?: string;
}

export function useTelegramAuth() {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [telegramLink, setTelegramLink] = useState<string | null>(null);
    const [status, setStatus] = useState<AuthStatusResponse['status']>('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Инициализация (генерация токена)
    const initAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.post<AuthInitResponse>('/admin/auth/init');
            setAuthToken(data.token);
            setTelegramLink(data.deep_link);
            setStatus('pending');
        } catch (err: unknown) {
            let message = 'Failed to initialize authorization';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.detail || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Polling статуса
    useEffect(() => {
        if (!authToken || status !== 'pending') return;

        const checkStatus = async () => {
            try {
                const { data } = await api.get<AuthStatusResponse>(`/admin/auth/status?token=${authToken}`);

                if (data.status === 'approved' && data.access_token && data.refresh_token) {
                    // Авторизация пройдена! Сохраняем токены
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    setStatus('approved');
                } else if (data.status === 'rejected' || data.status === 'not_found') {
                    setStatus(data.status);
                    setAuthToken(null);
                    setTelegramLink(null);
                }
            } catch (err) {
                // Игнорируем временные сетевые ошибки во время поллинга
                console.error('Polling error:', err);
            }
        };

        // Проверяем каждые 2 секунды
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [authToken, status]);

    return { initAuth, authToken, telegramLink, status, isLoading, error };
}
