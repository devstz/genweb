import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { Pack } from '@/lib/types/packs';

export function usePacks() {
    const [packs, setPacks] = useState<Pack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchPacks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get<Pack[]>('/admin/packs');
            setPacks(data ?? []);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось загрузить пакеты';
            setError(msg);
            setPacks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

    const createPack = async (payload: Partial<Pack>) => {
        try {
            const { data } = await api.post<Pack>('/admin/packs', payload);
            await fetchPacks();
            return data;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось создать пакет';
            setError(msg);
            return null;
        }
    };

    const updatePack = async (id: string, payload: Partial<Pack>) => {
        try {
            const { data } = await api.put<Pack>(`/admin/packs/${id}`, payload);
            await fetchPacks();
            return data;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось обновить пакет';
            setError(msg);
            return null;
        }
    };

    const deletePack = async (id: string) => {
        try {
            await api.delete(`/admin/packs/${id}`);
            await fetchPacks();
            return true;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось удалить пакет';
            setError(msg);
            return false;
        }
    };

    const togglePack = async (id: string) => {
        setTogglingId(id);
        try {
            const { data } = await api.patch<Pack>(`/admin/packs/${id}/toggle`);
            if (data) {
                setPacks((prev) => prev.map((p) => (p.id === id ? data : p)));
            }
            return true;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось переключить пакет';
            setError(msg);
            return false;
        } finally {
            setTogglingId(null);
        }
    };

    return { packs, isLoading, error, togglingId, refresh: fetchPacks, createPack, updatePack, deletePack, togglePack };
}
