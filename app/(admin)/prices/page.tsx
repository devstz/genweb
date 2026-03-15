'use client';

import { Icon } from '@/components/admin/Icon';
import { useState } from 'react';
import { PackCard } from '@/components/admin/PackCard';
import { IconPicker } from '@/components/admin/IconPicker';
import { usePacks } from '@/hooks/usePacks';
import type { Pack } from '@/lib/types/packs';

export default function PricesPage() {
    const { packs, isLoading, error, createPack, updatePack, deletePack, togglePack, togglingId } = usePacks();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<Pack | null>(null);
    const [formData, setFormData] = useState<Partial<Pack>>({});

    const handleOpenForm = (pack?: Pack) => {
        if (pack) {
            setEditingPack(pack);
            setFormData({
                name: pack.name,
                description: pack.description ?? '',
                generations_count: pack.generations_count,
                price: pack.price,
                icon: pack.icon ?? 'payments',
                is_active: pack.is_active,
                is_bestseller: pack.is_bestseller,
            });
        } else {
            setEditingPack(null);
            setFormData({
                name: '',
                description: '',
                generations_count: 10,
                price: 0,
                icon: 'payments',
                is_active: true,
                is_bestseller: false,
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
        const payload = {
            name: formData.name ?? '',
            description: formData.description ?? undefined,
            generations_count: formData.generations_count ?? 0,
            price: formData.price ?? 0,
            icon: formData.icon ?? 'payments',
            is_active: formData.is_active ?? true,
            is_bestseller: formData.is_bestseller ?? false,
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
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                    />
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
