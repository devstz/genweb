export const DUMMY_METRICS = {
    uniqueUsers: { value: '12,845', change: '+12.4%', isPositive: true, icon: 'group' },
    revenueToday: { value: '$1,240.50', change: '+5.2%', isPositive: true, icon: 'payments' },
    revenueMonth: { value: '$34,810.00', change: '-2.1%', isPositive: false, icon: 'calendar_month' },
};

export const TOP_TEMPLATES = [
    { id: 1, name: 'AI Image Gen Pro', usageCount: 4281, successRate: 88 },
    { id: 2, name: 'Content Rewrite', usageCount: 3105, successRate: 76 },
    { id: 3, name: 'Code Helper', usageCount: 2890, successRate: 92 },
    { id: 4, name: 'Summarizer', usageCount: 1940, successRate: 64 },
    { id: 5, name: 'Translator', usageCount: 1210, successRate: 51 },
];

export const CONVERSION_FUNNEL = [
    { label: 'Старт: 100%', percentage: 100, twWidth: 'w-full', twBg: 'bg-primary' },
    { label: 'Взаимодействие: 75%', percentage: 75, twWidth: 'w-[75%]', twBg: 'bg-primary/80' },
    { label: 'Оплата: 30%', percentage: 30, twWidth: 'w-[30%]', twBg: 'bg-primary/60' },
    { label: 'Лояльность: 12%', percentage: 12, twWidth: 'w-[12%]', twBg: 'bg-primary/40' },
];

export const SYSTEM_HEALTH = [
    { label: 'Тайм-ауты', subLabel: 'Критические ошибки', value: '14', icon: 'speed', iconColor: 'text-amber-500' },
    { label: 'Сбои БД', subLabel: 'Ошибки соединения', value: '2', icon: 'timer_off', iconColor: 'text-red-500' },
    { label: 'Аптайм API', subLabel: 'Общий статус', value: '99.98%', icon: 'check_circle', iconColor: 'text-emerald-500', isGreen: true },
];

export const PROFILE_INFO = {
    name: 'Alex Rivera',
    role: 'Суперадмин',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwrB7uZIeP11jBzf0HicLfWCkrmTFdmQT-CwzmwtJPcFYHfyYJMMo1_DHrNNc7YqS37Cz_67jrsbO7JMSHZJL_wXf759O7GvvFL7g9AXTSJfKj2tTUjlnAn4zissU8y2pP06xL5t37EuzdR0DxemVh9qyge884NM_Dn8rKTRgm7JHbSssVUuhRBWhpFkg1i2ElFU33jyMiVx-5yXgs4ASfYpCDws6dVRFhjgaxUfJfKqP4E4tELoT607UqWWUvf6aM7VzFnsSjTg',
};
