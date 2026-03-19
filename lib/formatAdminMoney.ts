import type { DisplayCurrency } from '@/lib/types/packs';

/** Форматирование сумм выручки в админке (дашборд, UTM). */
export function formatAdminRevenue(amount: number, currency: DisplayCurrency): string {
    if (Number.isNaN(amount)) return '—';
    const n = Number(amount);
    if (currency === 'RUB') {
        const rounded = Math.round(n);
        return `${rounded.toLocaleString('ru-RU')} ₽`;
    }
    if (currency === 'USD') {
        return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function parseDisplayCurrency(raw: string | undefined | null): DisplayCurrency {
    const c = (raw || 'RUB').toUpperCase();
    if (c === 'USD' || c === 'EUR') return c;
    return 'RUB';
}

/** Две строки выручки без смешивания валют (дашборд, UTM). */
export function formatRevenueRubUsdBlock(rub: number, usd: number): { rubLine: string; usdLine: string } {
    return {
        rubLine: formatAdminRevenue(rub, 'RUB'),
        usdLine: formatAdminRevenue(usd, 'USD'),
    };
}
