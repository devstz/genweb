import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';

export interface ProfileData {
    name: string;
    role: string;
    avatar: string | null;
    username: string | null;
    bot_username: string | null;
}

const CACHE_TTL_MS = 2 * 60 * 1000;
let profileCache: { data: ProfileData; ts: number } | null = null;

export function useProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (profileCache && Date.now() - profileCache.ts <= CACHE_TTL_MS) {
                setProfile(profileCache.data);
                setIsLoading(false);
                return;
            }
            try {
                const { data } = await api.get<ProfileData>('/admin/auth/me');
                profileCache = { data, ts: Date.now() };
                setProfile(data);
            } catch {
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return { profile, isLoading };
}
