import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { AudienceStats } from '@/lib/types/mailings';

export function useAudienceStats(audience: string, includeAdmins = false) {
    const [stats, setStats] = useState<AudienceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get<AudienceStats>('/admin/mailings/audience-stats', {
                params: { audience, include_admins: includeAdmins },
            });
            setStats(data);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось загрузить статистику';
            setError(msg);
            setStats({ count: 0, total: 0, percent: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [audience, includeAdmins]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, refresh: fetchStats };
}
