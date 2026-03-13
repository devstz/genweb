export interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'active' | 'test' | 'hidden';
    image: string;
    prompt: string;
    negativePrompt: string;
}

export const CATEGORIES = [
    'Все',
    'Онбординг',
    'Продажи',
    'Поддержка',
    'Промо',
    'Контент',
] as const;

const DEFAULT_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAGk5jAQZWsx1pwKk1ZfnRDTArPKzDzQofsxwX4xZDzAGBazgkACgh7tLlFq_PFXd7b31vyhmgdAk5GMhBSHtgvL-01i8k08jExi8rfFMimJXO2yaohNICK__ZDGzkr2g8yy3CH9IaL8EvbqQ-yTHAeCLBX6q3D-NWOd3nF7GBkSK5M-mlB0KdCoitGqaNl_6YA0QKBESbJXLD8nKLenXV-lyJCidLO152JT_nGbSvaqdrwYh_yIiA36g3lXA-mEclY96y9beGBhA';

export const INITIAL_TEMPLATES: Template[] = [
    {
        id: '1',
        title: 'AI Image Gen Pro',
        description: 'Генерация изображений с помощью нейросети по текстовому описанию.',
        category: 'Контент',
        status: 'active',
        image: DEFAULT_IMAGE,
        prompt: 'Генерация изображений с помощью нейросети по текстовому описанию.',
        negativePrompt: 'Avoid blurry images, low resolution.',
    },
    {
        id: '2',
        title: 'Content Rewrite',
        description: 'Переписывание текста с сохранением смысла и улучшением стиля.',
        category: 'Контент',
        status: 'active',
        image: DEFAULT_IMAGE,
        prompt: 'Переписывание текста с сохранением смысла и улучшением стиля.',
        negativePrompt: 'Don\'t change the core meaning.',
    },
    {
        id: '3',
        title: 'Code Helper',
        description: 'Помощь с написанием и отладкой кода.',
        category: 'Поддержка',
        status: 'active',
        image: DEFAULT_IMAGE,
        prompt: 'Помощь с написанием и отладкой кода.',
        negativePrompt: 'Avoid suggesting deprecated APIs.',
    },
    {
        id: '4',
        title: 'Welcome Onboarding',
        description: 'Приветствие новых пользователей и знакомство с возможностями бота.',
        category: 'Онбординг',
        status: 'active',
        image: DEFAULT_IMAGE,
        prompt: 'Приветствие новых пользователей и знакомство с возможностями бота.',
        negativePrompt: 'Don\'t overwhelm with too many options at once.',
    },
    {
        id: '5',
        title: 'Premium Offer',
        description: 'Промо-сообщение о премиум подписке.',
        category: 'Промо',
        status: 'test',
        image: DEFAULT_IMAGE,
        prompt: 'Промо-сообщение о премиум подписке.',
        negativePrompt: 'Avoid aggressive sales language.',
    },
];
