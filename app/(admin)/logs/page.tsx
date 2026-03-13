'use client';

import { useState } from 'react';
import { useGenerations } from '@/hooks/useGenerations';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function fullMediaUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/api/proxy${path.startsWith('/') ? path : `/${path}`}`;
}

function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        completed: 'Завершено',
        failed: 'Ошибка',
        pending: 'В процессе',
        processing: 'В процессе',
    };
    return map[status] ?? status;
}

function getStatusClass(status: string) {
    if (status === 'completed') return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
    if (status === 'failed') return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
    return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400';
}

export default function LogsPage() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(0);
    const limit = 50;
    const { items, total, isLoading, error } = useGenerations(limit, page * limit, statusFilter || undefined);

    const totalPages = Math.ceil(total / limit) || 1;
    const hasNext = page < totalPages - 1;
    const hasPrev = page > 0;

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Логи генераций</h2>
                        <p className="text-slate-500 dark:text-slate-400">История последних запросов нейросети</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-primary/20 rounded-lg hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span>Экспорт CSV</span>
                        </button>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-primary/20 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300"
                        >
                            <option value="">Все статусы</option>
                            <option value="completed">Завершено</option>
                            <option value="failed">Ошибка</option>
                            <option value="pending">В процессе</option>
                            <option value="processing">В процессе</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-primary/5 border-b border-slate-200 dark:border-primary/20">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Дата/ID</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Исходное фото</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Промпт</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Результат</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium">
                                                    {item.created_at ? format(new Date(item.created_at), 'dd.MM.yyyy HH:mm', { locale: ru }) : '—'}
                                                </div>
                                                <div className="text-[10px] text-slate-400">#{item.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="size-16 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                                                    {item.source_image_url ? (
                                                        <img
                                                            src={fullMediaUrl(item.source_image_url)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-300 dark:bg-slate-700" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm line-clamp-2 max-w-xs italic text-slate-600 dark:text-slate-300">
                                                    {item.user_prompt ? `"${item.user_prompt}"` : '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.status === 'failed' ? (
                                                    <div className="flex items-center gap-2 text-red-500">
                                                        <span className="material-symbols-outlined">error</span>
                                                        <span className="text-xs font-medium">{item.error_message || 'Ошибка'}</span>
                                                    </div>
                                                ) : item.result_video_url ? (
                                                    <div className="size-16 rounded-lg bg-primary/20 flex flex-col items-center justify-center text-primary overflow-hidden relative group cursor-pointer">
                                                        <span className="material-symbols-outlined text-sm mb-1">movie</span>
                                                        <span className="text-[10px] font-bold uppercase">MP4</span>
                                                    </div>
                                                ) : item.status === 'processing' || item.status === 'pending' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-xs text-slate-400">В процессе</span>
                                                    </div>
                                                ) : (
                                                    <div className="size-16 rounded-lg bg-slate-100 dark:bg-primary/10 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">hourglass_empty</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusClass(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="px-4 md:px-6 py-4 bg-slate-50 dark:bg-primary/5 border-t border-slate-200 dark:border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                            Показано {items.length} из {total} записей
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={!hasPrev}
                                className="p-1.5 rounded bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 disabled:opacity-50 cursor-not-allowed disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-slate-50 dark:enabled:hover:bg-primary/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasNext}
                                className="p-1.5 rounded bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 disabled:opacity-50 cursor-not-allowed disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-slate-50 dark:enabled:hover:bg-primary/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
