'use client';

import { Icon } from '@/components/admin/Icon';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    onMenuClick?: () => void;
}

export function Header({ title = "Обзор дашборда", subtitle = "Метрики в реальном времени", onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
            <div className="flex items-center gap-3 min-w-0">
                {onMenuClick && (
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="md:hidden size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-slate-100 shrink-0"
                        aria-label="Открыть меню"
                    >
                        <Icon name="menu" size={24} />
                    </button>
                )}
                <div className="flex flex-col min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold truncate">{title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-slate-100 relative transition-colors hover:opacity-80">
                    <Icon name="notifications" size={24} />
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
                </button>
            </div>
        </header>
    );
}
