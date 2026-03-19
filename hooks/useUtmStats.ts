import axios from 'axios';
import { api } from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';
import type {
    UtmRegistration,
    UtmRegistrationListResponse,
    UtmRegistrationListParams,
    UtmSeriesResponse,
    UtmStats,
    UtmSummary,
} from '@/lib/types/utm';

export function useUtmSummary() {
    const [summary, setSummary] = useState<UtmSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get<UtmSummary>('/admin/utm/stats/summary');
            setSummary(data);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось загрузить UTM summary';
            setError(message);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, isLoading, error, refresh: fetchSummary };
}

interface UseUtmCampaignStatsOptions {
    period?: 'day' | 'week' | 'month';
    registrationsLimit?: number;
    registrationsOffset?: number;
    from?: string;
    to?: string;
}

export function useUtmCampaignStats(campaignId?: string, options: UseUtmCampaignStatsOptions = {}) {
    const period = options.period ?? 'day';
    const [stats, setStats] = useState<UtmStats | null>(null);
    const [series, setSeries] = useState<UtmSeriesResponse['items']>([]);
    const [registrations, setRegistrations] = useState<UtmRegistrationListResponse['items']>([]);
    const [registrationsTotal, setRegistrationsTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistrationsLoading, setIsRegistrationsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRegistrations = useCallback(
        async (params: UtmRegistrationListParams = {}): Promise<UtmRegistration[] | null> => {
            if (!campaignId) return null;
            try {
                setIsRegistrationsLoading(true);
                const requestParams: Record<string, string | number> = {
                    limit: params.limit ?? options.registrationsLimit ?? 20,
                    offset: params.offset ?? options.registrationsOffset ?? 0,
                };
                if (params.from ?? options.from) {
                    requestParams.from = params.from ?? options.from ?? '';
                }
                if (params.to ?? options.to) {
                    requestParams.to = params.to ?? options.to ?? '';
                }
                const { data } = await api.get<UtmRegistrationListResponse>(`/admin/utm/${campaignId}/registrations`, {
                    params: requestParams,
                });
                setRegistrations(data.items ?? []);
                setRegistrationsTotal(data.total ?? 0);
                return data.items ?? [];
            } catch (err: unknown) {
                const message = axios.isAxiosError(err)
                    ? (err.response?.data?.detail as string) || err.message
                    : 'Не удалось загрузить регистрации кампании';
                setError(message);
                setRegistrations([]);
                setRegistrationsTotal(0);
                return null;
            } finally {
                setIsRegistrationsLoading(false);
            }
        },
        [campaignId, options.from, options.registrationsLimit, options.registrationsOffset, options.to],
    );

    const fetchAll = useCallback(async () => {
        if (!campaignId) return;
        try {
            setIsLoading(true);
            setError(null);
            const dateParams: Record<string, string> = {};
            if (options.from) {
                dateParams.from = options.from;
            }
            if (options.to) {
                dateParams.to = options.to;
            }
            const [statsRes, seriesRes, regsItems] = await Promise.all([
                api.get<UtmStats>(`/admin/utm/${campaignId}/stats`, { params: dateParams }),
                api.get<UtmSeriesResponse>(`/admin/utm/${campaignId}/series`, {
                    params: { period, ...dateParams },
                }),
                fetchRegistrations({
                    limit: options.registrationsLimit ?? 20,
                    offset: options.registrationsOffset ?? 0,
                    from: options.from,
                    to: options.to,
                }),
            ]);

            setStats(statsRes.data);
            setSeries(seriesRes.data.items ?? []);
            if (!regsItems) {
                setRegistrations([]);
            }
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось загрузить UTM детали';
            setError(message);
            setStats(null);
            setSeries([]);
            setRegistrations([]);
            setRegistrationsTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [
        campaignId,
        fetchRegistrations,
        options.from,
        options.registrationsLimit,
        options.registrationsOffset,
        options.to,
        period,
    ]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        stats,
        series,
        registrations,
        registrationsTotal,
        isLoading,
        isRegistrationsLoading,
        error,
        refresh: fetchAll,
        fetchRegistrations,
    };
}
