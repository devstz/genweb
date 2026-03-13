export interface Pack {
    id: string;
    name: string;
    description: string;
    generations_count: number;
    price: number;
    icon: string;
    is_active: boolean;
    is_bestseller: boolean;
    created_at?: string;
}
