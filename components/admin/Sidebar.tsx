'use client';

import { Icon } from '@/components/admin/Icon';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
    const { profile, isLoading } = useProfile();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const navLink = (href: string, label: string, icon: string) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10'}`}
            >
                <Icon name={icon} size={24} />
                <span className="text-sm font-medium">{label}</span>
            </Link>
        );
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            <aside
                className={`
                    fixed md:relative inset-y-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-border-dark flex flex-col bg-background-light dark:bg-background-dark shrink-0
                    transition-transform duration-300 ease-out md:translate-x-0
                    ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
            <div className="p-6 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary rounded-lg p-2 flex items-center justify-center shrink-0">
                        <Icon name="smart_toy" size={24} className="text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-lg leading-none truncate">Бот Админ</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Панель управления</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden size-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-dark shrink-0"
                        aria-label="Закрыть меню"
                    >
                        <Icon name="close" size={24} />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navLink('/dashboard', 'Дашборд', 'dashboard')}
                {navLink('/templates', 'Шаблоны', 'description')}
                {navLink('/postcards', 'Открытки', 'celebration')}
                {navLink('/mailings', 'Рассылка', 'mail')}
                {navLink('/prices', 'Цены', 'payments')}
                {navLink('/logs', 'Логи', 'history')}
                {navLink('/utm', 'UTM-метки', 'campaign')}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
                    {navLink('/settings', 'Настройки', 'settings')}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-border-dark">
                <div className="flex items-center gap-3 bg-primary/5 dark:bg-surface-dark p-3 rounded-xl min-w-0">
                    <div className="size-10 shrink-0 rounded-full bg-slate-200 dark:bg-border-dark flex items-center justify-center overflow-hidden">
                        {profile?.avatar ? (
                            <img
                                alt="Admin Avatar"
                                className="w-full h-full object-cover"
                                src={profile.avatar}
                            />
                        ) : (
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                {profile ? getInitials(profile.name) : '—'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-semibold truncate" title={profile?.name}>
                            {isLoading ? '…' : profile?.name ?? 'Загрузка'}
                        </p>
                        <p className="text-xs text-slate-500 truncate" title={profile?.role}>
                            {profile?.role ?? ''}
                        </p>
                    </div>
                    <div
                        className="relative shrink-0 flex items-center justify-center size-8"
                        ref={dropdownRef}
                    >
                        <button
                            type="button"
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            <Icon name="more_vert" size={20} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-50">
                                {profile?.bot_username && (
                                    <a
                                        href={`tg://resolve?domain=${profile.bot_username}`}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <Icon name="send" size={20} />
                                        Перейти в бот
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleLogout();
                                        setDropdownOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                >
                                    <Icon name="logout" size={20} />
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
}
