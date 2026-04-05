export type AudienceFilter = 'all' | 'active_24h' | 'new_7d' | 'inactive_1d';

export interface Mailing {
    id: string;
    message: string;
    audience_filter: string;
    status: string;
    recipient_count: number;
    created_at: string;
    sent_at: string | null;
    attachment_path?: string | null;
    attachment_type?: string | null;
}

export interface AudienceStats {
    count: number;
    total: number;
    percent: number;
}
