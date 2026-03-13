import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { GenerationLog, GenerationLogListResponse } from '@/lib/types/generations';

export function useGenerations(limit = 200, offset = 0, status?: string) {
    const [items, setItems] = useState<GenerationLog[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGenerations = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params: Record<string, string | number> = { limit, offset };
            if (status) params.status = status;
            const { data } = await api.get<GenerationLogListResponse>('/admin/generations', { params });
            setItems(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось загрузить логи';
            setError(msg);
            setItems([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset, status]);

    useEffect(() => {
        fetchGenerations();
    }, [fetchGenerations]);

    return { items, total, isLoading, error, refresh: fetchGenerations };
}
