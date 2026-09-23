import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, Calendar, Users, Play, AlertCircle, RefreshCw, BookOpen, Radio, PlayCircle, FileCheck2, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import liveHubIllustrationImg from '../../assets/live-hub-illustration.png';

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
    const [showCalendar, setShowCalendar] = useState(false);
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

    // Header "Join a Live Session" button: jumps straight in when there's exactly
    // one live session, otherwise surfaces the Upcoming & Live list so the user
    // can pick (or see that nothing is live right now) instead of guessing.
    const handleJoinLiveNow = () => {
        const liveNow = sessions.filter(s => s.status === 'live');
        if (liveNow.length === 1) {
            handleJoin(liveNow[0]);
            return;
        }
        setActiveTab('active');
        if (liveNow.length === 0) {
            setError('No live sessions right now. Check the Upcoming & Live list below for scheduled sessions.');
            setTimeout(() => setError(null), 5000);
        }
        requestAnimationFrame(() => {
            document.getElementById('upcoming-live-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
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

    const upcomingLive = filteredSessions.filter(s => s.status !== 'ended' && s.status !== 'archived').sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const completed = filteredSessions.filter(s => s.status === 'ended' || s.status === 'archived').sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const renderSessionCard = (session, index) => {
        const { day, time } = formatDate(session.startTime);
        const isCompleted = session.status === 'ended' || session.status === 'archived';
        const isLive = session.status === 'live';

        const sc = {
            bg: isLive ? 'bg-red-50 dark:bg-red-950/40' : isCompleted ? 'bg-slate-50 dark:bg-white/5' : 'bg-emerald-50 dark:bg-emerald-950/40',
            border: isLive ? 'border-red-200 dark:border-red-900/50' : isCompleted ? 'border-slate-200 dark:border-white/10' : 'border-emerald-200 dark:border-emerald-900/50',
            text: isLive ? 'text-red-500 dark:text-red-400' : isCompleted ? 'text-slate-400 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400',
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
                <div className={`rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden flex flex-col h-full min-h-[190px] group ${isCompleted ? 'opacity-80' : ''}`}>
                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                        {/* Title + Category */}
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                                {session.topic}
                            </p>
                            {session.category && (
                                <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${isCompleted ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                    {session.category}
                                </span>
                            )}
                        </div>

                        {/* Course & Description */}
                        <div className="flex flex-col gap-1.5">
                            {session.course?.title && (
                                <div className="flex items-center gap-1.5 text-xs text-primary/80 dark:text-primary-accent">
                                    <BookOpen size={11} className="shrink-0" />
                                    <span className="font-semibold truncate">{session.course.title}</span>
                                </div>
                            )}
                            {session.description && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {session.description}
                                </p>
                            )}
                        </div>

                        {/* Badges/Stats */}
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 text-[10px] font-medium">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-300">
                                <Clock size={9} />{session.duration}m
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-300">
                                <Calendar size={9} />{day} @ {time}
                            </span>
                            {session.instructor?.name && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-300 truncate max-w-[120px]">
                                    <Users size={9} className="shrink-0" /> <span className="truncate">{session.instructor.name}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3 min-h-[44px]">
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
                                        className="text-[10px] font-bold px-3 py-1 rounded border transition-all flex items-center gap-1 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm"
                                    >
                                        <Play size={10} /> Watch Recording
                                    </button>
                                ) : (
                                    <span className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase tracking-wide">Recording N/A</span>
                                )
                            ) : (
                                <button
                                    onClick={() => handleJoin(session)}
                                    className={`text-[10px] font-bold px-3 py-1 rounded border transition-all flex items-center gap-1 ${isLive
                                        ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm'
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

    const emptyState = (icon, title, subtitle) => (
        <div className="col-span-full py-7 text-center flex flex-col items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center">
                {icon}
                <Sparks />
            </div>
            <div className="space-y-1">
                <p className="!text-sm !font-bold !text-slate-900 dark:!text-white !leading-tight !tracking-normal !font-inter">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="-mt-8 pb-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                    <h1 className="!text-2xl sm:!text-[28px] !font-bold !text-[#311B92] dark:!text-white !leading-tight !tracking-normal !font-inter">Live Learning Hub</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg">Join interactive sessions and masterclasses with world-class instructors.</p>
                </div>

                <div className="flex items-center gap-4">
                    <LiveHubIllustration />
                    <button
                        onClick={handleJoinLiveNow}
                        className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0"
                    >
                        <Video size={14} /> Join a Live Session
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 dark:border-white/10 mt-1 overflow-x-auto hide-scrollbar">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-1.5 pb-3 text-sm font-bold border-b-2 -mb-px transition-all shrink-0 whitespace-nowrap ${activeTab === 'active' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    <Radio size={14} /> Active Live Classes
                </button>
                <button
                    onClick={() => setActiveTab('recorded')}
                    className={`flex items-center gap-1.5 pb-3 text-sm font-bold border-b-2 -mb-px transition-all shrink-0 whitespace-nowrap ${activeTab === 'recorded' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    <PlayCircle size={14} /> Recorded Classes
                </button>
            </div>

            {/* Toolbar: course filter + live count + refresh */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3">
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    {uniqueCourses.length > 0 && (
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-[#0f0a21] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-primary/40 transition-colors"
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map((course, index) => (
                                <option key={index} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                            {filteredSessions.filter(s => s.status === 'live').length} Live
                        </span>
                    </div>
                    <button
                        onClick={fetchSessions}
                        className="p-1.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center"
                        title="Refresh sessions"
                    >
                        <RefreshCw size={13} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 mt-3">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="text-[11px] font-medium leading-relaxed flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="shrink-0 text-[11px] font-bold px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded ml-2">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Active tab: Upcoming & Live + Completed Sessions cards */}
            {activeTab === 'active' && (
                <div className="space-y-6 mt-3">
                    {/* Upcoming & Live Card */}
                    <div id="upcoming-live-section" className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0e0924]/90 dark:backdrop-blur-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
                                <h2 className="!text-sm !font-bold !text-slate-900 dark:!text-white !leading-tight !tracking-normal !font-inter">Upcoming & Live</h2>
                            </div>
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 bg-transparent dark:bg-white/5 rounded-lg px-3 py-1.5 hover:border-primary/40 hover:text-primary dark:hover:text-white transition-all"
                            >
                                <Calendar size={13} /> View Calendar
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {upcomingLive.length === 0
                                    ? emptyState(
                                        <Video size={22} className="text-primary" />,
                                        'No live sessions at the moment',
                                        'Check back later for upcoming classes and live sessions from your instructors.'
                                    )
                                    : upcomingLive.map((session, index) => renderSessionCard(session, index))}
                            </div>
                        </div>
                    </div>

                    {/* Completed Sessions Card */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0e0924]/90 dark:backdrop-blur-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                                    <Clock size={12} />
                                </div>
                                <h2 className="!text-sm !font-bold !text-slate-900 dark:!text-white !leading-tight !tracking-normal !font-inter">Completed Sessions</h2>
                            </div>
                            <button onClick={() => setActiveTab('recorded')} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                                View All <ArrowRight size={13} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {completed.length === 0
                                    ? emptyState(
                                        <FileCheck2 size={22} className="text-primary" />,
                                        'No completed sessions yet',
                                        'Your past live sessions will appear here once you attend them.'
                                    )
                                    : completed.map((session, index) => renderSessionCard(session, index))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recorded tab */}
            {activeTab === 'recorded' && (
                <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0e0924]/90 dark:backdrop-blur-md mt-3">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                                <PlayCircle size={12} />
                            </div>
                            <h2 className="!text-sm !font-bold !text-slate-900 dark:!text-white !leading-tight !tracking-normal !font-inter">Recorded Sessions</h2>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {completed.length === 0
                                ? emptyState(
                                    <PlayCircle size={22} className="text-primary" />,
                                    'No recorded sessions available yet',
                                    'Recordings from your completed live sessions will show up here.'
                                )
                                : completed.map((session, index) => renderSessionCard(session, index))}
                        </div>
                    </div>
                </div>
            )}

            {/* View Calendar modal - lists the real upcoming/live sessions, chronologically; no placeholder data */}
            {showCalendar && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowCalendar(false)}
                >
                    <div
                        className="bg-white dark:bg-[#0f0a21] border border-transparent dark:border-white/10 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
                            <h3 className="!text-sm !font-bold !text-slate-900 dark:!text-white !leading-tight !tracking-normal !font-inter flex items-center gap-2">
                                <Calendar size={15} className="text-primary" /> Upcoming Sessions
                            </h3>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5 space-y-2.5">
                            {upcomingLive.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-400 text-center py-10">No live sessions are scheduled right now. Check back later.</p>
                            ) : (
                                upcomingLive.map((session) => {
                                    const { day, time } = formatDate(session.startTime);
                                    const isLive = session.status === 'live';
                                    return (
                                        <div key={session._id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/[0.02] hover:border-primary/30 transition-all">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLive ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-primary/10 dark:bg-primary/20 text-primary'}`}>
                                                <Calendar size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{session.topic}</p>
                                                {session.course?.title && <p className="text-[11px] text-primary/70 dark:text-primary/90 font-semibold truncate">{session.course.title}</p>}
                                                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">{day} at {time}</p>
                                            </div>
                                            {isLive && (
                                                <span className="shrink-0 text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-900/50 rounded px-1.5 py-0.5 uppercase self-center">
                                                    Live
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Small decorative sparkle marks that sit near an empty-state icon circle,
// matching the reference design's "motion" accents.
const Sparks = () => (
    <>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute -top-1 -right-1 text-primary/40">
            <path d="M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8L7 0Z" fill="currentColor" />
        </svg>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute -bottom-1 -left-1 text-primary/30">
            <path d="M4 0L4.7 3.3L8 4L4.7 4.7L4 8L3.3 4.7L0 4L3.3 3.3L4 0Z" fill="currentColor" />
        </svg>
    </>
);

// Flat-style illustration of a student on a video call with a laptop -
// approximating the reference design's header visual. No matching stock
// asset existed, so this is a hand-built inline SVG rather than an image.
const LiveHubIllustration = () => (
    <img
        src={liveHubIllustrationImg}
        alt=""
        className="hidden sm:block shrink-0 w-auto object-contain"
        style={{ height: 165 }}
    />
);

export default LiveClasses;
