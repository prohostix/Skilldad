import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, Calendar, Users, Play, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardHeading from '../../components/ui/DashboardHeading';

const parseSafeDate = (dateish) => {
    if (!dateish) return new Date();
    if (typeof dateish === 'string' && (dateish.includes('Z') || /[\+\-]\d{2}:\d{2}$/.test(dateish))) {
        return new Date(dateish);
    }
    if (typeof dateish === 'string' && dateish.includes('T')) {
        const [d, t] = dateish.split('T');
        const [y, m, day] = d.split('-').map(Number);
        const [h, min] = t.split(':').map(Number);
        const ld = new Date(y, m - 1, day, h, min);
        return isNaN(ld.getTime()) ? new Date(dateish) : ld;
    }
    return new Date(dateish);
};

const LiveClasses = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'recorded'
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
            setSessions(Array.isArray(data) ? data : []);
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
        const date = parseSafeDate(dateString);
        return {
            day: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    };

    // Get unique courses from sessions
    const uniqueCourses = [...new Set(sessions.map(s => s.course?.title).filter(Boolean))];

    // Filter sessions based on selected course & sort newly created/newest first
    const filteredSessions = (selectedCourse === 'all' 
        ? sessions 
        : sessions.filter(s => s.course?.title === selectedCourse)
    ).sort((a, b) => {
        const timeA = new Date(a.created_at || a.createdAt || a.startTime).getTime();
        const timeB = new Date(b.created_at || b.createdAt || b.startTime).getTime();
        return timeB - timeA;
    });

    const renderSessionCard = (session, index) => {
        const { day, time } = formatDate(session.startTime);
        const isCompleted = session.status === 'ended' || session.status === 'archived';
        const isLive = session.status === 'live';
        
        const sc = {
            bg: isLive ? 'bg-red-500/10' : isCompleted ? 'bg-white/5' : 'bg-emerald-500/10',
            border: isLive ? 'border-red-500/20' : isCompleted ? 'border-white/10' : 'border-emerald-500/20',
            text: isLive ? 'text-red-500' : isCompleted ? 'text-white/40' : 'text-emerald-400',
            icon: isLive ? null : <Video size={10} />
        };
        
        return (
            <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="h-full"
            >
                <div className={`rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full min-h-[190px] group ${isCompleted ? 'grayscale-[0.5] opacity-80' : ''}`}>
                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                        {/* Title + Category */}
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                                {session.topic}
                            </p>
                            {session.category && (
                                <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${isCompleted ? 'bg-white/5 border-white/10 text-white/40' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                    {session.category}
                                </span>
                            )}
                        </div>

                        {/* Course & Description */}
                        <div className="flex flex-col gap-1.5">
                            {session.course?.title && (
                                <div className="flex items-center gap-1.5 text-xs text-primary/70">
                                    <BookOpen size={11} className="shrink-0" />
                                    <span className="font-semibold truncate">{session.course.title}</span>
                                </div>
                            )}
                            {session.description && (
                                <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                                    {session.description}
                                </p>
                            )}
                        </div>

                        {/* Badges/Stats */}
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 text-[10px] font-medium">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/50">
                                <Clock size={9} />{session.duration}m
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/50">
                                <Calendar size={9} />{day} @ {time}
                            </span>
                            {session.instructor?.name && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/50 truncate max-w-[120px]">
                                    <Users size={9} className="shrink-0" /> <span className="truncate">{session.instructor.name}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.015] flex items-center justify-between gap-3 min-h-[44px]">
                        {/* Left: Status / Info */}
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${sc.bg} ${sc.border} ${sc.text}`}>
                            {isLive ? <><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-0.5" /> LIVE</> : <>{sc.icon} {isCompleted ? 'Ended' : 'Upcoming'}</>}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center shrink-0">
                            {isCompleted ? (
                                session.recording && session.recording.status === 'available' ? (
                                    <button
                                        onClick={() => window.open(session.recording.playUrl || session.recording.play_url, '_blank')}
                                        className="text-[10px] font-bold px-3 py-1 rounded border transition-all flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm"
                                    >
                                        <Play size={10} /> Watch Recording
                                    </button>
                                ) : (
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wide">Recording N/A</span>
                                )
                            ) : (
                                <button
                                    onClick={() => handleJoin(session)}
                                    className={`text-[10px] font-bold px-3 py-1 rounded border transition-all flex items-center gap-1 ${
                                        isLive 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm' 
                                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white hover:border-primary shadow-sm'
                                    }`}
                                >
                                    <Play size={10} /> {isLive ? 'Watch Session' : 'Join Link'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="pb-1 border-b border-white/5">
                <DashboardHeading title="Live Learning Hub" />
                <p className="text-xs text-white/40 mt-0.5 font-medium mb-3">Join interactive sessions and masterclasses with world-class instructors.</p>
                
                {/* Tabs */}
                <div className="flex gap-6 mt-4 relative top-[1px]">
                    <button 
                        onClick={() => setActiveTab('active')} 
                        className={`pb-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'active' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/80 hover:border-white/20'}`}
                    >
                        Active Live Classes
                    </button>
                    <button 
                        onClick={() => setActiveTab('recorded')} 
                        className={`pb-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'recorded' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/80 hover:border-white/20'}`}
                    >
                        Recorded Classes
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    {uniqueCourses.length > 0 && (
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-primary/40 transition-colors"
                        >
                            <option value="all" className="bg-[#0a0a0a]">All Courses</option>
                            {uniqueCourses.map((course, index) => (
                                <option key={index} value={course} className="bg-[#0a0a0a]">
                                    {course}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
                            {filteredSessions.filter(s => s.status === 'live').length} Live
                        </span>
                    </div>
                    <button
                        onClick={fetchSessions}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center"
                        title="Refresh sessions"
                    >
                        <RefreshCw size={13} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="text-[11px] font-medium leading-relaxed flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="shrink-0 p-1 hover:bg-red-500/10 rounded ml-2">
                        <span className="sr-only">Dismiss</span>
                        Dismiss
                    </button>
                </div>
            )}

            {/* Results count */}
            <p className="text-[11px] text-white/30 font-medium tracking-wide">
                {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} found
            </p>

            {/* Upcoming & Live Sessions Grid (Visible in ACTIVE tab) */}
            {activeTab === 'active' && (
                <div className="space-y-8">
                    {/* Upcoming & Live Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                Upcoming & Live
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredSessions.filter(s => s.status !== 'ended' && s.status !== 'archived').length === 0 ? (
                                <div className="col-span-full py-10 text-center flex flex-col items-center gap-3">
                                    <div className="p-3.5 bg-white/5 rounded-full">
                                        <Video size={20} className="text-white/20" />
                                    </div>
                                    <p className="text-[11px] font-semibold text-white/35">No upcoming sessions available.</p>
                                </div>
                            ) : (
                                filteredSessions
                                    .filter(s => s.status !== 'ended' && s.status !== 'archived')
                                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                    .map((session, index) => renderSessionCard(session, index))
                            )}
                        </div>
                    </div>

                    {/* Complete Sessions Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={10} />
                                Complete Sessions
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredSessions.filter(s => s.status === 'ended' || s.status === 'archived').length === 0 ? (
                                <div className="col-span-full py-6 text-center text-[10px] text-white/20 italic">
                                    No completed sessions yet.
                                </div>
                            ) : (
                                filteredSessions
                                    .filter(s => s.status === 'ended' || s.status === 'archived')
                                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                                    .map((session, index) => renderSessionCard(session, index))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Completed/Recorded Sessions Grid (Visible in RECORDED tab) */}
            {activeTab === 'recorded' && (
                <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} />
                            Recorded Sessions
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/20 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filteredSessions.filter(s => s.status === 'ended' || s.status === 'archived').length === 0 ? (
                            <div className="col-span-full py-10 text-center flex flex-col items-center gap-3">
                                <div className="p-3.5 bg-white/5 rounded-full">
                                    <Video size={20} className="text-white/20" />
                                </div>
                                <p className="text-[11px] font-semibold text-white/35">No recorded sessions available yet.</p>
                            </div>
                        ) : (
                            filteredSessions
                                .filter(s => s.status === 'ended' || s.status === 'archived')
                                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                                .map((session, index) => renderSessionCard(session, index))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveClasses;
