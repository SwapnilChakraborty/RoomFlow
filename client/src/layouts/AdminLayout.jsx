import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BedDouble,
    ClipboardList,
    Users,
    BarChart3,
    Settings as SettingsIcon,
    Bell,
    Search,
    ChevronRight,
    LogOut,
    Handshake,
    Menu,
    X,
    Bed,
    MessageSquare,
    User,
    FileText,
    Loader2
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config/api';
import { useSocket } from '../context/SocketContext';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';

const API = () => API_URL;

const NAV_PAGES = [
    { label: 'Overview',       path: '/admin',            icon: LayoutDashboard },
    { label: 'Active Rooms',   path: '/admin/rooms',      icon: BedDouble },
    { label: 'Maintenance',    path: '/admin/maintenance', icon: SettingsIcon },
    { label: 'Live Requests',  path: '/admin/requests',   icon: ClipboardList },
    { label: 'Guest Messages', path: '/admin/messages',   icon: MessageSquare },
    { label: 'CRM Dashboard',  path: '/admin/crm',        icon: Handshake },
    { label: 'Staff Panel',    path: '/admin/staff',      icon: Users },
    { label: 'Analytics',      path: '/admin/analytics',  icon: BarChart3 },
    { label: 'Settings',       path: '/admin/settings',   icon: SettingsIcon },
];

function useGlobalSearch(query) {
    const [results, setResults] = useState({ pages: [], rooms: [], staff: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) { setResults({ pages: [], rooms: [], staff: [] }); return; }
        const q = query.toLowerCase();

        // Filter pages client-side immediately
        const pages = NAV_PAGES.filter(p => p.label.toLowerCase().includes(q));

        // Debounce API calls
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const [roomsRes, activityRes] = await Promise.all([
                    fetch(`${API()}/api/rooms`).then(r => r.json()),
                    fetch(`${API()}/api/activity`).then(r => r.json()),
                ]);

                const rooms = Array.isArray(roomsRes)
                    ? roomsRes.filter(r =>
                        r.roomNumber?.toString().includes(q) ||
                        r.type?.toLowerCase().includes(q) ||
                        r.status?.toLowerCase().includes(q) ||
                        r.currentGuest?.name?.toLowerCase().includes(q)
                      )
                    : [];

                // Derive unique guests/staff from rooms
                const guestMap = {};
                if (Array.isArray(roomsRes)) {
                    roomsRes.forEach(r => {
                        if (r.currentGuest?.name?.toLowerCase().includes(q)) {
                            guestMap[r.currentGuest.name] = { ...r.currentGuest, roomNumber: r.roomNumber };
                        }
                    });
                }
                const staff = Object.values(guestMap);

                setResults({ pages, rooms: rooms.slice(0, 5), staff: staff.slice(0, 5) });
            } catch (e) {
                setResults({ pages, rooms: [], staff: [] });
            } finally {
                setLoading(false);
            }
        }, 300);

        setResults(prev => ({ ...prev, pages }));
        return () => clearTimeout(timer);
    }, [query]);

    return { results, loading };
}

