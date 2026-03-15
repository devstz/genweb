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
        <div className="min-h-dvh flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 sm:p-8">
            <div className="w-full max-w-[400px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2rem] shadow-2xl flex flex-col items-center p-8 sm:p-10 relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 3H7a1 1 0 0 1-1-1v-4h12v4a1 1 0 0 1-1 1Zm-1-8V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H7a2 2 0 0 0-2 2v1h14V9a2 2 0 0 0-2-2h-1Z" />
                    </svg>
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
                        <div className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin shrink-0" aria-hidden />
                    ) : (
                        <>
                            <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                            Войти через Telegram
                        </>
                    )}
                </Button>

                {/* Security Note */}
                <div className="mt-5 flex items-center gap-1.5 opacity-60 justify-center">
                    <svg className="size-3.5 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Защищено протоколом v2.0</span>
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
