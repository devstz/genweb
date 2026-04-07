'use client';

import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { api } from '@/lib/axios';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface PasswordAuthResponse {
    status: 'approved' | 'pending_2fa' | 'pending' | 'rejected' | 'expired';
    access_token?: string;
    refresh_token?: string;
    token?: string;
    deep_link?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { initAuth, telegramLink, status, isLoading, error } = useTelegramAuth();
    const [mounted, setMounted] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [password2faToken, setPassword2faToken] = useState<string | null>(null);
    const [password2faLink, setPassword2faLink] = useState<string | null>(null);
    const [password2faStatus, setPassword2faStatus] = useState<'pending_2fa' | 'rejected' | 'expired' | null>(null);

    const getTgDeepLink = (link: string | null) => {
        if (!link) return null;
        if (link.startsWith('https://t.me/')) {
            const parts = link.replace('https://t.me/', '').split('?start=');
            const botUsername = parts[0];
            const startParam = parts[1];
            return `tg://resolve?domain=${botUsername}${startParam ? `&start=${startParam}` : ''}`;
        }
        return link;
    };

    useEffect(() => {
        setMounted(true);
        const bootstrap = async () => {
            if (!localStorage.getItem('access_token')) {
                initAuth();
                return;
            }
            try {
                await api.get('/admin/auth/me');
                router.push('/dashboard');
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
                initAuth();
            }
        };
        void bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status === 'approved') {
            router.push('/dashboard');
        }
    }, [status, router]);

    useEffect(() => {
        if (!password2faToken || password2faStatus !== 'pending_2fa') return;

        const interval = setInterval(async () => {
            try {
                const { data } = await api.get<PasswordAuthResponse>(`/admin/auth/status?token=${password2faToken}`);
                if (data.status === 'approved' && data.access_token && data.refresh_token) {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    router.push('/dashboard');
                    return;
                }
                if (data.status === 'rejected' || data.status === 'expired') {
                    setPassword2faStatus(data.status);
                    setPassword2faToken(null);
                }
            } catch {
                // ignore temporary polling errors
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [password2faToken, password2faStatus, router]);

    const handlePasswordLogin = async () => {
        if (!login.trim() || !password) {
            setPasswordError('Введите логин и пароль.');
            return;
        }
        setPasswordLoading(true);
        setPasswordError(null);

        try {
            const { data } = await api.post<PasswordAuthResponse>('/admin/auth/login', {
                login: login.trim(),
                password,
            });

            if (data.status === 'approved' && data.access_token && data.refresh_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                router.push('/dashboard');
                return;
            }

            if (data.status === 'pending_2fa' && data.token && data.deep_link) {
                setPassword2faToken(data.token);
                setPassword2faLink(data.deep_link);
                setPassword2faStatus('pending_2fa');
                return;
            }

            setPasswordError('Не удалось выполнить вход.');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setPasswordError((err.response?.data?.detail as string) || 'Ошибка авторизации.');
            } else {
                setPasswordError('Ошибка авторизации.');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 sm:p-8">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2rem] shadow-2xl p-8 sm:p-10 relative z-10">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Вход через Telegram QR</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        Отсканируйте QR-код или перейдите по ссылке для входа.
                    </p>

                    <div className="w-full max-w-[220px] aspect-square rounded-[2rem] bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark p-4 sm:p-5 mb-8 flex items-center justify-center shadow-inner relative overflow-hidden group mx-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <div className="size-10 border-2 border-slate-200 dark:border-slate-600 border-t-slate-500 dark:border-t-slate-400 rounded-full animate-spin" aria-hidden />
                                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Загрузка</span>
                            </div>
                        ) : telegramLink ? (
                            <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden relative">
                                <QRCode
                                    value={telegramLink}
                                    size={180}
                                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                    viewBox={`0 0 256 256`}
                                    fgColor="#0f172a"
                                    bgColor="#ffffff"
                                />
                            </div>
                        ) : status === 'rejected' ? (
                            <div className="flex flex-col items-center text-red-500">
                                <svg className="size-10 mb-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6" />
                                    <path d="m9 9 6 6" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center mt-1">Доступ запрещен</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-xs text-center font-medium px-2">
                                {error}
                            </div>
                        ) : (
                            <svg className="size-14 text-slate-200 dark:text-border-dark shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zm-6 6h4v4H3V9zm6 0h4v4H9V9zm0-6h6v2h-2v2h2v2h-2v2h-2v-4H9V3h4V1H9v2zm6 4h2v2h-2V9zm0 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-6 2h2v2H9v-2zm4 0h2v2h-2v-2z" />
                            </svg>
                        )}
                    </div>

                    <Button
                        onClick={() => {
                            if (!telegramLink) return;
                            const deepLink = getTgDeepLink(telegramLink);
                            if (deepLink) window.location.href = deepLink;
                        }}
                        disabled={!telegramLink || isLoading}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        Войти через Telegram
                    </Button>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2rem] shadow-2xl p-8 sm:p-10 relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Вход по логину и паролю</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                        Используйте сохраненные учетные данные. Если включен 2FA, потребуется подтверждение в Telegram.
                    </p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Логин"
                            autoComplete="username"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                            disabled={passwordLoading}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                            disabled={passwordLoading}
                        />
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        <Button
                            onClick={handlePasswordLogin}
                            disabled={passwordLoading}
                            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm"
                        >
                            {passwordLoading ? 'Проверка...' : 'Войти по логину'}
                        </Button>
                    </div>

                    {password2faStatus && (
                        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/60">
                            {password2faStatus === 'pending_2fa' ? (
                                <>
                                    <p className="text-sm font-semibold mb-3">Подтвердите вход в Telegram</p>
                                    {password2faLink && (
                                        <div className="max-w-[160px] mx-auto">
                                            <QRCode value={password2faLink} size={160} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => {
                                            const deepLink = getTgDeepLink(password2faLink);
                                            if (deepLink) window.location.href = deepLink;
                                        }}
                                        className="w-full mt-3"
                                    >
                                        Открыть Telegram
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-red-500">Подтверждение входа не выполнено или истекло.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 justify-center opacity-80">
                <span className="size-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
                Панель управления администратора
                <span className="size-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
            </div>
        </div>
    );
}
