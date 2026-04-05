import axios from 'axios';
import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';

export interface PiapiBalanceData {
    balance_usd: number | null;
    available_credits: number | null;
    used_credits: number | null;
    total_credits: number | null;
    plan: string | null;
    cost_per_generation: number;
    remaining_generations: number | null;
    current_model: string;
    current_settings: { duration: number; resolution: number };
    error?: string;
}

export function usePiapiBalance() {
    const [data, setData] = useState<PiapiBalanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<PiapiBalanceData>('/admin/dashboard/piapi-balance');
            setData(response.data);
            setError(response.data.error || null);
        } catch (err: unknown) {
            if (axios.isCancel(err)) return;
            const message = err instanceof Error ? err.message : 'Failed to load PiAPI balance';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { data, isLoading, error, refresh: fetchBalance };
}
