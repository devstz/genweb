export interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon?: string;
}

export function MetricCard({ title, value, change, isPositive, icon = "bar_chart" }: MetricCardProps) {
    const trendColorClass = isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10';

    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-border-dark shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-lg bg-primary/10 text-primary material-symbols-outlined">
                    {icon}
                </span>
                <span className={`${trendColorClass} text-xs font-bold px-2 py-1 rounded-full`}>
                    {change}
                </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}
