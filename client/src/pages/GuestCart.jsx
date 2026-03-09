import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export function GuestCart() {
    const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
    const { emitRequest } = useSocket();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        const customer = JSON.parse(localStorage.getItem('customer')) || { room: { roomNumber: 'N/A' } };
        const roomNumber = customer.room?.roomNumber || 'Unknown';

        const orderData = {
            roomNumber,
            items: cart.map(i => ({
                name: i.name,
                price: parseFloat(i.price.replace('$', '')),
                quantity: i.quantity
            })),
            total: total + 2.5
        };

        try {
            const response = await fetch('http://localhost:5001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Order submission failed');

            emitRequest('new_request', {
                room: roomNumber,
                type: 'order',
                details: `${cart.length} items: ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
                total: total,
                priority: 'normal'
            });

            alert('Order placed successfully!');
            clearCart();
            navigate('/guest');
        } catch (err) {
            console.error(err);
            alert('Failed to place order. Please try again.');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <Trash2 size={40} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary">Your cart is empty</h2>
                    <p className="text-slate-500">Add some delicious items to get started.</p>
                </div>
                <Button onClick={() => navigate('/guest/services')} variant="accent" className="mt-4">
                    Browse Menu
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-24"
        >
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-primary">Your Order</h1>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="flex items-center gap-5 p-4 border-slate-100/50 hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {item.img && item.img.startsWith('http') ? (
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl">{item.icon || '🍽️'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-bold text-primary truncate leading-tight">{item.name}</p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-accent font-extrabold text-sm mt-0.5">{item.price}</p>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary hover:bg-slate-50 active:scale-90 transition-all"
                                            >
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="font-black text-primary w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary hover:bg-slate-50 active:scale-90 transition-all"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subtotal</span>
                                            <span className="font-bold text-primary text-sm">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <Card className="bg-primary text-white space-y-4">
                <div className="flex justify-between items-center text-sm opacity-80">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-80">
                    <span>Service Fee</span>
                    <span>$2.50</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>${(total + 2.5).toFixed(2)}</span>
                </div>
                <Button
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl shadow-lg shadow-teal-500/20 mt-2 flex items-center justify-center gap-2"
                    variant="accent"
                >
                    <CreditCard size={18} />
                    Place Order
                </Button>
            </Card>
        </motion.div>
    );
}
