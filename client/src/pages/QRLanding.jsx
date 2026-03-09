import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

export function QRLanding() {
    const navigate = useNavigate();
    const { roomId } = useParams();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto animate-in fade-in duration-1000">
            <Logo className="mb-12 scale-125" />

            <div className="relative mb-8">
                <div className="w-32 h-32 bg-accent/10 rounded-3xl flex items-center justify-center animate-pulse">
                    <QrCode size={64} className="text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white border-4 border-white">
                    <Sparkles size={16} />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-primary mb-4 tracking-tight">
                Welcome to Room {roomId || '402'}
            </h1>
            <p className="text-slate-500 mb-12 leading-relaxed">
                Experience seamless hospitality. Scan, request, and enjoy your stay without lifting a finger.
            </p>

            <div className="w-full space-y-4">
                <Button
                    onClick={() => navigate('/guest')}
                    className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 active:scale-95"
                    variant="accent"
                >
                    Enter Room Dashboard
                    <ArrowRight size={20} />
                </Button>

                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-8">
                    <ShieldCheck size={16} />
                    <span>Secure & Contactless Experience</span>
                </div>
            </div>

            {/* Modern decoration */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
        </div>
    );
}
