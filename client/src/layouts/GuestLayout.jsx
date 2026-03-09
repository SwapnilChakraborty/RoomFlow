import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, MessageSquare, User, Utensils, Sparkles, Menu, Compass } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useSocket } from '../context/SocketContext';

export function GuestLayout() {
    const navigate = useNavigate();
    const { socket } = useSocket();

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

        return () => {
            socket.off('guest_checkout', handleGuestCheckout);
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

                <div className="relative">
                    <button className="text-primary hover:bg-slate-50 p-2 rounded-xl transition-colors">
                        <Bell size={24} />
                    </button>
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white shadow-sm"></span>
                </div>
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

            {/* Chat Floating Button */}
            <NavLink
                to="/guest/chat"
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 z-40 transition-transform active:scale-90"
            >
                <MessageSquare size={24} fill="white" />
            </NavLink>
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


