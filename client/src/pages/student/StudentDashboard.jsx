import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, Heart, Archive, Bell, X, ChevronLeft, ChevronRight, MoreHorizontal, Calendar as CalendarIcon, Play, BarChart2
} from 'lucide-react';
import axios from 'axios';
import { getMediaUrl } from '../../utils/media';
import DashboardHeading from '../../components/ui/DashboardHeading';

const StudentDashboard = () => {
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [stats, setStats] = useState({
        completionRate: 0,
        totalCourses: 0,
        averageScore: 0,
        certificatesEarned: 0
    });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(true);
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewingMonthDate, setViewingMonthDate] = useState(new Date());
    const [pendingProjectsCount, setPendingProjectsCount] = useState(0);
    const [pendingCertsCount, setPendingCertsCount] = useState(0);
    const navigate = useNavigate();

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
                    pointsRes,
                    leaderboardRes,
                    certsRes
                ] = await Promise.allSettled([
                    axios.get('/api/enrollment/my-courses', config),
                    axios.get('/api/sessions', config),
                    axios.get('/api/projects/my-projects', config),
                    axios.get('/api/exams/student/my-exams', config),
                    axios.get('/api/documents/my-documents', config),
                    axios.get('/api/referrals/my-points', config),
                    axios.get('/api/referrals/leaderboard', config),
                    axios.get('/api/certificates/my', config)
                ]);
                if (pointsRes.status === 'fulfilled') {
                    setRewardPoints(pointsRes.value.data?.total || 0);
                }
                if (leaderboardRes.status === 'fulfilled') {
                    setLeaderboard(leaderboardRes.value.data || []);
                }

                const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data : [];
                const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data : [];
                const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
                const exams = examsRes.status === 'fulfilled' ? (examsRes.value.data.data || examsRes.value.data || []) : [];
                const docs = docsRes.status === 'fulfilled' ? docsRes.value.data : [];
                const certs = certsRes.status === 'fulfilled' ? (certsRes.value.data.data || certsRes.value.data || []) : [];

                setEnrolledCourses(courses.slice(0, 3)); 
                setUpcomingSessions(sessions.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3));
                setRecentProjects(projects.slice(0, 3));
                // Calculate pending stats
                // Note: These are NOT demo data. They are calculated from the live API response.
                const activeProjects = projects.filter(p => !p.completed && p.status !== 'approved');
                setPendingProjectsCount(activeProjects.length);
                
                // Documents pending (status pending, rejected, or unverified)
                const pendingDocs = docs.filter(d => d.status === 'pending' || d.status === 'rejected' || !d.verified);
                
                // Certificates pending (status pending or requested)
                const activeCerts = Array.isArray(certs) ? certs.filter(c => c.status === 'pending' || c.status === 'requested') : [];
                
                // Combine both for the card
                setPendingCertsCount(activeCerts.length + pendingDocs.length);

                const now = new Date();
                setUpcomingExams(exams.filter(e => e.status === 'scheduled' && new Date(e.scheduledStartTime) > now).slice(0, 3));
                setDocuments(docs);

                const totalProgress = courses.reduce((sum, c) => sum + (Number(c.progress) || 0), 0);
                const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
                setStats(prev => ({ ...prev, completionRate: avgProgress }));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        const handleToggleStats = () => setShowStats(prev => !prev);
        window.addEventListener('toggle-stats', handleToggleStats);
        return () => window.removeEventListener('toggle-stats', handleToggleStats);
    }, []);

    if (loading || !userInfo) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[#4C1D95]/20 border-t-[#4C1D95] rounded-full animate-spin"></div>
        </div>
    );

    const userName = userInfo.name?.split(' ')[0] || 'Student';
    const userHandle = `@${userName.toLowerCase()}`;

    // Calculate current week
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diffToMonday);
    
    const weekDays = ['M','T','W','T','F','S','S'];
    const currentWeekDates = Array.from({length: 7}).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return {
            day: weekDays[i],
            dateNum: d.getDate(),
            fullDate: d,
            isToday: d.toDateString() === new Date().toDateString()
        };
    });

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewingMonthDate(new Date(viewingMonthDate.getFullYear(), viewingMonthDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewingMonthDate(new Date(viewingMonthDate.getFullYear(), viewingMonthDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        let startingDayOfWeek = firstDay.getDay(); 
        if (startingDayOfWeek === 0) startingDayOfWeek = 7; // Treat Sunday as 7
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Add previous month days
        for (let i = startingDayOfWeek - 1; i > 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i + 1);
            days.push({ date: d, dateNum: d.getDate(), isCurrentMonth: false, isToday: d.toDateString() === today.toDateString() });
        }
        
        // Add current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, dateNum: i, isCurrentMonth: true, isToday: d.toDateString() === today.toDateString() });
        }
        
        // Pad next month days to 42 items (6 weeks)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, dateNum: i, isCurrentMonth: false, isToday: d.toDateString() === today.toDateString() });
        }
        
        return days;
    };

    const monthDaysGrid = isCalendarExpanded ? getDaysInMonth(viewingMonthDate) : [];
    const viewingMonthStr = viewingMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Filter schedule by selected date
    const filteredSessions = upcomingSessions.filter(s => new Date(s.startTime).toDateString() === selectedDate.toDateString());
    const filteredExams = upcomingExams.filter(e => new Date(e.scheduledStartTime).toDateString() === selectedDate.toDateString());

    return (
        <div className="student-dashboard-container bg-transparent min-h-screen px-4 sm:px-6 lg:px-8 pt-2 pb-4 lg:pt-3 lg:pb-6 font-inter text-gray-900 text-dark-white overflow-x-hidden w-full max-w-full">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
                <DashboardHeading title="Overviews" />
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 space-y-8 min-w-0">
                    
                    {/* Hero and Daily Question Grid */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        
                        {/* Hero Card */}
                        <div className="lg:col-span-3 bg-gradient-to-r from-[#4C1D95] via-[#51239E] to-[#4C1D95] rounded-[32px] py-6 px-8 flex flex-col justify-between relative overflow-hidden min-h-[220px] shadow-lg shadow-purple-900/20">
                            
                            {/* Decorative Background Elements */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {/* Blurred glowing orbs */}
                                <div className="absolute top-[-20%] left-[30%] w-64 h-64 bg-white/5 rounded-full mix-blend-screen blur-[80px]"></div>
                                <div className="absolute bottom-[-10%] left-[50%] w-48 h-48 bg-purple-300/10 rounded-full mix-blend-screen blur-[60px]"></div>
                                
                                {/* Floating particles */}
                                <div className="absolute top-[30%] left-[45%] w-2 h-2 bg-white/20 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                <div className="absolute bottom-[35%] left-[55%] w-3 h-3 bg-white/10 rounded-full"></div>
                                <div className="absolute top-[60%] left-[38%] w-1.5 h-1.5 bg-white/30 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                                <div className="absolute top-[20%] left-[60%] w-2 h-2 bg-purple-300/30 rounded-full"></div>
                            </div>

                            <div className="relative z-10 w-[85%] sm:w-[70%] lg:w-[65%] xl:w-[60%]">
                                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold !text-white mb-2 leading-tight">
                                    <span className="whitespace-nowrap">Welcome back,</span> {userName}!
                                </h2>
                                <p className="!text-white text-xs sm:text-sm mt-3 max-w-md font-medium leading-relaxed">
                                    Ready to achieve your goals? Pick up right where you left off and continue your learning journey today.
                                </p>
                                <button 
                                    onClick={() => navigate(enrolledCourses.length > 0 ? `/dashboard/course/${enrolledCourses[0].course._id}` : '/dashboard/courses')} 
                                    className="mt-4 sm:mt-5 px-8 py-3 bg-white text-[#4C1D95] font-bold rounded-xl shadow-sm hover:shadow-lg transition-all hover:bg-gray-100 hover:scale-105 transform duration-200"
                                >
                                    {enrolledCourses.length > 0 ? 'Resume Learning' : 'Browse Courses'}
                                </button>
                            </div>
                            
                            {/* Abstract Student Illustration */}
                            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-end pointer-events-none pr-8 z-10">
                                {/* Decorative background circle */}
                                <div className="absolute right-[5%] w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full mix-blend-screen z-0"></div>
                                <img src="/student_hero_illustration_transparent.png" alt="Student" className="h-[100%] scale-[1.15] origin-center w-auto object-contain object-right z-10 opacity-100" />
                            </div>
                        </div>
                    </div>

                    {/* Continue Watching */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-dark-white dark:text-white">Continue Watching</h2>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#C026FF]/20 flex items-center justify-center hover:bg-gray-50 dark:bg-white/5 transition-colors">
                                    <ChevronLeft size={16} className="text-gray-600 text-dark-gray dark:text-gray-300" />
                                </button>
                                <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#C026FF]/20 flex items-center justify-center hover:bg-gray-50 dark:bg-white/5 transition-colors">
                                    <ChevronRight size={16} className="text-gray-600 text-dark-gray dark:text-gray-300" />
                                </button>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enrolledCourses.length > 0 ? enrolledCourses.map((enrollment, index) => (
                                <div key={enrollment._id || index} className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-5 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col glass-panel" onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-600 text-dark-gray dark:text-gray-300 text-xs font-bold rounded-full border border-gray-100 dark:border-[#C026FF]/20">
                                            {enrollment.completedModules || 0}/{enrollment.totalModules || 12}
                                        </span>
                                        <button className="text-gray-400 dark:text-gray-500 text-dark-gray hover:text-gray-600 text-dark-gray dark:text-gray-300">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-dark-gray uppercase tracking-wider mb-2 line-clamp-1">
                                        {enrollment.course.instructor?.profile?.universityName || 'Course'}
                                    </p>
                                    <h4 className="font-bold text-gray-900 text-dark-white dark:text-white leading-snug line-clamp-2 min-h-[2.5rem]">
                                        {enrollment.course.title}
                                    </h4>
                                </div>
                            )) : (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-400 dark:text-gray-500 text-dark-gray border-2 border-dashed border-gray-200 dark:border-[#C026FF]/20 rounded-[24px]">
                                    No active courses found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <div 
                            onClick={() => navigate('/dashboard/my-courses')}
                            className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-6 flex items-center space-x-4 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm cursor-pointer hover:shadow-md transition-shadow group glass-panel"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                                <Archive size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 text-dark-white dark:text-white font-inter">{pendingProjectsCount}</h3>
                                <p className="text-sm text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray font-medium font-inter">Pending Projects</p>
                            </div>
                            <div className="ml-auto text-gray-300 group-hover:text-orange-500 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        <div 
                            onClick={() => navigate('/dashboard/documents')}
                            className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-6 flex items-center space-x-4 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm cursor-pointer hover:shadow-md transition-shadow group glass-panel"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 text-dark-white dark:text-white font-inter">{pendingCertsCount}</h3>
                                <p className="text-sm text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray font-medium font-inter">Pending Docs & Certs</p>
                            </div>
                            <div className="ml-auto text-gray-300 group-hover:text-emerald-500 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                {showStats && (
                <div className="w-full xl:w-80 space-y-4 shrink-0 animate-in slide-in-from-right-8 duration-300">
                    
                    {/* Statistic Header */}
                    <div className="flex items-center gap-3 bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-full py-1.5 px-2 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm statistic-header">
                        <button onClick={() => setShowStats(false)} className="w-8 h-8 rounded-full hover:bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 text-dark-gray dark:text-gray-400 hover:text-red-500 transition-colors shrink-0">
                            <X size={16} />
                        </button>
                        <h3 className="font-extrabold text-base premium-gradient-text flex-1">Statistic</h3>
                    </div>

                    {/* Profile Summary Widget */}
                    <div className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[20px] py-3 px-4 flex items-center gap-3 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm glass-panel">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                            <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userName}&background=4C1D95&color=fff`} alt={userName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-dark-white dark:text-white truncate text-sm">{userInfo.name || 'Scholar'}</h3>
                            <p className="text-xs text-[#F48F56] font-bold truncate">{rewardPoints} Reward Points</p>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-6 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm transition-all duration-300 glass-panel">
                        <div className="flex items-center justify-between mb-5 cursor-pointer group" onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}>
                            <div className="flex items-center gap-2">
                                {isCalendarExpanded && (
                                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray">
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                <h3 className="font-bold text-gray-900 text-dark-white dark:text-white text-sm">
                                    {isCalendarExpanded ? viewingMonthStr : currentMonth}
                                </h3>
                                {isCalendarExpanded && (
                                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray">
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-gray-50 dark:bg-white/5 transition-colors">
                                <ChevronRight size={16} className={`text-gray-400 dark:text-gray-500 text-dark-gray transition-transform duration-300 ${isCalendarExpanded ? '-rotate-90' : 'rotate-90'}`} />
                            </div>
                        </div>
                        
                        {!isCalendarExpanded ? (
                            <div className="flex justify-between items-center text-center">
                                {currentWeekDates.map((d, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-dark-gray">{d.day}</span>
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${d.isToday ? 'bg-[#F48F56] text-white shadow-md shadow-[#F48F56]/30' : 'text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray hover:bg-gray-50 dark:bg-white/5 cursor-pointer'}`}>
                                            {d.dateNum}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-dark-gray py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {monthDaysGrid.map((d, i) => {
                                        const isSelected = d.date.toDateString() === selectedDate.toDateString();
                                        return (
                                            <div 
                                                key={i} 
                                                onClick={(e) => { e.stopPropagation(); setSelectedDate(d.date); }}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-[#4C1D95] text-white shadow-md shadow-[#4C1D95]/30' 
                                                        : d.isToday 
                                                            ? 'bg-[#F48F56] text-white shadow-md shadow-[#F48F56]/30' 
                                                            : d.isCurrentMonth 
                                                                ? 'text-gray-700 text-dark-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10' 
                                                                : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {d.dateNum}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Expanded Schedule */}
                        {isCalendarExpanded && (
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#C026FF]/20 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-dark-gray uppercase tracking-wider">Schedule</h4>
                                    <span className="text-[10px] font-semibold text-[#4C1D95] dark:text-[#E879F9]">{selectedDate.toLocaleDateString()}</span>
                                </div>
                                
                                {filteredSessions.length === 0 && filteredExams.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-[#C026FF]/20">No schedule for this date</p>
                                ) : (
                                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {filteredSessions.map(session => (
                                            <div key={session._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-100 dark:border-[#C026FF]/20 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/live-classes')}>
                                                <div className="w-8 h-8 rounded-full bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95] dark:text-[#E879F9] shrink-0 mt-0.5">
                                                    <Play size={12} className="ml-0.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 text-dark-white dark:text-white truncate leading-tight mb-0.5">{session.topic || 'Live Session'}</h4>
                                                    <p className="text-[9px] font-semibold text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredExams.map(exam => (
                                            <div key={exam._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-100 dark:border-[#C026FF]/20 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/exams')}>
                                                <div className="w-8 h-8 rounded-full bg-[#F48F56]/10 flex items-center justify-center text-[#F48F56] shrink-0 mt-0.5">
                                                    <CalendarIcon size={12} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 text-dark-white dark:text-white truncate leading-tight mb-0.5">{exam.title || 'Exam'}</h4>
                                                    <p className="text-[9px] font-semibold text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray">{new Date(exam.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tasks of the month */}
                    <div className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-6 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm glass-panel">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-dark-white dark:text-white text-sm">Tasks of the month</h3>
                            <span className="text-[10px] font-bold text-[#F48F56] bg-[#F48F56]/10 px-2 py-1 rounded-md">{currentMonth.split(' ')[0]}</span>
                        </div>
                        
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-2 relative overflow-hidden">
                            <div className="bg-[#F48F56] h-full rounded-full transition-all duration-1000" style={{ width: `${stats.completionRate || 0}%` }}></div>
                        </div>
                        <div className="text-right text-xs font-bold text-gray-500 text-dark-gray dark:text-gray-400 dark:text-gray-500 text-dark-gray">{stats.completionRate || 0}%</div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-md rounded-[24px] p-6 border border-gray-100 dark:border-[#C026FF]/20 shadow-sm glass-panel">
                        <h3 className="font-bold text-gray-900 text-dark-white dark:text-white mb-5 text-sm">Leaderboard</h3>
                        
                        <div className="space-y-4">
                            {leaderboard.length > 0 ? leaderboard.map((user, i) => {
                                const level = Math.floor((user.xp || 0) / 1000) + 1;
                                const userImg = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=4C1D95&color=fff`;
                                return (
                                    <div key={user.id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                        <img src={userImg} alt={user.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 text-dark-white dark:text-white truncate">{user.name || 'User'}</h4>
                                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-dark-gray">Level {level} • {user.xp || 0} XP</p>
                                        </div>
                                        <div className="text-xs font-bold text-gray-900 text-dark-white dark:text-white bg-gray-100 dark:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">#{i + 1}</div>
                                    </div>
                                );
                            }) : (
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-dark-gray text-center py-4">No top students yet</p>
                            )}
                        </div>
                    </div>

                </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
