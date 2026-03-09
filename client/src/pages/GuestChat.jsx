import React, { useState } from 'react';
import { Send, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GuestChat() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to RoomFlow! How can we assist you today?", sender: 'system', time: '10:00 AM' },
        { id: 2, text: "Hello, I wanted to ask about the gym timings.", sender: 'user', time: '10:05 AM' },
        { id: 3, text: "Our gym is open 24/7 on Level 2. You can use your room key to access it.", sender: 'system', time: '10:06 AM' },
    ]);
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setInput('');

        // Simulate auto-reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: "Thanks for your message. An agent will be with you shortly.",
                sender: 'system',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2000);
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={20} className="text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                            FD
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-primary leading-none">Front Desk</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase mt-1">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                            }`}>
                            <p className="text-sm font-medium">{msg.text}</p>
                            <p className={`text-[9px] mt-1 font-bold ${msg.sender === 'user' ? 'text-white/50' : 'text-slate-300'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-1 border border-slate-100">
                    <button className="text-slate-400 hover:text-slate-600"><Paperclip size={18} /></button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent py-3 text-sm outline-none font-medium"
                    />
                    <button className="text-slate-400 hover:text-slate-600"><Smile size={18} /></button>
                    <button
                        onClick={handleSend}
                        className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
