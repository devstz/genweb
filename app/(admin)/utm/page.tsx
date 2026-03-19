'use client';

import { Icon } from '@/components/admin/Icon';
import { useUtmCampaigns } from '@/hooks/useUtmCampaigns';
import { generateStartCode } from '@/lib/start-code';
import { useUtmSummary } from '@/hooks/useUtmStats';
import { formatAdminRevenue } from '@/lib/formatAdminMoney';
import type { UtmCreatePayload } from '@/lib/types/utm';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function UtmPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterIsActive, setFilterIsActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UtmCreatePayload>({
        name: '',
        start_code: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: '',
        utm_term: '',
        is_active: true,
    });

    const limit = 20;
    const filters = useMemo(
        () => ({
            is_active:
                filterIsActive === 'active'
                    ? true
                    : filterIsActive === 'inactive'
                      ? false
                      : undefined,
            from: filterFrom || undefined,
            to: filterTo || undefined,
        }),
        [filterFrom, filterIsActive, filterTo],
    );
    const {
        items,
        total,
        isLoading,
        isCreating,
        deletingId,
        hasPrev,
        hasNext,
        error,
        createCampaign,
        deleteCampaign,
    } = useUtmCampaigns({
        page,
        limit,
        search: debouncedSearch || undefined,
        filters,
    });
    const { summary } = useUtmSummary();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const filteredItems = useMemo(() => items, [items]);

    const handleCopy = async (id: string, link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setActionError(null);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            setActionError('Не удалось скопировать ссылку. Проверьте доступ к буферу обмена.');
        }
    };

    const handleCreate = async () => {
        setFormError(null);
        const trimmedName = formData.name?.trim() || '';
        const trimmedStartCode = formData.start_code?.trim() || '';
        if (!trimmedName || !trimmedStartCode) {
            setFormError('Укажите название кампании и start параметр.');
            return;
        }
        const payload: UtmCreatePayload = {
            ...formData,
            name: trimmedName,
            start_code: trimmedStartCode,
        };
        const created = await createCampaign(payload);
        if (created) {
            setIsCreateModalOpen(false);
            setFormData({
                name: '',
                start_code: '',
                utm_source: '',
                utm_medium: '',
                utm_campaign: '',
                utm_content: '',
                utm_term: '',
                is_active: true,
            });
            setActionError(null);
            setPage(1);
        } else {
            setFormError('Не удалось создать кампанию. Проверьте поля и попробуйте еще раз.');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Удалить UTM-кампанию? Это действие нельзя отменить.');
        if (!confirmed) return;
        const ok = await deleteCampaign(id);
        if (!ok) {
            setActionError('Не удалось удалить кампанию.');
            return;
        }
        setActionError(null);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-1">Управление UTM-метками</h2>
                    <p className="text-slate-400 text-sm">Отслеживайте эффективность ваших рекламных кампаний в реальном времени</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary/20"
                >
                    <Icon name="add" size={20} />
                    <span>Создать новую ссылку</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Уникальные клики</p>
                    <h3 className="text-3xl font-bold">{summary?.unique_clicks?.toLocaleString('ru-RU') ?? '0'}</h3>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Конверсии (Покупки)</p>
                    <h3 className="text-3xl font-bold">{summary?.purchases?.toLocaleString('ru-RU') ?? '0'}</h3>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                    <p className="text-slate-400 text-sm font-medium mb-1">Общий доход</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {formatAdminRevenue(summary?.revenue_rub ?? 0, 'RUB')}
                    </h3>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {formatAdminRevenue(summary?.revenue_usd ?? 0, 'USD')}
                    </p>
                </div>
            </div>

            {(error || actionError) && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error || actionError}
                </div>
            )}

            <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark">
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <h4 className="font-bold">Активные кампании</h4>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
                                placeholder="Поиск по названию..."
                                type="text"
                            />
                        </div>
                        <button
                            onClick={() => setIsFiltersOpen((prev) => !prev)}
                            className="px-3 py-2 border border-slate-200 dark:border-border-dark rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-background-dark transition-colors flex items-center gap-2"
                        >
                            <Icon name="tune" size={16} />
                            Фильтр
                        </button>
                    </div>
                </div>
                {isFiltersOpen && (
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-border-dark bg-slate-50/70 dark:bg-background-dark/40 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                            value={filterIsActive}
                            onChange={(e) => {
                                setFilterIsActive(e.target.value as 'all' | 'active' | 'inactive');
                                setPage(1);
                            }}
                            className="bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">Все статусы</option>
                            <option value="active">Только активные</option>
                            <option value="inactive">Только отключенные</option>
                        </select>
                        <input
                            type="datetime-local"
                            value={filterFrom}
                            onChange={(e) => {
                                setFilterFrom(e.target.value);
                                setPage(1);
                            }}
                            className="bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                            type="datetime-local"
                            value={filterTo}
                            onChange={(e) => {
                                setFilterTo(e.target.value);
                                setPage(1);
                            }}
                            className="bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                            onClick={() => {
                                setFilterIsActive('all');
                                setFilterFrom('');
                                setFilterTo('');
                                setPage(1);
                            }}
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-border-dark hover:bg-white dark:hover:bg-background-dark"
                        >
                            Сбросить
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Загрузка...</div>
                    ) : (
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-primary/5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">Название кампании</th>
                                    <th className="px-6 py-4">Ссылка /start</th>
                                    <th className="px-6 py-4 text-center">Уникальные клики</th>
                                    <th className="px-6 py-4 text-center">Регистрации</th>
                                    <th className="px-6 py-4 text-center">Покупки</th>
                                    <th className="px-6 py-4">Доход</th>
                                    <th className="px-6 py-4 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                {filteredItems.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                                                    <Icon name="campaign" size={18} />
                                                </div>
                                                <Link href={`/utm/${campaign.id}`} className="font-semibold hover:text-primary transition-colors">
                                                    {campaign.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <code className="bg-slate-100 dark:bg-background-dark px-2 py-1 rounded text-primary font-mono text-sm">{campaign.link}</code>
                                        </td>
                                        <td className="px-6 py-5 text-center font-medium">{campaign.unique_clicks}</td>
                                        <td className="px-6 py-5 text-center font-medium">{campaign.registrations}</td>
                                        <td className="px-6 py-5 text-center font-medium">{campaign.purchases}</td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                {formatAdminRevenue(campaign.revenue_rub, 'RUB')}
                                            </div>
                                            <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                                                {formatAdminRevenue(campaign.revenue_usd, 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleCopy(campaign.id, campaign.link)}
                                                    className={`p-2 rounded-lg transition-all ${copiedId === campaign.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-primary hover:bg-primary/10'}`}
                                                    title="Копировать"
                                                >
                                                    <Icon name={copiedId === campaign.id ? 'check' : 'content_copy'} size={18} />
                                                </button>
                                                <Link
                                                    href={`/utm/${campaign.id}?edit=true`}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center"
                                                    title="Настройки"
                                                >
                                                    <Icon name="settings" size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(campaign.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Удалить"
                                                    disabled={deletingId === campaign.id}
                                                >
                                                    <Icon name="delete" size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-border-dark text-sm text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span>
                        Показано {filteredItems.length} из {total} кампаний
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={!hasPrev || isLoading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark disabled:opacity-40"
                        >
                            Назад
                        </button>
                        <span className="text-xs">Страница {page}</span>
                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!hasNext || isLoading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark disabled:opacity-40"
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Создать UTM-метку</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Icon name="close" size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formError && <div className="text-sm text-red-500">{formError}</div>}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Название кампании</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start параметр</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={formData.start_code}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, start_code: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 font-mono text-sm"
                                        placeholder="autumn_sale"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                start_code: generateStartCode(prev.name),
                                            }))
                                        }
                                        className="shrink-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-xs font-bold uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Генер.
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="utm_source" value={formData.utm_source} onChange={(e) => setFormData((p) => ({ ...p, utm_source: e.target.value }))} className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-sm" />
                                <input placeholder="utm_medium" value={formData.utm_medium} onChange={(e) => setFormData((p) => ({ ...p, utm_medium: e.target.value }))} className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-sm" />
                                <input placeholder="utm_campaign" value={formData.utm_campaign} onChange={(e) => setFormData((p) => ({ ...p, utm_campaign: e.target.value }))} className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-sm" />
                                <input placeholder="utm_content" value={formData.utm_content} onChange={(e) => setFormData((p) => ({ ...p, utm_content: e.target.value }))} className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-sm" />
                                <input placeholder="utm_term" value={formData.utm_term} onChange={(e) => setFormData((p) => ({ ...p, utm_term: e.target.value }))} className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-sm col-span-2" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 font-medium"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60"
                                >
                                    {isCreating ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
