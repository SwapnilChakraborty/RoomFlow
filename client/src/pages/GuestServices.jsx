import React, { useState } from 'react';
import { Search, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function GuestServices() {
    const [activeCategory, setActiveCategory] = useState('All');
    const { addToCart, itemCount, total } = useCart();
    const navigate = useNavigate();

    const categories = ['All', 'Breakfast', 'Main Course', 'Drinks', 'Dessert'];

    const menuItems = [
        { id: 1, name: 'Gourmet Avocado Toast', price: 16, category: 'Breakfast', icon: '🥑', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop', rating: 4.9 },
        { id: 2, name: 'Truffle Margherita Pizza', price: 24, category: 'Main Course', icon: '🍕', img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=800&auto=format&fit=crop', rating: 4.8 },
        { id: 3, name: 'Premium Wagyu Burger', price: 28, category: 'Main Course', icon: '🍔', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', rating: 5.0 },
        { id: 4, name: 'Vintage Red Reserve', price: 85, category: 'Drinks', icon: '🍷', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop', rating: 4.7 },
    ];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <div className="space-y-6 pb-32 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-extrabold text-primary">Dining</h1>
                    <p className="text-slate-500 font-medium">Prepared by Michelin Chefs</p>
                </motion.div>
            </div>

            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search for something delicious..."
                    className="w-full bg-white border border-slate-100 rounded-3xl pl-12 py-5 text-sm focus:ring-4 focus:ring-primary/5 outline-none shadow-sm transition-all focus:shadow-xl focus:border-slate-200"
                />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap tracking-widest ${activeCategory === cat
                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                            : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
                            }`}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredItems.map(item => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card soft className="p-0 overflow-hidden group">
                            <div className="relative h-56">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                    <Star size={14} className="fill-orange-400 text-orange-400" />
                                    <span className="text-xs font-bold text-primary">{item.rating}</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-extrabold text-primary text-xl leading-tight">{item.name}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                                    </div>
                                    <span className="text-2xl font-extrabold text-accent">${item.price}</span>
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-full mt-4"
                                    onClick={() => addToCart({ ...item, price: `$${item.price}` })}
                                >
                                    Add to Order
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Persistent Cart Button */}
            <AnimatePresence>
                {itemCount > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md px-8 z-[60] pointer-events-none"
                    >
                        <button
                            onClick={() => navigate('/guest/cart')}
                            className="w-full bg-primary text-white py-5 rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-between px-8 pointer-events-auto active:scale-95 transition-transform border border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-lg">
                                    {itemCount}
                                </div>
                                <div className="text-left">
                                    <span className="block font-extrabold text-sm uppercase tracking-widest">Your Order</span>
                                    <span className="text-xs text-white/60 font-medium">Ready for checkout</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-extrabold">${total.toFixed(2)}</span>
                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

