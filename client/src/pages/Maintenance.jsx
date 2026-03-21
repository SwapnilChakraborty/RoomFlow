import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Wrench,
    Search,
    Filter,
    MoreVertical,
    Loader2,
    CheckCircle,
    XCircle,
    Hammer
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function Maintenance() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const { socket } = useSocket();

    useEffect(() => {
        fetchTasks();

        if (socket) {
            socket.on('room_status_changed', () => {
                fetchTasks();
            });
        }

        return () => {
            if (socket) socket.off('room_status_changed');
        };
    }, [socket]);

    const fetchTasks = async () => {
        try {
            const response = await secureFetch(`${API_URL}/api/maintenance`);
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch maintenance tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (roomNumber) => {
        try {
            const response = await secureFetch(`${API_URL}/api/update-room-status`, {
                method: 'POST',
                body: JSON.stringify({ roomNumber, status: 'Ready' })
            });
            if (!response.ok) throw new Error('Failed to update status');
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert('Error completing maintenance');
        }
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
    const activeTasks = tasks.filter(t => t.status === 'Active');

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">Maintenance Hub</h1>
                    <p className="text-slate-500 font-medium mt-1">Track and manage property repairs and room serviceability.</p>
                </div>
                <div className="flex gap-4">
                    {['All', 'Active', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HighlightCard
                    label="Active Issues"
                    value={activeTasks.length.toString()}
                    icon={<Hammer className="text-orange-500" />}
                    color="orange"
                />
                <HighlightCard
                    label="Resolved (Today)"
                    value={tasks.filter(t => t.status === 'Completed').length.toString()}
                    icon={<CheckCircle className="text-green-500" />}
                    color="green"
                />
                <HighlightCard
                    label="System Health"
                    value="94%"
                    icon={<Wrench className="text-primary" />}
                    color="blue"
                />
            </div>

            {/* Task List */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Logs...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center p-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <p className="text-primary font-extrabold text-xl">Operational Excellence</p>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm mt-1">No maintenance tasks found for the selected filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-0 overflow-hidden border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 rounded-[1.5rem]">
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 text-left">
                                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black ${task.status === 'Active' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            <span className="text-[10px] uppercase opacity-40 leading-none mb-1">Room</span>
                                            <span className="text-3xl leading-none">{task.roomNumber}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-extrabold text-primary truncate">{task.issue}</h3>
                                                <Badge variant={task.status === 'Active' ? 'warning' : 'success'} className="uppercase text-[9px] font-black tracking-widest">
                                                    {task.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <Clock size={14} className="text-primary" />
                                                    <span>Logged {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <AlertTriangle size={14} className={task.priority === 'High' ? 'text-red-500' : 'text-orange-400'} />
                                                    <span>{task.priority} Priority</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full md:w-auto">
                                            {task.status === 'Active' ? (
                                                <Button
                                                    className="w-full md:w-48 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                                    onClick={() => handleComplete(task.roomNumber)}
                                                >
                                                    Mark Resolved
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest text-[10px] bg-green-50 px-6 py-3 rounded-2xl">
                                                    <CheckCircle2 size={16} />
                                                    Resolved
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function HighlightCard({ label, value, icon, color }) {
    const colors = {
        orange: 'bg-orange-50 border-orange-100',
        green: 'bg-green-50 border-green-100',
        blue: 'bg-blue-50 border-blue-100',
    };

    return (
        <Card soft className={`p-8 border-2 ${colors[color]} flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-3xl font-black text-primary">{value}</p>
            </div>
            <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                {icon}
            </div>
        </Card>
    );
}
