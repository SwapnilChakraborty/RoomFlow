import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle2, Clock, Star, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function Performance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const staff = JSON.parse(localStorage.getItem('staff')) || { id: 'unknown' };

    useEffect(() => {
        const staffId = staff.id || staff._id; // Cover both cases
        secureFetch(`${API_URL}/api/staff-performance/${staffId}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching performance:', err);
                setLoading(false);
            });
    }, [staff.id, staff._id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return null;

    const stats = [
        { label: 'Tasks Completed', value: data.tasksCompleted, change: data.efficiencyTrend, trending: 'up', icon: <CheckCircle2 className="text-green-500" /> },
        { label: 'Avg. Response', value: data.avgResponse, change: data.responseTrend, trending: 'down', icon: <Clock className="text-blue-500" /> },
        { label: 'Guest Rating', value: data.guestRating, change: data.ratingTrend, trending: 'up', icon: <Star className="text-orange-400" /> },
    ];

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Performance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Tracking your service excellence</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl">
                    <Activity className="text-blue-600" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-white border-slate-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                                (stat.label === 'Avg. Response' && stat.trending === 'down') || (stat.label !== 'Avg. Response' && stat.trending === 'up')
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-red-50 text-red-600'
                                }`}>
                                {stat.trending === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency Trend</h3>
                    <span className="text-[10px] font-bold text-slate-400 italic">Last 7 Days</span>
                </div>
                <Card className="bg-white border-slate-100 p-8 h-56 flex flex-col justify-between shadow-sm">
                    <div className="flex-1 flex items-end gap-2">
                        {data.history && data.history.map((val, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${(val / (Math.max(...data.history, 1) * 1.2)) * 100}%` }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-t-lg transition-colors relative group"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {val} tasks
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>7 Days Ago</span>
                        <span>Today</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
