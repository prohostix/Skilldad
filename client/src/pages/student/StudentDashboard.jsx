import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    PlayCircle,
    Award,
    Calendar,
    History,
    ChevronRight,
    FileText,
    Video,
    Users,
    Target,
    CheckCircle,
    AlertCircle,
    Upload,
    Download,
    Eye,
    Star,
    BarChart3,
    Settings,
    Zap,
    Layers,
    Play,
    ExternalLink,
    Bell
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import CountingNumber from '../../components/ui/CountingNumber';
import DashboardHeading from '../../components/ui/DashboardHeading';

const StudentDashboard = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [enrolledUniversities, setEnrolledUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        completionRate: 0,
        totalCourses: 0,
        averageScore: 0,
        certificatesEarned: 0
    });
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    // Mock data for demonstration
    useEffect(() => {
        const fetchData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            if (!storedUser || !storedUser.token) {
                navigate('/login');
                return;
            }
            setUserInfo(storedUser);

            const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
            setLoading(true);

            try {
                const [
                    coursesRes,
                    sessionsRes,
                    projectsRes,
                    examsRes,
                    docsRes
                ] = await Promise.allSettled([
                    axios.get('/api/enrollment/my-courses', config),
                    axios.get('/api/sessions', config),
                    axios.get('/api/projects/my-projects', config),
                    axios.get('/api/exams/student/my-exams', config),
                    axios.get('/api/documents/my-documents', config)
                ]);

                // Safe data extraction
                const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data : [];
                const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data : [];
                const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
                // New API returns { success: true, data: [...] }
                const exams = examsRes.status === 'fulfilled' ? (examsRes.value.data.data || examsRes.value.data || []) : [];
                const docs = docsRes.status === 'fulfilled' ? docsRes.value.data : [];

                setEnrolledCourses(courses.slice(0, 3)); // Show top 3 active
                setUpcomingSessions(sessions.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3));
                setRecentProjects(projects.slice(0, 3));
                // Filter upcoming exams (scheduled status, not yet started)
                const now = new Date();
                setUpcomingExams(exams.filter(e => {
                    const startTime = new Date(e.scheduledStartTime);
                    return e.status === 'scheduled' && startTime > now;
                }).slice(0, 3));
                setDocuments(docs.slice(0, 5));

                // Extract unique universities from enrolled courses
                const universities = new Map();
                courses.forEach(enrollment => {
                    const course = enrollment.course;
                    if (course) {
                        // Try to get university info from different sources
                        const uniName = course.universityName ||
                            course.instructor?.profile?.universityName ||
                            (course.instructor?.role === 'university' && course.instructor?.name);

                        const uniId = course.instructor?._id || course.instructor;

                        if (uniName && uniId) {
                            if (!universities.has(uniId.toString())) {
                                universities.set(uniId.toString(), {
                                    id: uniId,
                                    name: uniName,
                                    courseCount: 1,
                                    logo: course.instructor?.profileImage || null
                                });
                            } else {
                                const existing = universities.get(uniId.toString());
                                existing.courseCount += 1;
                            }
                        }
                    }
                });
                setEnrolledUniversities(Array.from(universities.values()));

                // Calculate stats from real data
                const totalProgress = courses.reduce((sum, c) => sum + (Number(c.progress) || 0), 0);
                const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

                // Average score from graded exams
                // Note: database might return percentage as string, so we cast it to Number
                const gradedExams = exams.filter(e => e.submission && (e.submission.percentage !== undefined && e.submission.percentage !== null));
                const totalExamPercentage = gradedExams.reduce((sum, e) => sum + (Number(e.submission.percentage) || 0), 0);
                const avgExamScore = gradedExams.length > 0
                    ? Math.round(totalExamPercentage / gradedExams.length)
                    : null; // Use null to indicate no exams found

                const certificates = courses.filter(c => c.isCompleted).length;

                setStats({
                    completionRate: avgProgress,
                    totalCourses: courses.length,
                    // If we have graded exams, use that score even if it's 0. Only fallback to progress-based if no exams exist.
                    averageScore: avgExamScore !== null ? avgExamScore : (avgProgress > 0 ? avgProgress - 5 : 0),
                    certificatesEarned: certificates
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading || !userInfo) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* 1. Header Section - Refined */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                <div className="space-y-2">
                    <DashboardHeading
                        title={`Student Dashboard`}
                        className="mb-1"
                    />
                    <div className="flex items-center gap-4">
                        <p className="text-white/40 text-base font-medium">
                            Welcome back, <span className="text-white font-bold">{userInfo.name?.split(' ')[0] || 'Scholar'}</span>.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton
                        variant="secondary"
                        size="sm"
                        className="!bg-white/5 !border-white/10 hover:!bg-white/10"
                        onClick={() => navigate('/dashboard/my-courses')}
                    >
                        <BookOpen size={14} className="mr-2 text-primary" /> My Learning
                    </ModernButton>
                    <button
                        onClick={() => navigate('/courses')}
                        className="group relative px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                        <div className="relative flex items-center gap-2">
                            <PlayCircle size={16} /> New Courses
                        </div>
                    </button>
                </div>
            </div>

            {/* Enrolled Universities Section */}
            {enrolledUniversities.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-6 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Users size={18} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Enrolled Universities</h3>
                                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                                        Learning from {enrolledUniversities.length} {enrolledUniversities.length === 1 ? 'Institution' : 'Institutions'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enrolledUniversities.map((university) => (
                                <div
                                    key={university.id}
                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/30 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform">
                                        {university.logo ? (
                                            <img
                                                src={university.logo}
                                                alt={university.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-black text-primary">
                                                {university.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                            {university.name}
                                        </h4>
                                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                                            {university.courseCount} {university.courseCount === 1 ? 'Course' : 'Courses'} Enrolled
                                        </p>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* 2. Stats Grid - University Style with CountingNumber */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Completion Rate', val: stats.completionRate, suffix: '%', icon: Target, border: 'border-primary/30', color: 'from-primary/20 to-primary-dark/20', text: 'text-primary' },
                    { label: 'Active Courses', val: stats.totalCourses, icon: BookOpen, border: 'border-emerald-500/30', color: 'from-emerald-500/20 to-emerald-600/20', text: 'text-emerald-400' },
                    { label: 'Average Score', val: stats.averageScore, suffix: '%', icon: BarChart3, border: 'border-amber-500/30', color: 'from-amber-500/20 to-amber-600/20', text: 'text-amber-400' },
                    { label: 'Certificates', val: stats.certificatesEarned, icon: Award, border: 'border-purple-500/30', color: 'from-purple-500/20 to-purple-600/20', text: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className={`p-6 border-b-2 ${stat.border} group hover:scale-[1.02] transition-all duration-300`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="text-3xl font-black text-white">
                                        <CountingNumber value={stat.val} suffix={stat.suffix || ''} />
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} ${stat.text} shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${stat.text}`}>LIVE METRIC</span>
                                <span className="text-[10px] text-white/20 uppercase tracking-tighter">Updated just now</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>


            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Courses & Progress */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Active Courses */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6">
                            <div className="dashboard-section-title flex-1 min-w-[150px]">
                                <BookOpen size={14} className="text-primary" />
                                Active Learning
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/my-courses')}
                                className="text-[10px] font-extrabold text-white/30 hover:text-primary transition-colors flex items-center uppercase tracking-[0.2em]"
                            >
                                Explorer <ChevronRight size={12} className="ml-1" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {enrolledCourses.map((enrollment) => (
                                <GlassCard
                                    key={enrollment._id}
                                    className="p-0 border-white/15 hover:border-primary/60 transition-all duration-500 cursor-pointer group overflow-hidden bg-white/[0.01]"
                                    onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}
                                >
                                    <div className="relative aspect-[16/6] overflow-hidden">
                                        <img
                                            src={enrollment.course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                        <div className="absolute top-3 right-3">
                                            <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-white border border-white/10 uppercase tracking-widest">
                                                {enrollment.progress}% complete
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{enrollment.course.title}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">
                                                {enrollment.course.instructorName || enrollment.course.instructor?.name || 'Academic Facilitator'}
                                            </p>
                                            {(enrollment.course.universityName || enrollment.course.instructor?.profile?.universityName || (enrollment.course.instructor?.role === 'university' && enrollment.course.instructor?.name)) && (
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-1">
                                                    {enrollment.course.universityName || enrollment.course.instructor?.profile?.universityName || enrollment.course.instructor?.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-gray-500 uppercase tracking-widest">{enrollment.completedModules || 0}/{enrollment.totalModules || 10} Modules</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${enrollment.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-secondary-purple rounded-full shadow-[0_0_12px_rgba(192,38,255,0.3)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex -space-x-1.5">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/100?u=${enrollment.course._id}${i}`} className="w-full h-full object-cover opacity-50" />
                                                    </div>
                                                ))}
                                                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white/40">
                                                    +8
                                                </div>
                                            </div>
                                            <ModernButton
                                                size="sm"
                                                className="!py-1.5 !px-4 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 group-hover:shadow-primary/30"
                                            >
                                                Resume <Play size={10} className="ml-1.5 fill-current" />
                                            </ModernButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6">
                            <div className="dashboard-section-title flex-1 min-w-[150px]">
                                <FileText size={14} className="text-emerald-400" />
                                Project Pipeline
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/course/1/projects')}
                                className="text-[10px] font-extrabold text-white/30 hover:text-emerald-400 transition-colors flex items-center uppercase tracking-[0.2em]"
                            >
                                All Work <ChevronRight size={12} className="ml-1" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentProjects.map((project) => (
                                <GlassCard
                                    key={project._id}
                                    className="p-4 border-white/15 hover:border-emerald-500/50 transition-all group relative overflow-hidden bg-white/[0.01] cursor-pointer"
                                    onClick={() => navigate(`/dashboard/course/${project.course?._id || '1'}/projects`)}
                                >
                                    <div className="flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs font-bold text-white mb-1 truncate group-hover:text-emerald-400 transition-colors uppercase tracking-wider">{project.title}</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{project.course?.title}</p>
                                            </div>
                                            <div className={`p-2 rounded-xl bg-opacity-10 backdrop-blur-md border ${project.status === 'submitted' || project.status === 'graded'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {project.status === 'submitted' || project.status === 'graded' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">
                                                    {project.status === 'graded' ? 'Grade' : 'Deadline'}
                                                </span>
                                                <span className={`text-[11px] font-bold ${project.status === 'graded' ? 'text-emerald-400' : 'text-white/80'
                                                    }`}>
                                                    {project.status === 'graded' ? (project.submission?.grade || 'A+') : new Date(project.deadline).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <button className="flex items-center gap-1.5 text-[9px] font-black text-white/40 group-hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors">
                                                Details <ExternalLink size={10} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="dashboard-section-title mb-6">
                            <Video size={14} className="text-purple-400" />
                            Scheduled Sessions
                        </div>

                        <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                                <GlassCard key={session._id} className="p-4 border-white/10 border-2 hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                                            <Video size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-white truncate mb-1">{session.topic}</h3>
                                            <div className="flex items-center space-x-3 text-[10px] text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center"><Calendar size={10} className="mr-1" /> {new Date(session.startTime).toLocaleDateString()}</span>
                                                    {session.instructor?.profile?.universityName && (
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-1 italic">{session.instructor.profile.universityName}</span>
                                                    )}
                                                </div>
                                                <span className="flex items-center"><Clock size={10} className="mr-1" /> {session.duration}m</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ModernButton
                                        size="sm"
                                        className="w-full mt-4 !py-2 text-[10px] font-bold uppercase tracking-widest shadow-none hover:shadow-purple-500/20"
                                        onClick={() => {
                                            if (session.status === 'live') {
                                                navigate(`/dashboard/watch/${session._id}`);
                                            } else {
                                                window.open(session.meetingLink, '_blank');
                                            }
                                        }}
                                    >
                                        {session.status === 'live' ? 'Watch Stream' : 'Join Module'}
                                    </ModernButton>
                                </GlassCard>
                            ))}
                            {upcomingSessions.length === 0 && (
                                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No Active Sessions</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="dashboard-section-title mb-6">
                            <Trophy size={14} className="text-amber-400" />
                            Exam Assessments
                        </div>

                        <div className="space-y-3">
                            {upcomingExams.map((exam) => (
                                <GlassCard
                                    key={exam._id}
                                    className="!p-4 border-white/15 border-2 hover:border-amber-500/50 transition-all cursor-pointer group bg-white/[0.01]"
                                    onClick={() => navigate('/dashboard/exams')}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                                            <Trophy size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[11px] font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider truncate">{exam.title}</h3>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate mt-0.5">{exam.course?.title}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-500" />
                                            <span className="text-[10px] font-bold text-white/60">{new Date(exam.scheduledStartTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-gray-500" />
                                            <span className="text-[10px] font-bold text-white/60">{exam.duration} Min</span>
                                        </div>
                                    </div>

                                    <ModernButton
                                        size="sm"
                                        className="w-full mt-4 !py-2 !bg-amber-500/10 hover:!bg-amber-500 text-amber-500 hover:text-black !border-amber-500/20 text-[10px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        Attempt Exam
                                    </ModernButton>
                                </GlassCard>
                            ))}
                            {upcomingExams.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Trophy size={24} className="mx-auto text-white/5 mb-2" />
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No Pending Assessments</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="dashboard-section-title mb-6">
                            <FileText size={14} className="text-primary" />
                            Resources & Docs
                        </div>

                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <GlassCard
                                    key={doc._id}
                                    className="!p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group border-white/20"
                                    onClick={() => navigate('/dashboard/documents')}
                                >
                                    <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[11px] font-bold text-white truncate group-hover:text-primary transition-colors">{doc.title}</h3>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                            {doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'} • {doc.format || 'PDF'}
                                        </p>
                                    </div>
                                    <Download size={12} className="text-white/20 group-hover:text-white transition-colors" />
                                </GlassCard>
                            ))}

                            <button
                                onClick={() => navigate('/dashboard/documents')}
                                className="w-full p-4 bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-primary/10 hover:border-primary/40 transition-all mt-2"
                            >
                                <div className="p-2.5 bg-primary/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    <Upload size={18} />
                                </div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Upload Verification Files</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
