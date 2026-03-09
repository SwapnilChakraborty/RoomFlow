import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { User, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://hotel-mangment.onrender.com'}/api/staff-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store staff data
            localStorage.setItem('staff', JSON.stringify(data));

            // Redirect to admin dashboard
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/30 mb-6 group hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={40} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Staff Portal</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-3">Access restricted to authorized personnel</p>
                </div>

                <Card className="p-10 border-white/50 bg-white/80 backdrop-blur-xl shadow-3xl shadow-primary/10 rounded-[2.5rem]">
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 rounded-2xl py-5 pl-14 pr-6 font-bold text-primary placeholder:text-slate-300 focus:bg-white transition-all outline-none shadow-sm focus:shadow-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 rounded-2xl py-5 pl-14 pr-6 font-bold text-primary placeholder:text-slate-300 focus:bg-white transition-all outline-none shadow-sm focus:shadow-md"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group overflow-hidden"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <span>Authenticate Access</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </Card>

                <div className="mt-10 text-center">
                    <p className="text-slate-400 font-medium text-sm">
                        Forgot credentials? <span className="text-primary font-bold cursor-pointer hover:underline">Contact System Admin</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
