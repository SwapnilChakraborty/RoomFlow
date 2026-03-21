import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    ClipboardList,
    Star,
    DollarSign,
    ChevronRight,
    Filter,
    Download,
    Bed,
    Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatWidget } from '../components/ui/StatWidget';
import { AreaChart } from '../components/admin/AreaChart';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [hotelName, setHotelName] = useState('Grand Hyatt');
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes, settingsRes] = await Promise.all([
                    secureFetch(`${API_URL}/api/stats`),
                    secureFetch(`${API_URL}/api/activity`),
                    secureFetch(`${API_URL}/api/settings`)
                ]);
                const statsData = await statsRes.json();
                const activityData = await activityRes.json();
                const settingsData = await settingsRes.json();

                if (settingsData.hotelName) setHotelName(settingsData.hotelName);
                
                setStats(statsData);
                setActivities(activityData.map(act => ({
                    ...act,
                    text: `Room ${act.room} ${act.type || 'Service'}: ${act.details}`
                })));
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        if (socket) {
            socket.on('stats_update', (newStats) => {
                setStats(newStats);
            });

            socket.on('admin_activity', (newActivity) => {
                setActivities(prev => {
                    const formatted = {
                        id: newActivity.id,
                        text: `Room ${newActivity.room} ${newActivity.type || 'Service'}: ${newActivity.details}`,
                        time: newActivity.time || new Date(),
                        type: newActivity.type,
                        status: newActivity.status || 'Pending'
                    };
                    return [formatted, ...prev].slice(0, 10);
                });
            });

            socket.on('admin_activity_update', (data) => {
                const { requestId, status } = data;
                setActivities(prev => prev.map(act =>
                    act.id === requestId ? { ...act, status } : act
                ));
            });
        }

        return () => {
            if (socket) {
                socket.off('stats_update');
                socket.off('admin_activity');
                socket.off('admin_activity_update');
            }
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Management Data...</p>
            </div>
        );
    }
    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight text-white/110">Executive Dashboard</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium mt-1 inline-flex items-center gap-2">
                        Property oversight for <span className="text-primary font-black px-2 py-0.5 bg-primary/5 rounded-lg">{hotelName} RF-PRO</span>
                        <span className="text-[10px] font-black text-slate-300 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-widest">Instance: X792</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <Button variant="outline" size="md" className="gap-2 flex-1 md:flex-none justify-center">
                        <Download size={16} />
                        Export Data
                    </Button>
                    <Button variant="primary" size="md" className="gap-2 flex-1 md:flex-none justify-center">
                        <Filter size={16} />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget
                    label="Active Rooms"
                    value={stats?.totalRooms.toString() || "0"}
                    trend={`${stats?.occupancyRate}% Occupied`}
                    positive={true}
                    icon={Bed}
                />
                <StatWidget
                    label="Active Guests"
                    value={stats?.totalGuests.toString() || "0"}
                    trend="Currently Inhouse"
                    positive={true}
                    icon={Users}
                />
                <StatWidget
                    label="Cleaning"
                    value={stats?.cleaningRooms.toString() || "0"}
                    trend="In Progress"
                    positive={false}
                    icon={ClipboardList}
                />
                <StatWidget
                    label="Revenue (Est)"
                    value={`$${(stats?.occupiedRooms * 150) || 0}`}
                    trend="+12% from yesterday"
                    positive={true}
                    icon={DollarSign}
                />
            </div>

            {/* Proprietary System Integrity Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl p-6 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <Star className="text-accent animate-pulse" size={32} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Verified Proprietary Instance</h3>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-1">System Core: RoomFlow Ultra v4.2.0-ULTRA</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 text-center w-full md:w-auto">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Integrity Status</p>
                            <p className="text-sm font-black text-accent mt-1 tracking-widest">100% SECURE</p>
                        </div>
                        <div className="px-6 py-3 bg-accent text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/20 cursor-default hover:scale-105 transition-transform">
                            License Active
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Analytics Chart */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    <Card className="p-4 md:p-10 border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-primary">Service Activity</h2>
                                <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Last 7 Days</p>
                            </div>
                            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                                <button className="flex-1 sm:flex-none px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-primary whitespace-nowrap">Volume</button>
                                <button className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors whitespace-nowrap">Revenue</button>
                            </div>
                        </div>
                        <div className="w-full h-80">
                            <AreaChart />
                        </div>
                        <div className="mt-6 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-4">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <Card soft className="p-4 md:p-8">
                            <h2 className="text-lg md:text-xl font-extrabold text-primary mb-4 md:mb-6">Staff Performance</h2>
                            <div className="space-y-4 md:space-y-6">
                                <RankingItem label="Housekeeping Team" percentage={92} />
                                <RankingItem label="Room Service (Kitchen)" percentage={85} />
                                <RankingItem label="Laundry Service" percentage={78} />
                            </div>
                        </Card>
                        <Card className="bg-primary p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[250px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                            <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-accent border-r-transparent flex items-center justify-center mb-4">
                                <span className="text-2xl md:text-3xl font-extrabold">98<span className="text-sm">%</span></span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold">Uptime Efficiency</h3>
                            <p className="text-white/60 text-[10px] md:text-xs font-medium mt-2 max-w-[200px]">System is performing optimally with zero downtime reported today.</p>
                        </Card>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <Card className="flex flex-col h-full border-slate-100 p-0 overflow-hidden shadow-2xl shadow-slate-200/30">
                    <div className="p-4 md:p-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-lg md:text-xl font-extrabold text-primary">Live Pulse</h2>
                        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 max-h-[500px]">
                        {activities.length > 0 ? activities.map(item => (
                            <ActivityItem
                                key={item.id}
                                text={item.text}
                                time={new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                                type={item.type}
                                status={item.status}
                            />
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No recent activity</p>
                            </div>
                        )}
                    </div>
                    <button className="p-6 text-center text-xs font-bold text-accent hover:bg-slate-50 transition-all border-t border-slate-50 uppercase tracking-widest">
                        Detailed Activity Log
                    </button>
                </Card>
            </div>
        </div>
    );
}

function RankingItem({ label, percentage }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-primary">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                <div
                    className="bg-accent h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function ActivityItem({ text, time, type, status }) {
    const colors = {
        service: 'bg-accent shadow-accent/20',
        order: 'bg-orange-400 shadow-orange-400/20',
        msg: 'bg-primary shadow-primary/20',
        system: 'bg-slate-400 shadow-slate-400/20',
        action: 'bg-blue-400 shadow-blue-400/20'
    };

    return (
        <div className="flex gap-4 group cursor-default">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-lg ${colors[type] || 'bg-slate-400'}`}></div>
            <div>
                <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors leading-snug flex items-center flex-wrap gap-2">
                    {text}
                    {status && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest ${status.toLowerCase() === 'completed' || status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-600' :
                            status.toLowerCase() === 'pending' || status.toLowerCase() === 'new' ? 'bg-orange-100 text-orange-500' :
                                'bg-blue-100 text-blue-500'
                            }`}>
                            {status}
                        </span>
                    )}
                </p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5">{time}</p>
            </div>
        </div>
    );
}
