import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, glass = false, soft = false, padding = true }) {
    return (
        <div
            className={twMerge(
                'rounded-[2rem] transition-all duration-300',
                glass && 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50',
                soft && 'bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50',
                !glass && !soft && 'bg-white border border-slate-100 shadow-lg shadow-slate-200/40',
                padding && 'p-8',
                className
            )}
        >
            {children}
        </div>
    );
}
