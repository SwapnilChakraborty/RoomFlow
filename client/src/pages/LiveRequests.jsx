import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Filter,
    Search,
    Loader2,
    ChevronRight,
    Utensils,
    Wind,
    Wrench,
    Trash2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { socket } = useSocket();

    useEffect(() => {
        fetchRequests();

        if (socket) {
            socket.on('admin_activity', (newReq) => {
                setRequests(prev => {
                    const exists = prev.find(r => r.id === newReq.id);
                    if (exists) return prev;
                    return [newReq, ...prev];
                });
            });

            socket.on('admin_activity_update', (data) => {
                const { requestId, status } = data;
                setRequests(prev => {
                    if (['Completed', 'Delivered', 'Cancelled'].includes(status)) {
                        return prev.filter(r => r.id !== requestId);
                    }
                    return prev.map(r => r.id === requestId ? { ...r, status } : r);
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('admin_activity');
                socket.off('admin_activity_update');
            }
        };
    }, [socket]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await secureFetch(`${API_URL}/api/requests/live`);
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch live requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = (id, status, room) => {
        if (socket) {
            socket.emit('update_status', { requestId: id, status, roomNumber: room });
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.room.toString().includes(searchTerm) || 
                             req.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || 
                             (filter === 'Services' && req.type === 'service') ||
                             (filter === 'Orders' && req.type === 'order');
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Live Feed...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="text-primary" size={36} />
                        Live Service Feed
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
                        Real-time request management
                    </p>
                </div>
                
                <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    {['All', 'Services', 'Orders'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                                filter === f 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:text-primary hover:bg-slate-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by room number or details..."
                    className="w-full bg-white border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 shadow-xl shadow-slate-200/40 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req, index) => (
                        <RequestCard 
                            key={req.id} 
                            request={req} 
                            onUpdate={updateStatus}
                            index={index}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filteredRequests.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <ClipboardList size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">All caught up!</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        No active requests matching your criteria
                    </p>
                </div>
            )}
        </div>
    );
}

function RequestCard({ request, onUpdate, index }) {
    const isService = request.type === 'service';
    const isHighPriority = request.priority?.toLowerCase() === 'high' || request.priority?.toLowerCase() === 'urgent';
    
    const getIcon = () => {
        if (!isService) return <Utensils size={24} />;
        switch (request.serviceType?.toLowerCase()) {
            case 'housekeeping': return <Wind size={24} />;
            case 'maintenance': return <Wrench size={24} />;
            default: return <ClipboardList size={24} />;
        }
    };

    const getRefColor = () => {
        if (isHighPriority) return 'bg-red-500';
        if (isService) return 'bg-primary';
        return 'bg-orange-500';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/40 transition-all group">
                {/* Priority/Type Accent */}
                <div className={`h-2 ${getRefColor()} w-full transition-all group-hover:h-3`} />
                
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isService ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
                                {getIcon()}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-none">Room {request.room}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                    {isService ? `${request.serviceType} Request` : 'In-Room Dining'}
                                </p>
                            </div>
                        </div>
                        {isHighPriority && (
                            <Badge variant="red" className="animate-pulse">URGENT</Badge>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 min-h-[80px]">
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            "{request.details}"
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] tracking-tight uppercase">
                            <Clock size={12} />
                            {new Date(request.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${request.status === 'Pending' ? 'bg-orange-400' : 'bg-blue-500'} animate-pulse`} />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{request.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {request.status === 'Pending' ? (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                onClick={() => onUpdate(request.id, 'In Progress', request.room)}
                            >
                                Accept
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-600 border-blue-200 bg-blue-50/50"
                                disabled
                            >
                                Working...
                            </Button>
                        )}
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-full h-12 rounded-xl font-black text-[10px] bg-green-600 hover:bg-green-700 uppercase tracking-widest shadow-lg shadow-green-100"
                            onClick={() => onUpdate(request.id, isService ? 'Completed' : 'Delivered', request.room)}
                        >
                            Complete
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
