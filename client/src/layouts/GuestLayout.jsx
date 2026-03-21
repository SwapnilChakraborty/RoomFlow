import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, MessageSquare, User, Utensils, Sparkles, Menu, Compass, CheckCircle2, Info, X } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useSocket } from '../context/SocketContext';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { ChatBot } from '../components/ChatBot';
import { motion, AnimatePresence } from 'framer-motion';

export function GuestLayout() {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [toasts, setToasts] = React.useState([]);
    const [notifications, setNotifications] = React.useState([]);

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

    const addToast = (title, message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    useEffect(() => {
        if (!socket) return;

        const handleGuestCheckout = (data) => {
            const customer = JSON.parse(localStorage.getItem('customer') || '{}');
            const roomNumber = (customer.room?.roomNumber || customer.room || '').toString();

            if (data.roomNumber === roomNumber) {
                console.log('Remote checkout detected. Logging out...');
                localStorage.removeItem('customer');
                navigate('/login');
            }
        };

        socket.on('guest_checkout', handleGuestCheckout);

        socket.on('status_updated', (data) => {
            addToast('Status Update', `Your request status is now: ${data.status}`, 'success');
        });

        socket.on('new_notification', (notif) => {
            if (notif.role === 'guest') {
                addNotification(notif);
                addToast(notif.title, notif.message, 'info');
            }
        });

        socket.on('admin_activity', (data) => {
            const customer = JSON.parse(localStorage.getItem('customer') || '{}');
            const roomNumber = (customer.room?.roomNumber || customer.room || '').toString();

            if (data.room === roomNumber && data.type !== 'msg') {
                const title = data.type === 'order' ? 'Order Update' : 'Service Update';
                const message = data.type === 'order' 
                    ? `Order #${data.id.toString().slice(-5).toUpperCase()} has been updated`
                    : data.details || 'Your request has been updated';
                addToast(title, message, 'info');
            }
        });

        return () => {
            socket.off('guest_checkout', handleGuestCheckout);
            socket.off('status_updated');
            socket.off('new_notification');
            socket.off('admin_activity');
        };
    }, [socket, navigate]);

    return (
        <div className="min-h-screen bg-secondary flex flex-col max-w-md mx-auto relative border-x border-slate-200 shadow-2xl">
            {/* Top Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <button className="text-primary hover:bg-slate-50 p-2 rounded-xl transition-colors">
                    <Menu size={24} />
                </button>

                <Logo className="scale-90" />

                <NotificationDropdown 
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onClearAll={handleClearAll}
                    onRead={handleRead}
                />
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 pt-4 pb-32 overflow-x-hidden">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 py-3 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
                <BottomNavLink to="/guest" icon={<Home size={24} />} label="HOME" />
                <BottomNavLink to="/guest/services" icon={<Utensils size={24} />} label="SERVICES" />
                <BottomNavLink to="/guest/amenities" icon={<Compass size={24} />} label="EXPLORE" />
                <BottomNavLink to="/guest/profile" icon={<User size={24} />} label="PROFILE" />
            </nav>

            {/* Chat Bot Widget */}
            <ChatBot />

            {/* Notification Toasts */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-[340px] z-[100] space-y-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-4 flex items-start gap-3 pointer-events-auto"
                        >
                            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-primary uppercase tracking-wider leading-none mb-1">{toast.title}</p>
                                <p className="text-xs font-medium text-slate-500 line-clamp-2">{toast.message}</p>
                            </div>
                            <button 
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function BottomNavLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end={label === 'HOME'}
            className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className={`p-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                        {icon}
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
}


