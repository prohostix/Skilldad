import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Trophy,
    Clock,
    Target,
    PlayCircle,
    Calendar,
    ChevronRight,
    FileText,
    Video,
    Users,
    CheckCircle,
    Upload,
    Download,
    Star,
    BarChart3,
    Play,
    ExternalLink,
    Gift,
    Copy,
    Check,
    Share2
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import CountingNumber from '../../components/ui/CountingNumber';
import DashboardHeading from '../../components/ui/DashboardHeading';
import ReferralWidget from '../../components/student/ReferralWidget';
import ReferralModal from '../../components/student/ReferralModal';

const StudentDashboard = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [enrolledUniversities, setEnrolledUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [stats, setStats] = useState({
        completionRate: 0,
        totalCourses: 0,
        averageScore: 0,
        certificatesEarned: 0
    });
    const [userInfo, setUserInfo] = useState(null);
    const [referralData, setReferralData] = useState({ code: '', link: '' });
    const [isReferModalOpen, setIsReferModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
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
                    docsRes,
                    pointsRes
                ] = await Promise.allSettled([
                    axios.get('/api/enrollment/my-courses', config),
                    axios.get('/api/sessions', config),
                    axios.get('/api/projects/my-projects', config),
                    axios.get('/api/exams/student/my-exams', config),
                    axios.get('/api/documents/my-documents', config),
                    axios.get('/api/referrals/my-points', config)
                ]);
                if (pointsRes.status === 'fulfilled') {
                    setRewardPoints(pointsRes.value.data?.total || 0);
                }

                const codeRes = await axios.get('/api/referrals/my-code', config);
                setReferralData(codeRes.data);

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

                const gradedExams = exams.filter(e => e.submission && (e.submission.percentage !== undefined && e.submission.percentage !== null));
                const totalExamPercentage = gradedExams.reduce((sum, e) => sum + (Number(e.submission.percentage) || 0), 0);
                const avgExamScore = gradedExams.length > 0
                    ? Math.round(totalExamPercentage / gradedExams.length)
                    : null;

                const certificates = courses.filter(c => c.isCompleted).length;

                setStats({
                    completionRate: avgProgress,
                    totalCourses: courses.length,
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || !userInfo) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-12 px-1 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                    <DashboardHeading title={`Student Dashboard`} className="mb-0.5" />
                    <p className="text-white/40 text-xs font-medium">
                        Welcome back, <span className="text-white font-bold">{userInfo.name?.split(' ')[0] || 'Scholar'}</span>.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/dashboard/my-courses')}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-colors flex items-center uppercase tracking-wider"
                    >
                        <BookOpen size={12} className="mr-1.5 text-primary" /> My Learning
                    </button>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center uppercase tracking-wider"
                    >
                        <PlayCircle size={12} className="mr-1.5" /> New Courses
                    </button>
                </div>
            </div>

            {/* Enrolled Universities */}
            {enrolledUniversities.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono">
                                <Users size={12} className="text-primary" /> Enrolled Universities
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {enrolledUniversities.map((university) => (
                                <div key={university.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5 bg-white/[0.015] hover:border-primary/20 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0">
                                        {university.logo ? (
                                            <img src={university.logo} alt={university.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {university.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] font-bold text-white group-hover:text-primary transition-colors truncate">{university.name}</h4>
                                        <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                                            {university.courseCount} {university.courseCount === 1 ? 'Course' : 'Courses'}
                                        </p>
                                    </div>
                                    <ChevronRight size={12} className="text-white/20 group-hover:text-primary transition-colors mr-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { 
                        label: 'Current Status', 
                        val: stats.completionRate, 
                        suffix: '%',
                        icon: CheckCircle, 
                        border: 'border-primary/20', 
                        bg: 'bg-primary/10', 
                        text: 'text-primary'
                    },
                    { label: 'Active Courses', val: stats.totalCourses, icon: BookOpen, border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
                    { label: 'Average Score', val: stats.averageScore, suffix: '%', icon: BarChart3, border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
                    { label: 'Reward Points', val: rewardPoints, suffix: ' pts', icon: Star, border: 'border-yellow-500/20', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 flex items-center gap-3 transition-colors h-full`}>
                            <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.text} ${stat.border}`}>
                                <stat.icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest truncate">{stat.label}</p>
                                <p className="text-lg font-bold text-white leading-none mt-1">
                                    <CountingNumber value={stat.val} suffix={stat.suffix || ''} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Left Column - Core Acitivties */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Active Learning */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono">
                                <BookOpen size={8} /> Active Learning
                            </div>
                            <button onClick={() => navigate('/dashboard/my-courses')} className="text-[9px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors flex items-center">
                                View All <ChevronRight size={10} className="ml-0.5" />
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3.5">
                            {enrolledCourses.map((enrollment) => (
                                <div
                                    key={enrollment._id}
                                    className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full group cursor-pointer"
                                    onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}
                                >
                                    <div className="relative aspect-video sm:aspect-[16/6] overflow-hidden">
                                        <img src={enrollment.course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'} alt={enrollment.course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white border border-white/10 uppercase tracking-widest">
                                            {enrollment.progress}% complete
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">{enrollment.course.title}</h3>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 leading-tight">
                                            {enrollment.course.instructor?.profile?.universityName || enrollment.course.instructorName || 'Lead Instructor'}
                                        </div>
                                        <div className="mt-auto pt-2">
                                            <div className="flex justify-between items-center text-[9px] font-bold text-white/40 mb-1.5 uppercase tracking-widest">
                                                <span>{enrollment.completedModules || 0}/{enrollment.totalModules || 10} Modules</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 border-t border-white/5 bg-white/[0.015] flex items-center justify-between gap-3 min-h-[40px]">
                                        <div className="flex -space-x-1.5">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${enrollment.course._id}${i}`} className="w-full h-full object-cover opacity-50" />
                                                </div>
                                            ))}
                                            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white/40">
                                                +
                                            </div>
                                        </div>
                                        <button className="text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded border border-primary/20 hover:border-primary transition-all flex items-center gap-1 uppercase tracking-widest">
                                            Resume <Play size={8} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Pipeline */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono">
                                <FileText size={8} /> Project Pipeline
                            </div>
                            <button onClick={() => navigate('/dashboard/course/1/projects')} className="text-[9px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors flex items-center">
                                All Work <ChevronRight size={10} className="ml-0.5" />
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3.5">
                            {recentProjects.map((project) => (
                                <div
                                    key={project._id}
                                    className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full group cursor-pointer relative"
                                    onClick={() => navigate(`/dashboard/course/${project.course?._id || '1'}/projects`)}
                                >
                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wider truncate">{project.title}</h3>
                                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest truncate">{project.course?.title}</p>
                                            </div>
                                            <div className={`p-1.5 rounded-lg border ${project.status === 'submitted' || project.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {project.status === 'submitted' || project.status === 'graded' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 border-t border-white/5 bg-white/[0.015] flex items-center justify-between min-h-[40px]">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                                            <Calendar size={10} /> {project.status === 'graded' ? 'Grade: A+' : new Date(project.deadline).toLocaleDateString()}
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30 group-hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                                            Details <ExternalLink size={8} />
                                        </span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Referrals & Reward Widget */}
                    <ReferralWidget userInfo={userInfo} />

                    {/* Scheduled Sessions */}
                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono mb-1">
                            <Video size={8} /> Scheduled Sessions
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {upcomingSessions.map((session) => (
                                <div key={session._id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all flex flex-col gap-3 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                            <Video size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-400 transition-colors">{session.topic}</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 truncate">{session.instructor?.profile?.universityName || 'Academic Session'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                                        <span className="flex items-center gap-1"><Calendar size={9} /> {new Date(session.startTime).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock size={9} /> {session.duration}m</span>
                                    </div>
                                    <button 
                                        onClick={() => { session.status === 'live' ? navigate(`/dashboard/watch/${session._id}`) : window.open(session.meetingLink, '_blank') }}
                                        className="w-full py-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-400 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Play size={10} /> {session.status === 'live' ? 'Watch Stream' : 'Join Link'}
                                    </button>
                                </div>
                            ))}
                            {upcomingSessions.length === 0 && (
                                <div className="p-4 text-center border border-dashed border-white/10 rounded-xl text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                    No Active Sessions
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exam Assessments */}
                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono mb-1">
                            <Trophy size={8} /> Assessments
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {upcomingExams.map((exam) => (
                                <div key={exam._id} onClick={() => navigate('/dashboard/exams')} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-amber-500/30 hover:bg-white/[0.04] transition-all flex flex-col gap-3 group cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                            <Trophy size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[11px] font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider truncate">{exam.title}</h3>
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest truncate">{exam.course?.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                            <Calendar size={9} /> {new Date(exam.scheduledStartTime).toLocaleDateString()}
                                        </div>
                                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Attempt</span>
                                    </div>
                                </div>
                            ))}
                            {upcomingExams.length === 0 && (
                                <div className="p-4 text-center border border-dashed border-white/10 rounded-xl text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                    No Pending Assessments
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Resources */}
                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 font-mono mb-1">
                            <FileText size={8} /> Quick Docs
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {documents.map((doc) => (
                                <div key={doc._id} onClick={() => navigate('/dashboard/documents')} className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all flex items-center gap-3 group cursor-pointer">
                                    <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[10px] font-bold text-white truncate group-hover:text-primary transition-colors">{doc.title}</h3>
                                        <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">{doc.format || 'PDF'} • {(doc.fileSize / (1024 * 1024)).toFixed(1) || '2MB'}</p>
                                    </div>
                                    <Download size={10} className="text-white/20 group-hover:text-primary transition-colors mr-1" />
                                </div>
                            ))}
                            
                            <button onClick={() => navigate('/dashboard/documents')} className="w-full py-3 bg-white/[0.02] border border-dashed border-white/20 hover:border-primary/40 rounded-xl flex items-center justify-center gap-1.5 group transition-all mt-1">
                                <Upload size={12} className="text-white/30 group-hover:text-primary transition-colors" />
                                <span className="text-[9px] font-bold text-white/40 group-hover:text-primary uppercase tracking-widest transition-colors">Upload Document</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
