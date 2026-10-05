import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';
import { toast } from 'react-hot-toast';
import { Bell, MessageSquare, Trophy, Ticket, X } from 'lucide-react';
import axios from 'axios';

const StandardToastCard = ({ t, title, message, badge = 'NOTIFICATION', icon: IconComponent = Bell, accent = 'primary' }) => {
    const isAmber = accent === 'amber';
    return (
        <div
            className={`${
                t.visible ? 'animate-in fade-in slide-in-from-top-3' : 'animate-out fade-out slide-out-to-top-2'
            } max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto transition-all`}
        >
            <div className={`h-1 w-full ${isAmber ? 'bg-amber-500' : 'bg-primary'}`} />
            <div className="p-4 flex items-start gap-3.5">
                <div
                    className={`w-10 h-10 rounded-xl ${
                        isAmber
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-primary/10 text-primary dark:text-primary-light border border-primary/20'
                    } flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
                >
                    <IconComponent size={20} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${
                                isAmber
                                    ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                                    : 'text-primary dark:text-primary-light bg-primary/10 border-primary/20'
                            }`}
                        >
                            {badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug mb-0.5">
                        {title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
                        {message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close notification"
                >
                    <X size={15} strokeWidth={2.4} />
                </button>
            </div>
        </div>
    );
};

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

                const isSupport = data.type === 'support_update';
                const isCourse = data.type === 'course_completed';

                toast.custom(
                    (t) => (
                        <StandardToastCard
                            t={t}
                            title={data.title || (isSupport ? 'Support Update' : 'Notification')}
                            message={data.message}
                            badge={isSupport ? 'SUPPORT UPDATE' : (isCourse ? 'ACHIEVEMENT' : 'NOTIFICATION')}
                            icon={isSupport ? MessageSquare : (isCourse ? Trophy : Bell)}
                            accent={isCourse ? 'amber' : 'primary'}
                        />
                    ),
                    { duration: 6000, position: 'top-right' }
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

                    toast.custom(
                        (t) => (
                            <StandardToastCard
                                t={t}
                                title={data.title || 'New Support Ticket'}
                                message={data.message}
                                badge="ADMIN ALERT"
                                icon={Ticket}
                                accent="primary"
                            />
                        ),
                        { duration: 6000, position: 'top-right' }
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

