import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';
import type { Template } from '@/lib/types/templates';

async function uploadImageIfNeeded(imageValue?: string): Promise<string | undefined> {
    if (!imageValue) return undefined;
    // Already a server path or URL — no upload needed
    if (!imageValue.startsWith('data:')) return imageValue;

    // Convert data URL to File and upload
    const res = await fetch(imageValue);
    const blob = await res.blob();
    const ext = blob.type.split('/')[1] || 'png';
    const file = new File([blob], `upload.${ext}`, { type: blob.type });

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ path: string }>('/admin/templates/upload', formData);
    return data.path;
}

async function uploadVideoIfNeeded(videoValue?: string): Promise<string | undefined> {
    if (!videoValue) return undefined;
    if (!videoValue.startsWith('data:')) return videoValue;

    const res = await fetch(videoValue);
    const blob = await res.blob();
    const ext = blob.type.split('/')[1] || 'mp4';
    const file = new File([blob], `upload.${ext}`, { type: blob.type });

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ path: string }>('/admin/templates/upload', formData);
    return data.path;
}

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
        video?: string;
        negativePrompt?: string;
        templateType?: string;
    }): Promise<Template | null> => {
        try {
            const uploadedImage = await uploadImageIfNeeded(payload.image);
            const uploadedVideo = await uploadVideoIfNeeded(payload.video);
            const { data } = await api.post<Template>('/admin/templates', {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                status: payload.status,
                image: uploadedImage,
                video: uploadedVideo,
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
        payload: Partial<Pick<Template, 'title' | 'description' | 'category' | 'status' | 'image' | 'video' | 'negativePrompt'>> & { templateType?: string }
    ): Promise<Template | null> => {
        try {
            const uploadedImage = await uploadImageIfNeeded(payload.image);
            const uploadedVideo = await uploadVideoIfNeeded(payload.video);
            const { data } = await api.put<Template>(`/admin/templates/${id}`, {
                ...payload,
                image: uploadedImage,
                video: uploadedVideo,
            });
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
