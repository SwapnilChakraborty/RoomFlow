import React, { useState } from 'react';
import { Sparkles, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export function GuestAmenities() {
    const [selected, setSelected] = useState(null);

    const amenities = [
        {
            id: 1,
            name: 'Azure Wellness Spa',
            type: 'Wellness',
            location: 'Level 4, East Wing',
            hours: '08:00 AM - 10:00 PM',
            img: '🧖‍♀️',
            description: 'Experience pure tranquility with our signature hot stone massage.',
            available: true,
            price: '$120/hour'
        },
        {
            id: 2,
            name: 'Skyline Fitness Center',
            type: 'Gym',
            location: 'Level 42, Rooftop',
            hours: '24/7 Access',
            img: '💪',
            description: 'State-of-the-art equipment with panoramic city views.',
            available: true,
            price: 'Complimentary'
        },
        {
            id: 3,
            name: 'Infinity Pool & Bar',
            type: 'Leisure',
            location: 'Level 42, Rooftop',
            hours: '06:00 AM - 11:00 PM',
            img: '🏊‍♂️',
            description: 'Heated pool with handcrafted cocktails and poolside dining.',
            available: true,
            price: 'Complimentary'
        },
        {
            id: 4,
            name: 'Royal Business Lounge',
            type: 'Work',
            location: 'Lobby Level',
            hours: '07:00 AM - 09:00 PM',
            img: '💼',
            description: 'Quiet workspace with high-speed fiber and conferencing suites.',
            available: false,
            price: '$50/day'
        }
    ];

    return (
        <div className="space-y-6 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-primary">Hotel Amenities</h1>
                <p className="text-slate-500 font-medium">Elevate your stay with our premium facilities.</p>
            </motion.div>

            <div className="grid gap-6">
                {amenities.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card
                            className={`p-0 overflow-hidden border-slate-100 cursor-pointer transition-all hover:shadow-xl group ${selected === item.id ? 'ring-2 ring-accent ring-offset-4 shadow-2xl shadow-accent/10' : ''
                                }`}
                            onClick={() => setSelected(item.id)}
                        >
                            <div className="flex flex-col sm:flex-row relative">
                                {selected === item.id && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <CheckCircle2 size={24} className="text-accent fill-white" />
                                    </div>
                                )}

                                <div className="sm:w-32 bg-slate-50 flex items-center justify-center text-5xl py-8 sm:py-0">
                                    {item.img}
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant={item.available ? 'success' : 'danger'} className="mb-2">
                                                {item.type}
                                            </Badge>
                                            <h3 className="text-xl font-bold text-primary">{item.name}</h3>
                                        </div>
                                        <p className="font-bold text-accent">{item.price}</p>
                                    </div>

                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                        {item.description}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-accent" />
                                            {item.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-accent" />
                                            {item.hours}
                                        </div>
                                    </div>

                                    {selected === item.id && item.available && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="pt-4"
                                        >
                                            <Button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl" variant="accent">
                                                Book Now
                                                <ArrowRight size={18} />
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
