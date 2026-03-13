import axios from 'axios';
import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';

export interface DashboardMetrics {
    metrics: {
        uniqueUsers: { value: number; change: string; isPositive: boolean };
        totalGenerations: { value: number; change: string; isPositive: boolean };
        revenueMonth: { value: string; change: string; isPositive: boolean };
    };
    topTemplates: Array<{ id: number; name: string; usageCount: number; successRate: number }>;
    systemHealth: Array<{ 
        label: string; 
        value: string; 
        icon: string; 
        isBadge: boolean; 
        isGreen?: boolean; 
        iconColor?: string;
        subLabel?: string;
    }>;
    conversionFunnel: Array<{ key: string; percentage: number; count: number }>;
    performance: {
        avgTime: string;
        status: string;
        percentage: number;
    };
    revenueTrend: Array<{ label: string; value: number; fullDate: string }>;
}

const CACHE_TTL_MS = 2 * 60 * 1000;
const cache: Record<string, { data: DashboardMetrics; ts: number }> = {};

function getCached(key: string): DashboardMetrics | null {
    const entry = cache[key];
    if (!entry || Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
}

function setCached(key: string, data: DashboardMetrics) {
    cache[key] = { data, ts: Date.now() };
}

export function useDashboardData(period: string = "week") {
    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const cacheKey = `dashboard:${period}`;

        const fetchMetrics = async () => {
            const cached = getCached(cacheKey);
            if (cached) {
                setData(cached);
                setError(null);
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const response = await api.get<DashboardMetrics>(
                    `/admin/dashboard/metrics?period=${period}`,
                    { signal: controller.signal }
                );
                setCached(cacheKey, response.data);
                setData(response.data);
                setError(null);
            } catch (err: any) {
                if (axios.isCancel(err)) return;
                setError(err?.message || 'Не удалось загрузить данные дашборда');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchMetrics();

        const interval = setInterval(fetchMetrics, CACHE_TTL_MS);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [period]);

    const refresh = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<DashboardMetrics>(`/admin/dashboard/metrics?period=${period}`);
            setCached(`dashboard:${period}`, response.data);
            setData(response.data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Не удалось загрузить данные дашборда');
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, error, refresh };
}
