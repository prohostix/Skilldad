import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, Calendar, Users, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const LiveClasses = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchSessions = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            navigate('/login');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        setError(null);
        try {
            const { data } = await axios.get('/api/sessions', config);

            if (!data || data.length === 0) {
                setSessions([
                    {
                        _id: 'demo1',
                        topic: 'Systemic Architecture with Microservices',
                        category: 'Engineering',
                        startTime: new Date(Date.now() + 3600000 * 3).toISOString(),
                        duration: 90,
                        description: 'A masterclass on scaling distributed systems using modern orchestration tools.',
                        instructor: { name: 'Dr. Elizabeth Thorne' },
                        status: 'scheduled',
                        meetingLink: '#'
                    },
                    {
                        _id: 'demo2',
                        topic: 'UI/UX Design Psychology',
                        category: 'Design',
                        startTime: new Date(Date.now() + 86400000).toISOString(),
                        duration: 60,
                        description: 'Exploring how cognitive load influences conversion rates.',
                        instructor: { name: 'Marcus Sterling' },
                        status: 'scheduled',
                        meetingLink: '#'
                    }
                ]);
            } else {
                setSessions(data);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || error.message || 'Failed to load sessions';
            setError(msg);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(() => {
            fetchSessions();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleJoin = (session) => {
        if (session.status === 'live') {
            navigate(`/dashboard/session/${session._id}`);
            return;
        }
        if (session.meetingLink && session.meetingLink !== '#') {
            window.open(session.meetingLink, '_blank');
        } else {
            setError('No join link is available for this session yet. Please check back closer to the session time.');
            setTimeout(() => setError(null), 5000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    };

    const renderSessionCard = (session, index, isCompleted = false) => {
        const { day, time } = formatDate(session.startTime);
        return (
            <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <GlassCard className={`h-full flex flex-col group hover:border-primary/50 transition-all duration-500 overflow-hidden ${isCompleted ? 'grayscale-[0.5] opacity-80' : ''}`}>
                    <div className="p-6 pb-0 flex justify-between items-start">
                        <div className={`px-3 py-1 rounded-full ${isCompleted ? 'bg-white/5 border-white/10' : 'bg-primary/10 border-primary/20'} border`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-white/40' : 'text-primary'}`}>
                                {session.category || 'General'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <Clock size={14} />
                            <span>{session.duration}m</span>
                        </div>
                    </div>

                    <div className="p-6 flex-1">
                        <h3 className={`text-xl font-bold text-white mb-2 transition-colors ${!isCompleted && 'group-hover:text-primary'}`}>{session.topic}</h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-6">{session.description}</p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-white/5 text-white/20' : 'bg-primary/20 text-primary'}`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Date & Time</p>
                                    <p className="text-sm text-white font-semibold">{day} @ {time}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-white/5 text-white/20' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Instructor</p>
                                    <p className="text-sm text-white font-semibold leading-tight">{session.instructor?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-0 mt-auto">
                        <ModernButton
                            onClick={() => handleJoin(session)}
                            className="w-full justify-center group/btn"
                            variant={session.status === 'live' ? 'primary' : 'secondary'}
                            disabled={isCompleted && session.status !== 'live'}
                        >
                            {isCompleted ? (
                                <span className="flex items-center gap-2">Completed</span>
                            ) : (
                                <>
                                    <Play size={18} className="mr-2 fill-white group-hover/btn:scale-110 transition-transform" />
                                    {session.status === 'live' ? 'Watch Live Stream' : 'Join Session'}
                                </>
                            )}
                        </ModernButton>
                    </div>
                </GlassCard>
            </motion.div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Live Learning Hub" />
                    <p className="text-white/50 mt-1">Join interactive sessions with world-class instructors.</p>
                </div>
                <div className="flex gap-4">
                    <GlassCard className="px-4 py-2 flex items-center gap-2 border-primary/30">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold uppercase tracking-wider">
                            {sessions.filter(s => s.status === 'live').length > 0
                                ? `Live Now: ${sessions.filter(s => s.status === 'live').length} Session`
                                : 'No Live Sessions'}
                        </span>
                    </GlassCard>
                    <button
                        onClick={fetchSessions}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-primary hover:border-primary/50 transition-all"
                        title="Refresh sessions"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 text-xs font-bold uppercase tracking-wider">Dismiss</button>
                </div>
            )}

            {/* Active Sessions */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                        Upcoming & Live
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sessions.filter(s => s.status !== 'ended' && s.status !== 'archived').length === 0 ? (
                        <GlassCard className="col-span-full p-12 text-center border-dashed border-white/10">
                            <Video size={32} className="text-white/10 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">No active sessions at the moment.</p>
                        </GlassCard>
                    ) : (
                        sessions
                            .filter(s => s.status !== 'ended' && s.status !== 'archived')
                            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                            .map((session, index) => renderSessionCard(session, index, false))
                    )}
                </div>
            </div>

            {/* Completed Sessions */}
            {sessions.filter(s => s.status === 'ended' || s.status === 'archived').length > 0 && (
                <div className="space-y-6 pt-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Clock size={14} />
                            Completed Live Sessions
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sessions
                            .filter(s => s.status === 'ended' || s.status === 'archived')
                            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                            .map((session, index) => renderSessionCard(session, index, true))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveClasses;
