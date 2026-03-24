import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { Template } from '@/lib/types/templates';

export function useTemplates(templateType?: string) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params: Record<string, string> = {};
            if (templateType) params.templateType = templateType;
            const { data } = await api.get<Template[]>('/admin/templates', { params });
            setTemplates(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Не удалось загрузить шаблоны';
            setError(msg);
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    }, [templateType]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const createTemplate = async (payload: {
        title: string;
        description: string;
        category: string;
        status: string;
        image?: string;
        negativePrompt?: string;
        templateType?: string;
    }): Promise<Template | null> => {
        try {
            const { data } = await api.post<Template>('/admin/templates', {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                status: payload.status,
                image: payload.image,
                negativePrompt: payload.negativePrompt,
                templateType: payload.templateType || templateType || 'preset',
            });
            await fetchTemplates();
            return data;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Ошибка создания шаблона';
            setError(msg);
            return null;
        }
    };

    const updateTemplate = async (
        id: string,
        payload: Partial<Pick<Template, 'title' | 'description' | 'category' | 'status' | 'image' | 'negativePrompt'>> & { templateType?: string }
    ): Promise<Template | null> => {
        try {
            const { data } = await api.put<Template>(`/admin/templates/${id}`, payload);
            await fetchTemplates();
            return data;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Ошибка обновления шаблона';
            setError(msg);
            return null;
        }
    };

    const deleteTemplate = async (id: string): Promise<boolean> => {
        try {
            await api.delete(`/admin/templates/${id}`);
            await fetchTemplates();
            return true;
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.detail || err.message
                : 'Ошибка удаления шаблона';
            setError(msg);
            return false;
        }
    };

    return {
        templates,
        isLoading,
        error,
        refresh: fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
    };
}
