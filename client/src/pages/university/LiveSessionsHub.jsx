import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Video, Calendar, Clock, Users, Plus, MoreVertical,
    Sparkles, ArrowRight, VideoOff, Radio, Bell, X,
    Link, BookOpen, Target, Send, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

/* ═══════════════════════════════════════════════════════════════
   Inline Toast (self-contained, no external context needed)
═══════════════════════════════════════════════════════════════*/
const InlineToast = ({ toasts, onRemove }) => (
    <div className="fixed bottom-6 right-6 z-[99999] space-y-3 pointer-events-none">
        {toasts.map(t => (
            <div
                key={t.id}
                className={`pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl shadow-2xl border text-sm font-medium min-w-[260px] max-w-xs animate-in slide-in-from-bottom-4 duration-300 ${t.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : t.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300'
                        : 'bg-primary/15 border-primary/30 text-primary'
                    }`}
            >
                {t.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    : t.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        : <Info size={16} className="mt-0.5 shrink-0" />}
                <span className="flex-1 leading-relaxed">{t.message}</span>
                <button onClick={() => onRemove(t.id)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <X size={14} />
                </button>
            </div>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   Static Config
═══════════════════════════════════════════════════════════════*/
const COURSES = ['General', 'Engineering', 'Design', 'AI & ML', 'Security', 'Finance', 'Data Science', 'Business'];
const DURATIONS = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
];

const DEMO_SESSIONS = [
    {
        _id: 'demo1',
        topic: 'Systemic Architecture with Microservices',
        category: 'Engineering',
        startTime: new Date(Date.now() + 3600000 * 3).toISOString(),
        duration: 90,
        description: 'A masterclass on scaling distributed systems using modern orchestration tools and service mesh patterns.',
        instructor: { name: 'Dr. Elizabeth Thorne' },
        enrolledStudents: 156,
        status: 'scheduled',
    },
    {
        _id: 'demo2',
        topic: 'UI/UX Design Psychology & Interaction',
        category: 'Design',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        description: 'Exploring how cognitive load and gestalt principles influence conversion rates.',
        instructor: { name: 'Marcus Sterling' },
        enrolledStudents: 89,
        status: 'scheduled',
    },
    {
        _id: 'demo3',
        topic: 'Securing Cloud Infrastructure in 2026',
        category: 'Security',
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        duration: 120,
        description: 'Hands-on workshop on zero-trust security models and identity-aware proxy implementation.',
        instructor: { name: 'Sarah Connor' },
        enrolledStudents: 210,
        status: 'scheduled',
    },
    {
        _id: 'demo4',
        topic: 'Basics of Quantitative Analysis',
        category: 'Finance',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        duration: 45,
        description: 'Introduction to statistical methods used in derivatives pricing and Risk Management.',
        instructor: { name: 'Prof. David Goggins' },
        enrolledStudents: 112,
        status: 'completed',
    },
];

const parseSafeDate = (dateish) => {
    if (!dateish) return new Date();
    // If it's already an ISO string with Z or an offset, new Date() is safe
    if (typeof dateish === 'string' && (dateish.includes('Z') || /[\+\-]\d{2}:\d{2}$/.test(dateish))) {
        return new Date(dateish);
    }
    // If it's a T-string without timezone (e.g. 2026-03-04T10:02), parse manually as LOCAL
    if (typeof dateish === 'string' && dateish.includes('T')) {
        const [d, t] = dateish.split('T');
        const [y, m, day] = d.split('-').map(Number);
        const [h, min] = t.split(':').map(Number);
        const ld = new Date(y, m - 1, day, h, min);
        return isNaN(ld.getTime()) ? new Date(dateish) : ld;
    }
    return new Date(dateish);
};

const formatSession = (s) => {
    const startObj = parseSafeDate(s.startTime);
    // Use en-IN for Indian users, but keep it robust
    const locale = 'en-IN';
    return {
        id: s._id,
        title: s.topic,
        course: s.course?.title || s.category || 'General',
        instructor: s.instructor?.profile?.universityName || s.instructor?.name || 'Institution Faculty',
        date: startObj.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }),
        time: startObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true }),
        duration: `${s.duration} min`,
        enrolledStudents: typeof s.enrolledStudents === 'number' ? s.enrolledStudents : (s.enrolledStudents?.length || 0),
        status: s.status || (startObj > new Date() ? 'scheduled' : 'completed'),
        description: s.description,
        meetingLink: s.meetingLink,
    };
};

