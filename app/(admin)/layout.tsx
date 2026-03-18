'use client';

import { Header } from '@/components/admin/Header';
import { Sidebar } from '@/components/admin/Sidebar';
import { invalidateProfileCache } from '@/hooks/useProfile';
import { api } from '@/lib/axios';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useState } from 'react';

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard': { title: 'Обзор показателей', subtitle: 'Метрики в реальном времени' },
    '/templates': { title: 'Галерея шаблонов', subtitle: 'Управление шаблонами ответов' },
    '/mailings': { title: 'Рассылка новостей', subtitle: 'Создайте и отправьте сообщение пользователям' },
    '/prices': { title: 'Цены', subtitle: 'Управление тарифными пакетами' },
    '/logs': { title: 'Логи генераций', subtitle: 'История последних запросов' },
    '/utm': { title: 'UTM-метки', subtitle: 'Аналитика рекламных кампаний' },
    '/settings': { title: 'Настройки', subtitle: 'Параметры профиля и безопасности' },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [requireCredentialsSetup, setRequireCredentialsSetup] = useState(false);
    const [setupLogin, setSetupLogin] = useState('');
    const [setupPassword, setSetupPassword] = useState('');
    const [setupError, setSetupError] = useState<string | null>(null);
    const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);

    useEffect(() => {
        setMounted(true);

        const bootstrap = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                router.push('/login');
                return;
            }

            try {
                const { data } = await api.get<{ has_admin_credentials: boolean }>('/admin/auth/me');
                setRequireCredentialsSetup(!data.has_admin_credentials);
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                router.push('/login');
                return;
            } finally {
                setAuthReady(true);
            }
        };

        bootstrap();
    }, [router]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const isUtmDetails = pathname.startsWith('/utm/');
    const { title, subtitle } = isUtmDetails
        ? { title: 'UTM-метка', subtitle: 'Детальная аналитика кампании' }
        : ROUTE_TITLES[pathname] ?? { title: 'Обзор показателей', subtitle: 'Метрики в реальном времени' };

    const submitCredentialsSetup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!setupLogin.trim() || !setupPassword) {
            setSetupError('Введите логин и пароль.');
            return;
        }

        setIsSubmittingSetup(true);
        setSetupError(null);
        try {
            const payload = {
                login: setupLogin.trim(),
                password: setupPassword,
            };

            try {
                await api.post('/admin/auth/credentials/setup', payload);
            } catch (err: unknown) {
                if (!axios.isAxiosError(err) || err.response?.status !== 404) {
                    throw err;
                }

                try {
                    await api.post('/admin/auth/credentials/bind', payload);
                } catch (bindErr: unknown) {
                    if (axios.isAxiosError(bindErr) && bindErr.response?.status === 404) {
                        setSetupError('На API не найден endpoint setup/bind. Обновите backend.');
                        return;
                    }
                    throw bindErr;
                }
            }

            invalidateProfileCache();
            setRequireCredentialsSetup(false);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                // Credentials were already set in another session.
                setRequireCredentialsSetup(false);
                return;
            }

            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setSetupError(
                        'API отклонил формат body (ожидался JSON-объект с login/password). Обновите страницу и попробуйте снова.'
                    );
                    return;
                }

                const detail = err.response?.data?.detail;
                if (typeof detail === 'string' && detail.trim()) {
                    setSetupError(detail);
                    return;
                }

                setSetupError('Не удалось сохранить данные.');
                return;
            }
            setSetupError('Не удалось сохранить данные.');
        } finally {
            setIsSubmittingSetup(false);
        }
    };

    if (!mounted || !authReady) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto scrollbar-thin bg-background-light dark:bg-background-dark relative">
                <Header title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {requireCredentialsSetup && (
                <div className="fixed inset-0 z-80 bg-slate-950/95 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Завершите настройку входа</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Для дальнейшей работы задайте логин и пароль. Это обязательный шаг после первого входа по QR-коду.
                        </p>

                        <form onSubmit={submitCredentialsSetup} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="setup-login" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Логин
                                </label>
                                <input
                                    id="setup-login"
                                    type="text"
                                    value={setupLogin}
                                    onChange={(e) => setSetupLogin(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
                                    placeholder="Введите логин"
                                    autoComplete="username"
                                    disabled={isSubmittingSetup}
                                />
                            </div>
                            <div>
                                <label htmlFor="setup-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Пароль
                                </label>
                                <input
                                    id="setup-password"
                                    type="password"
                                    value={setupPassword}
                                    onChange={(e) => setSetupPassword(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
                                    placeholder="Введите пароль"
                                    autoComplete="new-password"
                                    disabled={isSubmittingSetup}
                                />
                            </div>

                            {setupError && (
                                <p className="text-sm text-red-500">{setupError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmittingSetup}
                                className="w-full bg-primary text-primary-foreground font-bold rounded-lg py-2.5 hover:bg-primary/90 transition disabled:opacity-60"
                            >
                                {isSubmittingSetup ? 'Сохраняем...' : 'Сохранить логин и пароль'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
