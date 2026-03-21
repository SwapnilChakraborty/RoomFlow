import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, Phone, Mail, Award, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export function StaffTeam() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await secureFetch(`${API_URL}/api/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            }
        } catch (err) {
            console.error('Failed to fetch team:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Team Members...</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Our Team</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {staff.length} Active Staff Members
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name or role..."
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Team List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredStaff.map((member, index) => (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-4 border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-xl uppercase">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                            member.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'
                                        }`} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="font-black text-slate-900 leading-tight">{member.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={member.role === 'Admin' ? 'blue' : 'slate'} className="px-2 py-0.5 text-[8px] font-black tracking-widest">
                                                {member.role.toUpperCase()}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock size={10} />
                                                {member.shiftStart || '09:00'} - {member.shiftEnd || '18:00'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        <button className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                                            <Phone size={16} />
                                        </button>
                                        <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                                            <Mail size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredStaff.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">No staff found</p>
                </div>
            )}
        </div>
    );
}
