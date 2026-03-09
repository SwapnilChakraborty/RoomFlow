import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export function CustomerLogin() {
    const [customerID, setCustomerID] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://hotel-mangment.onrender.com'}/api/customer-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerID })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store customer data in localStorage for persistence
            localStorage.setItem('customer', JSON.stringify(data));
            navigate('/guest');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col justify-center items-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center gap-4">
                    <Logo className="scale-125 mb-4" />
                    <h1 className="text-3xl font-extrabold text-primary text-center">Guest Login</h1>
                    <p className="text-slate-500 font-medium text-center">Enter the Guest ID provided by reception</p>
                </div>

                <Card className="p-8 shadow-2xl shadow-primary/10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest ID</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    type="text"
                                    value={customerID}
                                    onChange={(e) => setCustomerID(e.target.value)}
                                    placeholder="e.g. CUST1234"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-primary placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white rounded-2xl py-4 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Enter Room <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </Card>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Need help? Contact hotel reception.
                </p>
            </motion.div>
        </div>
    );
}
