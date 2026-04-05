'use client';

import { Icon } from '@/components/admin/Icon';
import { MetricCard } from '@/components/admin/MetricCard';
import { TemplateListCard } from '@/components/admin/TemplateListCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePiapiBalance } from '@/hooks/usePiapiBalance';
import { formatAdminRevenue } from '@/lib/formatAdminMoney';
import { useMemo, useState } from 'react';

export default function DashboardPage() {
    const [period, setPeriod] = useState<'week' | 'month'>('week');
    const { data, isLoading, error } = useDashboardData(period);
    const { data: piapiData, isLoading: piapiLoading } = usePiapiBalance();

    const { maxRub, maxUsd } = useMemo(() => {
        if (!data?.revenueTrend?.length) return { maxRub: 1, maxUsd: 1 };
        const maxRub = Math.max(...data.revenueTrend.map((t) => Number(t.rub) || 0), 1);
        const maxUsd = Math.max(...data.revenueTrend.map((t) => Number(t.usd) || 0), 1);
        return { maxRub, maxUsd };
    }, [data?.revenueTrend]);

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Icon name="autorenew" size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
                <h3 className="font-bold">Ошибка загрузки дашборда</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    const funnelLabels: Record<string, string> = {
        total_active: 'Зашли в бот',
        referral_active: 'Приглашают друзей',
        payers: 'Сделали покупку',
    };

    const performanceLabels: Record<string, string> = {
        stable: 'Стабильно',
        high_load: 'Нагрузка',
    };

    const healthLabels: Record<string, string> = {
        DB_STATUS: 'Статус БД',
        API: 'API Сервис',
        CONNECTED: 'Подключено',
        STABLE: 'Стабильно',
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Всего пользователей"
                    value={data.metrics.uniqueUsers.value}
                    change={data.metrics.uniqueUsers.change}
                    isPositive={data.metrics.uniqueUsers.isPositive}
                    icon="group"
                />
                <MetricCard
                    title="Всего генераций"
                    value={data.metrics.totalGenerations.value}
                    change={data.metrics.totalGenerations.change}
                    isPositive={data.metrics.totalGenerations.isPositive}
                    icon="auto_awesome"
                />
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Icon name="payments" size={20} />
                        </span>
                        <span className="text-emerald-500 bg-emerald-500/10 text-xs font-bold px-2 py-1 rounded-full">
                            ₽ + $
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Выручка (месяц)</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatAdminRevenue(data.metrics.revenueMonth.rub, 'RUB')}
                        </p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {formatAdminRevenue(data.metrics.revenueMonth.usd, 'USD')}
                        </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                        Сегодня: {formatAdminRevenue(data.metrics.revenueMonth.todayRub, 'RUB')} ·{' '}
                        {formatAdminRevenue(data.metrics.revenueMonth.todayUsd, 'USD')}
                    </p>
                </div>
            </section>

            {/* PiAPI Balance Card */}
            <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                            <Icon name="smart_toy" size={20} />
                        </span>
                        <h3 className="font-bold text-lg">PiAPI Balance</h3>
                    </div>
                    {piapiData && !piapiData.error && (
                        <span className="text-emerald-500 bg-emerald-500/10 text-xs font-bold px-2 py-1 rounded-full">
                            ${piapiData.balance_usd?.toFixed(2)}
                        </span>
                    )}
                </div>
                {piapiLoading && !piapiData ? (
                    <div className="flex justify-center py-4">
                        <Icon name="autorenew" size={24} className="animate-spin text-primary" />
                    </div>
                ) : piapiData?.error ? (
                    <p className="text-sm text-red-500">❌ PiAPI недоступен</p>
                ) : piapiData ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Баланс</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${piapiData.balance_usd?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Кредиты</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{piapiData.used_credits?.toLocaleString()}/{piapiData.total_credits?.toLocaleString()}</p>
                            <div className="mt-1 h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all"
                                    style={{ width: `${piapiData.total_credits ? Math.min(100, ((piapiData.used_credits || 0) / piapiData.total_credits) * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Осталось генераций</p>
                            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">~{piapiData.remaining_generations}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Модель</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{piapiData.current_model}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{piapiData.current_settings?.duration}s, {piapiData.current_settings?.resolution}p</p>
                        </div>
                    </div>
                ) : null}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm">
                    <div className="items-center justify-between mb-6 hidden md:flex">
                        <div>
                            <h3 className="font-bold text-lg">Тренды выручки</h3>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Столбцы: <span className="text-primary font-bold">₽</span> ·{' '}
                                <span className="text-amber-500 font-bold">$</span> (без суммирования валют)
                            </p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-background-dark p-1 rounded-lg">
                            <button 
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'week' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Неделя
                            </button>
                            <button 
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'month' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Месяц
                            </button>
                        </div>
                    </div>
                    <div className="relative overflow-x-auto overflow-y-visible scrollbar-thin">
                        {isLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-surface-dark/80 rounded-lg">
                                <Icon name="autorenew" size={32} className="animate-spin text-primary" />
                            </div>
                        )}
                        <div 
                            className="min-w-0"
                            style={period === 'month' && data.revenueTrend.length > 10 
                                ? { minWidth: Math.max(400, data.revenueTrend.length * 24) } 
                                : undefined}
                        >
                            <div className="pt-14 h-64 flex items-end justify-between gap-0.5 md:gap-1">
                                {data.revenueTrend.map((item, i) => {
                                    const hRub = `${Math.max(2, ((Number(item.rub) || 0) / maxRub) * 100)}%`;
                                    const hUsd = `${Math.max(2, ((Number(item.usd) || 0) / maxUsd) * 100)}%`;
                                    const last = i === data.revenueTrend.length - 1;
                                    return (
                                        <div
                                            key={`bar-${item.label}-${i}`}
                                            className="flex-1 h-full flex gap-0.5 items-end relative group"
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl min-w-[140px]">
                                                <p className="font-bold text-slate-300">{item.fullDate}</p>
                                                <p className="text-xs font-bold text-white mt-1">
                                                    {formatAdminRevenue(Number(item.rub) || 0, 'RUB')}
                                                </p>
                                                <p className="text-xs font-bold text-amber-300">
                                                    {formatAdminRevenue(Number(item.usd) || 0, 'USD')}
                                                </p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                            </div>
                                            <div className="flex-1 h-full flex flex-col justify-end">
                                                <div style={{ height: hRub }} className="w-full relative">
                                                    <div
                                                        className={`w-full h-full rounded-t-sm ${last ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/50'} transition-colors`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 h-full flex flex-col justify-end">
                                                <div style={{ height: hUsd }} className="w-full relative">
                                                    <div
                                                        className={`w-full h-full rounded-t-sm ${last ? 'bg-amber-500' : 'bg-amber-500/25 group-hover:bg-amber-500/50'} transition-colors`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                                {(() => {
                                    const count = data.revenueTrend.length;
                                    const maxLabels = 8;
                                    const labelIndices = count <= maxLabels 
                                        ? new Set([...Array(count).keys()])
                                        : new Set(Array.from({ length: maxLabels }, (_, j) => 
                                            j === maxLabels - 1 ? count - 1 : Math.round((count - 1) * j / (maxLabels - 1))
                                          ));
                                    const formatLabel = (label: string) => 
                                        period === 'month' && label.includes('.') ? label.split('.')[0] : label;
                                    return data.revenueTrend.map((item, i) => (
                                        <span 
                                            key={`label-${item.label}-${i}`} 
                                            className="flex-1 text-center min-w-0 whitespace-nowrap overflow-visible"
                                        >
                                            {labelIndices.has(i) ? formatLabel(item.label) : '\u00A0'}
                                        </span>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Templates List */}
                <TemplateListCard templates={data.topTemplates} />
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Conversion Funnel */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Воронка конверсии</h3>
                    <div className="flex-1 flex flex-col gap-3 justify-center">
                        {data.conversionFunnel.map((step, i) => {
                            const colors = ['bg-primary/40', 'bg-primary/60', 'bg-primary'];
                            const width = `${Math.max(15, step.percentage)}%`;
                            return (
                                <div key={step.key || `funnel-${i}`} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                                        <span>{funnelLabels[step.key] || step.key}</span>
                                        <span>{step.count} чел.</span>
                                    </div>
                                    <div 
                                        style={{ width }} 
                                        className={`relative h-10 ${colors[i % colors.length]} rounded-xl flex items-center px-4 overflow-hidden transition-all hover:scale-[1.02] shadow-sm`}
                                    >
                                        <span className="text-xs font-black text-white relative z-10">{step.percentage}%</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Gauge */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-2 w-full text-left">Производительность</h3>
                    <p className="text-sm text-slate-500 mb-6 w-full text-left">Средняя скорость обработки</p>
                    <div className="flex-1 flex items-center justify-center flex-col">
                        <div className="relative size-32">
                            <svg className="size-full" viewBox="0 0 36 36">
                                <path className="stroke-slate-100 dark:stroke-background-dark fill-none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeWidth="3"></path>
                                {data.performance && (
                                    <path 
                                        className="stroke-primary fill-none transition-all duration-1000" 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                        strokeDasharray={`${data.performance.percentage}, 100`} 
                                        strokeLinecap="round" 
                                        strokeWidth="3"
                                    ></path>
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {data.performance?.avgTime || '0s'}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                    {data.performance ? (performanceLabels[data.performance.status] || data.performance.status) : '—'}
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs font-medium text-slate-500 italic text-center">на основе последних генераций</p>
                    </div>
                </div>

                {/* System Stats Block */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Состояние системы</h3>
                    <div className="space-y-4">
                        {data.systemHealth.map((item, i) => (
                            <div key={item.label || i} className="flex items-center gap-3">
                                <div className={`size-10 rounded-lg bg-emerald-500/10 ${item.iconColor || 'text-emerald-500'} flex items-center justify-center`}>
                                    <Icon name={item.icon} size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{healthLabels[item.label] || item.label}</p>
                                    <p className="text-xs text-slate-500">{healthLabels[item.subLabel || ''] || item.subLabel || 'Стабильно'}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                        {item.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
