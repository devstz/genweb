export interface UtmCampaign {
    id: string;
    name: string;
    start_code: string;
    link: string;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    is_active: boolean;
    created_at: string;
    unique_clicks: number;
    registrations: number;
    purchases: number;
    revenue_rub: number;
    revenue_usd: number;
}

export interface UtmCampaignListResponse {
    items: UtmCampaign[];
    total: number;
}

export interface UtmCampaignFilters {
    is_active?: boolean;
    from?: string;
    to?: string;
}

export interface UtmCampaignListParams extends UtmCampaignFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export interface UtmSummary {
    unique_clicks: number;
    new_users: number;
    purchases: number;
    revenue_rub: number;
    revenue_usd: number;
}

export interface UtmStats extends UtmSummary {
    conversion: number;
}

export interface UtmSeriesPoint {
    label: string;
    full_date: string;
    clicks: number;
    registrations: number;
    purchases: number;
    revenue_rub: number;
    revenue_usd: number;
}

export interface UtmSeriesResponse {
    items: UtmSeriesPoint[];
}

export interface UtmRegistration {
    user_id: number;
    username?: string | null;
    full_name?: string | null;
    created_at: string;
}

export interface UtmRegistrationListResponse {
    items: UtmRegistration[];
    total: number;
}

export interface UtmRegistrationListParams {
    limit?: number;
    offset?: number;
    from?: string;
    to?: string;
}

export interface UtmCreatePayload {
    name: string;
    start_code: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    is_active?: boolean;
}

export type UtmUpdatePayload = Partial<UtmCreatePayload>;
