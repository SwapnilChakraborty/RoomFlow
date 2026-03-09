import React from 'react';
import {
    BarChart3,
    Users,
    Clock,
    ThumbsUp,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Download
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AreaChart } from '../components/admin/AreaChart';

export function Analytics() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">Business Intelligence</h1>
                    <p className="text-slate-500 font-medium mt-1">Deep dive into <span className="text-primary font-bold">RoomFlow performance metrics</span></p>
                </div>
                <Button variant="primary" size="md" className="gap-2">
                    <Download size={16} />
                    Full PDF Report
                </Button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricItem
                    label="Avg Response Time"
                    value="4.2m"
                    trend="-12%"
                    positive={true}
                    icon={Clock}
                />
                <MetricItem
                    label="Staff Efficiency"
                    value="88%"
                    trend="+5.2%"
                    positive={true}
                    icon={TrendingUp}
                />
                <MetricItem
                    label="Guest Satisfaction"
                    value="4.92"
                    trend="+0.12"
                    positive={true}
                    icon={ThumbsUp}
                />
                <MetricItem
                    label="Total Requests"
                    value="1,420"
                    trend="+18%"
                    positive={true}
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-extrabold text-primary leading-tight">Response Time Trends</h2>
                        <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg uppercase tracking-widest">Real-time</div>
                    </div>
                    <div className="w-full h-80">
                        <AreaChart />
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4">
                        <span>Morning</span>
                        <span>Afternoon</span>
                        <span>Evening</span>
                        <span>Night</span>
                    </div>
                </Card>

                <Card className="p-10">
                    <h2 className="text-2xl font-extrabold text-primary mb-8 leading-tight">Most Requested Services</h2>
                    <div className="space-y-8">
                        <ServiceStat label="Room Cleaning" value="442" percentage={85} color="bg-accent" />
                        <ServiceStat label="Towel Request" value="312" percentage={65} color="bg-blue-400" />
                        <ServiceStat label="Laundry Express" value="215" percentage={45} color="bg-primary" />
                        <ServiceStat label="Late Checkout" value="128" percentage={25} color="bg-orange-400" />
                    </div>
                </Card>
            </div>

            <Card className="p-10">
                <h2 className="text-2xl font-extrabold text-primary mb-8 leading-tight">Staff Performance Index</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Member</th>
                                <th className="pb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="pb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tasks</th>
                                <th className="pb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Avg Time</th>
                                <th className="pb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <StaffRow name="Marco Rossi" role="Head Chef" tasks="142" time="12m" rating="5.0" />
                            <StaffRow name="Elena Gilbert" role="Housekeeping" tasks="285" time="18m" rating="4.9" />
                            <StaffRow name="John Smith" role="Concierge" tasks="98" time="4m" rating="4.8" />
                            <StaffRow name="Sarah Connor" role="Maintenance" tasks="42" time="45m" rating="4.7" />
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function MetricItem({ label, value, trend, positive, icon: Icon }) {
    return (
        <Card soft className="p-8">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary rounded-2xl text-primary">
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{label}</p>
                <p className="text-3xl font-extrabold text-primary mt-1 tracking-tight">{value}</p>
            </div>
        </Card>
    );
}

function ServiceStat({ label, value, percentage, color }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-xs font-extrabold">
                <span className="text-slate-600 uppercase tracking-wider">{label}</span>
                <span className="text-primary">{value}</span>
            </div>
            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 p-0.5">
                <div
                    className={`${color} h-full rounded-full transition-all duration-1000 shadow-sm`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function StaffRow({ name, role, tasks, time, rating }) {
    return (
        <tr className="group hover:bg-slate-50 transition-colors">
            <td className="py-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white transition-colors">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-bold text-primary">{name}</span>
            </td>
            <td className="py-6 text-sm font-semibold text-slate-500 tracking-tight">{role}</td>
            <td className="py-6 text-sm font-bold text-primary">{tasks}</td>
            <td className="py-6 text-sm font-bold text-slate-500">{time}</td>
            <td className="py-6 text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-xs font-extrabold rounded-lg">
                    <Star size={12} className="fill-accent" />
                    {rating}
                </span>
            </td>
        </tr>
    );
}
