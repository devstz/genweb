import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { Mailing } from '@/lib/types/mailings';

export function useMailings(limit = 50, offset = 0) {
    const [mailings, setMailings] = useState<Mailing[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMailings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get<{ items: Mailing[]; total: number }>('/admin/mailings', {
                params: { limit, offset },
            });
            setMailings(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось загрузить рассылки';
            setError(msg);
            setMailings([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchMailings();
    }, [fetchMailings]);

    const sendMailing = async (message: string, audience: string, includeAdmins = false) => {
        try {
            await api.post('/admin/mailings', { message, audience, include_admins: includeAdmins });
            await fetchMailings();
            return true;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Ошибка отправки рассылки';
            setError(msg);
            return false;
        }
    };

    return { mailings, total, isLoading, error, refresh: fetchMailings, sendMailing };
}
