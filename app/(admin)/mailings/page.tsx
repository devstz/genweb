'use client';

import { Icon } from '@/components/admin/Icon';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { useMailings } from '@/hooks/useMailings';
import { useAudienceStats } from '@/hooks/useAudienceStats';
import type { AudienceFilter } from '@/lib/types/mailings';

function insertFormat(
    text: string,
    selectionStart: number,
    selectionEnd: number,
    before: string,
    after: string
): { newText: string; newCursor: number } {
    const selected = text.slice(selectionStart, selectionEnd);
    const newText = text.slice(0, selectionStart) + before + selected + after + text.slice(selectionEnd);
    const newCursor = selectionStart + before.length + selected.length + after.length;
    return { newText, newCursor };
}

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'Все пользователи', icon: 'groups' },
    { value: 'active_24h', label: 'Активные (24ч)', icon: 'history' },
    { value: 'new_7d', label: 'Новые (7д)', icon: 'person_add' },
    { value: 'inactive_1d', label: 'Неактивные (1 день)', icon: 'schedule' },
];

function getAudienceLabel(audience_filter: string): string {
    const map: Record<string, string> = {
        all: 'Все пользователи',
        active_24h: 'Активные (24ч)',
        new_7d: 'Новые (7д)',
        inactive_1d: 'Неактивные (1 день)',
    };
    return map[audience_filter] ?? audience_filter;
}

const STATUS_STYLES: Record<string, string> = {
    sent: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    sending: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    failed: 'bg-red-500/20 text-red-600 dark:text-red-400',
    draft: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
    sent: 'Отправлено',
    sending: 'Отправляется',
    failed: 'Ошибка',
    draft: 'Черновик',
};

