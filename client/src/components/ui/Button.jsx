import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-blue-900 shadow-md shadow-primary/10 hover:shadow-primary/20',
        accent: 'bg-accent text-white hover:bg-teal-600 shadow-md shadow-accent/10 hover:shadow-accent/20',
        secondary: 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-100',
        outline: 'border border-slate-200 bg-transparent text-slate-600 hover:border-primary hover:text-primary',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm font-semibold',
        lg: 'px-8 py-4 text-md font-bold',
    };

    return (
        <button
            className={twMerge(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
