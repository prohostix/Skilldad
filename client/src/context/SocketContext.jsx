import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch stored notifications from DB on mount
    const fetchStoredNotifications = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL || ''}/api/notifications/my`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const stored = (data || []).map(n => ({
                id: n.id,
                type: n.type,
                title: getTitleFromType(n.type),
                message: getMessageFromLog(n),
                timestamp: n.created_at,
                read: n.is_read,
                metadata: n.metadata
            }));
            setNotifications(stored);
            setUnreadCount(stored.filter(n => !n.read).length);
        } catch (err) {
            // Non-fatal: silently ignore
        }
    }, [user]);

    // Mark all as read
    const markAllRead = useCallback(async () => {
        if (!user?.token) return;
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL || ''}/api/notifications/read`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            // Non-fatal
        }
    }, [user]);

    useEffect(() => {
        if (user && user.token) {
            // Load stored notifications immediately
            fetchStoredNotifications();

            const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const newSocket = io(socketUrl, { auth: { token: user.token } });

            newSocket.on('connect', () => {
                console.log('[Socket] Connected to server');
            });

            newSocket.on('notification', (data) => {
                console.log('[Socket] Received notification:', data);
                const newNotif = {
                    ...data,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);

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
                    const newNotif = {
                        ...data,
                        timestamp: new Date().toISOString(),
                        read: false,
                        isAdmin: true
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    toast.error(
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{data.title}</span>
                            <span className="text-xs">{data.message}</span>
                        </div>,
                        {
                            position: 'bottom-right',
                            style: { background: '#7c3aed', color: '#fff' }
                        }
                    );
                });
            }

            setSocket(newSocket);
            return () => newSocket.close();
        } else {
            setSocket(null);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchStoredNotifications]);

    const value = {
        socket,
        notifications,
        unreadCount,
        setUnreadCount,
        setNotifications,
        markAllRead,
        fetchStoredNotifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// Helper: get a human-readable title from notification type
function getTitleFromType(type) {
    const map = {
        liveSession: '🔴 Live Session Scheduled',
        enrollment: '✅ Enrollment Confirmed',
        exam: '📝 Exam Scheduled',
        exam_scheduled: '📝 Exam Scheduled',
        examResult: '🏆 Exam Result',
        examReminder: '⏰ Exam Reminder',
        examCancelled: '❌ Exam Cancelled',
        welcome: '👋 Welcome to SkillDad',
    };
    return map[type] || '🔔 Notification';
}

// Helper: build message text from notification log
function getMessageFromLog(n) {
    const m = n.metadata || {};
    switch (n.type) {
        case 'liveSession': return `"${m.topic}" scheduled for ${m.startTime ? new Date(m.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}`;
        case 'enrollment': return `You have been enrolled in ${m.courseTitle}`;
        case 'exam':
        case 'exam_scheduled': return `Exam "${m.examTitle}" scheduled`;
        case 'examResult': return `Result for "${m.examTitle}": ${m.score} (${m.percentage?.toFixed?.(1) || ''}%)`;
        default: return n.message || 'You have a new notification';
    }
}

