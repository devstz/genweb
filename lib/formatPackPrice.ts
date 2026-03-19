import type { DisplayCurrency, Pack } from '@/lib/types/packs';

/** Цена для карточки в админке по выбранной валюте */
export function formatPackPriceForAdmin(pack: Pack, currency: DisplayCurrency): string {
    const pc = pack.prices_by_currency;
    const v = pc?.[currency] ?? (currency === 'RUB' ? pack.price : undefined);
    if (v == null || Number.isNaN(Number(v))) return '—';
    const n = Number(v);
    if (currency === 'RUB') {
        return Number.isInteger(n) ? `${n} ₽` : `${n.toFixed(2)} ₽`;
    }
    if (currency === 'USD') {
        return `$${n.toFixed(2)}`;
    }
    return `${n.toFixed(2)} €`;
}