/* ═══════════════════════════════════════════════════════════════
   Schedule Session Modal
═══════════════════════════════════════════════════════════════*/
const ScheduleModal = ({ onClose, onScheduled, onToast, courses = [] }) => {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        topic: '',
        category: 'General',
        courseId: '',
        startDate: '',
        startHour: '',
        meetingLink: '',
        description: '',
        duration: 60,
    });

    const handleCourseChange = (e) => {
        const val = e.target.value;
        if (val.length === 24) {
            const course = courses.find(c => c._id === val);
            setForm(prev => ({
                ...prev,
                courseId: val,
                category: course ? course.category : prev.category
            }));
        } else {
            setForm(prev => ({
                ...prev,
                courseId: '',
                category: val || 'General'
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'courseId') return;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'startDate' || name === 'startHour') {
                const d = name === 'startDate' ? value : updated.startDate;
                const h = name === 'startHour' ? value : updated.startHour;
                updated.startTime = d && h ? `${d}T${h}` : '';
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.topic.trim()) {
            onToast('Session topic is required.', 'error');
            return;
        }
        if (!form.startDate || !form.startHour) {
            onToast('Please select both a date and a time.', 'error');
            return;
        }

        // Robust local-to-ISO parser
        const getISO = () => {
            if (!form.startTime) return '';
            const [d, t] = form.startTime.split('T');
            const [y, m, day] = d.split('-').map(Number);
            const [hour, minute] = t.split(':').map(Number);
            const localDate = new Date(y, m - 1, day, hour, minute);
            return isNaN(localDate.getTime()) ? '' : localDate.toISOString();
        };
        const isoStartTime = getISO();

        // ── Optimistic: create locally IMMEDIATELY so the button always works ──
        const localSession = {
            _id: `local_${Date.now()}`,
            topic: form.topic.trim(),
            category: form.category,
            startTime: isoStartTime, // Use ISO instead of T-string
            duration: Number(form.duration),
            meetingLink: form.meetingLink,
            description: form.description,
            status: 'scheduled',
            instructor: { name: 'You' },
            enrolledStudents: [],
            zoom: { meetingId: 'temp_' + Date.now(), joinUrl: form.meetingLink },
        };

        onScheduled(localSession);           // add to list immediately
        onToast('✅ Session scheduled! Students will be notified.', 'success');
        onClose();                           // close modal right away

        // ── Background: persist to backend, then sync state with real ID ──
        const rawInfo = localStorage.getItem('userInfo');
        if (rawInfo) {
            const { token } = JSON.parse(rawInfo);
            const config = {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                timeout: 15000,
            };

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const payload = {
                ...form,
                duration: Number(form.duration),
                timezone,
                startTime: isoStartTime
            };

            axios.post('/api/sessions', payload, config)
                .then(({ data }) => {
                    // Replace the local optimistic session with the real DB entry
                    onScheduled(data, localSession._id);
                })
                .catch((err) => {
                    const serverMsg = err.response?.data?.message;
                    console.warn('[LiveSessions] Backend save failed (session shown locally):', serverMsg || err.message);
                    onToast(`⚠️ Failed to save to server: ${serverMsg || 'Please retry.'}`, 'error');
                });
        }
    };

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/60 focus:bg-white/8 transition-all placeholder:text-white/25 text-sm";
    const labelCls = "block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-0.5";

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <div className="w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
                <GlassCard className="border-primary/20 shadow-2xl shadow-primary/10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/15 rounded-xl text-primary">
                                <Video size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white">Schedule Live Session</h2>
                                <p className="text-[11px] text-white/40 font-medium">Enrolled students are notified automatically</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Topic */}
                        <div>
                            <label className={labelCls}>Session Topic *</label>
                            <div className="relative group">
                                <Target size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    name="topic"
                                    required
                                    value={form.topic}
                                    onChange={handleChange}
                                    className={`${inputCls} pl-10 font-bold`}
                                    placeholder="e.g. Mastering Advanced React Patterns"
                                />
                            </div>
                        </div>

                        {/* Course & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Select Course (Targets Students) *</label>
                                <div className="relative group">
                                    <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <select
                                        name="courseId"
                                        required
                                        value={form.courseId || form.category}
                                        onChange={handleCourseChange}
                                        className={`${inputCls} pl-10 cursor-pointer text-white`}
                                    >
                                        <option value="" className="bg-[#0B0F1A] text-white">University-wide (All Students)</option>

                                        {Array.isArray(courses) && courses.length > 0 ? (
                                            courses.map(c => (
                                                <option key={c._id} value={c._id} className="bg-[#0B0F1A] text-white">
                                                    {c.title}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled className="bg-[#0B0F1A] text-white/50">No assigned courses available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Duration</label>
                                <select
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                >
                                    {DURATIONS.map(d => (
                                        <option key={d.value} value={d.value} className="bg-[#0B0F1A] text-white">{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Start Date & Time — two separate inputs for reliable cross-browser UX */}
                        <div>
                            <label className={labelCls}>Start Date & Time *</label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Date */}
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className={`${inputCls} pl-9 cursor-pointer`}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                {/* Time */}
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                    <input
                                        type="time"
                                        name="startHour"
                                        required
                                        value={form.startHour}
                                        onChange={handleChange}
                                        className={`${inputCls} pl-9 cursor-pointer`}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                            {form.startDate && form.startHour && (
                                <p className="text-[11px] text-emerald-400 mt-1.5 ml-1 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Scheduled for{' '}
                                    {(() => {
                                        const [y, m, day] = form.startDate.split('-').map(Number);
                                        const [h, min] = form.startHour.split(':').map(Number);
                                        return new Date(y, m - 1, day, h, min).toLocaleString('en-IN', {
                                            dateStyle: 'medium', timeStyle: 'short'
                                        });
                                    })()}
                                </p>
                            )}
                        </div>

                        {/* Meeting Link */}
                        <div>
                            <label className={labelCls}>Meeting Link (Optional - Zoom created automatically)</label>
                            <div className="relative group">
                                <Link size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={form.meetingLink}
                                    onChange={handleChange}
                                    className={`${inputCls} pl-10`}
                                    placeholder="https://zoom.us/j/..."
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelCls}>Description & Agenda</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={form.description}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="What will students learn? Include key topics and prerequisites."
                            />
                        </div>

                        {/* Auto-notify banner */}
                        <div className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <Bell size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-white/55 leading-relaxed">
                                <span className="text-emerald-400 font-bold">Smart-Notify Enabled:</span> {form.courseId ? 'Only students enrolled in this course' : 'All university students'} will receive an
                                email and WhatsApp notification immediately.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <ModernButton type="submit" className="flex-1 justify-center" disabled={submitting}>
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Scheduling...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send size={15} /> Schedule & Notify Students
                                    </span>
                                )}
                            </ModernButton>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   Main Page Component
