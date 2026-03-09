import React from 'react';
import { TrendingUp, CheckCircle2, Clock, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';

export function Performance() {
    const stats = [
        { label: 'Tasks Completed', value: '24', change: '+12%', trending: 'up', icon: <CheckCircle2 className="text-green-500" /> },
        { label: 'Avg. Response', value: '14m', change: '-2m', trending: 'up', icon: <Clock className="text-blue-500" /> },
        { label: 'Guest Rating', value: '4.9', change: '+0.2', trending: 'up', icon: <Star className="text-orange-400" /> },
    ];

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Your Performance</h1>
                <p className="text-slate-400 font-medium">Tracking your service excellence</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-slate-800/50 border-white/5 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${stat.trending === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {stat.trending === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Efficiency Over Time</h3>
                <Card className="bg-slate-800/50 border-white/5 p-8 h-48 flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp size={48} className="text-slate-700 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold text-sm">Analytics engine initializing...</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
