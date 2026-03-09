import React from 'react';
import { User, Shield, Clock, MapPin, Key } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export function StaffProfile() {
    const staff = JSON.parse(localStorage.getItem('staff')) || { name: 'Staff Member', role: 'Department Staff' };

    return (
        <div className="space-y-4 pb-32 animate-in fade-in duration-700 bg-[#F8FAFC]">
            <div className="flex justify-center pt-8 pb-2">
                <Logo className="scale-110" />
            </div>

            <div className="flex flex-col items-center pb-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-md border-4 border-white mb-4 text-3xl font-black text-slate-700">
                    {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{staff.name}</h1>
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100">
                    {staff.role}
                </p>
            </div>

            <div className="space-y-4 px-6 md:max-w-md md:mx-auto">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Work Information</h3>
                <Card className="bg-white border-slate-200 divide-y divide-slate-100 p-0 overflow-hidden shadow-sm">
                    <ProfileItem icon={<Shield size={18} />} label="Access Level" value="Level 2 (Departmental)" />
                    <ProfileItem icon={<Clock size={18} />} label="Current Shift" value="Morning (08:00 - 16:00)" />
                    <ProfileItem icon={<MapPin size={18} />} label="Assigned Zone" value="Floor 1-3 (North Wing)" />
                </Card>
            </div>

            <div className="space-y-4 pt-4 px-6 md:max-w-md md:mx-auto">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Account Security</h3>
                <Button className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl h-14 flex items-center justify-start gap-4 px-6 font-bold hover:bg-slate-50 transition-all shadow-sm focus:ring-4 focus:ring-slate-100">
                    <Key size={18} className="text-slate-400" />
                    <span>Change Access PIN</span>
                </Button>
            </div>
        </div>
    );
}

function ProfileItem({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}
