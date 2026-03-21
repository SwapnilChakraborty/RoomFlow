import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Card } from '../components/ui/Card';
import { API_URL } from '../config/api';
import { secureFetch } from '../utils/api';

export function AdminChat() {
    const [chats, setChats] = useState([]); // List of active room chats
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { socket } = useSocket();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchInitialChats = async () => {
            try {
                const res = await secureFetch(`${API_URL}/api/rooms`);
                const rooms = await res.json();
                // Only show rooms that are currently occupied
                const activeRooms = rooms.filter(r => r.status === 'Occupied');
                setChats(activeRooms.map(r => ({
                    roomNumber: r.roomNumber.toString(),
                    lastMessage: 'Open to view history',
                    time: '',
                    unread: false
                })));
            } catch (err) {
                console.error('Failed to fetch rooms for chat:', err);
            }
        };

        fetchInitialChats();

        if (socket) {
            socket.on('admin_new_message', (msg) => {
                // If the message is for the currently selected room, add it to messages
                if (selectedRoom && msg.roomNumber === selectedRoom) {
                    setMessages(prev => [...prev, msg]);
                }

                // Update the chat list previews
                setChats(prev => {
                    const existing = prev.find(c => c.roomNumber === msg.roomNumber);
                    if (existing) {
                        return [
                            { ...existing, lastMessage: msg.text, time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unread: true },
                            ...prev.filter(c => c.roomNumber !== msg.roomNumber)
                        ];
                    } else {
                        return [
                            { roomNumber: msg.roomNumber, lastMessage: msg.text, time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unread: true },
                            ...prev
                        ];
                    }
                });
            });

            socket.on('guest_checkout', ({ roomNumber }) => {
                setChats(prev => prev.filter(c => c.roomNumber !== roomNumber.toString()));
                if (selectedRoom === roomNumber.toString()) {
                    setSelectedRoom(null);
                    setMessages([]);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('admin_new_message');
                socket.off('guest_checkout');
            }
        };
    }, [socket, selectedRoom]);

    useEffect(() => {
        if (selectedRoom) {
            secureFetch(`${API_URL}/api/chat/${selectedRoom}`)
                .then(res => res.json())
                .then(data => setMessages(data));
        }
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !selectedRoom || !socket) return;
        
        socket.emit('admin_reply_message', {
            roomNumber: selectedRoom,
            text: input
        });
        
        setInput('');
    };

    return (
        <div className="h-[80vh] flex gap-6 animate-in fade-in duration-700">
            {/* Conversations List */}
            <Card className="w-80 flex flex-col p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/30">
                <div className="p-6 border-b border-slate-50 bg-white">
                    <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                        <MessageCircle size={20} className="text-accent" />
                        Guest Messages
                    </h2>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search rooms..." 
                            className="w-full bg-slate-50 border-none rounded-xl pl-9 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/5"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                    {chats.length === 0 ? (
                        <div className="p-10 text-center opacity-40">
                            <p className="text-[10px] font-bold uppercase tracking-widest">No active chats</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <button
                                key={chat.roomNumber}
                                onClick={() => setSelectedRoom(chat.roomNumber)}
                                className={`w-full p-4 flex gap-4 transition-all hover:bg-white border-b border-slate-50/50 text-left ${selectedRoom === chat.roomNumber ? 'bg-white shadow-sm border-l-4 border-l-accent' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                    {chat.roomNumber}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-extrabold text-primary truncate">Room {chat.roomNumber}</p>
                                        <span className="text-[9px] font-bold text-slate-400">{chat.time}</span>
                                    </div>
                                    <p className={`text-[11px] truncate ${chat.unread ? 'text-accent font-extrabold' : 'text-slate-400 font-medium'}`}>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Window */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/30">
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-serif text-xl">
                                    {selectedRoom}
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-primary">Live Chat: Room {selectedRoom}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Guest is Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors">
                                    <CheckCircle2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 flex flex-col custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg._id || idx}
                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${msg.sender === 'admin' ? 'flex flex-row-reverse' : 'flex'} gap-3`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'admin' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                                            {msg.sender === 'admin' ? 'S' : <User size={14} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                                            msg.sender === 'admin'
                                            ? 'bg-accent text-white rounded-tr-none'
                                            : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                            <p className={`text-[9px] mt-2 font-bold opacity-60`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-50 bg-white">
                            <div className="flex gap-4 items-center bg-slate-50 rounded-2xl px-6 py-2 border border-slate-100 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your reply here..."
                                    className="flex-1 bg-transparent py-4 text-sm font-bold text-primary outline-none"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50/30">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <MessageCircle size={32} className="text-slate-100" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-primary mb-2">Select a Conversation</h2>
                        <p className="text-sm text-slate-400 max-w-sm font-medium leading-relaxed">Choose a room from the sidebar to view message history and respond to guest inquiries in real-time.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
