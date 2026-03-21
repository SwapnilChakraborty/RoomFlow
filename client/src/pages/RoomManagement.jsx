import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatWidget } from '../components/ui/StatWidget';
import { MoreVertical, User, Sparkles, AlertTriangle, Bed, CheckCircle2, Waves, UserPlus, X, Loader2, Hammer, FileText, Circle, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function RoomManagement() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [allotModal, setAllotModal] = useState(null); // room data if modal open
    const [guestName, setGuestName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [allotting, setAllotting] = useState(false);
    const [allotSuccess, setAllotSuccess] = useState(null); // { guestID }
    const [maintenanceModal, setMaintenanceModal] = useState(null); // room data
    const [maintIssue, setMaintIssue] = useState('');
    const [maintPriority, setMaintPriority] = useState('Medium');
    
    // Add Room Modal State
    const [addRoomModal, setAddRoomModal] = useState(false);
    const [newRoom, setNewRoom] = useState({ roomNumber: '', type: 'Deluxe', floor: 1 });
    const [adding, setAdding] = useState(false);
    
    // Delete Room Modal State
    const [deleteRoomModal, setDeleteRoomModal] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [deleting, setDeleting] = useState(false);

    const { socket } = useSocket();

    useEffect(() => {
        fetchRooms();

        if (socket) {
            socket.on('room_status_changed', (data) => {
                setRooms(prev => prev.map(r =>
                    r.roomNumber === data.roomNumber ? { ...r, status: data.status } : r
                ));
            });

            socket.on('room_added', (newRoom) => {
                setRooms(prev => [...prev, newRoom].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)));
            });

            socket.on('room_deleted', (data) => {
                setRooms(prev => prev.filter(r => r._id !== data.roomId));
            });
        }

        return () => {
            if (socket) {
                socket.off('room_status_changed');
                socket.off('room_added');
                socket.off('room_deleted');
            }
        };
    }, [socket]);

    const fetchRooms = async () => {
        try {
            const response = await secureFetch(`${API_URL}/api/rooms`);
            const data = await response.json();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAllotRoom = async (e) => {
        e.preventDefault();
        setAllotting(true);
        try {
            const response = await secureFetch(`${API_URL}/api/allot-room`, {
                method: 'POST',
                body: JSON.stringify({ roomNumber: allotModal.roomNumber, guestName, phone, checkIn, checkOut })
            });

            if (!response.ok) throw new Error('Failed to allot room');

            const result = await response.json();
            setAllotSuccess({ guestID: result.customerID });
            setGuestName('');
            setPhone('');
            setCheckIn('');
            setCheckOut('');
            fetchRooms();
        } catch (err) {
            console.error(err);
            alert('Error allotting room');
        } finally {
            setAllotting(false);
        }
    };

    const handleCheckout = async (roomNumber) => {
        if (!window.confirm('Are you sure you want to checkout this guest?')) return;
        try {
            const response = await secureFetch(`${API_URL}/api/checkout`, {
                method: 'POST',
                body: JSON.stringify({ roomNumber })
            });

            if (!response.ok) throw new Error('Checkout failed');
            fetchRooms();
        } catch (err) {
            console.error('Checkout error:', err);
        }
    };


    const handleUpdateStatus = async (roomNumber, status) => {
        try {
            const response = await secureFetch(`${API_URL}/api/update-room-status`, {
                method: 'POST',
                body: JSON.stringify({ roomNumber, status })
            });
            if (!response.ok) throw new Error('Status update failed');
            fetchRooms();
        } catch (err) {
            console.error(err);
            alert('Error updating room status');
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            const response = await secureFetch(`${API_URL}/api/rooms`, {
                method: 'POST',
                body: JSON.stringify(newRoom)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to add room');
            }

            setAddRoomModal(false);
            setNewRoom({ roomNumber: '', type: 'Deluxe', floor: 1 });
            fetchRooms();
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setAdding(false);
        }
    };


    const handleDeleteRoom = async (roomId, roomNumber) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY remove Room ${roomNumber}? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            const response = await secureFetch(`${API_URL}/api/rooms/${roomId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to delete room');
            }

            setDeleteRoomModal(false);
            setSelectedRoomId('');
            fetchRooms();
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const stats = [
        { label: 'Available', count: rooms.filter(r => r.status === 'Ready').length, icon: CheckCircle2, positive: true, trend: 'Ready for check-in' },
        { label: 'Occupied', count: rooms.filter(r => r.status === 'Occupied').length, icon: Bed, positive: true, trend: '82% total occupancy' },
        { label: 'Cleaning', count: rooms.filter(r => r.status === 'Cleaning').length, icon: Waves, positive: false, trend: 'Avg. 24m turnaround' },
        { label: 'In Service', count: rooms.filter(r => r.status === 'Maintenance').length, icon: AlertTriangle, positive: false, trend: 'AC repair in 104' },
    ];

    const filteredRooms = filter === 'All' ? rooms : rooms.filter(r => r.status === filter);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">Room Inventory</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time room availability and maintenance status.</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
                    <button
                        onClick={() => setAddRoomModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <UserPlus size={14} /> Add Room
                    </button>
                    <button
                        onClick={() => setDeleteRoomModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Trash2 size={14} /> Remove Room
                    </button>
                    {['All', 'Ready', 'Occupied', 'Cleaning', 'Maintenance'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <StatWidget
                        key={s.label}
                        label={s.label}
                        value={s.count.toString()}
                        icon={s.icon}
                        trend={s.trend}
                        positive={s.positive}
                    />
                ))}
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing with Vault...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <Bed size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-primary font-extrabold text-xl">No Rooms Found</p>
                        <p className="text-slate-400 font-medium">Try adjusting your filters or seed the database.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredRooms.map((room, idx) => (
                            <motion.div
                                key={room.roomNumber}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-0 overflow-hidden border-slate-100 group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2rem]">
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-500 group-hover:scale-110 ${room.status === 'Ready' ? 'bg-green-50 text-green-600' :
                                                room.status === 'Occupied' ? 'bg-primary text-white shadow-xl shadow-primary/30' :
                                                    room.status === 'Cleaning' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                <span className="text-[10px] uppercase opacity-60 leading-none mb-1">Room</span>
                                                <span className="text-xl leading-none">{room.roomNumber}</span>
                                            </div>
                                            {room.status === 'Ready' && (
                                                <button
                                                    onClick={() => setAllotModal(room)}
                                                    className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    title="Allot Room"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                            )}
                                            {room.status === 'Occupied' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCheckout(room.roomNumber)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        title="Check-out"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            {(room.status === 'Cleaning' || room.status === 'Maintenance') && (
                                                <button
                                                    onClick={() => handleUpdateStatus(room.roomNumber, 'Ready')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Mark as Ready"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {(room.status === 'Cleaning' || room.status === 'Ready') && (
                                                <button
                                                    onClick={() => setMaintenanceModal(room)}
                                                    className="p-2 bg-orange-50 text-orange-400 rounded-xl hover:bg-orange-400 hover:text-white transition-all shadow-sm"
                                                    title="Maintenance"
                                                >
                                                    <Hammer size={18} />
                                                </button>
                                            )}
                                            {room.status !== 'Occupied' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room._id, room.roomNumber); }}
                                                    className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Remove Room"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Category</p>
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-extrabold text-primary text-lg">{room.type}</h3>
                                                    <StatusBadge status={room.status} />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-50">
                                                {room.currentGuest ? (
                                                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl group-hover:bg-primary/5 transition-colors">
                                                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                                            <User size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inhouse Guest</p>
                                                            <p className="font-bold text-primary text-sm truncate">{room.currentGuest.name}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl text-slate-300">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <Bed size={14} />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">Available</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Floor {room.floor}</span>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            {room.status === 'Cleaning' && <Sparkles size={14} className="animate-pulse" />}
                                            {room.status === 'Maintenance' && <AlertTriangle size={14} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Manage</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Allot Room Modal */}
            <AnimatePresence>
                {allotModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAllotModal(null)}
                            className="absolute inset-0 bg-primary/20 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <Card className="p-10 shadow-3xl shadow-primary/20 border-white/50 bg-white/95 overflow-visible">
                                <button
                                    onClick={() => setAllotModal(null)}
                                    className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-xl hover:text-primary transition-colors border border-slate-50"
                                >
                                    <X size={20} />
                                </button>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-primary text-white rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-primary/20">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Room</span>
                                            <span className="text-2xl font-black">{allotModal.roomNumber}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-primary">Allot Room</h2>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Assigning {allotModal.type}</p>
                                        </div>
                                    </div>

                                    {!allotSuccess ? (
                                        <form onSubmit={handleAllotRoom} className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                    <input
                                                        type="text"
                                                        value={guestName}
                                                        onChange={(e) => setGuestName(e.target.value)}
                                                        placeholder="Enter full name"
                                                        className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-14 pr-6 font-bold text-primary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (WhatsApp)</label>
                                                <div className="relative">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">+</div>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="919988776655"
                                                        className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-10 pr-6 font-bold text-primary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <p className="text-[9px] text-slate-400 ml-1 font-medium italic">* Include country code without + (e.g. 91 for India)</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check In</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={checkIn}
                                                            onChange={(e) => setCheckIn(e.target.value)}
                                                            className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 font-bold text-primary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check Out</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={checkOut}
                                                            onChange={(e) => setCheckOut(e.target.value)}
                                                            className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 font-bold text-primary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={allotting}
                                                className="w-full bg-primary text-white rounded-3xl py-5 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                                            >
                                                {allotting ? <Loader2 className="animate-spin" /> : (
                                                    <>
                                                        <UserPlus size={20} />
                                                        Confirm Allotment
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6 text-center"
                                        >
                                            <div className="p-8 bg-green-50 rounded-[2rem] border-2 border-green-100 space-y-4">
                                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-green-800 font-extrabold text-xl">Room Allotted!</p>
                                                    <p className="text-green-600 font-bold uppercase tracking-widest text-[10px] mt-1">Temporary Guest Access Key</p>
                                                </div>
                                                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                                                    <p className="text-3xl font-black text-primary tracking-widest">{allotSuccess.guestID}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                className="w-full h-16 rounded-3xl font-black uppercase tracking-widest"
                                                onClick={() => {
                                                    setAllotModal(null);
                                                    setAllotSuccess(null);
                                                    setCheckIn('');
                                                    setCheckOut('');
                                                }}
                                            >
                                                Done
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Maintenance Modal */}
            <AnimatePresence>
                {maintenanceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMaintenanceModal(null)}
                            className="absolute inset-0 bg-primary/20 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <Card className="p-10 shadow-3xl shadow-primary/20 bg-white">
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-black text-primary">Log Maintenance</h2>
                                    <form onSubmit={handleMaintenance} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Details</label>
                                            <input
                                                type="text"
                                                value={maintIssue}
                                                onChange={(e) => setMaintIssue(e.target.value)}
                                                placeholder="e.g. AC Repair"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                            <select
                                                value={maintPriority}
                                                onChange={(e) => setMaintPriority(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold"
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                        <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">
                                            Mark for Maintenance
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Add Room Modal */}
            <AnimatePresence>
                {addRoomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAddRoomModal(false)}
                            className="absolute inset-0 bg-primary/20 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <Card className="p-10 shadow-3xl shadow-primary/20 bg-white rounded-[2.5rem]">
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-primary">Add Room</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Expanding inventory</p>
                                    </div>
                                    <form onSubmit={handleAddRoom} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                                            <input
                                                type="text"
                                                value={newRoom.roomNumber}
                                                onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                                                placeholder="e.g. 101"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                                <select
                                                    value={newRoom.type}
                                                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                >
                                                    <option>Deluxe</option>
                                                    <option>Suite</option>
                                                    <option>Premium</option>
                                                    <option>Economy</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor</label>
                                                <input
                                                    type="number"
                                                    value={newRoom.floor}
                                                    onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={adding}
                                            className="w-full bg-primary text-white rounded-2xl py-5 font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {adding ? <Loader2 className="animate-spin" /> : 'Create Room'}
                                        </button>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Room Modal */}
            <AnimatePresence>
                {deleteRoomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteRoomModal(false)}
                            className="absolute inset-0 bg-primary/20 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <Card className="p-10 shadow-3xl shadow-primary/20 bg-white rounded-[2.5rem] border-red-50">
                                <button
                                    onClick={() => setDeleteRoomModal(false)}
                                    className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-xl hover:text-red-500 transition-colors border border-slate-50"
                                >
                                    <X size={20} />
                                </button>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 text-red-500">
                                        <div className="p-3 bg-red-50 rounded-2xl">
                                            <Trash2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-primary">Remove Room</h2>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Permanent Deletion</p>
                                        </div>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const room = rooms.find(r => r._id === selectedRoomId);
                                        if (room) handleDeleteRoom(room._id, room.roomNumber);
                                    }} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Room to Remove</label>
                                            <select
                                                value={selectedRoomId}
                                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 focus:ring-red-100 transition-all"
                                                required
                                            >
                                                <option value="">Choose a room...</option>
                                                {rooms
                                                    .filter(r => r.status !== 'Occupied')
                                                    .map(r => (
                                                        <option key={r._id} value={r._id}>
                                                            Room {r.roomNumber} - {r.type} (Floor {r.floor})
                                                        </option>
                                                    ))}
                                            </select>
                                            <p className="text-[9px] text-slate-400 ml-1 font-medium italic">* Only unoccupied rooms can be removed.</p>
                                        </div>

                                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                                            <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                                            <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                                                Warning: This action is permanent and will remove all room history and configuration from the system.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={deleting || !selectedRoomId}
                                            className="w-full bg-red-500 text-white rounded-2xl py-5 font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-600 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {deleting ? <Loader2 className="animate-spin" /> : 'Confirm Deletion'}
                                        </button>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBadge({ status }) {
    const variants = {
        Ready: 'success',
        Occupied: 'primary',
        Cleaning: 'warning',
        Maintenance: 'danger',
    };
    return (
        <Badge variant={variants[status]} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
            {status}
        </Badge>
    );
}

