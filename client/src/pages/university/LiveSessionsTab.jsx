import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Plus, Play, Square, Bell, Radio,
    Clock, Users, Calendar, CheckCircle2,
    AlertCircle, X, RefreshCw, Eye, Trash2,
    Download, ChevronRight, Wifi, WifiOff, ExternalLink,
    Activity, BarChart3, Film, Link2, Copy, CheckCheck, Send, BookOpen
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const API = (path) => `${import.meta.env.VITE_API_URL || ''}/api/sessions${path === '/' ? '' : path}`;
const authHeader = () => {
    const rawInfo = localStorage.getItem('userInfo');
    if (!rawInfo) return {};
    const userInfo = JSON.parse(rawInfo);
    return { Authorization: `Bearer ${userInfo.token}` };
};

/* ── Status badge ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        live: { label: 'LIVE', bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
        scheduled: { label: 'SCHEDULED', bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', dot: 'bg-blue-400' },
        ended: { label: 'ENDED', bg: 'bg-white/5 border-white/10', text: 'text-white/40', dot: 'bg-white/30' },
        cancelled: { label: 'CANCELLED', bg: 'bg-red-900/20 border-red-900/40', text: 'text-red-400/60', dot: 'bg-red-400/40' },
        archived: { label: 'ARCHIVED', bg: 'bg-white/5 border-white/10', text: 'text-white/30', dot: 'bg-white/20' },
    };
    const cfg = map[status] || map.scheduled;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

/* ── Recording badge ──────────────────────────────────────── */
const RecordingBadge = ({ status }) => {
    const map = {
        pending: { label: 'No Recording', color: 'text-white/30' },
        processing: { label: 'Processing…', color: 'text-amber-400' },
        ready: { label: 'Recording Ready', color: 'text-emerald-400' },
        failed: { label: 'Rec. Failed', color: 'text-red-400' },
    };
    const cfg = map[status] || map.pending;
    return <span className={`text-[10px] font-semibold ${cfg.color} flex items-center gap-1`}><Film size={10} />{cfg.label}</span>;
};

