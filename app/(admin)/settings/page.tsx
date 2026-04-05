'use client';

import { useAdminDisplayCurrency } from '@/hooks/useAdminDisplayCurrency';
import { useProfile } from '@/hooks/useProfile';
import { api } from '@/lib/axios';
import type { DisplayCurrency, PaymentProviderSettings } from '@/lib/types/packs';
import axios from 'axios';
import { CheckCircle2, Globe, History, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function SettingsPage() {
    const { profile, isLoading, refreshProfile } = useProfile();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [twofaSaving, setTwofaSaving] = useState(false);
    const [twofaError, setTwofaError] = useState<string | null>(null);
    const [paymentSettings, setPaymentSettings] = useState<PaymentProviderSettings | null>(null);
    const [paymentProviderDraft, setPaymentProviderDraft] = useState<'mock' | 'lava'>('mock');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const { displayCurrency, isLoading: displayCurrencyLoading, error: displayCurrencyLoadError, refresh: refreshDisplayCurrency } =
        useAdminDisplayCurrency();
    const [displayCurrencyDraft, setDisplayCurrencyDraft] = useState<DisplayCurrency>('RUB');
    const [displayCurrencySaving, setDisplayCurrencySaving] = useState(false);
    const [displayCurrencyMessage, setDisplayCurrencyMessage] = useState<string | null>(null);
    const [displayCurrencyError, setDisplayCurrencyError] = useState<string | null>(null);

    const telegramName = useMemo(() => {
        if (!profile) return '—';
        return profile.username ? `@${profile.username}` : 'не указан';
    }, [profile]);

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            setPaymentLoading(true);
            setPaymentError(null);
            try {
                const { data } = await api.get<PaymentProviderSettings>('/admin/settings/payment');
                setPaymentSettings(data);
                setPaymentProviderDraft(data.provider);
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setPaymentError((err.response?.data?.detail as string) || 'Не удалось загрузить настройки платежей.');
                } else {
                    setPaymentError('Не удалось загрузить настройки платежей.');
                }
            } finally {
                setPaymentLoading(false);
            }
        };
        fetchPaymentSettings();
    }, []);

    useEffect(() => {
        setDisplayCurrencyDraft(displayCurrency);
    }, [displayCurrency]);

    const updatePassword = async () => {
        setPasswordSaving(true);
        setPasswordMessage(null);
        setPasswordError(null);
        try {
            await api.post('/admin/auth/credentials/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setPasswordMessage('Пароль успешно обновлен.');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setPasswordError((err.response?.data?.detail as string) || 'Не удалось обновить пароль.');
            } else {
                setPasswordError('Не удалось обновить пароль.');
            }
        } finally {
            setPasswordSaving(false);
        }
    };

    const toggleTwoFa = async (enabled: boolean) => {
        setTwofaSaving(true);
        setTwofaError(null);
        try {
            await api.post('/admin/auth/credentials/toggle-2fa', { enabled });
            await refreshProfile();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setTwofaError((err.response?.data?.detail as string) || 'Не удалось обновить 2FA.');
            } else {
                setTwofaError('Не удалось обновить 2FA.');
            }
        } finally {
            setTwofaSaving(false);
        }
    };

    const saveDisplayCurrency = async () => {
        setDisplayCurrencySaving(true);
        setDisplayCurrencyMessage(null);
        setDisplayCurrencyError(null);
        try {
            await api.put('/admin/settings/display-currency', {
                admin_display_currency: displayCurrencyDraft,
            });
            await refreshDisplayCurrency();
            setDisplayCurrencyMessage('Валюта отображения сохранена.');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setDisplayCurrencyError(
                    (err.response?.data?.detail as string) || 'Не удалось сохранить валюту отображения.',
                );
            } else {
                setDisplayCurrencyError('Не удалось сохранить валюту отображения.');
            }
        } finally {
            setDisplayCurrencySaving(false);
        }
    };

    const savePaymentProvider = async () => {
        setPaymentSaving(true);
        setPaymentMessage(null);
        setPaymentError(null);
        try {
            const { data } = await api.put<PaymentProviderSettings>('/admin/settings/payment', {
                provider: paymentProviderDraft,
            });
            setPaymentSettings(data);
            setPaymentProviderDraft(data.provider);
            setPaymentMessage('Платежный провайдер сохранен.');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setPaymentError((err.response?.data?.detail as string) || 'Не удалось сохранить платежного провайдера.');
            } else {
                setPaymentError('Не удалось сохранить платежного провайдера.');
            }
        } finally {
            setPaymentSaving(false);
        }
    };

    if (isLoading || !profile) {
        return <div className="text-sm text-slate-500">Загрузка...</div>;
    }

    const twoFaClasses = profile.admin_require_telegram_2fa
        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
        : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-200';

    const currencyOptions: { value: DisplayCurrency; label: string }[] = [
        { value: 'RUB', label: 'Рубли (₽)' },
        { value: 'USD', label: 'Доллары ($)' },
        { value: 'EUR', label: 'Евро (€)' },
    ];

    function radioCardClass(active: boolean) {
        return active
            ? 'border-primary bg-primary/5 text-primary font-semibold'
            : 'border-slate-200 dark:border-border-dark hover:border-primary/40';
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column — profile card + activity */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                        <p className="text-primary font-medium text-sm">{profile.role}</p>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-border-dark">
                                <span className="text-slate-500 dark:text-slate-400">Telegram ID</span>
                                <span className="font-mono text-slate-900 dark:text-slate-200">{profile.user_id}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-border-dark">
                                <span className="text-slate-500 dark:text-slate-400">Telegram</span>
                                <span className="text-slate-900 dark:text-slate-200">{telegramName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2">
                                <span className="text-slate-500 dark:text-slate-400">Логин</span>
                                <span className="font-mono text-slate-900 dark:text-slate-200">{profile.admin_login ?? 'не задан'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Активность</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <History className="w-5 h-5 text-primary/60 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Последний вход</p>
                                    <p className="text-sm mt-0.5">—</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Globe className="w-5 h-5 text-primary/60 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">IP Адрес</p>
                                    <p className="text-sm font-mono mt-0.5">—</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column — settings cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Security */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-lg font-bold">Безопасность</h3>
                        </div>
                        <div className="p-5 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <h4 className="font-bold text-sm">Смена пароля</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Рекомендуется менять пароль регулярно</p>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <input
                                        type="password"
                                        placeholder="Текущий пароль"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Новый пароль"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                                    />
                                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                                    {passwordMessage && <p className="text-sm text-emerald-500">{passwordMessage}</p>}
                                    <button
                                        onClick={updatePassword}
                                        disabled={passwordSaving}
                                        className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all text-sm disabled:opacity-60"
                                    >
                                        {passwordSaving ? 'Сохранение...' : 'Обновить пароль'}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-border-dark" />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Двухфакторная аутентификация (2FA)</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">После ввода логина и пароля потребуется подтверждение входа в Telegram</p>
                                        {twofaError && <p className="text-sm text-red-500 mt-2">{twofaError}</p>}
                                    </div>
                                </div>
                                <button
                                    className={'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ' + twoFaClasses}
                                    disabled={twofaSaving}
                                    onClick={() => toggleTwoFa(!profile.admin_require_telegram_2fa)}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {profile.admin_require_telegram_2fa ? 'Включено' : 'Выключено'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Display currency */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-lg font-bold">Отображение цен в админке</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Какую валюту показывать на карточках пакетов</p>
                        </div>
                        <div className="p-5 space-y-4">
                            {displayCurrencyLoading ? (
                                <p className="text-sm text-slate-500">Загрузка...</p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-3">
                                        {currencyOptions.map((c) => (
                                            <label key={c.value} className={'flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ' + radioCardClass(displayCurrencyDraft === c.value)}>
                                                <input
                                                    type="radio"
                                                    name="admin_display_currency"
                                                    value={c.value}
                                                    checked={displayCurrencyDraft === c.value}
                                                    onChange={() => setDisplayCurrencyDraft(c.value)}
                                                    disabled={displayCurrencySaving}
                                                    className="sr-only"
                                                />
                                                <span className="text-sm">{c.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {displayCurrencyLoadError && (
                                        <p className="text-sm text-amber-600 dark:text-amber-400">{displayCurrencyLoadError}</p>
                                    )}
                                    {displayCurrencyError && <p className="text-sm text-red-500">{displayCurrencyError}</p>}
                                    {displayCurrencyMessage && (
                                        <p className="text-sm text-emerald-500">{displayCurrencyMessage}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={saveDisplayCurrency}
                                        disabled={displayCurrencySaving}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all text-sm disabled:opacity-60"
                                    >
                                        {displayCurrencySaving ? 'Сохраняем...' : 'Сохранить валюту'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment provider */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-lg font-bold">Платежная система</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            {paymentLoading ? (
                                <p className="text-sm text-slate-500">Загрузка настроек платежей...</p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-3">
                                        <label className={'flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ' + radioCardClass(paymentProviderDraft === 'mock')}>
                                            <input
                                                type="radio"
                                                name="payment_provider"
                                                value="mock"
                                                checked={paymentProviderDraft === 'mock'}
                                                onChange={() => setPaymentProviderDraft('mock')}
                                                disabled={paymentSaving}
                                                className="sr-only"
                                            />
                                            <span className="text-sm">Тестовая оплата (Mock)</span>
                                        </label>
                                        <label className={'flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ' + radioCardClass(paymentProviderDraft === 'lava')}>
                                            <input
                                                type="radio"
                                                name="payment_provider"
                                                value="lava"
                                                checked={paymentProviderDraft === 'lava'}
                                                onChange={() => setPaymentProviderDraft('lava')}
                                                disabled={paymentSaving}
                                                className="sr-only"
                                            />
                                            <span className="text-sm">Lava.top</span>
                                        </label>
                                    </div>

                                    {paymentSettings && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-background-dark rounded-lg p-3">
                                            <p>LAVA_API_KEY: <span className={paymentSettings.lava_api_key_configured ? 'font-mono text-emerald-500' : 'font-mono text-red-400'}>{paymentSettings.lava_api_key_configured ? 'настроен' : 'не настроен'}</span></p>
                                            <p>LAVA_WEBHOOK_SECRET: <span className={paymentSettings.lava_webhook_secret_configured ? 'font-mono text-emerald-500' : 'font-mono text-red-400'}>{paymentSettings.lava_webhook_secret_configured ? 'настроен' : 'не настроен'}</span></p>
                                        </div>
                                    )}

                                    {paymentError && <p className="text-sm text-red-500">{paymentError}</p>}
                                    {paymentMessage && <p className="text-sm text-emerald-500">{paymentMessage}</p>}

                                    <button
                                        onClick={savePaymentProvider}
                                        disabled={paymentSaving}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all text-sm disabled:opacity-60"
                                    >
                                        {paymentSaving ? 'Сохраняем...' : 'Сохранить провайдер'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
