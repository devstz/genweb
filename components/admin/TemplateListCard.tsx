export interface TemplateItem {
    id: number | string;
    name: string;
    usageCount: number;
    successRate: number;
}

export function TemplateListCard({ templates }: { templates: TemplateItem[] }) {
    const colors = [
        'bg-indigo-500/10 text-indigo-500',
        'bg-orange-500/10 text-orange-500',
        'bg-sky-500/10 text-sky-500',
        'bg-pink-500/10 text-pink-500',
        'bg-emerald-500/10 text-emerald-500',
    ];

    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm h-full">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-6">Топ-5 шаблонов</h3>
            <div className="space-y-5">
                {templates.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 group cursor-default transition-all hover:translate-x-1">
                        <div className={`size-10 rounded-lg ${colors[index % colors.length]} flex items-center justify-center font-bold`}>
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.usageCount} использований</p>
                        </div>
                        <div className={`text-xs font-bold ${item.successRate > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {item.successRate}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
