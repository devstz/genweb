import { api } from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';

export interface ProfileData {
    user_id: number;
    name: string;
    role: string;
    avatar: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    admin_login: string | null;
    has_admin_credentials: boolean;
    admin_require_telegram_2fa: boolean;
}

const CACHE_TTL_MS = 2 * 60 * 1000;
let profileCache: { data: ProfileData; ts: number } | null = null;
export function invalidateProfileCache() {
    profileCache = null;
}

export function useProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (force = false) => {
        if (!force && profileCache && Date.now() - profileCache.ts <= CACHE_TTL_MS) {
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
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const refreshProfile = async () => {
        invalidateProfileCache();
        setIsLoading(true);
        await fetchProfile(true);
    };

    return { profile, isLoading, refreshProfile };
}
