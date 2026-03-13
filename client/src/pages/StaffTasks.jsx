import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, ClipboardList } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config/api';

const NOTIFICATION_SOUNDS = {
    order: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Ding
    service: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Alert
    housekeeping: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // Clean
};

function useNotificationSound() {
    const audioRef = useRef(null);

    const play = (type = 'order') => {
        try {
            const url = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.order;
            const audio = new Audio(url);
            audio.play().catch(e => console.warn('Audio play blocked:', e));
        } catch (err) {
            console.error('Notification sound error:', err);
        }
    };

    return play;
}

export function StaffTasks() {
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('Active');
    const [now, setNow] = useState(new Date());
    const playSound = useNotificationSound();

    // Fetch initial tasks
    useEffect(() => {
        const fetchInitialTasks = async () => {
            try {
                const response = await fetch(`${API_URL}/api/activity`);
                const data = await response.json();
                setTasks(data.map(item => ({
                    id: item.id,
                    room: item.room,
                    type: item.type === 'order' ? 'Dining' : item.type === 'housekeeping' ? 'Housekeeping' : 'Service',
                    detail: item.details,
                    priority: item.priority || 'Normal',
                    status: item.status || 'Pending',
                    timestamp: new Date(item.time)
                })));
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            }
        };
        fetchInitialTasks();
        const timer = setInterval(() => setNow(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    // Realtime socket events
    useEffect(() => {
        if (!socket) return;

        socket.on('admin_activity', (data) => {
            playSound(data.type);
            setTasks(prev => {
                const standardizedId = data.id;
                const exists = prev.find(t => t.id === standardizedId);
                if (exists) return prev;
                return [{
                    id: standardizedId,
                    room: data.room,
                    type: data.type === 'order' ? 'Dining' : data.type === 'housekeeping' ? 'Housekeeping' : 'Service',
                    detail: data.details,
                    priority: data.priority || 'Normal',
                    status: data.status || 'Pending',
                    timestamp: new Date(data.time || Date.now())
                }, ...prev];
            });
        });

        socket.on('admin_activity_update', (data) => {
            setTasks(prev => prev.map(t => t.id === data.requestId ? { ...t, status: data.status } : t));
        });

        return () => {
            socket.off('admin_activity');
            socket.off('admin_activity_update');
        };
    }, [socket]);

    const updateStatus = (id, newStatus) => {
        const task = tasks.find(t => t.id === id);
        if (socket && task) {
            socket.emit('update_status', { requestId: id, status: newStatus, roomNumber: task.room });
        }
    };

    const formatTimeElapsed = (timestamp) => {
        const seconds = Math.floor((now - timestamp) / 1000);
        const mins = Math.floor(seconds / 60);
        return `${mins} mins elapsed`;
    };

    const activeCount    = tasks.filter(t => t.status !== 'Completed').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;

    const currentTasks = filter === 'Completed'
        ? tasks.filter(t => t.status === 'Completed')
        : tasks.filter(t => t.status !== 'Completed');

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
            {/* Tabs Header */}
            <div className="bg-white px-6 pt-4 border-b border-slate-100 sticky top-0 z-40">
                <div className="flex items-center gap-8 mb-4">
                    <Tab label="Active"    count={activeCount}    isActive={filter === 'Active'}    onClick={() => setFilter('Active')} />
                    <Tab label="Completed" count={completedCount} isActive={filter === 'Completed'} onClick={() => setFilter('Completed')} />
                    <Tab label="Scheduled" count={0}              isActive={filter === 'Scheduled'} onClick={() => setFilter('Scheduled')} />
                </div>
            </div>

            {/* Sub-header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Collecting Phase
                </h2>
                <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] tracking-tight">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Clock size={14} />
                    </motion.div>
                    Auto-refreshing
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {currentTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group transition-all">
                                {/* Priority Accent Border */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority === 'High' ? 'bg-red-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                                    #{task.id.toString().slice(-4).toUpperCase()}
                                                </h3>
                                                {task.priority === 'High' && (
                                                    <span className="bg-red-50 text-red-500 text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase">Priority</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                                <Clock size={12} />
                                                {formatTimeElapsed(task.timestamp)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-sm">{task.type}</p>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Room {task.room}</p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-slate-50/50 rounded-xl p-4 mb-5 ml-2 space-y-2 border border-slate-100/50">
                                        {task.detail.split(',').map((item, id) => {
                                            const parts = item.trim().split('x ');
                                            const qty  = parts.length > 1 ? parts[0] + 'x' : '1x';
                                            const name = parts.length > 1 ? parts[1] : parts[0];
                                            return (
                                                <div key={id} className="flex justify-between items-center text-sm">
                                                    <div className="font-bold text-slate-900">
                                                        <span className="text-slate-400 mr-2">{qty}</span>{name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Button */}
                                    {task.status === 'Pending' ? (
                                        <button
                                            onClick={() => updateStatus(task.id, 'In Progress')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all border border-blue-500/20"
                                        >
                                            <Clock size={18} />
                                            Accept & Start
                                        </button>
                                    ) : task.status === 'In Progress' ? (
                                        <button
                                            onClick={() => updateStatus(task.id, 'Completed')}
                                            className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all border border-green-500/20"
                                        >
                                            <CheckCircle2 size={18} />
                                            Mark as Complete
                                        </button>
                                    ) : (
                                        <div className="w-full bg-slate-50 text-slate-400 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-slate-100">
                                            <CheckCircle2 size={18} className="text-green-500" />
                                            Order Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentTasks.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <ClipboardList className="text-slate-200" size={32} />
                        </div>
                        <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                            No {filter.toLowerCase()} orders
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Tab({ label, count, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`relative pb-3 text-sm font-bold transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className="flex items-center gap-2">
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {count}
                </span>
            </div>
            {isActive && (
                <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                />
            )}
        </button>
    );
}
