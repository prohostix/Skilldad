import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    Calendar,
    History,
    ChevronRight,
    Play,
    Download,
    X,
    CheckCircle2,
    Sparkles,
    Sun,
    Moon,
    Sunset,
    Zap,
    Save
} from 'lucide-react';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { getMediaUrl } from '../../utils/media';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlannerModal, setShowPlannerModal] = useState(false);
    const [plannerSavedToast, setPlannerSavedToast] = useState(false);
    const [plannerConfig, setPlannerConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('skilldad_study_planner');
            return saved ? JSON.parse(saved) : {
                weeklyHours: 5,
                pace: 'Balanced',
                selectedDays: ['Mon', 'Wed', 'Fri'],
                preferredTime: 'Evening'
            };
        } catch (e) {
            return { weeklyHours: 5, pace: 'Balanced', selectedDays: ['Mon', 'Wed', 'Fri'], preferredTime: 'Evening' };
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                navigate('/login');
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const [coursesRes, certsRes] = await Promise.all([
                    axios.get('/api/enrollment/my-courses', config),
                    axios.get('/api/certificates/my', config)
                ]);
                
                setEnrolledCourses(coursesRes.data);
                setCertificates(certsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleSavePlanner = (updatedConfig) => {
        setPlannerConfig(updatedConfig);
        try {
            localStorage.setItem('skilldad_study_planner', JSON.stringify(updatedConfig));
        } catch (e) {
            console.error('Failed to save study planner:', e);
        }
        setPlannerSavedToast(true);
        setTimeout(() => setPlannerSavedToast(false), 3000);
        setShowPlannerModal(false);
    };

    const handleApplyCertificate = async (courseId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            console.log('Applying for certificate for course:', courseId);
            const response = await axios.post('/api/certificates/apply', { courseId }, config);
            console.log('Application response:', response.data);
            alert('Certificate application submitted successfully!');
            
            // Refresh certificates
            const { data } = await axios.get('/api/certificates/my', config);
            setCertificates(data);
        } catch (error) {
            console.error('Certificate Application Error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to apply for certificate';
            alert(`Error: ${message}`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (enrolledCourses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 text-white/20">
                    <BookOpen size={32} />
                </div>
                <h2 className="text-base font-semibold text-white mb-1">Your shelf is empty!</h2>
                <p className="text-white/40 mb-6 max-w-sm text-xs font-medium">You haven't enrolled in any courses yet. Start your journey today.</p>
                <button 
                    onClick={() => navigate('/courses')}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-primary/20 shadow-lg shadow-primary/20"
                >
                    Browse Catalog
                </button>
            </div>
        );
    }

    const renderCourseCard = (enrollment) => {
        const cert = certificates.find(c => c.course_id === (enrollment.course?._id || enrollment.course_id));
        const progress = enrollment.progress || 0;
        const isCompleted = progress >= 100;

        return (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full group pb-0">
                <div className="p-4 flex flex-col gap-3 flex-1 cursor-pointer" onClick={() => navigate(`/dashboard/course/${enrollment.course?._id || enrollment.course_id}`)}>
                    <div className="flex gap-3">
                        <div className="w-20 h-14 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/10">
                            <img 
                                src={enrollment.course?.thumbnail ? getMediaUrl(enrollment.course.thumbnail) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                alt={enrollment.course?.title}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                            />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none block mb-1.5">
                                {enrollment.course?.instructor?.profile?.universityName || 'SkillDad Partner'}
                            </span>
                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {enrollment.course?.title || 'Unknown Course'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-2">
                        <div className="flex justify-between items-center text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                            <span>Course Progress</span>
                            <span className="text-white/60">{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full bg-primary" 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                    <div className="text-[10px] font-medium text-white/40 truncate">
                        {isCompleted ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Completed
                            </span>
                        ) : (
                            <span>{progress}% Finished</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isCompleted && (!cert || cert.status === 'NOT_APPLIED') && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleApplyCertificate(enrollment.course?._id || enrollment.course_id); }}
                                className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded border border-emerald-500/20 hover:border-emerald-500 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                                <Trophy size={10} /> Apply Cert
                            </button>
                        )}
                        {cert && cert.status === 'PENDING' && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded border border-amber-400/20">
                                Pending
                            </span>
                        )}
                        {cert && cert.status === 'ISSUED' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); window.open(cert.file_url, '_blank'); }}
                                className="text-[10px] font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1.5 rounded border border-purple-500/20 hover:border-purple-500 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                                <Download size={10} /> Download
                            </button>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/course/${enrollment.course?._id || enrollment.course_id}`); }}
                            className="text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded border border-primary/20 hover:border-primary transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                        >
                            <Play size={10} /> {isCompleted ? 'Review' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const avgProgress = enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCourses.length)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Toast Notification when Plan Saved */}
            {plannerSavedToast && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-500/20 animate-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 size={16} /> Study Plan updated successfully!
                </div>
            )}

            {/* Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="My Learning Hub" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Pick up exactly where you left off.</p>
                </div>
                <div className="flex shrink-0">
                    <button
                        onClick={() => setShowPlannerModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 rounded-lg text-xs font-semibold text-white [.light-mode_&]:!text-black transition-all shadow-sm group"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <Calendar size={14} className="text-primary group-hover:scale-110 transition-transform" />
                        <span>Study Planner ({plannerConfig.weeklyHours}h/wk)</span>
                    </button>
                </div>
            </div>

            {/* Learning Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Enrolled', val: enrolledCourses.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    { label: 'Completed', val: enrolledCourses.filter(c => (c.progress || 0) >= 100).length, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Avg Progress', val: `${avgProgress}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Issued Certs', val: certificates.filter(c => c.status === 'ISSUED').length, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color} ${stat.border}`}>
                                <stat.icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest truncate">{stat.label}</p>
                                <p className="text-lg font-bold text-white leading-none mt-1">{stat.val}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recently Accessed - Horizontal Layout */}
            {enrolledCourses.length > 0 && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono">
                            <History size={10} /> Recently Accessed
                        </div>
                        <button className="text-[8px] font-semibold text-white/20 hover:text-white uppercase tracking-widest transition-colors flex items-center">
                            View All <ChevronRight size={10} className="ml-0.5" />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-2 px-2 no-scrollbar">
                        {enrolledCourses.slice(0, 4).map((enrollment, i) => (
                            <motion.div
                                key={`recent-${enrollment._id}`}
                                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-shrink-0"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                {renderCourseCard(enrollment)}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Course Feed */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono">
                        <BookOpen size={10} /> Learning Journey
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {enrolledCourses.map((enrollment, idx) => (
                        <motion.div
                            key={enrollment._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            {renderCourseCard(enrollment)}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Study Planner Modal */}
            {showPlannerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        className="w-full max-w-2xl bg-slate-900/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/20 overflow-y-auto max-h-[90vh] space-y-6 text-white"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary">
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Personalized Study Planner
                                    </h3>
                                    <p className="text-xs text-white/50">Organize your weekly learning pace and daily study schedule</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPlannerModal(false)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Weekly Commitment Slider */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <Clock size={14} className="text-primary" /> Weekly Target Hours
                                </label>
                                <span className="text-sm font-black text-primary px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                    {plannerConfig.weeklyHours} Hours / Week
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={plannerConfig.weeklyHours}
                                onChange={(e) => setPlannerConfig({ ...plannerConfig, weeklyHours: parseInt(e.target.value) })}
                                className="w-full accent-primary cursor-pointer"
                            />
                            <div className="flex justify-between items-center gap-2 pt-1">
                                {[3, 5, 10, 15].map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setPlannerConfig({ ...plannerConfig, weeklyHours: h })}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${plannerConfig.weeklyHours === h ? 'bg-primary text-white border-primary' : 'bg-white/5 text-white/50 border-white/10 hover:text-white'}`}
                                    >
                                        {h}h / week
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pace & Preferred Days */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Study Days Selection */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <Calendar size={14} className="text-emerald-400" /> Active Study Days
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                        const active = plannerConfig.selectedDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const updated = active
                                                        ? plannerConfig.selectedDays.filter(d => d !== day)
                                                        : [...plannerConfig.selectedDays, day];
                                                    setPlannerConfig({ ...plannerConfig, selectedDays: updated.length ? updated : ['Mon'] });
                                                }}
                                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preferred Time of Day */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <Sun size={14} className="text-amber-400" /> Preferred Study Time
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                        { key: 'Morning', icon: Sun, label: 'Morning (8-12)' },
                                        { key: 'Afternoon', icon: Sunset, label: 'Afternoon (12-5)' },
                                        { key: 'Evening', icon: Sunset, label: 'Evening (5-9)' },
                                        { key: 'Night', icon: Moon, label: 'Night (9-12)' }
                                    ].map((t) => (
                                        <button
                                            key={t.key}
                                            onClick={() => setPlannerConfig({ ...plannerConfig, preferredTime: t.key })}
                                            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 transition-all ${plannerConfig.preferredTime === t.key ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
                                        >
                                            <t.icon size={12} />
                                            <span>{t.key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Smart Weekly Routine Breakdown */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                            <h4 className="text-xs font-bold text-white/80 flex items-center gap-2">
                                <Zap size={14} className="text-purple-400" /> Recommended Weekly Routine
                            </h4>
                            <div className="space-y-2">
                                {plannerConfig.selectedDays.map((day, idx) => {
                                    const assignedCourse = enrolledCourses[idx % enrolledCourses.length];
                                    const dailyMins = Math.round((plannerConfig.weeklyHours * 60) / plannerConfig.selectedDays.length);
                                    return (
                                        <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                                    {day}
                                                </span>
                                                <span className="text-white/80 font-medium truncate max-w-[240px]">
                                                    {assignedCourse?.course?.title || 'Course Learning Session'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/50 text-[11px] font-mono">
                                                <span>{plannerConfig.preferredTime}</span>
                                                <span>•</span>
                                                <span className="text-emerald-400 font-bold">{dailyMins} mins</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowPlannerModal(false)}
                                className="px-4 py-2 text-xs font-bold text-white/50 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSavePlanner(plannerConfig)}
                                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-primary/30 shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                <Save size={14} /> Save Study Plan
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
