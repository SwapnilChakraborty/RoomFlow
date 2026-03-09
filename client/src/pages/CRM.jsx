import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Filter,
    Search,
    TrendingUp,
    Target,
    Clock,
    ChevronRight,
    Mail,
    Phone,
    Building,
    MoreVertical,
    DollarSign
} from 'lucide-react';

export function CRM() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', email: '', company: '', value: 0, status: 'New' });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://hotel-mangment.onrender.com'}/api/crm/leads`);
            const data = await res.json();
            setLeads(data);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://hotel-mangment.onrender.com'}/api/crm/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });
            const data = await res.json();
            setLeads([data, ...leads]);
            setShowAddModal(false);
            setNewLead({ name: '', email: '', company: '', value: 0, status: 'New' });
        } catch (err) {
            console.error('Failed to add lead:', err);
        }
    };

    const updateLeadStatus = async (id, status) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://hotel-mangment.onrender.com'}/api/crm/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updated = await res.json();
            setLeads(leads.map(l => l._id === id ? updated : l));
        } catch (err) {
            console.error('Failed to update lead:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Qualified': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Proposal': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Closed': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Loading CRM Data...</div>;

    const totalValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0);
    const activeLeads = leads.filter(l => l.status !== 'Closed').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary tracking-tight">CRM Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your corporate relationships and sales pipeline</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        <span>Add New Lead</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<TrendingUp />} label="Pipeline Value" value={`$${totalValue.toLocaleString()}`} color="bg-blue-600" />
                <StatCard icon={<Target />} label="Active Leads" value={activeLeads} color="bg-accent" />
                <StatCard icon={<Users />} label="Total Contacts" value={leads.length} color="bg-indigo-600" />
                <StatCard icon={<Clock />} label="Avg. Response" value="4.2h" color="bg-slate-800" />
            </div>

            {/* Pipeline View */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">Sales Pipeline</h2>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find a contact..."
                            className="w-full bg-slate-50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-200 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead / Company</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deal Value</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leads.map((lead) => (
                                <tr key={lead._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{lead.name}</p>
                                                <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mt-1">
                                                    <Building size={12} />
                                                    {lead.company || 'Private Lead'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer transition-all ${getStatusColor(lead.status)}`}
                                        >
                                            {['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1 text-slate-700 font-bold">
                                            <DollarSign size={14} className="text-slate-400" />
                                            {lead.value?.toLocaleString() || '0'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <Mail size={16} />
                                            </button>
                                            <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <Phone size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-primary">Add New Lead</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter name..."
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                    <input
                                        type="text"
                                        placeholder="Company name..."
                                        value={newLead.company}
                                        onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Deal Value ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newLead.value}
                                        onChange={e => setNewLead({ ...newLead, value: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={newLead.email}
                                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                Create Lead Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 rounded-full`}></div>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-black/5`}>
                    {React.cloneElement(icon, { size: 22 })}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                    <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
}

