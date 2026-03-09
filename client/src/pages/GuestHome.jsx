import React from 'react';
import { Key, Wifi, Utensils, MessageSquare, Briefcase, Car, Sparkles, MoreHorizontal, Sun, Calendar, Clock, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';

export function GuestHome() {
    const customer = JSON.parse(localStorage.getItem('customer') || '{}');
    const guestName = customer.name || 'Anderson';
    const roomNumber = (customer.room?.roomNumber || customer.room || '402').toString();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Hero Section with Glassmorphism */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-[28rem] w-full rounded-[3.5rem] overflow-hidden shadow-2xl shadow-primary/30 group"
            >
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop"
                    alt="Hotel Hero"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex flex-col justify-end p-10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full w-fit mb-6"
                    >
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_#00C2A8]"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Active Residency</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                        Welcome, <br />
                        <span className="text-accent-light">Mr. {guestName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-white/70 font-bold mt-4 text-xs flex items-center gap-2 uppercase tracking-[0.2em]">
                        <MapPin size={14} className="text-accent" /> Royal Horizon Resort
                    </p>
                </div>
            </motion.div>

            {/* Premium Status Row */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Card soft className="grid grid-cols-3 divide-x divide-slate-100 p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
                    <StatusItem label="YOUR ROOM" value={roomNumber} icon={<Key size={16} className="text-primary" />} />
                    <StatusItem label="CHECKOUT" value="Oct 24" icon={<Calendar size={16} className="text-primary" />} />
                    <StatusItem label="WEATHER" value="72°F" subValue="SUNNY" icon={<Sun size={16} className="text-orange-400" />} />
                </Card>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <div className="flex justify-between items-center px-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Signature Services</h3>
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full">
                        <Clock size={10} className="text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Available 24/7</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 px-6 font-sans">
                    <QuickAction icon={<Key size={22} />} label="Digital Key" delay={0.1} />
                    <QuickAction icon={<Wifi size={22} />} label="Fast Wi-Fi" delay={0.2} />
                    <QuickAction icon={<Utensils size={22} />} label="Dining" to="/guest/services" delay={0.3} />
                    <QuickAction icon={<MessageSquare size={22} />} label="Concierge" to="/guest/chat" delay={0.4} />
                    <QuickAction icon={<Briefcase size={22} />} label="Laundry" delay={0.5} />
                    <QuickAction icon={<Car size={22} />} label="Valet" delay={0.6} />
                    <QuickAction icon={<Sparkles size={22} />} label="Wellness" to="/guest/amenities" delay={0.7} />
                    <QuickAction icon={<MoreHorizontal size={22} />} label="Support" delay={0.8} />
                </div>
            </motion.div>

            {/* Curated Experiences */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
            >
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] px-6">Curated For You</h3>
                <div className="space-y-6 px-6">
                    <PromoCard
                        tag="GASTRONOMY"
                        title="Azure Fine Dining"
                        sub="Experience Michelin-star seafood with ocean views"
                        image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
                    />
                    <PromoCard
                        tag="EXPLORATION"
                        title="Island Discovery"
                        sub="Private yacht tours departing from the resort dock"
                        image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop"
                    />
                </div>
            </motion.div>
        </div>
    );
}

function StatusItem({ label, value, subValue, icon }) {
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-slate-50 cursor-pointer group">
            <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase group-hover:text-primary transition-colors">{label}</span>
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                    {icon}
                </div>
                <span className="text-xl font-black text-primary tracking-tight">{value}</span>
            </div>
            {subValue && <span className="text-[8px] font-black text-slate-400 tracking-[0.1em] mt-1.5 uppercase">{subValue}</span>}
        </div>
    );
}

function QuickAction({ icon, label, to = "#", delay }) {
    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
            }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ y: -5 }}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-100 shadow-sm rounded-[2rem] transition-all hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 group"
        >
            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-primary/30">
                {icon}
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">{label}</span>
        </motion.button>
    );
}

function PromoCard({ tag, title, sub, image }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative h-44 w-full rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shadow-slate-200/50"
        >
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent flex flex-col justify-center p-8 w-2/3">
                <span className="text-[10px] font-black text-accent tracking-[0.2em] mb-2 uppercase">{tag}</span>
                <h4 className="text-2xl font-black text-primary leading-tight tracking-tight">{title}</h4>
                <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed opacity-80">{sub}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest group-hover:gap-3 transition-all">
                    Explore Experience <ArrowRightIcon className="w-3 h-3" />
                </div>
            </div>
        </motion.div>
    );
}

function ArrowRightIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}

