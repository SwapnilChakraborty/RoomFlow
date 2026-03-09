import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'neutral', className }) {
    const variants = {
        neutral: 'bg-slate-100 text-slate-600',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        danger: 'bg-red-100 text-red-700',
        accent: 'bg-accent/10 text-accent',
        primary: 'bg-primary/10 text-primary',
    };

    return (
        <span className={twMerge(
            'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
