'use client';

import { Icon } from '@/components/admin/Icon';
import { api } from '@/lib/axios';
import { generateStartCode } from '@/lib/start-code';
import type { UtmCampaign } from '@/lib/types/utm';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useUtmCampaignStats } from '@/hooks/useUtmStats';
import { formatAdminRevenue } from '@/lib/formatAdminMoney';

export default function UtmDetailsPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const campaignId = params?.id;
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [campaign, setCampaign] = useState<UtmCampaign | null>(null);
    const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
    const [campaignError, setCampaignError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isShowAllRegistrations, setIsShowAllRegistrations] = useState(false);
    const [registrationsPage, setRegistrationsPage] = useState(1);
    const [registrationsLimit] = useState(20);
    const [copied, setCopied] = useState(false);
    const [editName, setEditName] = useState('');
    const [editStartCode, setEditStartCode] = useState('');
    const [editUtmSource, setEditUtmSource] = useState('');
    const [editUtmMedium, setEditUtmMedium] = useState('');
    const [editUtmCampaign, setEditUtmCampaign] = useState('');
    const [editUtmContent, setEditUtmContent] = useState('');
    const [editUtmTerm, setEditUtmTerm] = useState('');

    const {
        stats,
        series,
        registrations,
        registrationsTotal,
        isLoading,
        isRegistrationsLoading,
        error,
        refresh,
        fetchRegistrations,
    } = useUtmCampaignStats(campaignId, {
        period,
        registrationsLimit,
        registrationsOffset: (registrationsPage - 1) * registrationsLimit,
    });

    useEffect(() => {
        if (searchParams.get('edit') === 'true') {
            setIsEditModalOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        setRegistrationsPage(1);
    }, [isShowAllRegistrations]);

    useEffect(() => {
        if (!campaignId) return;
        fetchRegistrations({
            limit: isShowAllRegistrations ? registrationsLimit : 5,
            offset: (registrationsPage - 1) * (isShowAllRegistrations ? registrationsLimit : 5),
        });
    }, [campaignId, fetchRegistrations, isShowAllRegistrations, registrationsLimit, registrationsPage]);

    useEffect(() => {
        if (!campaignId) return;
        const fetchCampaign = async () => {
            try {
                setIsLoadingCampaign(true);
                setCampaignError(null);
                const { data } = await api.get<UtmCampaign>(`/admin/utm/${campaignId}`);
                setCampaign(data);
                setEditName(data.name);
                setEditStartCode(data.start_code);
                setEditUtmSource(data.utm_source ?? '');
                setEditUtmMedium(data.utm_medium ?? '');
                setEditUtmCampaign(data.utm_campaign ?? '');
                setEditUtmContent(data.utm_content ?? '');
                setEditUtmTerm(data.utm_term ?? '');
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setCampaignError((err.response?.data?.detail as string) || err.message);
                } else {
                    setCampaignError('Не удалось загрузить кампанию');
                }
            } finally {
                setIsLoadingCampaign(false);
            }
        };
        fetchCampaign();
    }, [campaignId]);

    const handleCopy = async () => {
        if (!campaign?.link) return;
        try {
            await navigator.clipboard.writeText(campaign.link);
            setActionError(null);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setActionError('Не удалось скопировать ссылку. Проверьте разрешения буфера обмена.');
        }
    };

    const handleSave = async () => {
        if (!campaign) return;
        const trimmedName = editName.trim();
        const trimmedStartCode = editStartCode.trim();
        const normalizeOptional = (value: string) => {
            const trimmed = value.trim();
            return trimmed.length ? trimmed : null;
        };
        if (!trimmedName || !trimmedStartCode) {
            setActionError('Название и start параметр обязательны.');
            return;
        }
        try {
            setIsSaving(true);
            const { data } = await api.put<UtmCampaign>(`/admin/utm/${campaign.id}`, {
                name: trimmedName,
                start_code: trimmedStartCode,
                utm_source: normalizeOptional(editUtmSource),
                utm_medium: normalizeOptional(editUtmMedium),
                utm_campaign: normalizeOptional(editUtmCampaign),
                utm_content: normalizeOptional(editUtmContent),
                utm_term: normalizeOptional(editUtmTerm),
            });
            setCampaign(data);
            setEditName(data.name);
            setEditStartCode(data.start_code);
            setEditUtmSource(data.utm_source ?? '');
            setEditUtmMedium(data.utm_medium ?? '');
            setEditUtmCampaign(data.utm_campaign ?? '');
            setEditUtmContent(data.utm_content ?? '');
            setEditUtmTerm(data.utm_term ?? '');
            setIsEditModalOpen(false);
            setActionError(null);
            setActionSuccess('Изменения сохранены.');
            await refresh();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setActionError((err.response?.data?.detail as string) || err.message);
            } else {
                setActionError('Не удалось сохранить изменения.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportCsv = async () => {
        if (!campaignId) return;
        try {
            setIsExporting(true);
            const response = await api.get(`/admin/utm/${campaignId}/export.csv`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `utm-${campaignId}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setActionError(null);
            setActionSuccess('CSV экспортирован.');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setActionError((err.response?.data?.detail as string) || err.message);
            } else {
                setActionError('Не удалось экспортировать CSV.');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const hasRegsPrev = registrationsPage > 1;
    const currentLimit = isShowAllRegistrations ? registrationsLimit : 5;
    const hasRegsNext = registrationsPage * currentLimit < registrationsTotal;

    const maxClicks = useMemo(() => Math.max(...series.map((s) => s.clicks), 1), [series]);

    if (isLoadingCampaign) {
        return <div className="p-8 text-slate-500">Загрузка...</div>;
    }

    if (campaignError || !campaign) {
        return <div className="p-8 text-red-500">{campaignError || 'Кампания не найдена'}</div>;
    }

    return (
        <div className="space-y-8">
            <header className="h-16 border-b border-border-dark flex items-center justify-between px-2 md:px-4 bg-background-dark/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link href="/utm" className="flex items-center justify-center p-2 rounded-lg hover:bg-card-dark text-slate-500 transition-colors">
                        <Icon name="arrow_back" size={20} />
                    </Link>
                    <div>
                        <h2 className="text-lg font-bold">{campaign.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Link href="/utm" className="hover:text-primary transition-colors">UTM Ссылки</Link>
                            <span>/</span>
                            <span>Детали ссылки</span>
                        </div>
                    </div>
                </div>
            </header>

            {(error || campaignError || actionError) && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
                    {error || campaignError || actionError}
                </div>
            )}
            {actionSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900 text-sm">
                    {actionSuccess}
                </div>
            )}

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="size-28 rounded-2xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                        <Icon name="campaign" size={44} />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Ваш UTM URL</label>
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <code className="text-lg md:text-2xl font-mono font-bold break-all">{campaign.link}</code>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-white hover:bg-primary'}`}
                                    >
                                        <Icon name={copied ? 'check' : 'content_copy'} size={16} />
                                        {copied ? 'Скопировано' : 'Копировать'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-slate-100 dark:bg-background-dark text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-card-dark"
                                    >
                                        <Icon name="edit" size={16} />
                                        Редактировать
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">
                            Start параметр: <span className="px-2 py-0.5 rounded bg-background-dark text-slate-300 font-mono text-xs">#{campaign.start_code}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Уникальные клики</p>
                    <h4 className="text-2xl font-black tracking-tight">{stats?.unique_clicks ?? 0}</h4>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Новые пользователи</p>
                    <h4 className="text-2xl font-black tracking-tight">{stats?.new_users ?? 0}</h4>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Конверсия</p>
                    <h4 className="text-2xl font-black tracking-tight">{stats?.conversion ?? 0}%</h4>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Общий доход</p>
                    <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                        {formatAdminRevenue(stats?.revenue_rub ?? 0, 'RUB')}
                    </h4>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {formatAdminRevenue(stats?.revenue_usd ?? 0, 'USD')}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-lg font-bold">Активность по ссылке</h4>
                        <p className="text-sm text-slate-400">Распределение кликов и регистраций</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCsv}
                            disabled={isExporting}
                            className="px-3 py-1.5 text-xs font-bold rounded-md border border-slate-200 dark:border-border-dark disabled:opacity-50"
                        >
                            {isExporting ? 'Экспорт...' : 'Экспорт CSV'}
                        </button>
                        <div className="flex bg-slate-100 dark:bg-background-dark p-1 rounded-lg">
                            <button onClick={() => setPeriod('day')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${period === 'day' ? 'bg-card-dark shadow-sm' : 'text-slate-500'}`}>День</button>
                            <button onClick={() => setPeriod('week')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${period === 'week' ? 'bg-card-dark shadow-sm' : 'text-slate-500'}`}>Неделя</button>
                            <button onClick={() => setPeriod('month')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${period === 'month' ? 'bg-card-dark shadow-sm' : 'text-slate-500'}`}>Месяц</button>
                        </div>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {series.map((item) => (
                        <div key={item.full_date} className="flex-1 bg-primary/20 rounded-t-md relative group" style={{ height: `${Math.max(8, (item.clicks / maxClicks) * 100)}%` }}>
                            <div className="hidden group-hover:block absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                {item.full_date}: {item.clicks} кликов / {item.registrations} рег.
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {series.map((item) => (
                        <span key={`${item.full_date}-label`}>{item.label}</span>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                    <h4 className="text-lg font-bold">Последние регистрации</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">Всего: {registrationsTotal}</span>
                        <button
                            onClick={() => setIsShowAllRegistrations((prev) => !prev)}
                            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 dark:border-border-dark"
                        >
                            {isShowAllRegistrations ? 'Свернуть' : 'Смотреть всех'}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-primary/5 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Пользователь</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Дата</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {registrations.map((user) => (
                                <tr key={`${user.user_id}-${user.created_at}`} className="hover:bg-background-dark/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold">{user.full_name || user.username || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{user.user_id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.created_at).toLocaleString('ru-RU')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between text-xs text-slate-400">
                    <span>{isRegistrationsLoading ? 'Обновление регистраций...' : `Страница ${registrationsPage}`}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setRegistrationsPage((prev) => Math.max(1, prev - 1))}
                            disabled={!hasRegsPrev || isRegistrationsLoading}
                            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-border-dark disabled:opacity-50"
                        >
                            Назад
                        </button>
                        <button
                            onClick={() => setRegistrationsPage((prev) => prev + 1)}
                            disabled={!hasRegsNext || isRegistrationsLoading}
                            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-border-dark disabled:opacity-50"
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Настройки UTM-метки</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Icon name="close" size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Название кампании</label>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start параметр</label>
                                <div className="flex items-center gap-2">
                                    <input value={editStartCode} onChange={(e) => setEditStartCode(e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 font-mono text-sm" />
                                    <button
                                        type="button"
                                        onClick={() => setEditStartCode(generateStartCode(editName))}
                                        className="shrink-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-xs font-bold uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Генер.
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="utm_source"
                                    value={editUtmSource}
                                    onChange={(e) => setEditUtmSource(e.target.value)}
                                    className="bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-sm"
                                />
                                <input
                                    placeholder="utm_medium"
                                    value={editUtmMedium}
                                    onChange={(e) => setEditUtmMedium(e.target.value)}
                                    className="bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-sm"
                                />
                                <input
                                    placeholder="utm_campaign"
                                    value={editUtmCampaign}
                                    onChange={(e) => setEditUtmCampaign(e.target.value)}
                                    className="bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-sm"
                                />
                                <input
                                    placeholder="utm_content"
                                    value={editUtmContent}
                                    onChange={(e) => setEditUtmContent(e.target.value)}
                                    className="bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-sm"
                                />
                                <input
                                    placeholder="utm_term"
                                    value={editUtmTerm}
                                    onChange={(e) => setEditUtmTerm(e.target.value)}
                                    className="bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-sm col-span-2"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl hover:bg-white/5 text-slate-300 font-medium">
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60"
                                >
                                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(isLoading || isLoadingCampaign) && <div className="text-xs text-slate-400">Обновление данных...</div>}
        </div>
    );
}
