'use client';

import { Icon } from '@/components/admin/Icon';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface CategoryDropdownProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CategoryDropdown({
    value,
    options,
    onChange,
    placeholder = 'Выберите',
    className = '',
    disabled = false,
}: CategoryDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-sm text-left text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
            >
                <span className={value ? '' : 'text-slate-400'}>{value || placeholder}</span>
                <Icon name="expand_more" size={20} className={cn('text-slate-400 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-500">Нет категорий</div>
                    ) : (
                        options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${value === opt ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-primary/10'}`}
                            >
                                {opt}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
