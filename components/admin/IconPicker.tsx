'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@/components/admin/Icon';
import { cn } from '@/lib/utils';

export const PACK_ICON_OPTIONS = [
    'payments',
    'sell',
    'shopping_cart',
    'workspace_premium',
    'loyalty',
    'campaign',
    'diamond',
    'star',
    'auto_awesome',
    'bolt',
    'favorite',
    'redeem',
    'card_giftcard',
    'local_offer',
] as const;

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const currentIcon = value || 'payments';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-primary/10 py-2.5 px-3 font-normal hover:bg-slate-100 dark:hover:bg-primary/20 transition-colors text-left',
                    className
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Icon name={currentIcon} size={20} className="text-primary shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 text-sm truncate">{currentIcon}</span>
                </div>
                <Icon name="expand_more" size={20} className="text-slate-400 shrink-0" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-3" sideOffset={8}>
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
                    {PACK_ICON_OPTIONS.map((icon) => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => onChange(icon)}
                            className={cn(
                                'flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-primary/10',
                                currentIcon === icon
                                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                                    : 'text-slate-600 dark:text-slate-400'
                            )}
                            title={icon}
                        >
                            <Icon name={icon} size={24} />
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
