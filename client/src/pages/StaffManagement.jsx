import React, { useState, useEffect } from 'react';
import { Users, Clock, Star, MoreVertical, Loader2, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, perfRes] = await Promise.all([
                secureFetch(`${API_URL}/api/staff`),
                secureFetch(`${API_URL}/api/admin/staff-performance-stats`)
            ]);

            const [staffData, perfData] = await Promise.all([
                staffRes.json(),
                perfRes.json()
            ]);

            setStaff(staffData);
            setPerformance(perfData);
        } catch (err) {
            console.error('Error fetching staff data:', err);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    const filteredPerformance = performance.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={36} />
                        Staff Management
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
                        Performance & Shifts
                    </p>
                </div>
                
                <Link 
                    to="/admin/staff/register"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
                >
                    <UserPlus size={20} />
                    Add New Staff
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    label="Total Staff" 
                    value={staff.length} 
                    icon={<Users className="text-blue-500" />} 
                    color="blue" 
                />
                <StatCard 
                    label="Avg Rating" 
                    value={performance.length > 0 ? (performance.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / performance.length).toFixed(1) : "5.0"} 
                    icon={<Star className="text-yellow-500" />} 
                    color="yellow" 
                />
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search staff members..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Performance Table */}
            <Card className="overflow-hidden border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks Completed</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Time</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPerformance.map(p => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm leading-tight">{p.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="blue" className="px-2 py-0.5 font-black">{p.tasksCompleted}</Badge>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                        <Clock size={14} className="text-slate-300" />
                                        {p.avgCompletionTime}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="font-black text-slate-900 text-sm">{p.rating}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600'
    };
    return (
        <Card className="p-6 border-slate-100">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${colors[color]}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                </div>
            </div>
        </Card>
    );
}
