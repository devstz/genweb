'use client';

import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

export default function LoginPage() {
    const router = useRouter();
    const { initAuth, telegramLink, status, isLoading, error } = useTelegramAuth();
    const [mounted, setMounted] = useState(false);

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
        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status === 'approved') {
            router.push('/dashboard');
        }
    }, [status, router]);

    if (!mounted) return null;

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 sm:p-8">
            <div className="w-full max-w-[400px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2rem] shadow-2xl flex flex-col items-center p-8 sm:p-10 relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center tracking-tight">Бот Админ</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center px-2 leading-relaxed">
                    Отсканируйте QR-код или перейдите по ссылке для входа
                </p>

                {/* QR Code */}
                <div className="w-full max-w-[220px] aspect-square rounded-[2rem] bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark p-4 sm:p-5 mb-8 flex items-center justify-center shadow-inner relative overflow-hidden group">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
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
                            <span className="material-symbols-outlined text-4xl mb-2">cancel</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-center mt-1">Доступ запрещен</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-xs text-center font-medium px-2">
                            {error}
                        </div>
                    ) : (
                        <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-border-dark">qr_code_2</span>
                    )}
                </div>

                {/* Button */}
                <Button
                    onClick={() => {
                        if (!telegramLink) return;
                        const deepLink = getTgDeepLink(telegramLink);
                        if (deepLink) window.location.href = deepLink;
                    }}
                    disabled={!telegramLink || isLoading}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    {isLoading ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">send</span>
                            Войти через Telegram
                        </>
                    )}
                </Button>

                {/* Security Note */}
                <div className="mt-5 flex items-center gap-1.5 opacity-60 justify-center">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold">verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Защищено протоколом v2.0</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 justify-center opacity-80">
                <span className="size-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
                Панель управления администратора
                <span className="size-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
            </div>
        </div>
    );
}
