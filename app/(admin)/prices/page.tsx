'use client';

import { Icon } from '@/components/admin/Icon';
import { useState } from 'react';
import { PackCard } from '@/components/admin/PackCard';
import { IconPicker } from '@/components/admin/IconPicker';
import { useAdminDisplayCurrency } from '@/hooks/useAdminDisplayCurrency';
import { usePacks } from '@/hooks/usePacks';
import type { DisplayCurrency, LavaOffer, Pack } from '@/lib/types/packs';
import { api } from '@/lib/axios';
import axios from 'axios';

export default function PricesPage() {
    const { packs, isLoading, error, createPack, updatePack, deletePack, togglePack, togglingId } = usePacks();
    const { displayCurrency } = useAdminDisplayCurrency();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<Pack | null>(null);
    const [formData, setFormData] = useState<Partial<Pack>>({});
    const [isLavaModalOpen, setIsLavaModalOpen] = useState(false);
    const [lavaOffers, setLavaOffers] = useState<LavaOffer[]>([]);
    const [lavaLoading, setLavaLoading] = useState(false);
    const [lavaError, setLavaError] = useState<string | null>(null);

    const handleOpenForm = (pack?: Pack) => {
        if (pack) {
            const rub = pack.prices_by_currency?.RUB ?? pack.price;
            setEditingPack(pack);
            setFormData({
                name: pack.name,
                description: pack.description ?? '',
                generations_count: pack.generations_count,
                price: rub,
                prices_by_currency: {
                    RUB: rub,
                    USD: pack.prices_by_currency?.USD,
                    EUR: pack.prices_by_currency?.EUR,
                },
                icon: pack.icon ?? 'payments',
                is_active: pack.is_active,
                is_bestseller: pack.is_bestseller,
                lava_offer_id: pack.lava_offer_id ?? '',
            });
        } else {
            setEditingPack(null);
            setFormData({
                name: '',
                description: '',
                generations_count: 10,
                price: 0,
                prices_by_currency: { RUB: 0 },
                icon: 'payments',
                is_active: true,
                is_bestseller: false,
                lava_offer_id: '',
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPack(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const rub = formData.price ?? 0;
        const pc = formData.prices_by_currency ?? {};
        const prices_by_currency: Partial<Record<DisplayCurrency, number>> = { RUB: rub };
        if (pc.USD != null && !Number.isNaN(Number(pc.USD))) {
            prices_by_currency.USD = Number(pc.USD);
        }
        if (pc.EUR != null && !Number.isNaN(Number(pc.EUR))) {
            prices_by_currency.EUR = Number(pc.EUR);
        }
        const payload = {
            name: formData.name ?? '',
            description: formData.description ?? undefined,
            generations_count: formData.generations_count ?? 0,
            price: rub,
            prices_by_currency,
            icon: formData.icon ?? 'payments',
            is_active: formData.is_active ?? true,
            is_bestseller: formData.is_bestseller ?? false,
            lava_offer_id: formData.lava_offer_id?.trim() || undefined,
        };
        if (editingPack) {
            const ok = await updatePack(editingPack.id, payload);
            if (ok) handleCloseForm();
        } else {
            const created = await createPack(payload);
            if (created) handleCloseForm();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот пакет?')) return;
        await deletePack(id);
    };

    const fetchLavaOffers = async () => {
        setLavaLoading(true);
        setLavaError(null);
        try {
            const { data } = await api.get('/admin/lava/products');
            const items = Array.isArray(data?.items) ? data.items : [];
            const offers: LavaOffer[] = [];

            items.forEach((item: unknown) => {
                if (!item || typeof item !== 'object') return;
                const itemObj = item as Record<string, unknown>;
                const product =
                    itemObj.data && typeof itemObj.data === 'object'
                        ? (itemObj.data as Record<string, unknown>)
                        : itemObj;
                const productId = String(product.id ?? '');
                const productTitle = String(product.title ?? 'Без названия');
                const productOffers = Array.isArray(product.offers) ? product.offers : [];
                productOffers.forEach((offer: unknown) => {
                    if (!offer || typeof offer !== 'object') return;
                    const offerObj = offer as Record<string, unknown>;
                    const prices = Array.isArray(offerObj.prices) ? offerObj.prices : [];
                    const normalized: { amount: number; currency: string }[] = [];
                    prices.forEach((p) => {
                        if (!p || typeof p !== 'object') return;
                        const po = p as Record<string, unknown>;
                        const cur = String(po.currency ?? '').toUpperCase();
                        const amt = typeof po.amount === 'number' ? po.amount : null;
                        if (amt != null && cur) normalized.push({ amount: amt, currency: cur });
                    });
                    const rubPrice = normalized.find((p) => p.currency === 'RUB');
                    const firstPrice = rubPrice ?? normalized[0] ?? null;
                    offers.push({
                        productId,
                        productTitle,
                        offerId: String(offerObj.id ?? ''),
                        offerName: String(offerObj.name ?? 'Offer'),
                        amount: firstPrice?.amount ?? null,
                        currency: firstPrice?.currency ?? null,
                        prices: normalized,
                    });
                });
            });

            setLavaOffers(offers.filter((offer) => offer.offerId));
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setLavaError((err.response?.data?.detail as string) || 'Не удалось загрузить продукты Lava.top.');
            } else {
                setLavaError('Не удалось загрузить продукты Lava.top.');
            }
            setLavaOffers([]);
        } finally {
            setLavaLoading(false);
        }
    };

    const openLavaModal = async () => {
        setIsLavaModalOpen(true);
        await fetchLavaOffers();
    };

    if (isFormOpen) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <button
                    onClick={handleCloseForm}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm"
                >
                    <Icon name="arrow_back" size={14} /> Назад к ценам
                </button>

                <div>
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <div className="w-8 md:w-10 h-1 bg-primary rounded-full" />
                        <h3 className="text-xl md:text-2xl font-black">
                            {editingPack ? 'Редактирование пакета' : 'Новый тарифный пакет'}
                        </h3>
                    </div>

                    <form
                        onSubmit={handleSave}
                        className="space-y-6 md:space-y-8 bg-white dark:bg-surface-dark p-5 md:p-10 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm max-w-2xl"
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Название</label>
                                <input
                                    required
                                    value={formData.name ?? ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                    placeholder="Стартовый"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Описание</label>
                                <textarea
                                    value={formData.description ?? ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3 min-h-[80px]"
                                    placeholder="Краткое описание пакета"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Кол-во генераций</label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        value={formData.generations_count ?? 0}
                                        onChange={(e) => setFormData({ ...formData, generations_count: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Цена (₽)</label>
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.price ?? 0}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value) || 0;
                                            setFormData({
                                                ...formData,
                                                price: v,
                                                prices_by_currency: {
                                                    ...(formData.prices_by_currency ?? {}),
                                                    RUB: v,
                                                },
                                            });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Цена (USD)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.prices_by_currency?.USD ?? ''}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            setFormData({
                                                ...formData,
                                                prices_by_currency: {
                                                    ...(formData.prices_by_currency ?? {}),
                                                    USD: raw === '' ? undefined : parseFloat(raw),
                                                },
                                            });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                        placeholder="Необязательно"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Цена (EUR)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.prices_by_currency?.EUR ?? ''}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            setFormData({
                                                ...formData,
                                                prices_by_currency: {
                                                    ...(formData.prices_by_currency ?? {}),
                                                    EUR: raw === '' ? undefined : parseFloat(raw),
                                                },
                                            });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                        placeholder="Необязательно"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Lava.top Offer ID</label>
                                <div className="flex gap-2">
                                    <input
                                        value={formData.lava_offer_id ?? ''}
                                        onChange={(e) => setFormData({ ...formData, lava_offer_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3 font-mono"
                                        placeholder="UUID offerId из Lava.top"
                                        type="text"
                                    />
                                    <button
                                        type="button"
                                        onClick={openLavaModal}
                                        className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:opacity-90"
                                    >
                                        Выбрать
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Иконка</label>
                                <IconPicker
                                    value={formData.icon ?? 'payments'}
                                    onChange={(icon) => setFormData({ ...formData, icon })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active ?? true}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium">Активен</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_bestseller ?? false}
                                        onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium">Бестселлер</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                {editingPack ? 'Сохранить' : 'Создать'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:opacity-90"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>

                {isLavaModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold">Выбор offerId из Lava.top</h4>
                                <button onClick={() => setIsLavaModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                    ✕
                                </button>
                            </div>
                            {lavaLoading ? (
                                <p className="text-sm text-slate-500">Загрузка...</p>
                            ) : lavaError ? (
                                <p className="text-sm text-red-500">{lavaError}</p>
                            ) : lavaOffers.length === 0 ? (
                                <p className="text-sm text-slate-500">Офферы не найдены.</p>
                            ) : (
                                <div className="overflow-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="text-left p-3">Продукт</th>
                                                <th className="text-left p-3">Оффер</th>
                                                <th className="text-left p-3">Цена</th>
                                                <th className="text-left p-3">Offer ID</th>
                                                <th className="text-left p-3" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lavaOffers.map((offer) => (
                                                <tr key={offer.offerId} className="border-t border-slate-100 dark:border-slate-800">
                                                    <td className="p-3">{offer.productTitle}</td>
                                                    <td className="p-3">{offer.offerName}</td>
                                                    <td className="p-3">
                                                        {offer.prices && offer.prices.length > 0
                                                            ? offer.prices.map((p) => `${p.amount} ${p.currency}`).join(', ')
                                                            : `${offer.amount ?? '—'} ${offer.currency ?? ''}`}
                                                    </td>
                                                    <td className="p-3 font-mono text-xs">{offer.offerId}</td>
                                                    <td className="p-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const byCur: Partial<Record<DisplayCurrency, number>> = {};
                                                                if (offer.prices?.length) {
                                                                    offer.prices.forEach((p) => {
                                                                        const c = p.currency.toUpperCase() as DisplayCurrency;
                                                                        if (c === 'RUB' || c === 'USD' || c === 'EUR') {
                                                                            byCur[c] = p.amount;
                                                                        }
                                                                    });
                                                                } else if (offer.amount != null && offer.currency) {
                                                                    const c = offer.currency.toUpperCase() as DisplayCurrency;
                                                                    if (c === 'RUB' || c === 'USD' || c === 'EUR') {
                                                                        byCur[c] = offer.amount;
                                                                    }
                                                                }
                                                                const rub = byCur.RUB;
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    lava_offer_id: offer.offerId,
                                                                    ...(rub != null ? { price: rub } : {}),
                                                                    prices_by_currency: {
                                                                        ...(prev.prices_by_currency ?? {}),
                                                                        ...byCur,
                                                                    },
                                                                }));
                                                                setIsLavaModalOpen(false);
                                                            }}
                                                            className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-xs"
                                                        >
                                                            Выбрать
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">
                    Управление тарифными пакетами для покупки генераций
                </p>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                    <Icon name="add" size={18} />
                    Добавить пакет
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">Загрузка…</div>
            ) : packs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-xl">
                    Пока нет пакетов. Нажмите «Добавить пакет», чтобы создать первый.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packs.map((pack) => (
                        <PackCard
                            key={pack.id}
                            pack={pack}
                            displayCurrency={displayCurrency}
                            isToggling={togglingId === pack.id}
                            onToggle={() => togglePack(pack.id)}
                            onEdit={() => handleOpenForm(pack)}
                            onDelete={() => handleDelete(pack.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
