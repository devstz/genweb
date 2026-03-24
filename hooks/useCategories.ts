import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';

export function useCategories(templateType?: string) {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const params: Record<string, string> = {};
            if (templateType) params.templateType = templateType;
            const { data } = await api.get<string[]>('/admin/templates/categories', { params });
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            if (templateType === 'postcard') {
                setCategories(['birthday', 'hearts', 'congrats']);
            } else {
                setCategories(['face', 'motion', 'animals', 'scene']);
            }
        } finally {
            setIsLoading(false);
        }
    }, [templateType]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, isLoading, refresh: fetchCategories };
}
