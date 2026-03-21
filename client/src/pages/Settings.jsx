import React, { useState, useEffect } from 'react';
import {
    Save,
    Settings as SettingsIcon,
    Building2,
    Link2,
    ShieldCheck,
    BellRing,
    Globe,
    Zap,
    LayoutDashboard
} from 'lucide-react';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function Settings() {
    const [settings, setSettings] = useState({
        hotelName: 'RoomFlow Premium',
        hotelId: 'RF-2026-01',
        crmEnabled: true,
        currency: 'INR',
        taxRate: 12,
        emailNotifications: true,
        autoCheckout: false,
        googleReviewUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await secureFetch(`${API_URL}/api/settings`);
            const data = await res.json();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await secureFetch(`${API_URL}/api/settings`, {
                method: 'POST',
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            setSettings(data);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary tracking-tight">System Settings</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure your hotel management and CRM experience</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'} font-bold flex items-center gap-3 animate-in zoom-in-95`}>
                    <ShieldCheck size={20} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Building2 size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Hotel Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hotel Name</label>
                                <input
                                    type="text"
                                    value={settings.hotelName}
                                    onChange={e => setSettings({ ...settings, hotelName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hotel ID</label>
                                <input
                                    type="text"
                                    value={settings.hotelId}
                                    onChange={e => setSettings({ ...settings, hotelId: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Currency Code</label>
                                <input
                                    type="text"
                                    value={settings.currency}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    value={settings.taxRate}
                                    onChange={e => setSettings({ ...settings, taxRate: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Google Review URL</label>
                                <input
                                    type="url"
                                    value={settings.googleReviewUrl}
                                    onChange={e => setSettings({ ...settings, googleReviewUrl: e.target.value })}
                                    placeholder="https://g.page/r/your-id/review"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Zap size={120} />
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Advanced Features</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[24px] border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                                        <LayoutDashboard className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">CRM Integration</h3>
                                        <p className="text-sm text-slate-500 font-medium">Enable lead management and sales pipeline tools.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, crmEnabled: !settings.crmEnabled })}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.crmEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.crmEnabled ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[24px] border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                                        <BellRing className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Smart Notifications</h3>
                                        <p className="text-sm text-slate-500 font-medium">Automatic alerts for new bookings and service requests.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.emailNotifications ? 'bg-primary' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.emailNotifications ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Info Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-blue-900 p-8 rounded-[32px] text-white shadow-xl shadow-primary/20">
                        <Globe className="mb-6 opacity-40" size={40} />
                        <h3 className="text-xl font-bold mb-2">Global Reach</h3>
                        <p className="text-blue-100/80 text-sm font-medium leading-relaxed">
                            Your hotel settings are synchronized across all staff devices and the guest portal in real-time.
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">System Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <Link2 className="text-slate-400 mb-6" size={24} />
                        <h3 className="font-bold text-slate-800 mb-2">Platform Version</h3>
                        <p className="text-slate-500 text-sm font-medium">
                            v2.4.0-premium
                        </p>
                        <button className="mt-6 w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
                            Check for Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
