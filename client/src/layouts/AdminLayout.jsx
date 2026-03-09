import React from 'react';
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
    UserCircle,
    Handshake
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export function AdminLayout() {
    const staff = JSON.parse(localStorage.getItem('staff')) || { name: 'Admin', role: 'Manager' };
    const navigate = useNavigate();
    const [crmEnabled, setCrmEnabled] = React.useState(true);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/settings');
                const data = await res.json();
                setCrmEnabled(data.crmEnabled);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('staff');
        navigate('/admin/login');
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                        <SidebarItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" />
                        <SidebarItem to="/admin/rooms" icon={<BedDouble size={18} />} label="Active Rooms" />
                        <SidebarItem to="/admin/maintenance" icon={<SettingsIcon size={18} />} label="Maintenance" />
                        <SidebarItem to="/admin/requests" icon={<ClipboardList size={18} />} label="Live Requests" />
                        {crmEnabled && (
                            <SidebarItem to="/admin/crm" icon={<Handshake size={18} />} label="CRM Dashboard" />
                        )}
                        <SidebarItem to="/admin/staff" icon={<Users size={18} />} label="Staff Panel" />
                        <SidebarItem to="/admin/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
                    </nav>
                </div>

                <div className="flex-1"></div>

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System</p>
                    <SidebarItem to="/admin/settings" icon={<SettingsIcon size={18} />} label="Settings" />
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

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
                    <div className="relative w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Type to search anything..."
                            className="w-full bg-slate-50 border border-transparent focus:border-slate-200 focus:bg-white rounded-2xl pl-12 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm focus:shadow-md"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">K</kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all group">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-100"></div>

                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="text-right">
                                <p className="text-sm font-extrabold text-primary group-hover:text-accent transition-colors">{staff.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{staff.role}</p>
                            </div>
                            <div className="relative">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden font-bold text-white text-sm">
                                    {getInitials(staff.name)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-10 flex-1 overflow-y-auto bg-secondary/30">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group border border-transparent ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'text-slate-500 hover:bg-white hover:border-slate-100 hover:text-primary hover:shadow-sm'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                        {icon}
                    </div>
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

