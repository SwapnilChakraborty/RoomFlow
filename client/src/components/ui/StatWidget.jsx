import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

export function StatWidget({ label, value, trend, positive = true, icon: Icon }) {
    return (
        <Card soft className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                    {Icon && <Icon size={24} />}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-extrabold text-primary mt-1">{value}</p>
            </div>
        </Card>
    );
}
