import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

import { API_URL } from '../config/api';

const SOCKET_URL = API_URL;

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('staff_token');
        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });
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
