'use client';

import { api } from '@/lib/axios';
import type { DisplayCurrency } from '@/lib/types/packs';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export function useAdminDisplayCurrency() {
    const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('RUB');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCurrency = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get<{ admin_display_currency: DisplayCurrency }>('/admin/settings/display-currency');
            const c = data?.admin_display_currency;
            if (c === 'RUB' || c === 'USD' || c === 'EUR') setDisplayCurrency(c);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? String(err.response?.data?.detail || err.message)
                : 'Не удалось загрузить валюту отображения';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCurrency();
    }, [fetchCurrency]);

    return { displayCurrency, isLoading, error, refresh: fetchCurrency };
}
