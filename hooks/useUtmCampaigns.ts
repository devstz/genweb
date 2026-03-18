import axios from 'axios';
import { api } from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';
import type {
    UtmCampaign,
    UtmCampaignFilters,
    UtmCampaignListResponse,
    UtmCreatePayload,
    UtmUpdatePayload,
} from '@/lib/types/utm';

interface UseUtmCampaignsParams {
    page: number;
    limit: number;
    search?: string;
    filters?: UtmCampaignFilters;
}

export function useUtmCampaigns({ page, limit, search, filters }: UseUtmCampaignsParams) {
    const [items, setItems] = useState<UtmCampaign[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params: Record<string, string | number | boolean> = {
                limit,
                offset: (page - 1) * limit,
            };
            if (search) {
                params.search = search;
            }
            if (typeof filters?.is_active === 'boolean') {
                params.is_active = filters.is_active;
            }
            if (filters?.from) {
                params.from = filters.from;
            }
            if (filters?.to) {
                params.to = filters.to;
            }
            const { data } = await api.get<UtmCampaignListResponse>('/admin/utm', { params });
            setItems(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось загрузить UTM кампании';
            setError(message);
            setItems([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [limit, page, search, filters?.is_active, filters?.from, filters?.to]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const createCampaign = async (payload: UtmCreatePayload): Promise<UtmCampaign | null> => {
        try {
            setIsCreating(true);
            const { data } = await api.post<UtmCampaign>('/admin/utm', payload);
            await fetchCampaigns();
            return data;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось создать кампанию';
            setError(message);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    const updateCampaign = async (id: string, payload: UtmUpdatePayload): Promise<UtmCampaign | null> => {
        try {
            const { data } = await api.put<UtmCampaign>(`/admin/utm/${id}`, payload);
            await fetchCampaigns();
            return data;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось обновить кампанию';
            setError(message);
            return null;
        }
    };

    const deleteCampaign = async (id: string): Promise<boolean> => {
        try {
            setDeletingId(id);
            await api.delete(`/admin/utm/${id}`);
            await fetchCampaigns();
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.detail as string) || err.message
                : 'Не удалось удалить кампанию';
            setError(message);
            return false;
        } finally {
            setDeletingId(null);
        }
    };

    const hasPrev = page > 1;
    const hasNext = page * limit < total;

    return {
        items,
        total,
        isLoading,
        isCreating,
        deletingId,
        hasPrev,
        hasNext,
        error,
        refresh: fetchCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,
    };
}
