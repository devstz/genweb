'use client';

import { Icon } from '@/components/admin/Icon';
import { formatPackPriceForAdmin } from '@/lib/formatPackPrice';
import type { DisplayCurrency, Pack } from '@/lib/types/packs';

interface PackCardProps {
    pack: Pack;
    displayCurrency?: DisplayCurrency;
    isToggling?: boolean;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function PackCard({
    pack,
    displayCurrency = 'RUB',
    isToggling,
    onToggle,
    onEdit,
    onDelete,
}: PackCardProps) {
    const { id, name, description, generations_count, icon, is_active, is_bestseller } = pack;

    const cardClasses = `bg-white dark:bg-surface-dark border rounded-xl overflow-hidden flex flex-col group transition-all ${
        is_active
            ? is_bestseller
                ? 'border-primary/30 shadow-2xl shadow-primary/10'
                : 'border-slate-200 dark:border-primary/20 hover:border-primary/50'
            : 'opacity-60 border-dashed border-slate-200 dark:border-white/10'
    }`;

    const iconContainerClasses = `p-2.5 sm:p-3 rounded-lg ${
        is_active ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    }`;

    const priceLabel = formatPackPriceForAdmin(pack, displayCurrency);

    return (
        <div className={`${cardClasses} relative`}>
            {isToggling && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 dark:bg-black/50 rounded-xl">
                    <Icon name="progress_activity" className="animate-spin text-2xl text-white" size={24} />
                </div>
            )}
            <div className="p-5 sm:p-6 flex-1 relative">
                {is_bestseller && (
                    <div className="absolute top-0 right-0 bg-primary px-2 py-1 sm:px-3 sm:py-1 rounded-bl-xl text-[9px] sm:text-[10px] font-bold uppercase text-white tracking-widest">
                        Бестселлер
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className={iconContainerClasses}>
                        <Icon name={icon} size={24} className="text-[20px] sm:text-[24px]" />
                    </div>

                    <label className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-300 dark:bg-slate-800 transition-colors shrink-0">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={is_active}
                            onChange={() => onToggle(id)}
                        />
                        <span className="absolute left-1 h-4 w-4 rounded-full bg-slate-500 dark:bg-slate-400 transition-all peer-checked:left-6 peer-checked:bg-white"></span>
                        <span className="absolute inset-0 rounded-full peer-checked:bg-primary/60 transition-colors"></span>
                    </label>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {description || '—'}
                </p>

                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            Генераций
                        </span>
                        <span className={`text-base sm:text-lg font-black ${is_active ? 'text-primary' : 'text-slate-500'}`}>
                            {generations_count}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            Цена
                        </span>
                        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{priceLabel}</span>
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex gap-2 sm:gap-3">
                <button
                    onClick={() => onEdit(id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                >
                    <Icon name="edit" size={18} className="text-[16px] sm:text-[18px]" />
                    Изменить
                </button>
                <button
                    onClick={() => onDelete(id)}
                    className="px-3 sm:px-4 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 rounded-lg transition-all cursor-pointer"
                >
                    <Icon name="delete" size={18} className="text-[16px] sm:text-[18px]" />
                </button>
            </div>
        </div>
    );
}