export function AdminLayout() {
    const staff = JSON.parse(localStorage.getItem('staff')) || { name: 'Admin', role: 'Manager' };
    const navigate = useNavigate();
    const [crmEnabled, setCrmEnabled] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const { results, loading } = useGlobalSearch(searchQuery);
    const hasResults = results.pages.length + results.rooms.length + results.staff.length > 0;
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);

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
            if (notif.role === 'admin') {
                addNotification(notif);
            }
        });
        return () => socket.off('new_notification');
    }, [socket]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API()}/api/settings`);
                const data = await res.json();
                setCrmEnabled(data.crmEnabled);
            } catch (err) { console.error('Failed to fetch settings:', err); }
        };
        fetchSettings();
    }, []);

    // Keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => { localStorage.removeItem('staff'); navigate('/admin/login'); };
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleNavigate = (path) => {
        navigate(path);
        setSearchOpen(false);
        setSearchQuery('');
    };

    const statusColor = {
        Ready: 'text-green-500',
        Occupied: 'text-blue-500',
        Cleaning: 'text-orange-500',
        Maintenance: 'text-red-500',
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300">
                <div className="p-8 pb-10">
                    <Logo className="scale-110" />
                </div>

                <div className="px-4 mb-4">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    <nav className="space-y-1">
                        <SidebarItem to="/admin"             icon={<LayoutDashboard size={18} />} label="Overview" />
                        <SidebarItem to="/admin/rooms"       icon={<BedDouble size={18} />}       label="Active Rooms" />
                        <SidebarItem to="/admin/maintenance" icon={<SettingsIcon size={18} />}    label="Maintenance" />
                        <SidebarItem to="/admin/requests"    icon={<ClipboardList size={18} />}   label="Live Requests" />
                        {crmEnabled && (
                            <SidebarItem to="/admin/crm"     icon={<Handshake size={18} />}       label="CRM Dashboard" />
                        )}
                        <SidebarItem to="/admin/staff"       icon={<Users size={18} />}           label="Staff Panel" />
                        <SidebarItem to="/admin/analytics"   icon={<BarChart3 size={18} />}       label="Analytics" />
                        <SidebarItem to="/admin/messages"    icon={<MessageSquare size={18} />}   label="Messages" />
                    </nav>
                </div>

                <div className="flex-1" />

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System</p>
                    <SidebarItem to="/admin/settings" icon={<SettingsIcon size={18} />} label="Settings" />
                    
                    {/* Unique System ID */}
                    <div className="mt-4 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Instance</p>
                        <p className="text-[10px] font-bold text-primary mt-1 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            RF-PRO-2026-X792
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all group"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200 z-50 flex flex-col lg:hidden"
                        >
                            <div className="p-6 pb-8 flex justify-between items-center">
                                <Logo className="scale-90 origin-left" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="px-3 mb-4 flex-1 overflow-y-auto">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                                <nav className="space-y-1">
                                    <SidebarItem to="/admin"             icon={<LayoutDashboard size={18} />} label="Overview"      onClick={() => setIsMobileMenuOpen(false)} />
                                    <SidebarItem to="/admin/rooms"       icon={<BedDouble size={18} />}       label="Active Rooms"  onClick={() => setIsMobileMenuOpen(false)} />
                                    <SidebarItem to="/admin/maintenance" icon={<SettingsIcon size={18} />}    label="Maintenance"   onClick={() => setIsMobileMenuOpen(false)} />
                                    <SidebarItem to="/admin/requests"    icon={<ClipboardList size={18} />}   label="Live Requests" onClick={() => setIsMobileMenuOpen(false)} />
                                    {crmEnabled && (
                                        <SidebarItem to="/admin/crm"     icon={<Handshake size={18} />}       label="CRM Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                                    )}
                                    <SidebarItem to="/admin/staff"       icon={<Users size={18} />}           label="Staff Panel"   onClick={() => setIsMobileMenuOpen(false)} />
                                    <SidebarItem to="/admin/analytics"   icon={<BarChart3 size={18} />}       label="Analytics"     onClick={() => setIsMobileMenuOpen(false)} />
                                    <SidebarItem to="/admin/messages"    icon={<MessageSquare size={18} />}   label="Messages"      onClick={() => setIsMobileMenuOpen(false)} />
                                </nav>
                            </div>
                            <div className="p-4 border-t border-slate-100 space-y-1">
                                <SidebarItem to="/admin/settings" icon={<SettingsIcon size={18} />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
                                    <LogOut size={18} /><span>Sign Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-40 transition-all gap-4">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl">
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Search */}
                    <div ref={searchRef} className="relative w-full max-w-[420px] hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Search rooms, guests, pages..."
                            className="w-full bg-slate-50 border border-transparent focus:border-slate-200 focus:bg-white rounded-2xl pl-12 pr-20 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm focus:shadow-md"
                        />
                        {loading ? (
                            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                        ) : null}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">K</kbd>
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {searchOpen && searchQuery.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-50"
                                >
                                    {!hasResults && !loading && (
                                        <div className="px-5 py-6 text-center text-slate-400 text-sm font-medium">
                                            No results for "<span className="font-bold text-slate-600">{searchQuery}</span>"
                                        </div>
                                    )}

                                    {results.pages.length > 0 && (
                                        <div>
                                            <p className="px-5 pt-4 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pages</p>
                                            {results.pages.map(page => {
                                                const Icon = page.icon;
                                                return (
                                                    <button
                                                        key={page.path}
                                                        onClick={() => handleNavigate(page.path)}
                                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
                                                    >
                                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                            <Icon size={15} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-800">{page.label}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium truncate">{page.path}</p>
                                                        </div>
                                                        <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {results.rooms.length > 0 && (
                                        <div className={results.pages.length > 0 ? 'border-t border-slate-50' : ''}>
                                            <p className="px-5 pt-4 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rooms</p>
                                            {results.rooms.map(room => (
                                                <button
                                                    key={room.roomNumber}
                                                    onClick={() => handleNavigate('/admin/rooms')}
                                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-black text-xs">
                                                        {room.roomNumber}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{room.type}</p>
                                                        <p className="text-[10px] font-medium truncate">
                                                            <span className={statusColor[room.status] || 'text-slate-400'}>{room.status}</span>
                                                            {room.currentGuest?.name && <span className="text-slate-400"> · {room.currentGuest.name}</span>}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-300 shrink-0">Floor {room.floor}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.staff.length > 0 && (
                                        <div className={(results.pages.length + results.rooms.length) > 0 ? 'border-t border-slate-50' : ''}>
                                            <p className="px-5 pt-4 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                                            {results.staff.map(guest => (
                                                <button
                                                    key={guest.name}
                                                    onClick={() => handleNavigate('/admin/rooms')}
                                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{guest.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Room {guest.roomNumber}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-2">
                                        <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md">Esc</kbd>
                                        <span className="text-[10px] text-slate-400 font-medium">to close</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationDropdown 
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onClearAll={handleClearAll}
                            onRead={handleRead}
                        />

                        <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                        <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-extrabold text-primary group-hover:text-accent transition-colors">{staff.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{staff.role}</p>
                            </div>
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden font-bold text-white text-xs sm:text-sm">
                                    {getInitials(staff.name)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-secondary/30 p-4 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ to, icon, label, onClick }) {
    return (
        <NavLink
            to={to}
            end={to === '/admin'}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group border border-transparent ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'text-slate-500 hover:bg-white hover:border-slate-100 hover:text-primary hover:shadow-sm'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className="transition-transform duration-300 group-hover:scale-110">{icon}</div>
                    <span>{label}</span>
                    <ChevronRight
                        size={14}
                        className={`ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 outline-none ${isActive ? 'opacity-40' : ''}`}
                    />
                </>
            )}
        </NavLink>
    );
}
