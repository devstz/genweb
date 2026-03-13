'use client';

import { Header } from '@/components/admin/Header';
import { Sidebar } from '@/components/admin/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard': { title: 'Обзор показателей', subtitle: 'Метрики в реальном времени' },
    '/templates': { title: 'Галерея шаблонов', subtitle: 'Управление шаблонами ответов' },
    '/mailings': { title: 'Рассылка новостей', subtitle: 'Создайте и отправьте сообщение пользователям' },
    '/prices': { title: 'Цены', subtitle: 'Управление тарифными пакетами' },
    '/logs': { title: 'Логи генераций', subtitle: 'История последних запросов' },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (!localStorage.getItem('access_token')) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSidebarOpen(false);
    }, [pathname]);

    const { title, subtitle } = ROUTE_TITLES[pathname] ?? { title: 'Обзор показателей', subtitle: 'Метрики в реальном времени' };

    if (!mounted) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto scrollbar-thin bg-background-light dark:bg-background-dark relative">
                <Header title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
