export type DisplayCurrency = 'RUB' | 'USD' | 'EUR';

export interface Pack {
    id: string;
    name: string;
    description: string;
    generations_count: number;
    price: number;
    /** Цены по валютам с бэка (Lava / ручной ввод) */
    prices_by_currency?: Partial<Record<DisplayCurrency, number>> | null;
    icon: string;
    is_active: boolean;
    is_bestseller: boolean;
    lava_offer_id?: string | null;
    created_at?: string;
}

export interface PaymentProviderSettings {
    provider: 'mock' | 'lava';
    lava_api_key_configured: boolean;
    lava_webhook_secret_configured: boolean;
}

export interface AdminDisplayCurrencySettings {
    admin_display_currency: DisplayCurrency;
}

export interface LavaOffer {
    productId: string;
    productTitle: string;
    offerId: string;
    offerName: string;
    amount?: number | null;
    currency?: string | null;
    /** Все валюты оффера из Lava (для подстановки в форму) */
    prices?: { amount: number; currency: string }[];
}
