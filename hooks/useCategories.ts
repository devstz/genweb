import axios from 'axios';
import { api } from '@/lib/axios';
import { useState, useEffect, useCallback } from 'react';

export function useCategories() {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get<string[]>('/admin/templates/categories');
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            setCategories(['face', 'motion', 'animals', 'scene']);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, isLoading, refresh: fetchCategories };
}