export default function MailingsPage() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState<AudienceFilter>('all');
    const [includeAdmins, setIncludeAdmins] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const { mailings, total, isLoading, error, sendMailing } = useMailings();
    const { stats, isLoading: statsLoading } = useAudienceStats(audience, includeAdmins);

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        setSendError(null);
        const ok = await sendMailing(message.trim(), audience, includeAdmins);
        setIsSending(false);
        if (ok) {
            setMessage('');
        } else {
            setSendError('Не удалось отправить рассылку');
        }
    };

    const handleFormat = (before: string, after: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const { newText, newCursor } = insertFormat(message, start, end, before, after);
        setMessage(newText);
        queueMicrotask(() => {
            el.focus();
            el.setSelectionRange(newCursor, newCursor);
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Рассылка новостей</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Создайте и отправьте сообщение пользователям бота в реальном времени
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
                    <div className="lg:col-span-2 space-y-6 lg:flex lg:flex-col">
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-xl overflow-hidden lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
                            <div className="p-6 flex-1 flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(false)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${!showPreview ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-primary/10'}`}
                                    >
                                        Редактирование
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${showPreview ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-primary/10'}`}
                                    >
                                        Превью
                                    </button>
                                </div>
                                <div className="flex items-stretch gap-4 flex-1 min-h-0">
                                    <div className="hidden md:flex size-12 rounded-full bg-primary/10 items-center justify-center shrink-0">
                                        <Icon name="edit_note" size={24} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col min-h-0">
                                        {showPreview ? (
                                            <div className="scrollbar-thin rounded-lg bg-slate-50 dark:bg-primary/5 p-4 text-lg text-slate-700 dark:text-slate-300 flex-1 min-h-[120px] [&_strong]:font-bold [&_em]:italic [&_code]:bg-slate-200 dark:[&_code]:bg-primary/20 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_a]:underline overflow-auto">
                                                {message ? <ReactMarkdown remarkPlugins={[remarkBreaks]}>{message}</ReactMarkdown> : <span className="text-slate-400">Нет текста для превью</span>}
                                            </div>
                                        ) : (
                                            <textarea
                                                ref={textareaRef}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="scrollbar-thin w-full flex-1 min-h-[120px] bg-transparent border-0 focus:ring-0 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none overflow-y-auto"
                                                placeholder="Введите текст… Поддерживается Markdown как в Telegram: *жирный* _курсив_ `код` [ссылка](url)"
                                            />
                                        )}
                                    </div>
                                </div>
                                {sendError && (
                                    <p className="mt-2 text-sm text-red-500">{sendError}</p>
                                )}
                            </div>
                            <div className="bg-slate-50 dark:bg-primary/5 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-primary/20">
                                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start flex-wrap">
                                    <button type="button" onClick={() => handleFormat('*', '*')} className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer font-bold" title="Жирный (*текст*)">
                                        <Icon name="format_bold" size={20} />
                                    </button>
                                    <button type="button" onClick={() => handleFormat('_', '_')} className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer italic" title="Курсив (_текст_)">
                                        <Icon name="format_italic" size={20} />
                                    </button>
                                    <button type="button" onClick={() => handleFormat('`', '`')} className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Код (`код`)">
                                        <Icon name="code" size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Добавить фото">
                                        <Icon name="image" size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Добавить видео">
                                        <Icon name="videocam" size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Смайлы">
                                        <Icon name="mood" size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-primary/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Прикрепить файл">
                                        <Icon name="attach_file" size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || isSending}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <Icon name="autorenew" size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Запустить рассылку</span>
                                            <Icon name="rocket_launch" size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                Фильтры аудитории
                            </h3>
                            <div className="space-y-3">
                                {AUDIENCE_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-primary/20 hover:bg-slate-50 dark:hover:bg-primary/5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon name={opt.icon} size={20} className="text-slate-400" />
                                            <span className="text-sm font-medium">{opt.label}</span>
                                        </div>
                                        <input
                                            checked={audience === opt.value}
                                            onChange={() => setAudience(opt.value)}
                                            className="text-primary focus:ring-primary bg-transparent border-slate-300 cursor-pointer"
                                            name="audience"
                                            type="radio"
                                        />
                                    </label>
                                ))}
                            </div>
                            <label className="flex items-center gap-3 mt-4 p-3 rounded-lg border border-slate-200 dark:border-primary/20 hover:bg-slate-50 dark:hover:bg-primary/5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeAdmins}
                                    onChange={(e) => setIncludeAdmins(e.target.checked)}
                                    className="text-primary focus:ring-primary bg-transparent border-slate-300 cursor-pointer rounded"
                                />
                                <span className="text-sm font-medium">Включить админов</span>
                            </label>
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-primary/10">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">Охват аудитории</span>
                                    <span className="font-bold">
                                        {statsLoading ? '…' : stats ? `${stats.count.toLocaleString('ru')} чел. (${stats.percent}%)` : '—'}
                                    </span>
                                </div>
                                {stats && stats.count === 0 ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Нет пользователей в выбранной аудитории</p>
                                ) : (
                                    <div className="w-full h-2 bg-slate-200 dark:bg-primary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: stats ? `${Math.min(stats.percent, 100)}%` : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-xl overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 p-6 pb-0 mb-4">
                    История рассылок
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-primary/10">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Загрузка…</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500 text-sm">{error}</div>
                    ) : mailings.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Пока нет рассылок</div>
                    ) : (
                        mailings.map((m) => {
                            const expanded = expandedId === m.id;
                            return (
                                <div
                                    key={m.id}
                                    className="border-b border-slate-100 dark:border-primary/10 last:border-b-0"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(expanded ? null : m.id)}
                                        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors cursor-pointer"
                                    >
                                        <div className="flex flex-wrap items-center gap-2 text-sm min-w-0">
                                            <span className="text-slate-900 dark:text-slate-100 font-medium">
                                                {format(new Date(m.created_at), 'dd.MM.yyyy HH:mm')}
                                            </span>
                                            <span>·</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[m.status] ?? STATUS_STYLES.draft}`}>
                                                {STATUS_LABELS[m.status] ?? m.status}
                                            </span>
                                            <span>·</span>
                                            <span className="text-slate-500 dark:text-slate-400">{getAudienceLabel(m.audience_filter)}</span>
                                            <span>·</span>
                                            <span className="text-slate-500 dark:text-slate-400">{m.recipient_count} чел.</span>
                                        </div>
                                        <Icon name="expand_more" size={24} className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expanded && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="rounded-lg bg-slate-50 dark:bg-primary/5 p-4 text-sm text-slate-700 dark:text-slate-300 [&_strong]:font-bold [&_em]:italic [&_code]:bg-slate-200 dark:[&_code]:bg-primary/20 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_a]:underline prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>{m.message || '—'}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