/* ── Host Link Modal ─────────────────────────────────────── */
const HostLinkModal = ({ data, onClose }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(data.hostUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Link2 size={16} className="text-primary" /> Host Session Link
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
                </div>

                <p className="text-xs text-white/40 mb-4">
                    Share this link with the instructor. It expires at{' '}
                    <strong className="text-white">{new Date(data.expiresAt).toLocaleTimeString()}</strong>{' '}
                    ({Math.round(data.expiresIn / 3600)}h TTL). JWT-signed — do not post publicly.
                </p>

                {/* Topic */}
                <div className="mb-3 px-3 py-2 bg-white/5 rounded-lg">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Session</p>
                    <p className="text-sm text-white font-semibold">{data.topic}</p>
                </div>

                {/* URL */}
                <div className="flex items-stretch gap-2 mb-4">
                    <div className="flex-1 px-3 py-3 bg-black/40 border border-white/10 rounded-xl">
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Host URL</p>
                        <p className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed">{data.hostUrl}</p>
                    </div>
                    <button
                        onClick={copy}
                        className={`px-4 rounded-xl border transition-all text-sm font-bold shrink-0 flex flex-col items-center justify-center gap-1 ${copied
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                        <span className="text-[10px]">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>

                <div className="flex gap-3">
                    <a
                        href={data.hostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        <Radio size={14} /> Open Host Room
                    </a>
                    <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};



const ScheduleModal = ({ onClose, onCreated, students }) => {
    const [form, setForm] = useState({
        topic: '', description: '', category: 'Computer Science',
        courseId: '',
        startDate: '', startHour: '', startTime: '',
        duration: 60, timezone: 'Asia/Kolkata',
        enrolledStudents: [], meetingLink: '',
        universityId: '', instructor: ''
    });
    const [universities, setUniversities] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch courses for the university
            axios.get('/api/courses/admin', config)
                .then(res => {
                    const data = res.data;
                    if (Array.isArray(data)) setCourses(data);
                    else if (data.courses && Array.isArray(data.courses)) setCourses(data.courses);
                    else setCourses([]);
                })
                .catch(() => {
                    setCourses([]);
                });

            if (userInfo.role === 'admin') {
                axios.get('/api/admin/universities', config)
                    .then(res => setUniversities(res.data))
                    .catch(err => console.error('Error fetching universities:', err));

                axios.get('/api/admin/users/all', config)
                    .then(res => {
                        const nonStudents = res.data.users.filter(u => u.role !== 'student');
                        setInstructors(nonStudents);
                    })
                    .catch(err => console.error('Error fetching instructors:', err));
            }
        }
    }, []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notifyOnCreate, setNotifyOnCreate] = useState(true);

    const handleCourseChange = (e) => {
        const val = e.target.value;
        if (val.length === 24) {
            const course = (courses || []).find(c => c._id === val);
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

    const set = (field) => (e) => {
        const value = e.target.value;
        setForm(f => {
            const updated = { ...f, [field]: value };
            if (field === 'startDate' || field === 'startHour') {
                const d = field === 'startDate' ? value : updated.startDate;
                const t = field === 'startHour' ? value : updated.startHour;
                updated.startTime = d && t ? `${d}T${t}` : '';
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.topic.trim()) {
            setError('Session topic is required.');
            return;
        }
        if (!form.startDate || !form.startHour) {
            setError('Please select both a date and a time.');
            return;
        }

        setLoading(true);
        setError('');

        const raw = localStorage.getItem('userInfo');
        if (!raw) {
            setError('Not logged in. Please refresh and log in again.');
            setLoading(false);
            return;
        }

        const { token } = JSON.parse(raw);
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        try {
            // ─── Save to backend (blocking — we wait for real confirmation) ───
            const { data: savedSession } = await axios.post(
                API(''),
                { ...form, duration: Number(form.duration) },
                { headers, timeout: 20000 }
            );

            // Notify students in the background after confirmed save
            if (notifyOnCreate) {
                axios.post(API(`/${savedSession._id}/notify`), {}, { headers }).catch(() => { });
            }

            onCreated(savedSession, notifyOnCreate);
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to save session.';
            setError(`Server error: ${msg}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary transition-colors";
    const labelCls = "text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block";

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Video size={18} className="text-primary" /> Schedule Live Session
                    </h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Topic */}
                    <div>
                        <label className={labelCls}>Session Topic *</label>
                        <input
                            value={form.topic}
                            onChange={set('topic')}
                            required
                            placeholder="e.g. Advanced React Patterns & Performance"
                            className={inputCls}
                        />
                    </div>

                    {/* Course & Duration */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Course / Category *</label>
                            <div className="relative group">
                                <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                <select
                                    value={form.courseId || form.category}
                                    onChange={handleCourseChange}
                                    className={inputCls + ' pl-9 cursor-pointer'}
                                >
                                    <option value="" className="bg-black text-white">University-wide (All Students)</option>
                                    {Array.isArray(courses) && courses.length > 0 ? (
                                        courses.map(c => (
                                            <option key={c._id} value={c._id} className="bg-black text-white">{c.title}</option>
                                        ))
                                    ) : (
                                        <option disabled className="bg-black text-white/50">No assigned courses available</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Duration (minutes)</label>
                            <select
                                value={form.duration}
                                onChange={set('duration')}
                                className={inputCls + ' appearance-none cursor-pointer'}
                            >
                                {[30, 45, 60, 90, 120, 180].map(d => (
                                    <option key={d} value={d} className="bg-black text-white">
                                        {d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}m` : ''}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Start Date & Time — split inputs for cross-browser reliability */}
                    <div>
                        <label className={labelCls}>Start Date & Time *</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={form.startDate}
                                    onChange={set('startDate')}
                                    className={inputCls + ' pl-9 cursor-pointer'}
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div className="relative">
                                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                <input
                                    type="time"
                                    required
                                    value={form.startHour}
                                    onChange={set('startHour')}
                                    className={inputCls + ' pl-9 cursor-pointer'}
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        {form.startDate && form.startHour && (
                            <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Scheduled for{' '}
                                {(() => {
                                    const date = new Date(`${form.startDate}T${form.startHour}`);
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    return `${day}/${month}/${year} ${hours}:${minutes}`;
                                })()}
                            </p>
                        )}
                    </div>

                    {/* Meeting Link */}
                    <div>
                        <label className={labelCls}>Meeting Link (Zoom / Google Meet / etc.)</label>
                        <input
                            type="url"
                            value={form.meetingLink}
                            onChange={set('meetingLink')}
                            placeholder="https://zoom.us/j/..."
                            className={inputCls}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelCls}>Description & Agenda</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={set('description')}
                            placeholder="What will students learn? Include key topics and prerequisites."
                            className={inputCls + ' resize-none'}
                        />
                    </div>

                    {JSON.parse(localStorage.getItem('userInfo'))?.role === 'admin' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Target University (Auto-Enroll)</label>
                                <select
                                    value={form.universityId}
                                    onChange={set('universityId')}
                                    className={inputCls + ' appearance-none cursor-pointer'}
                                >
                                    <option value="" className="bg-black text-white italic">None - Manual Only</option>
                                    {universities.map(u => (
                                        <option key={u._id} value={u._id} className="bg-black text-white">
                                            {u.profile?.universityName || u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Assigned Instructor</label>
                                <select
                                    value={form.instructor}
                                    onChange={set('instructor')}
                                    className={inputCls + ' appearance-none cursor-pointer'}
                                >
                                    <option value="" className="bg-black text-white italic">Select Instructor</option>
                                    {instructors.map(i => (
                                        <option key={i._id} value={i._id} className="bg-black text-white">
                                            {i.name} ({i.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Auto-notify toggle */}
                    <label className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl cursor-pointer hover:bg-emerald-500/8 transition-colors">
                        <input
                            type="checkbox"
                            checked={notifyOnCreate}
                            onChange={e => setNotifyOnCreate(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded accent-emerald-500 shrink-0"
                        />
                        <div>
                            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <Bell size={12} /> Notify enrolled students immediately
                            </p>
                            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                                Students receive an in-app notification and email right after scheduling.
                            </p>
                        </div>
                    </label>

                    {/* Zoom Meeting Info */}
                    <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 flex items-center gap-2">
                        <Radio size={12} className="shrink-0" />
                        A Zoom meeting will be auto-provisioned. Join link available after scheduling.
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scheduling…</>
                            ) : (
                                <><Send size={14} /> {notifyOnCreate ? 'Schedule & Notify' : 'Schedule Session'}</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

/* ── Session Card ────────────────────────────────────────── */
const SessionCard = ({ 
    session, 
    onStart, 
    onEnd, 
    onNotify, 
    onDelete, 
    onJoinHost = () => {}, 
    onJoinStudent = () => {}, 
    onGetUrl = () => {},
    loadingId 
}) => {
    const isLoading = loadingId === session._id;

    return (
        <GlassCard className="p-5 hover:border-primary/20 transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Left info */}
                <div className="flex gap-4 flex-1 min-w-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${session.status === 'live'
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : session.status === 'ended'
                            ? 'bg-white/5 border-white/10 text-white/30'
                            : 'bg-primary/10 border-primary/20 text-primary'
                        }`}>
                        <Video size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-white truncate">{session.topic}</h4>
                            <StatusBadge status={session.status} />
                        </div>
                        <p className="text-white/40 text-xs mb-2">{session.category}</p>
                        <div className="flex flex-wrap gap-3 text-[11px] text-white/40">
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" />
                                {(() => {
                                    const date = new Date(session.startTime);
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    return `${day}/${month}/${year} ${hours}:${minutes}`;
                                })()}
                            </span>
                            <span className="flex items-center gap-1"><Clock size={11} className="text-primary" /> {session.duration} min</span>
                            <span className="flex items-center gap-1"><Users size={11} className="text-primary" /> {session.enrolledStudents?.length || 0} students</span>
                        </div>

                        {/* Instructor & University */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white/40">
                                {session.instructor?.name?.charAt(0) || 'I'}
                            </div>
                            <div className="text-left flex flex-col">
                                <span className="text-[11px] font-bold text-white/70 leading-tight">
                                    {session.instructor?.name || 'Academic Faculty'}
                                </span>
                                {session.instructor?.profile?.universityName && (
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">
                                        {session.instructor.profile.universityName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Recording status */}
                        {session.recording && (
                            <div className="mt-2">
                                <RecordingBadge status={session.recording.status} />
                            </div>
                        )}

                        {/* RTMP key for live sessions - DEPRECATED: Zoom handles this now */}
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex gap-2 self-center shrink-0">
                    {/* Start button */}
                    {session.status === 'scheduled' && (
                        <button
                            onClick={() => onStart(session._id)}
                            disabled={isLoading}
                            title="Start session"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                            <Play size={13} /> Start
                        </button>
                    )}

                    {/* End button */}
                    {session.status === 'live' && (
                        <button
                            onClick={() => onEnd(session._id)}
                            disabled={isLoading}
                            title="End session"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            <Square size={13} /> End
                        </button>
                    )}

                    {/* Notify students */}
                    {(session.status === 'scheduled' || session.status === 'live') && (
                        <button
                            onClick={() => onNotify(session._id)}
                            disabled={isLoading}
                            title="Notify all enrolled students"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                        >
                            <Bell size={13} /> Notify
                        </button>
                    )}

                    {/* Join as Host - Embedded Zoom */}
                    {(session.status === 'scheduled' || session.status === 'live') && session.zoom?.meetingId && (
                        <button
                            onClick={() => onJoinHost(session._id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                            title="Join meeting as host (embedded)"
                        >
                            <Radio size={13} /> Enter Studio
                        </button>
                    )}

                    {/* Join as Student - Embedded Zoom */}
                    {(session.status === 'scheduled' || session.status === 'live') && session.zoom?.meetingId && (
                        <button
                            onClick={() => onJoinStudent(session._id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                            title="Join meeting as student (embedded)"
                        >
                            <Video size={13} /> Join Session
                        </button>
                    )}

                    {/* External Meeting Link */}
                    {session.meetingLink && (
                        <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                        >
                            <ExternalLink size={13} /> Join Zoom/Meet
                        </a>
                    )}

                    {/* Get signed URL */}
                    {(session.status === 'live' || session.status === 'ended') && (
                        <button
                            onClick={() => onGetUrl(session._id)}
                            disabled={isLoading}
                            title="Get secure playback URL"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        >
                            <Eye size={13} /> Playback
                        </button>
                    )}

                    {/* Delete */}
                    {session.status !== 'live' && (
                        <button
                            onClick={() => onDelete(session._id)}
                            disabled={isLoading}
                            title="Cancel session"
                            className="p-2 text-white/20 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}

                    {isLoading && <RefreshCw size={14} className="animate-spin text-primary" />}
                </div>
            </div>
        </GlassCard>
    );
};

/* ── Static demo sessions shown immediately on mount ────────── */
const DEMO_SESSIONS = [
    {
        _id: 'demo1',
        topic: 'Systemic Architecture with Microservices',
        category: 'Engineering',
        startTime: new Date(Date.now() + 3600000 * 3).toISOString(),
        duration: 90,
        status: 'scheduled',
        description: 'A masterclass on scaling distributed systems using modern orchestration tools.',
        instructor: { name: 'Dr. Elizabeth Thorne' },
        enrolledStudents: [],
        zoom: { meetingId: 'demo_meeting_1', joinUrl: 'https://zoom.us/j/demo1' },
    },
    {
        _id: 'demo2',
        topic: 'UI/UX Design Psychology & Interaction',
        category: 'Design',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        status: 'scheduled',
        description: 'Exploring gestalt principles and cognitive load in modern SaaS design.',
        instructor: { name: 'Marcus Sterling' },
        enrolledStudents: [],
        zoom: { meetingId: 'demo_meeting_2', joinUrl: 'https://zoom.us/j/demo2' },
    },
    {
        _id: 'demo3',
        topic: 'Securing Cloud Infrastructure in 2026',
        category: 'Security',
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        duration: 120,
        status: 'scheduled',
        description: 'Hands-on workshop on zero-trust security and identity-aware proxies.',
        instructor: { name: 'Sarah Connor' },
        enrolledStudents: [],
        zoom: { meetingId: 'demo_meeting_3', joinUrl: 'https://zoom.us/j/demo3' },
    },
    {
        _id: 'demo4',
        topic: 'Basics of Quantitative Finance',
        category: 'Finance',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        duration: 45,
        status: 'ended',
        description: 'Statistical methods used in derivatives pricing.',
        instructor: { name: 'Prof. David Ramsey' },
        enrolledStudents: [],
        zoom: { meetingId: 'demo_meeting_4', joinUrl: 'https://zoom.us/j/demo4' },
    },
];

/* ── Toast ───────────────────────────────────────────────── */
const Toast = ({ msg, type = 'info', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    const colors = { info: 'border-blue-500/30 text-blue-300', success: 'border-emerald-500/30 text-emerald-300', error: 'border-red-500/30 text-red-300' };
    return (
        <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className={`fixed bottom-6 right-6 z-[100] px-5 py-3 bg-[#0d0d1f] border rounded-xl text-sm shadow-2xl ${colors[type]}`}
        >
            {msg}
        </motion.div>
    );
};

/* ── Main LiveSessionsTab component ──────────────────────── */
const LiveSessionsTab = ({ students }) => {
    const navigate = useNavigate();
    // Initialise with demo data so the page is NEVER blank on first render
    // Initialise empty so we can detect once API responds
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true); // Indicate loading initially
    const [loadingId, setLoadingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [hostLinkData, setHostLinkData] = useState(null);
    const [toast, setToast] = useState(null);
    const pollRef = useRef(null);

    const showToast = (msg, type = 'info') => setToast({ msg, type });

    /* ── Background fetch with retry for Render cold starts ── */
    const fetchSessions = useCallback(async (attempt = 1) => {
        let retrying = false;
        try {
            const raw = localStorage.getItem('userInfo');
            if (!raw) { setLoading(false); return; }
            const { token } = JSON.parse(raw);

            // Wake up Render server first (fire and forget)
            if (attempt === 1) {
                axios.get('https://skilldad-server.onrender.com/health').catch(() => { });
            }

            const { data } = await axios.get('/api/sessions', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000, // Important: Render cold start can take long!
            });
            if (Array.isArray(data)) {
                setSessions(data);
            }
        } catch (err) {
            const status = err?.response?.status;
            // Render can take up to ~50s to wake up, so retry up to 6 times (6 * 8s = 48s)
            if (status === 503 && attempt < 6) {
                retrying = true;
                showToast(`Server waking up... retrying (${attempt}/6)`, 'info');
                setTimeout(() => fetchSessions(attempt + 1), 8000);
                return;
            }
            console.warn('[LiveSessions] API unavailable, showing demo data:', err.message);
            setSessions(DEMO_SESSIONS);
        } finally {
            if (!retrying) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchSessions();
        // Poll live session status every 30s
        pollRef.current = setInterval(async () => {
            const live = sessions.filter(s => s.status === 'live');
            for (const s of live) {
                try {
                    const { data } = await axios.get(API(`/${s._id}/status`), { headers: authHeader() });
                    setSessions(prev => prev.map(p => p._id === s._id ? { ...p, status: data.status } : p));
                } catch { /* skip */ }
            }
        }, 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchSessions]);

    /* ── Actions ── */
    const handleStart = async (id) => {
        setLoadingId(id);
        try {
            await axios.put(API(`/${id}/start`), {}, { headers: authHeader() });
            setSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'live' } : s));
            showToast('Session is now LIVE 🔴', 'success');
        } catch (e) { showToast(e.response?.data?.message || 'Error starting session', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleEnd = async (id) => {
        if (!window.confirm('End this session? Recording will begin processing.')) return;
        setLoadingId(id);
        try {
            await axios.put(API(`/${id}/end`), {}, { headers: authHeader() });
            setSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'ended' } : s));
            showToast('Session ended. Recording will be ready shortly.', 'success');
        } catch (e) { showToast(e.response?.data?.message || 'Error ending session', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleNotify = async (id) => {
        setLoadingId(id);
        try {
            const { data } = await axios.post(API(`/${id}/notify`), {}, { headers: authHeader() });
            showToast(`✅ Notified ${data.sent} students (${data.skipped} already notified)`, 'success');
        } catch (e) { showToast(e.response?.data?.message || 'Notification error', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleGetHostLink = async (id) => {
        setLoadingId(id);
        try {
            const { data } = await axios.get(API(`/${id}/host-link`), { headers: authHeader() });
            setHostLinkData(data);
        } catch (e) { showToast(e.response?.data?.message || 'Error generating host link', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Cancel this session?')) return;
        setLoadingId(id);
        try {
            await axios.delete(API(`/${id}`), { headers: authHeader() });
            setSessions(prev => prev.filter(s => s._id !== id));
            showToast('Session cancelled.', 'info');
        } catch (e) { showToast(e.response?.data?.message || 'Error deleting session', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleGetUrl = async (id) => {
        setLoadingId(id);
        try {
            const { data } = await axios.get(API(`/${id}/recording/playback`), { headers: authHeader() });
            if (data.playbackUrl) {
                window.open(data.playbackUrl, '_blank');
                showToast('Opening playback URL...', 'success');
            } else {
                showToast('Recording not yet available', 'info');
            }
        } catch (e) { showToast(e.response?.data?.message || 'Error getting playback URL', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleCreated = (newSession, notified) => {
        setSessions(prev => [newSession, ...prev.filter(s => !s._id.startsWith('local_'))]);
        showToast(
            notified
                ? '✅ Session scheduled & students notified via in-app + email!'
                : '✅ Session scheduled! Zoom meeting created.',
            'success'
        );
        // Re-fetch after 2s to sync background auto-enroll
        setTimeout(() => fetchSessions(), 2000);
    };

    const handleJoinHost = (id) => {
        navigate(`/host-room/${id}`);
    };

    const handleJoinStudent = (id) => {
        navigate(`/student-room/${id}`);
    };

    /* ── Derived ── */
    const filtered = filterStatus === 'all'
        ? sessions
        : sessions.filter(s => s.status === filterStatus);

    const liveCount = sessions.filter(s => s.status === 'live').length;
    const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;
    const endedCount = sessions.filter(s => s.status === 'ended').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Radio size={22} className="text-red-400" /> Live Streaming Hub
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Zoom powered · JWT-secured access · Real-time status</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchSessions} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
                        <RefreshCw size={16} />
                    </button>
                    <ModernButton onClick={() => setShowModal(true)}>
                        <Plus size={16} className="mr-2" /> Schedule Session
                    </ModernButton>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Live Now', value: liveCount, icon: Wifi, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Scheduled', value: scheduledCount, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Ended', value: endedCount, icon: Film, color: 'text-white/40', bg: 'bg-white/5' },
                ].map(s => (
                    <GlassCard key={s.label} className="p-4 text-center">
                        <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs text-white/40 font-medium">{s.label}</p>
                    </GlassCard>
                ))}
            </div>

            {/* Architecture info card */}
            <GlassCard className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
                    {[
                        { icon: Activity, label: 'Horizontal Scaling', desc: 'Redis cross-process rate limiting' },
                        { icon: Radio, label: 'Zoom Integration', desc: 'Native meeting SDK · Cloud recordings' },
                        { icon: Film, label: 'Auto Recording', desc: 'Zoom cloud recordings' },
                        { icon: Bell, label: 'Smart Notifications', desc: 'Redis-deduped, per-student' },
                        { icon: BarChart3, label: 'Signed URLs', desc: 'JWT signatures · 2h TTL' },
                    ].map(({ icon: Icon, label, desc }) => (
                        <span key={label} className="flex items-center gap-1.5">
                            <Icon size={12} className="text-purple-400" />
                            <strong className="text-white/70">{label}</strong> — {desc}
                        </span>
                    ))}
                </div>
            </GlassCard>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'live', 'scheduled', 'ended', 'cancelled'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === s
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {s === 'all' ? `All (${sessions.length})` : s}
                    </button>
                ))}
            </div>

            {/* Sessions list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw size={24} className="animate-spin text-primary" />
                    <span className="ml-3 text-white/40">Loading sessions…</span>
                </div>
            ) : filtered.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <Video size={40} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 font-medium">No sessions found</p>
                    <p className="text-white/20 text-sm mt-1">Schedule your first live session above</p>
                </GlassCard>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((session, index) => (
                            <motion.div
                                key={session._id || `session-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <SessionCard
                                    session={session}
                                    onStart={handleStart}
                                    onEnd={handleEnd}
                                    onNotify={handleNotify}
                                    onDelete={handleDelete}
                                    onJoinHost={handleJoinHost}
                                    onJoinStudent={handleJoinStudent}
                                    onGetUrl={handleGetUrl}
                                    loadingId={loadingId}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <ScheduleModal students={students} onClose={() => setShowModal(false)} onCreated={handleCreated} />
                )}
                {hostLinkData && (
                    <HostLinkModal data={hostLinkData} onClose={() => setHostLinkData(null)} />
                )}
                {toast && (
                    <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveSessionsTab;
