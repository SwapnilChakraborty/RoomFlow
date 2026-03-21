import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Info, AlertTriangle, Package, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationDropdown({ notifications, setNotifications, unreadCount, onClearAll, onRead }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const formatTime = (time) => {
        const d = new Date(time);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package size={16} className="text-blue-500" />;
            case 'service': return <Info size={16} className="text-orange-500" />;
            case 'status': return <Check size={16} className="text-green-500" />;
            default: return <Bell size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all group"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={onClearAll}
                                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => onRead(notif.id)}
                                        className={`p-4 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                                        )}
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{notif.title}</h4>
                                                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap ml-2">{formatTime(notif.time)}</span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 leading-snug line-clamp-2">{notif.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 mx-auto">
                                View Activity Log <ExternalLink size={10} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
