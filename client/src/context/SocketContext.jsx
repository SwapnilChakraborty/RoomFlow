import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:5001';

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        return () => newSocket.close();
    }, []);

    const emitRequest = (type, data) => {
        if (socket) {
            socket.emit('new_request', { type, data, timestamp: new Date() });
        }
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, emitRequest }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
