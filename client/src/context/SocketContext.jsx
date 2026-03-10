import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user && user.token) {
            // Point socket.io to the exact backend server URL, NOT Vercel
            const socketUrl = import.meta.env.VITE_API_URL || 'https://skilldad-server.onrender.com';

            const newSocket = io(socketUrl, {
                auth: {
                    token: user.token
                }
            });

            newSocket.on('connect', () => {
                console.log('[Socket] Connected to server');
            });

            newSocket.on('notification', (data) => {
                console.log('[Socket] Received notification:', data);

                // Show a premium toast notification
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-bold text-sm uppercase tracking-wider">{data.title}</span>
                        <span className="text-xs opacity-90">{data.message}</span>
                    </div>,
                    {
                        duration: 6000,
                        position: 'top-right',
                        style: {
                            background: 'rgba(30, 41, 59, 0.95)',
                            color: '#fff',
                            border: '1px solid rgba(124, 58, 237, 0.5)',
                            backdropFilter: 'blur(10px)'
                        },
                        icon: data.type === 'course_completed' ? '🏆' : '🔔'
                    }
                );
            });

            // Admin specific notifications
            if (user.role === 'admin') {
                newSocket.on('admin_notification', (data) => {
                    toast.error(
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{data.title}</span>
                            <span className="text-xs">{data.message}</span>
                        </div>,
                        {
                            position: 'bottom-right',
                            style: {
                                background: '#7c3aed',
                                color: '#fff'
                            }
                        }
                    );
                });
            }

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
