import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Box,
    TrendingUp,
    Users,
    User,
    Bell,
    Settings,
    Search
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { useSocket } from '../context/SocketContext';
import React, { useState, useEffect } from 'react';

export function StaffLayout() {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const staff = JSON.parse(localStorage.getItem('staff')) || { name: 'Marcus', role: 'Kitchen Staff' };

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (notif) => {
        setNotifications(prev => [
            { ...notif, read: false, id: Date.now() + Math.random() },
            ...prev
        ].slice(0, 20));
    };

    const handleClearAll = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notif) => {
            // Staff sees admin-level notifications (new tasks) in this simple version
            if (notif.role === 'admin') {
                addNotification(notif);
            }
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col max-w-md mx-auto relative border-x border-slate-200 shadow-xl font-sans">
            {/* Top Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo showText={false} className="scale-75 -ml-2" />
                    <div>
                        <h1 className="font-bold text-base leading-tight text-slate-900">Orders</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            STATION 1
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationDropdown 
                        notifications={notifications}
                        unreadCount={unreadCount}
                        onClearAll={handleClearAll}
                        onRead={handleRead}
                    />
                    <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all border border-slate-100">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-2xl shadow-lg flex justify-between items-center opacity-70">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">System Verified</span>
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">RF-S-9002</span>
                </div>
            </div>

            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <NavItem to="/staff" icon={<ClipboardList className="w-6 h-6" />} label="Orders" />

                <NavItem to="/staff/performance" icon={<TrendingUp className="w-6 h-6" />} label="Stats" />
                <NavItem to="/staff/team" icon={<Users className="w-6 h-6" />} label="Staff" />
                <NavItem to="/staff/profile" icon={<User className="w-6 h-6" />} label="Profile" />
            </nav>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${isActive
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`
            }
        >
            <div className="transition-transform active:scale-90">{icon}</div>
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
        </NavLink>
    );
}

