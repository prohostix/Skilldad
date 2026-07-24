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
    Download
} from 'lucide-react';
import DashboardHeading from '../../components/ui/DashboardHeading';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
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
                                src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'} 
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
                
                <div className="px-4 py-2 border-t border-white/5 bg-white/[0.015] flex items-center justify-between gap-3 min-h-[44px]">
                    <span className="text-[10px] font-medium text-white/30 flex items-center gap-1.5">
                        <Clock size={10} className="text-white/20" /> {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                    <div className="flex gap-2">
                        {isCompleted && !cert && (
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
            {/* Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="My Learning Hub" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Pick up exactly where you left off.</p>
                </div>
                <div className="flex shrink-0">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-colors">
                        <Calendar size={14} className="text-white/50" /> Study Planner
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
        </div>
    );
};

export default MyCourses;
