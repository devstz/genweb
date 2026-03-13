export interface GenerationLog {
    id: string;
    created_at: string;
    source_image_url: string;
    user_prompt: string | null;
    result_video_url: string | null;
    status: string;
    error_message: string | null;
}

export interface GenerationLogListResponse {
    items: GenerationLog[];
    total: number;
}
