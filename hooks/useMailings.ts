import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { Mailing } from '@/lib/types/mailings';

export type MailingAttachment = { path: string; kind: 'photo' | 'video' };

function formatSendError(err: unknown): string {
    if (!axios.isAxiosError(err)) return 'Ошибка отправки рассылки';
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item: { msg?: string; type?: string }) => item.msg || JSON.stringify(item))
            .join('; ');
    }
    if (detail && typeof detail === 'object' && 'message' in detail) {
        return String((detail as { message: string }).message);
    }
    return err.message || 'Ошибка отправки рассылки';
}

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

    /** @returns true on success, error message string on failure */
    const sendMailing = async (
        message: string,
        audience: string,
        includeAdmins = false,
        attachment?: MailingAttachment | null
    ): Promise<true | string> => {
        try {
            const body: Record<string, unknown> = {
                message: message.trim(),
                audience,
                include_admins: includeAdmins,
            };
            if (attachment) {
                body.attachment_path = attachment.path;
                body.attachment_type = attachment.kind;
            }
            await api.post('/admin/mailings', body);
            setError(null);
            await fetchMailings();
            return true;
        } catch (err: unknown) {
            const msg = formatSendError(err);
            setError(msg);
            return msg;
        }
    };

    return { mailings, total, isLoading, error, refresh: fetchMailings, sendMailing };
}
