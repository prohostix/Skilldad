import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    PlayCircle,
    Award,
    Calendar,
    History,
    ChevronRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyCourses = async () => {
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
                const { data } = await axios.get('/api/enrollment/my-courses', config);
                setEnrolledCourses(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, [navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (enrolledCourses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <BookOpen size={48} />
                </div>
                <h2 className="text-lg font-semibold text-white font-inter mb-1">Your shelf is empty!</h2>
                <p className="text-white/70 font-inter mb-8 max-w-sm text-sm">You haven't enrolled in any courses yet. Start your journey today.</p>
                <ModernButton onClick={() => navigate('/courses')}>
                    Browse Catalog
                </ModernButton>
            </div>
        );
    }

    return (
        <div className="space-y-2 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="My Learning Hub" />
                    <p className="text-white/40 font-inter text-sm mt-2">Pick up exactly where you left off.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton variant="secondary">
                        <Calendar size={18} className="mr-2" /> Study Planner
                    </ModernButton>
                </div>
            </div>

            {/* Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Enrolled', val: enrolledCourses.length, icon: BookOpen, color: 'primary' },
                    { label: 'Live Classes', val: '3', icon: Clock, color: 'emerald' },
                    { label: 'Progress', val: '65%', icon: TrendingUp, color: 'amber' },
                    { label: 'Certificates', val: '2', icon: Trophy, color: 'secondary-purple' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className={`group hover:border-${stat.color}/40 transition-colors`}>
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 bg-${stat.color}/10 text-${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider font-inter">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white font-poppins">{stat.val}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Recently Accessed - Horizontal Carousel */}
            {enrolledCourses.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white font-inter flex items-center">
                            <History size={20} className="mr-2 text-primary" /> Recently Accessed
                        </h2>
                        <button className="text-sm font-bold text-primary hover:underline flex items-center">
                            View All History <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pb-6 -mx-2 px-2 no-scrollbar scroll-smooth">
                        {enrolledCourses.slice(0, 4).map((enrollment, i) => (
                            <motion.div
                                key={`recent-${enrollment._id}`}
                                className="min-w-[300px] flex-shrink-0"
                                whileHover={{ y: -5 }}
                            >
                                <GlassCard className="!p-4 bg-white/40 hover:bg-white/60 transition-all border-white/40 group cursor-pointer" onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            <img src={enrollment.course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                                className="w-full h-full object-cover"
                                                alt=""
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                            />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="font-bold text-black truncate font-poppins">{enrollment.course.title}</h4>
                                            <div className="flex flex-col mt-1">
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{enrollment.course.instructor?.profile?.universityName || 'SkillDad Partner'}</p>
                                                <p className="text-[8px] font-bold text-black/50 uppercase tracking-widest">Last activity: 2h ago</p>
                                            </div>
                                            <div className="mt-2 w-full h-1 bg-slate-100 rounded-full">
                                                <div className="h-full bg-primary rounded-full w-[45%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Course Feed */}
            <div className="space-y-6">
                <h2 className="text-sm font-semibold text-white font-inter flex items-center">
                    <BookOpen size={20} className="mr-2 text-primary" /> Learning Journey
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((enrollment) => (
                        <motion.div
                            key={enrollment._id}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.1}
                            whileTap={{ scale: 0.98 }}
                            className="touch-none"
                        >
                            <GlassCard className="group overflow-hidden !p-0 h-full hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500">
                                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                    <img
                                        src={enrollment.course.thumbnail || `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`}
                                        alt={enrollment.course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-primary/80 rounded-md">In Progress</span>
                                    </div>
                                </div>

                                <div className="p-6 text-left">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{enrollment.course.instructor?.profile?.universityName || 'SkillDad Partner'}</span>
                                        <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{enrollment.course.category}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-black font-space mb-4 line-clamp-1">{enrollment.course.title}</h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center text-xs font-bold text-black/50">
                                            <span className="uppercase tracking-wider font-inter">Course Progress</span>
                                            <span>24%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary rounded-full transition-all"
                                                initial={{ width: 0 }}
                                                animate={{ width: '24%' }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>

                                    <ModernButton
                                        className="w-full !py-4 font-bold shadow-lg shadow-primary/20 group/btn"
                                        onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}
                                    >
                                        <PlayCircle size={18} className="mr-2 group-hover/btn:scale-110 transition-transform" /> Continue Learning
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