═══════════════════════════════════════════════════════════════*/
const LiveSessionsHub = () => {
    const navigate = useNavigate();
    // ✅ Seed with demo data immediately — NEVER show a blank/loading screen
    const [liveSessions, setLiveSessions] = useState([]); // Start empty
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true); // Indicate loading initially
    const [showModal, setShowModal] = useState(false);
    const [notifyingId, setNotifyingId] = useState(null);
    const [toasts, setToasts] = useState([]);

    /* ── Toast helpers ── */
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
    }, []);

    const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    /* ── Silent background fetch ── */
    const getAuthConfig = (timeoutMs = 15000) => {
        const raw = localStorage.getItem('userInfo');
        if (!raw) return null;
        const info = JSON.parse(raw);
        return { headers: { Authorization: `Bearer ${info.token}` }, timeout: timeoutMs };
    };

    const fetchSessions = useCallback(async () => {
        try {
            const config = getAuthConfig(15000);
            if (!config) return;
            const { data } = await axios.get('/api/sessions', config);
            if (Array.isArray(data)) {
                setLiveSessions(data.map(formatSession));
            }
        } catch (err) {
            console.warn('[LiveSessionsHub] background fetch sessions failed:', err.message);
            // Fallback to demo data ONLY if fetch fails completely and we have nothing
            setLiveSessions(DEMO_SESSIONS.map(formatSession));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            const config = getAuthConfig(15000);
            if (!config) return;
            const { data } = await axios.get('/api/courses/admin', config);
            if (Array.isArray(data)) {
                setCourses(data);
            }
        } catch (err) {
            console.warn('[LiveSessionsHub] background fetch courses failed:', err.message);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        fetchCourses();
    }, [fetchSessions, fetchCourses]);

    /* ── Actions ── */
    const handleScheduled = (newSession, replaceId = null) => {
        const formatted = formatSession(newSession);
        if (replaceId) {
            // Replace the optimistic local entry with the real DB entry
            setLiveSessions(prev => prev.map(s => s.id === replaceId ? formatted : s));
        } else {
            setLiveSessions(prev => [formatted, ...prev]);
        }
        // Re-fetch after a short delay to sync any background changes (auto-enroll, etc.)
        setTimeout(() => fetchSessions(), 3000);
    };

    const handleNotifyStudents = async (sessionId) => {
        if (sessionId.startsWith('demo')) {
            showToast('Demo sessions cannot send real notifications.', 'info');
            return;
        }
        setNotifyingId(sessionId);
        try {
            const config = getAuthConfig();
            const { data } = await axios.post(`/api/sessions/${sessionId}/notify`, {}, config);
            showToast(
                `Notified ${data.sent} student${data.sent !== 1 ? 's' : ''}${data.skipped > 0 ? ` (${data.skipped} already notified)` : ''}.`,
                'success'
            );
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to send notifications', 'error');
        } finally {
            setNotifyingId(null);
        }
    };

    const handleEnterStudio = async (sessionId) => {
        if (sessionId.startsWith('demo')) {
            showToast('Studio is not available for demo sessions.', 'info');
            return;
        }
        // Navigate to the session detail page with embedded Zoom
        navigate(`/university/session/${sessionId}`);
    };

    const handleJoinMeeting = (link) => {
        if (!link) { showToast('No meeting link available.', 'info'); return; }
        window.open(link, '_blank');
    };

    /* ── Partition sessions ── */
    const liveNow = liveSessions.filter(s => s.status === 'live');
    const upcoming = liveSessions.filter(s => s.status === 'scheduled');
    const past = liveSessions.filter(s => s.status === 'completed' || s.status === 'ended');

    /* ── Spinner while loading ── */
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-white/30 text-sm font-medium animate-pulse">Loading sessions…</p>
        </div>
    );

    /* ── Shared button styles ── */
    const notifyBtn = (id) => (
        <button
            title="Notify enrolled students"
            disabled={notifyingId === id}
            onClick={() => handleNotifyStudents(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-all disabled:opacity-50 shrink-0"
        >
            {notifyingId === id
                ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Bell size={13} />
            }
            <span>Notify</span>
        </button>
    );

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                                Management Portal
                            </span>
                        </div>
                        <DashboardHeading title="Live Learning Hub" />
                        <p className="text-white/40 text-xs mt-1.5">
                            Schedule sessions for specific courses, manage broadcasts, and notify enrolled students.
                        </p>
                    </div>
                    <ModernButton
                        variant="primary"
                        onClick={() => setShowModal(true)}
                        className="shrink-0 shadow-lg shadow-primary/25"
                    >
                        <Plus size={17} className="mr-2" /> Host New Session
                    </ModernButton>
                </div>

                {/* ── Stats Bar ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Sessions', value: liveSessions.length, color: 'text-primary', bg: 'from-primary/10 to-primary/5' },
                        { label: 'Live Now', value: liveNow.length, color: 'text-red-400', bg: 'from-red-500/10 to-red-500/5' },
                        { label: 'Upcoming', value: upcoming.length, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-500/5' },
                        { label: 'Completed', value: past.length, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-500/5' },
                    ].map((stat, i) => (
                        <GlassCard key={i} className={`p-4 bg-gradient-to-br ${stat.bg} border-white/10`}>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left: Session Lists */}
                    <div className="lg:col-span-2 space-y-10">

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] inline-block" />
                                    All Live Sessions
                                </h2>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                                >
                                    <Plus size={16} /> Schedule New
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-white/30 text-sm font-medium animate-pulse">Loading sessions…</p>
                                </div>
                            ) : liveSessions.length === 0 ? (
                                <div
                                    onClick={() => setShowModal(true)}
                                    className="py-20 text-center border-2 border-dashed border-white/10 bg-white/[0.01] rounded-3xl cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                >
                                    <Video size={40} className="mx-auto mb-4 text-white/10 group-hover:text-primary/40 transition-all" />
                                    <p className="text-base font-medium text-white/20 group-hover:text-white/40 mb-1">
                                        No live sessions found
                                    </p>
                                    <p className="text-xs text-white/10 group-hover:text-white/20">Click to schedule your first session</p>
                                </div>
                            ) : (
                                <div className="grid gap-5">
                                    {liveSessions
                                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                        .map(session => (
                                            <GlassCard key={session.id} className={`p-5 group relative overflow-hidden transition-all duration-400 border-white/10 hover:border-primary/30 ${session.status === 'live' ? 'bg-red-500/5 border-red-500/20' : ''}`}>
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-all pointer-events-none" />
                                                <div className="flex flex-col sm:flex-row justify-between gap-5 relative z-10">
                                                    <div className="flex gap-4">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-400 group-hover:scale-110 ${session.status === 'live' ? 'bg-red-500/20 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                            {session.status === 'live' ? <Radio size={22} className="animate-pulse" /> : <Video size={22} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{session.title}</h4>
                                                                {session.status === 'live' && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-red-500 text-[9px] font-black text-white uppercase animate-pulse">Live</span>
                                                                )}
                                                            </div>
                                                            <p className="text-white/40 text-xs mb-3">{session.course} · <span className="text-primary/70">{session.instructor}</span></p>
                                                            <div className="flex flex-wrap gap-2.5">
                                                                <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[11px] font-bold text-white/50">
                                                                    <Calendar size={12} className="text-primary" /> {session.date}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[11px] font-bold text-white/50">
                                                                    <Clock size={12} className="text-primary" /> {session.time} · {session.duration}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[11px] font-bold text-white/50">
                                                                    <Users size={12} className="text-primary" /> {session.enrolledStudents} enrolled
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 self-center shrink-0">
                                                        {notifyBtn(session.id)}
                                                        <ModernButton
                                                            variant="primary"
                                                            className="text-xs px-5 py-2 h-10 shadow-lg shadow-primary/20"
                                                            onClick={() => (session.status === 'live' || !session.meetingLink) ? handleEnterStudio(session.id) : handleJoinMeeting(session.meetingLink)}
                                                        >
                                                            {session.status === 'live' ? 'Studio' : (session.meetingLink ? 'Join' : 'Prepare')}
                                                        </ModernButton>
                                                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-all">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-5">
                        {/* Quick schedule CTA */}
                        <GlassCard
                            className="p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-all"
                            onClick={() => setShowModal(true)}
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-wider">New Session</p>
                                        <p className="text-white/35 text-[11px]">Click to schedule</p>
                                    </div>
                                </div>
                                <p className="text-white/45 text-xs leading-relaxed mb-3">
                                    Pick a course, set the date & time, add your meeting link. Students get notified the moment you hit Schedule.
                                </p>
                                <span className="flex items-center gap-1.5 text-primary text-[11px] font-black uppercase tracking-widest">
                                    Schedule Now <ArrowRight size={12} />
                                </span>
                            </div>
                        </GlassCard>

                        {/* Spotlight cards */}
                        {upcoming.slice(0, 2).map((session, i) => (
                            <GlassCard
                                key={session.id}
                                className={`p-5 border-l-4 overflow-hidden relative ${i === 0 ? 'border-primary' : 'border-amber-500'}`}
                            >
                                <div className={`absolute top-0 right-0 p-1.5 ${i === 0 ? 'bg-primary/10' : 'bg-amber-500/10'} rounded-bl-xl`}>
                                    <Sparkles size={11} className={i === 0 ? 'text-primary' : 'text-amber-500'} />
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${i === 0 ? 'bg-primary text-white' : 'bg-amber-500 text-black'}`}>
                                    {i === 0 ? 'High Impact' : 'Most Anticipated'}
                                </span>
                                <h4 className="text-sm font-bold text-white leading-snug mt-3 mb-1">{session.title}</h4>
                                <p className="text-white/35 text-[11px] mb-3 leading-relaxed">
                                    {session.description || 'An engaging live learning session for enrolled students.'}
                                </p>
                                <div className="space-y-1.5 mb-3">
                                    <div className="flex items-center gap-2 text-[11px] text-white/45">
                                        <Calendar size={11} className={i === 0 ? 'text-primary' : 'text-amber-500'} />
                                        {session.date} · {session.time}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-white/45">
                                        <Users size={11} className={i === 0 ? 'text-primary' : 'text-amber-500'} />
                                        {session.enrolledStudents}+ students enrolled
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleNotifyStudents(session.id)}
                                        disabled={notifyingId === session.id}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                    >
                                        <Bell size={12} /> Notify
                                    </button>
                                    <button
                                        onClick={() => handleEnterStudio(session.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-wider transition-all ${i === 0 ? 'bg-primary hover:bg-primary/85' : 'bg-amber-500 hover:bg-amber-400'}`}
                                    >
                                        <Video size={12} /> Studio
                                    </button>
                                </div>
                            </GlassCard>
                        ))}

                        {/* Pro tip */}
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
                            <Sparkles size={15} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-white/45 leading-relaxed">
                                <span className="text-amber-400 font-bold">Pro Tip:</span> Sessions scheduled mid-week typically achieve
                                <span className="text-white/65"> 40% higher</span> attendance rates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Schedule Modal ── */}
            {showModal && (
                <ScheduleModal
                    onClose={() => setShowModal(false)}
                    onScheduled={handleScheduled}
                    onToast={showToast}
                    courses={courses}
                />
            )}

            {/* ── Inline Toast Notifications ── */}
            <InlineToast toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default LiveSessionsHub;
