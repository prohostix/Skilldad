import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart, Archive, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Play, ArrowRight,
    Award, Flame, GraduationCap, Briefcase, CheckCircle2, Circle, Pencil, Upload, FileCheck2,
    ClipboardCheck, TrendingUp, Sparkles, Clock, Compass, Target, X
} from 'lucide-react';
import axios from 'axios';
import { getMediaUrl } from '../../utils/media';
import PerformanceOverviewCard from '../../components/ui/PerformanceOverviewCard';
import courseFinderImg from '../../assets/course_finder_character.jpg';

// Rough learning-hours estimate - there is no per-video duration telemetry
// anywhere in the backend, so this is explicitly labeled "(est.)" in the UI
// rather than presented as a precise, tracked number.
const ASSUMED_MINUTES_PER_VIDEO = 12;

const StudentDashboard = () => {
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [stats, setStats] = useState({
        completionRate: 0,
        totalCourses: 0,
        averageScore: 0,
        certificatesEarned: 0
    });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allEnrolledCourses, setAllEnrolledCourses] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(true);
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewingMonthDate, setViewingMonthDate] = useState(new Date());
    const [pendingProjectsCount, setPendingProjectsCount] = useState(0);
    const [pendingCertsCount, setPendingCertsCount] = useState(0);
    const [certificatesEarnedCount, setCertificatesEarnedCount] = useState(0);
    const [weeklyPerformanceData, setWeeklyPerformanceData] = useState([]);

    // Real career-progress signals (career_goal / interview_prep / streak /
    // resume) fetched from the new /api/users/me/career-progress endpoint,
    // plus real job applications from the existing /api/career/my-applications.
    const [careerProgress, setCareerProgress] = useState(null);
    const [userDocuments, setUserDocuments] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState('');
    const [savingGoal, setSavingGoal] = useState(false);
    const [savingInterviewPrep, setSavingInterviewPrep] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    // Course Finder: real onboarding-quiz state, driven by users.course_finder_status
    // (server-side source of truth, not localStorage, since the same status must hold
    // across devices). showCourseFinderInvite is a one-time-per-visit UI flag only.
    const [courseFinderStatus, setCourseFinderStatus] = useState(null);
    const [courseFinderResult, setCourseFinderResult] = useState(null);
    const [showCourseFinderInvite, setShowCourseFinderInvite] = useState(false);
    const inviteTimerRef = useRef(null);

    const navigate = useNavigate();

    const fetchCareerProgress = async (config) => {
        try {
            const { data } = await axios.get('/api/users/me/career-progress', config);
            setCareerProgress(data);
        } catch (err) {
            console.error('Error loading career progress:', err.message);
        }
    };

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
                    certsRes,
                    careerProgressRes,
                    applicationsRes,
                    recommendedRes,
                    courseFinderStatusRes
                ] = await Promise.allSettled([
                    axios.get('/api/enrollment/my-courses', config),
                    axios.get('/api/sessions', config),
                    axios.get('/api/projects/my-projects', config),
                    axios.get('/api/exams/student/my-exams', config),
                    axios.get('/api/documents/my-documents', config),
                    axios.get('/api/referrals/my-points', config),
                    axios.get('/api/referrals/leaderboard', config),
                    axios.get('/api/certificates/my', config),
                    axios.get('/api/users/me/career-progress', config),
                    axios.get('/api/career/my-applications', config),
                    axios.get('/api/courses/recommended', config),
                    axios.get('/api/course-finder/status', config)
                ]);
                if (pointsRes.status === 'fulfilled') {
                    setRewardPoints(pointsRes.value.data?.total || 0);
                }
                if (leaderboardRes.status === 'fulfilled') {
                    setLeaderboard(leaderboardRes.value.data || []);
                }
                if (careerProgressRes.status === 'fulfilled') {
                    setCareerProgress(careerProgressRes.value.data);
                    setGoalInput(careerProgressRes.value.data?.careerGoal || '');
                }
                if (applicationsRes.status === 'fulfilled') {
                    setJobApplications(applicationsRes.value.data?.applications || []);
                }
                if (recommendedRes.status === 'fulfilled') {
                    setRecommendedCourses(Array.isArray(recommendedRes.value.data) ? recommendedRes.value.data : []);
                }
                if (courseFinderStatusRes.status === 'fulfilled') {
                    const status = courseFinderStatusRes.value.data?.status || 'NOT_STARTED';
                    setCourseFinderStatus(status);
                    if (status === 'NOT_STARTED') {
                        // Let the dashboard itself render and settle first, then invite -
                        // showing it the instant data loads made it easy to miss or
                        // reflexively dismiss before actually registering what it was.
                        inviteTimerRef.current = setTimeout(() => setShowCourseFinderInvite(true), 4000);
                    } else if (status === 'COMPLETED') {
                        axios.get('/api/course-finder/my-result', config)
                            .then(({ data }) => setCourseFinderResult(data))
                            .catch(() => {});
                    }
                }

                const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data : [];
                const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data : [];
                const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
                const exams = examsRes.status === 'fulfilled' ? (examsRes.value.data.data || examsRes.value.data || []) : [];
                const docs = docsRes.status === 'fulfilled' ? docsRes.value.data : [];
                const certs = certsRes.status === 'fulfilled' ? (certsRes.value.data.data || certsRes.value.data || []) : [];

                setUserDocuments(Array.isArray(docs) ? docs : []);
                setAllEnrolledCourses(courses);
                setEnrolledCourses(courses.slice(0, 3));
                setUpcomingSessions(sessions.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3));
                setRecentProjects(projects.slice(0, 3));
                // Calculate pending stats
                // Note: These are NOT demo data. They are calculated from the live API response.
                const activeProjects = projects.filter(p => !p.completed && p.status !== 'approved');
                setPendingProjectsCount(activeProjects.length);

                // Documents pending (status pending, rejected, or unverified)
                const pendingDocs = docs.filter(d => d.status === 'pending' || d.status === 'rejected' || !d.verified);

                // Certificates pending (status pending or requested) vs. genuinely issued
                const certsArray = Array.isArray(certs) ? certs : [];
                const activeCerts = certsArray.filter(c => c.status === 'PENDING' || c.status === 'REQUESTED');
                setCertificatesEarnedCount(certsArray.filter(c => c.status === 'ISSUED').length);

                // Combine both for the card
                setPendingCertsCount(activeCerts.length + pendingDocs.length);

                const now = new Date();
                setUpcomingExams(exams.filter(e => e.status === 'scheduled' && new Date(e.scheduledStartTime) > now).slice(0, 3));

                const totalProgress = courses.reduce((sum, c) => sum + (Number(c.progress) || 0), 0);
                const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
                setStats(prev => ({ ...prev, completionRate: avgProgress }));

                // Real day-by-day performance for the chart below: record
                // today's snapshot (upsert, so repeat dashboard visits the
                // same day just refresh today's value) then pull the last 7
                // real days back. Non-blocking - a failure here shouldn't
                // block the rest of the dashboard from loading.
                axios.post('/api/students/performance/snapshot', {}, config)
                    .then(() => axios.get('/api/students/performance/weekly', config))
                    .then(({ data }) => setWeeklyPerformanceData(data))
                    .catch(err => console.error('Error loading performance overview:', err.message));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => clearTimeout(inviteTimerRef.current);
    }, [navigate]);

    useEffect(() => {
        const handleToggleStats = () => setShowStats(prev => !prev);
        window.addEventListener('toggle-stats', handleToggleStats);
        return () => window.removeEventListener('toggle-stats', handleToggleStats);
    }, []);

    const getAuthConfig = () => {
        const stored = JSON.parse(localStorage.getItem('userInfo'));
        return stored ? { headers: { Authorization: `Bearer ${stored.token}` } } : null;
    };

    const handleSaveGoal = async () => {
        if (!goalInput.trim()) return;
        const config = getAuthConfig();
        if (!config) return;
        setSavingGoal(true);
        try {
            await axios.put('/api/users/me/career-goal', { careerGoal: goalInput.trim() }, config);
            setCareerProgress(prev => ({ ...(prev || {}), careerGoal: goalInput.trim() }));
            setIsEditingGoal(false);
        } catch (err) {
            console.error('Error saving career goal:', err.message);
        } finally {
            setSavingGoal(false);
        }
    };

    const handleDismissCourseFinder = async () => {
        setShowCourseFinderInvite(false);
        setCourseFinderStatus('DISMISSED');
        const config = getAuthConfig();
        if (!config) return;
        try {
            await axios.put('/api/course-finder/dismiss', {}, config);
        } catch (err) {
            console.error('Error dismissing course finder invite:', err.message);
        }
    };

    const handleToggleInterviewPrep = async () => {
        const config = getAuthConfig();
        if (!config || !careerProgress) return;
        const nextValue = !careerProgress.interviewPrepCompleted;
        setSavingInterviewPrep(true);
        try {
            await axios.put('/api/users/me/interview-prep', { completed: nextValue }, config);
            setCareerProgress(prev => ({ ...(prev || {}), interviewPrepCompleted: nextValue }));
        } catch (err) {
            console.error('Error updating interview prep status:', err.message);
        } finally {
            setSavingInterviewPrep(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const stored = JSON.parse(localStorage.getItem('userInfo'));
        if (!stored) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', 'resume');
        formData.append('title', 'Resume');

        setUploadingResume(true);
        try {
            const { data: newDoc } = await axios.post('/api/documents/upload', formData, {
                headers: { Authorization: `Bearer ${stored.token}`, 'Content-Type': 'multipart/form-data' }
            });
            if (newDoc) {
                setUserDocuments(prev => [...prev, newDoc]);
            }
            setCareerProgress(prev => ({ ...(prev || {}), hasResumeUploaded: true }));
            await fetchCareerProgress({ headers: { Authorization: `Bearer ${stored.token}` } });
        } catch (err) {
            console.error('Error uploading resume:', err.message);
        } finally {
            setUploadingResume(false);
            e.target.value = '';
        }
    };

    if (loading || !userInfo) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[#4C1D95]/20 border-t-[#4C1D95] rounded-full animate-spin"></div>
        </div>
    );

    const userName = userInfo.name?.split(' ')[0] || 'Student';

    // Calculate current week
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
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

    // A newly-enrolled student hasn't watched anything yet, so "Resume Learning"
    // would be misleading until at least one course shows real progress.
    const hasStartedLearning = enrolledCourses.some(e => (e.progress != null ? e.progress : (e.completedModules || 0)) > 0);

    // Real Learning Hours estimate - no per-video duration telemetry exists,
    // so this is a labeled estimate, not a precise tracked stat.
    const totalCompletedVideos = allEnrolledCourses.reduce((sum, e) => sum + (Array.isArray(e.completedVideos) ? e.completedVideos.length : 0), 0);
    const learningHoursEstimate = Math.round((totalCompletedVideos * ASSUMED_MINUTES_PER_VIDEO) / 60);
    const coursesCompletedCount = allEnrolledCourses.filter(e => (e.progress || 0) >= 100).length;

    // Resume detection: matches server flag OR any uploaded document that represents a resume
    const hasResumeUploaded = !!(
        careerProgress?.hasResumeUploaded ||
        userDocuments.some(d => {
            const title = (d.title || '').toLowerCase();
            const type = (d.type || '').toLowerCase();
            const fname = (d.file_name || d.fileName || '').toLowerCase();
            const isResume = type === 'resume' ||
                type.includes('resume') ||
                type.includes('cv') ||
                title.includes('resume') ||
                title.includes('curriculum vitae') ||
                title.includes('cv') ||
                fname.includes('resume') ||
                fname.includes('cv');
            return isResume && (d.status || '').toLowerCase() !== 'rejected';
        })
    );

    // Career Journey - 6 real signals, no fabricated steps.
    const hasSubmittedProject = recentProjects.some(p => p.status === 'submitted' || p.status === 'graded')
        || (Array.isArray(recentProjects) && recentProjects.some(p => p.submissionStatus === 'submitted' || p.submissionStatus === 'graded'));
    const careerSteps = careerProgress ? [
        { key: 'assessment', label: 'Career Assessment', done: !!careerProgress.careerGoal },
        { key: 'learning', label: 'Learning Path', done: allEnrolledCourses.length > 0 },
        { key: 'skills', label: 'Skills & Projects', done: hasSubmittedProject },
        { key: 'resume', label: 'Resume Ready', done: hasResumeUploaded },
        { key: 'interview', label: 'Interview Preparation', done: !!careerProgress.interviewPrepCompleted },
        { key: 'apply', label: 'Apply to Jobs', done: jobApplications.length > 0 },
    ] : [];
    const careerReadiness = careerSteps.length > 0
        ? Math.round((careerSteps.filter(s => s.done).length / careerSteps.length) * 100)
        : 0;

    // Nearest real upcoming deadline (exam), already fetched above.
    const nextDeadline = upcomingExams.length > 0
        ? [...upcomingExams].sort((a, b) => new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime))[0]
        : null;

    // Compact "Upcoming" preview (next 2 real items across sessions + exams),
    // reusing data already fetched for the calendar widget below.
    const upcomingPreview = [
        ...upcomingSessions.map(s => ({ type: 'session', title: s.topic || 'Live Session', date: new Date(s.startTime) })),
        ...upcomingExams.map(e => ({ type: 'exam', title: e.title || 'Exam', date: new Date(e.scheduledStartTime) })),
    ].sort((a, b) => a.date - b.date).slice(0, 2);

    const featuredCourse = enrolledCourses.length > 0
        ? [...enrolledCourses].sort((a, b) => (b.progress || 0) - (a.progress || 0))[0]
        : null;
    const otherCourses = featuredCourse ? enrolledCourses.filter(c => c !== featuredCourse) : enrolledCourses;

    return (
        <div className="student-dashboard-container bg-transparent min-h-screen pb-4 lg:pb-6 font-inter text-gray-900 dark:!text-white dark:!text-white overflow-x-hidden w-full max-w-full">
            {showCourseFinderInvite && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        className="relative w-full max-w-[440px] sm:max-w-[460px] bg-white dark:bg-[#150d2a] rounded-[22px] p-5 sm:p-6 shadow-2xl border border-purple-100/70 dark:border-purple-900/30 overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleDismissCourseFinder}
                            aria-label="Close modal"
                            className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"
                        >
                            <X size={16} />
                        </button>

                        {/* Top Hero Section: Illustration + Text */}
                        <div className="flex items-center gap-4 text-left mb-4">
                            {/* Illustration */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-purple-100/60 dark:bg-purple-900/20 rounded-full blur-lg scale-90 -z-0"></div>
                                <img
                                    src={courseFinderImg || '/assets/course_finder_character.jpg'}
                                    alt="Career Guide"
                                    className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-sm"
                                />
                            </div>

                            {/* Heading and details */}
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 text-[11px] font-semibold mb-1.5">
                                    <Compass size={12} className="text-[#4C1D95] dark:text-purple-300" />
                                    <span>Course Finder</span>
                                </div>
                                <h2 className="text-[22px] font-bold tracking-tight leading-[1.2] mb-1.5 font-jakarta">
                                    <span className="text-[#4C1D95] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#E9D5FF] block">
                                        Discover Your
                                    </span>
                                    <span className="text-[#4C1D95] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#E9D5FF] block">
                                        Career Path
                                    </span>
                                </h2>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-normal">
                                    Answer a few quick questions and we'll help you find courses that match your goals.
                                </p>
                            </div>
                        </div>

                        {/* 3 Pillar Features */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-white/5 my-1">
                            <div className="flex flex-col items-center text-center px-0.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                                    <Target size={14} />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                                    Personalized recommendations
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center px-0.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                                    <GraduationCap size={14} />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                                    Career-focused learning path
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center px-0.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                                    <Briefcase size={14} />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                                    Job-oriented suggestions
                                </span>
                            </div>
                        </div>

                        {/* Takes about 2 minutes */}
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400 font-medium my-2">
                            <Clock size={12} className="text-purple-600 dark:text-purple-400" />
                            <span>Takes about 2 minutes</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center mt-1">
                            <button
                                onClick={() => navigate('/dashboard/course-finder')}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#3b1675] dark:bg-[#6D28D9] dark:hover:bg-[#5b21b6] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/20 hover:shadow-purple-900/30 transition-all active:scale-[0.99]"
                            >
                                <span>Find My Course</span>
                                <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={handleDismissCourseFinder}
                                className="mt-2 text-[11px] sm:text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-0.5"
                            >
                                Maybe later
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 space-y-4 min-w-0">

                    {/* Hero Card */}
                    <div className="bg-gradient-to-br from-[#F3E8FF] via-[#F8F5FF] to-white dark:from-[#6B0F94] dark:via-[#C026FF] dark:to-[#4A0A6B] rounded-[20px] py-4 px-6 flex flex-col justify-center relative overflow-hidden min-h-[130px] border border-[#4C1D95]/5 dark:border-[#C026FF]/30">

                        {/* Decorative Background Elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-[-20%] left-[30%] w-64 h-64 bg-[#4C1D95]/5 dark:bg-white/5 rounded-full blur-[80px]"></div>
                            <div className="absolute bottom-[-10%] left-[50%] w-48 h-48 bg-[#4C1D95]/5 dark:bg-purple-300/10 rounded-full blur-[60px]"></div>
                            <div className="absolute top-[15%] right-[38%] w-2 h-2 bg-[#4C1D95]/20 dark:bg-white/20 rounded-full"></div>
                            <div className="absolute bottom-[25%] right-[42%] w-1.5 h-1.5 bg-[#4C1D95]/20 dark:bg-white/20 rounded-full"></div>
                        </div>

                        <div className="relative z-10 w-[85%] sm:w-[70%] lg:w-[65%] xl:w-[60%]">
                            <h2 className="!font-inter !text-lg lg:!text-xl !font-extrabold !text-gray-900 dark:!text-white mb-1 !leading-tight">
                                <span className="whitespace-nowrap">{userInfo?.isFirstLogin ? 'Welcome,' : 'Welcome back,'}</span> {userName}! 👋
                            </h2>
                            <p className="!text-gray-500 dark:!text-white text-xs mt-1 max-w-md font-medium leading-relaxed">
                                Continue learning and take the next step toward your career goal.
                            </p>
                            <button
                                onClick={() => navigate(enrolledCourses.length > 0 ? `/dashboard/course/${enrolledCourses[0].course._id}` : '/dashboard/courses')}
                                className="mt-3 px-5 py-2 bg-[#4C1D95] hover:bg-[#3b1675] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-lg transition-all hover:scale-105 transform duration-200 inline-flex items-center gap-1.5"
                            >
                                {enrolledCourses.length === 0 ? 'Browse Courses' : hasStartedLearning ? 'Resume Learning' : 'Start Learning'}
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        {/* Abstract Student Illustration - same asset/path, unchanged */}
                        <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-end pointer-events-none pr-0 sm:pr-8 translate-x-6 sm:translate-x-0 z-10">
                            <div className="absolute right-[5%] w-36 h-36 sm:w-44 sm:h-44 bg-[#4C1D95]/5 dark:bg-white/10 rounded-full z-0"></div>
                            <img src="/student_hero_illustration_transparent.png" alt="Student" className="h-[92%] scale-[1.15] origin-center w-auto object-contain object-right z-10 opacity-100" />
                        </div>
                    </div>

                    {/* Continue Learning */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="!font-inter !text-base !font-bold !text-gray-900 dark:!text-white">{hasStartedLearning ? 'Continue Learning' : 'Start Learning'}</h2>
                            <button onClick={() => navigate('/dashboard/my-courses')} className="text-xs font-bold text-[#4C1D95] hover:text-[#3b1675] flex items-center gap-1 transition-colors">
                                View all <ArrowRight size={12} />
                            </button>
                        </div>

                        {enrolledCourses.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 dark:!text-white border-2 border-dashed border-gray-200 dark:border-[#C026FF]/20 rounded-[24px]">
                                No active courses found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Featured course - highest-progress in-progress course */}
                                {featuredCourse && (() => {
                                    const totalModules = featuredCourse.totalModules || 12;
                                    const completedModules = featuredCourse.completedModules || 0;
                                    const progress = featuredCourse.progress != null
                                        ? Math.round(featuredCourse.progress)
                                        : Math.round((completedModules / totalModules) * 100);
                                    const isCompleted = progress >= 100;

                                    return (
                                        <div
                                            className="bg-white rounded-[16px] border border-gray-100 shadow-sm glass-panel hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row overflow-hidden group"
                                            onClick={() => navigate(`/dashboard/course/${featuredCourse.course._id}`)}
                                        >
                                            <div className="relative sm:w-44 h-24 sm:h-auto shrink-0 overflow-hidden bg-gray-100 dark:bg-white/10">
                                                <img
                                                    src={featuredCourse.course.thumbnail ? getMediaUrl(featuredCourse.course.thumbnail) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                                    alt={featuredCourse.course.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'; }}
                                                />
                                                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#4C1D95] text-[9px] font-bold rounded-full shadow-sm uppercase tracking-wide">
                                                    {isCompleted ? 'Completed' : 'In Progress'}
                                                </span>
                                            </div>
                                            <div className="p-3.5 flex flex-col flex-1 justify-center">
                                                <p className="text-[9px] font-bold text-gray-400 dark:!text-white uppercase tracking-wider mb-0.5">Current Course</p>
                                                <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white mb-1.5">{featuredCourse.course.title}</h3>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mr-4">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-500' : 'bg-[#4C1D95]'}`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#4C1D95] shrink-0">{progress}% Complete</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/course/${featuredCourse.course._id}`); }}
                                                    className="mt-1.5 self-start px-3.5 py-1.5 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-[11px] font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                                                >
                                                    {isCompleted ? 'Review Course' : 'Continue Learning'} <ArrowRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Smaller cards for remaining enrolled courses - 1/3 width grid */}
                                {otherCourses.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                        {otherCourses.map((enrollment, index) => {
                                            const totalModules = enrollment.totalModules || 12;
                                            const completedModules = enrollment.completedModules || 0;
                                            const progress = enrollment.progress != null
                                                ? Math.round(enrollment.progress)
                                                : Math.round((completedModules / totalModules) * 100);
                                            const isCompleted = progress >= 100;

                                            return (
                                                <div
                                                    key={enrollment._id || index}
                                                    className="bg-white dark:bg-[#150d2a] rounded-[16px] border border-gray-100 dark:border-white/10 shadow-sm glass-panel hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group"
                                                    onClick={() => navigate(`/dashboard/course/${enrollment.course._id}`)}
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-white/10">
                                                        <img
                                                            src={enrollment.course.thumbnail ? getMediaUrl(enrollment.course.thumbnail) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                                            alt={enrollment.course.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'; }}
                                                        />
                                                    </div>
                                                    <div className="p-3.5 flex flex-col flex-1">
                                                        <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 dark:!text-white leading-snug line-clamp-2 mb-2">
                                                            {enrollment.course.title}
                                                        </h4>
                                                        <div className="mt-auto pt-1">
                                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-500' : 'bg-[#4C1D95]'}`}
                                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1.5">
                                                                <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-gray-400 dark:!text-white'}`}>
                                                                    {isCompleted ? 'Completed' : `${progress}% complete`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Your Career Journey */}
                    {careerProgress && (
                        <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                            <div className="flex items-center justify-between mb-0.5 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={15} className="text-[#4C1D95]" />
                                    <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white">Your Career Journey</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-500 dark:!text-white">Career Readiness</span>
                                    <span className="text-xs font-extrabold text-[#4C1D95]">{careerReadiness}%</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 dark:!text-white mb-3">Follow your learning path and get closer to your dream job.</p>

                            <div className="flex items-start justify-between overflow-x-auto gap-1 pb-1">
                                {careerSteps.map((step, i) => (
                                    <React.Fragment key={step.key}>
                                        <div className="flex flex-col items-center gap-1.5 w-[72px] shrink-0 text-center">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:!text-white'}`}>
                                                {step.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                                            </div>
                                            <span className={`text-[9px] font-semibold leading-tight ${step.done ? 'text-gray-900 dark:!text-white' : 'text-gray-400 dark:!text-white'}`}>{step.label}</span>
                                        </div>
                                        {i < careerSteps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mt-3.5 min-w-[16px] ${careerSteps[i + 1].done && step.done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                            onClick={() => navigate('/dashboard/my-courses')}
                            className="bg-white rounded-[16px] p-4 flex items-center space-x-3 border border-gray-100 shadow-sm glass-panel cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors">
                                <Archive size={20} />
                            </div>
                            <div>
                                <h3 className="!text-base !font-bold !text-gray-900 dark:!text-white font-inter">{pendingProjectsCount}</h3>
                                <p className="text-[11px] text-gray-500 dark:!text-white font-medium font-inter">Pending Projects</p>
                            </div>
                            <div className="ml-auto text-gray-300 group-hover:text-orange-500 transition-colors">
                                <ChevronRight size={18} />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/dashboard/documents')}
                            className="bg-white rounded-[16px] p-4 flex items-center space-x-3 border border-gray-100 shadow-sm glass-panel cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                                <Heart size={20} />
                            </div>
                            <div>
                                <h3 className="!text-base !font-bold !text-gray-900 dark:!text-white font-inter">{pendingCertsCount}</h3>
                                <p className="text-[11px] text-gray-500 dark:!text-white font-medium font-inter">Pending Docs & Certs</p>
                            </div>
                            <div className="ml-auto text-gray-300 group-hover:text-emerald-500 transition-colors">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Recommended for You */}
                    {recommendedCourses.length > 0 && (
                        <div>
                            <h2 className="!font-inter !text-base !font-bold !text-gray-900 dark:!text-white mb-1">Recommended for You</h2>
                            <p className="text-xs text-gray-400 dark:!text-white mb-4">Courses and skills based on your career goal and learning progress.</p>
                            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                                {recommendedCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => navigate(`/courses/${course._id}`)}
                                        className="bg-white rounded-[18px] border border-gray-100 shadow-sm glass-panel hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
                                    >
                                        <div className="relative h-28 w-full overflow-hidden bg-gray-100 dark:bg-white/10">
                                            <img
                                                src={course.thumbnail ? getMediaUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'; }}
                                            />
                                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 text-[#4C1D95] text-[9px] font-bold rounded-full shadow-sm uppercase tracking-wide">
                                                {course.reason}
                                            </span>
                                        </div>
                                        <div className="p-3.5">
                                            <h4 className="text-xs font-bold text-gray-900 dark:!text-white leading-snug line-clamp-2 mb-2">{course.title}</h4>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded px-1.5 py-0.5">Certificate</span>
                                                {course.hasPlacementSupport && (
                                                    <span className="text-[9px] font-bold text-[#4C1D95] bg-[#4C1D95]/5 border border-[#4C1D95]/20 rounded px-1.5 py-0.5">Placement Support</span>
                                                )}
                                            </div>
                                            <button className="mt-3 text-[11px] font-bold text-[#4C1D95] hover:text-[#3b1675] flex items-center gap-1 transition-colors">
                                                View Course <ArrowRight size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Performance Overview */}
                    {weeklyPerformanceData.length > 0 && (
                        <PerformanceOverviewCard data={weeklyPerformanceData} />
                    )}
                </div>

                {/* Right Sidebar */}
                {showStats && (
                <div className="w-full xl:w-80 space-y-3 shrink-0 animate-in slide-in-from-right-8 duration-300">

                    {/* Your Progress */}
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                        <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white mb-3">Your Progress</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-14 h-14 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3E8FF" strokeWidth="3.5" />
                                    <circle
                                        cx="18" cy="18" r="15.5" fill="none" stroke="#4C1D95" strokeWidth="3.5"
                                        strokeDasharray={`${(stats.completionRate || 0) * 0.974} 200`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#4C1D95]">
                                    {stats.completionRate || 0}%
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:!text-white font-medium">Overall Learning Progress</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-lg font-extrabold text-gray-900 dark:!text-white">{allEnrolledCourses.length}</p>
                                <p className="text-[10px] text-gray-400 dark:!text-white font-semibold">Courses Enrolled</p>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-gray-900 dark:!text-white">{coursesCompletedCount}</p>
                                <p className="text-[10px] text-gray-400 dark:!text-white font-semibold">Courses Completed</p>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-gray-900 dark:!text-white">{certificatesEarnedCount}</p>
                                <p className="text-[10px] text-gray-400 dark:!text-white font-semibold">Certificates</p>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-gray-900 dark:!text-white">~{learningHoursEstimate}h</p>
                                <p className="text-[10px] text-gray-400 dark:!text-white font-semibold">Learning Hours (est.)</p>
                            </div>
                        </div>
                    </div>

                    {/* Career Progress */}
                    {careerProgress && (
                        <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                            <div className="flex items-center gap-2 mb-3">
                                <Briefcase size={14} className="text-[#4C1D95]" />
                                <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white">Career Progress</h3>
                            </div>

                            <div className="mb-4">
                                <p className="text-[10px] text-gray-400 dark:!text-white font-semibold uppercase tracking-wider mb-1">Career Goal</p>
                                {isEditingGoal ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={goalInput}
                                            onChange={(e) => setGoalInput(e.target.value)}
                                            placeholder="e.g. Hospital Administrator"
                                            className="flex-1 min-w-0 text-xs font-semibold text-gray-900 dark:!text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-[#C026FF]/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4C1D95]/50"
                                        />
                                        <button onClick={handleSaveGoal} disabled={savingGoal} className="shrink-0 text-[11px] font-bold text-white bg-[#4C1D95] rounded-lg px-2.5 py-1.5 disabled:opacity-50">
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-gray-900 dark:!text-white truncate">{careerProgress.careerGoal || 'Not set yet'}</p>
                                        <button onClick={() => { setIsEditingGoal(true); setGoalInput(careerProgress.careerGoal || ''); }} className="shrink-0 text-gray-400 dark:!text-white hover:text-[#4C1D95] transition-colors">
                                            <Pencil size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] text-gray-400 dark:!text-white font-semibold uppercase tracking-wider">Skills Progress</p>
                                    <span className="text-xs font-bold text-[#4C1D95]">{stats.completionRate || 0}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#4C1D95] rounded-full transition-all duration-700" style={{ width: `${stats.completionRate || 0}%` }} />
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between h-5">
                                    <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                                        {hasResumeUploaded ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300" />}
                                        Resume
                                    </span>
                                    {hasResumeUploaded ? (
                                        <span className="text-[10px] font-bold text-emerald-600">Completed</span>
                                    ) : (
                                        <label className="text-[10px] font-bold leading-none text-[#4C1D95] cursor-pointer hover:underline">
                                            {uploadingResume ? 'Uploading...' : 'Upload'}
                                            <input type="file" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} accept=".pdf,.doc,.docx" />
                                        </label>
                                    )}
                                </div>
                                <div className="flex items-center justify-between h-5">
                                    <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                                        {certificatesEarnedCount > 0 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300" />}
                                        Certificate
                                    </span>
                                    <span className={`text-[10px] font-bold ${certificatesEarnedCount > 0 ? 'text-emerald-600' : 'text-gray-400 dark:!text-white'}`}>
                                        {certificatesEarnedCount > 0 ? 'Completed' : 'Not Started'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between h-5">
                                    <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                                        {careerProgress.interviewPrepCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300" />}
                                        Interview Preparation
                                    </span>
                                    <button
                                        onClick={handleToggleInterviewPrep}
                                        disabled={savingInterviewPrep}
                                        className={`text-[10px] font-bold leading-none p-0 bg-transparent disabled:opacity-50 ${careerProgress.interviewPrepCompleted ? 'text-emerald-600' : 'text-[#4C1D95] hover:underline'}`}
                                    >
                                        {careerProgress.interviewPrepCompleted ? 'Completed' : 'Mark as prepared'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between h-5">
                                    <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                                        {jobApplications.length > 0 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300" />}
                                        Job Applications
                                    </span>
                                    <span className={`text-[10px] font-bold ${jobApplications.length > 0 ? 'text-emerald-600' : 'text-gray-400 dark:!text-white'}`}>
                                        {jobApplications.length > 0 ? `${jobApplications.length} sent` : 'Not Started'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming (compact preview, reuses calendar's data) */}
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                        <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white mb-3">Upcoming</h3>
                        {upcomingPreview.length === 0 ? (
                            <p className="text-xs text-gray-400 dark:!text-white text-center py-2">Nothing scheduled yet</p>
                        ) : (
                            <div className="space-y-2.5">
                                {upcomingPreview.map((item, i) => {
                                    const isToday = item.date.toDateString() === today.toDateString();
                                    const isTomorrow = item.date.toDateString() === tomorrow.toDateString();
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2.5 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 -m-1.5 transition-colors"
                                            onClick={() => navigate(item.type === 'session' ? '/dashboard/live-classes' : '/dashboard/exams')}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'session' ? 'bg-[#4C1D95]/10 dark:bg-[#4C1D95]/25 text-[#4C1D95] dark:text-[#C026FF]' : 'bg-[#F48F56]/10 dark:bg-[#F48F56]/25 text-[#F48F56]'}`}>
                                                {item.type === 'session' ? <Play size={13} /> : <CalendarIcon size={13} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 dark:!text-white uppercase tracking-wider">
                                                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : item.date.toLocaleDateString()}
                                                </p>
                                                <p className="text-xs font-bold text-gray-900 dark:!text-white truncate">{item.title}</p>
                                                <p className="text-[10px] text-gray-500 dark:!text-white">{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Profile Summary Widget */}
                    <div className="bg-white rounded-[20px] py-3 px-4 flex items-center gap-3 border border-gray-100 shadow-sm glass-panel">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                            <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userName}&background=4C1D95&color=fff`} alt={userName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="!font-inter !font-bold !text-gray-900 dark:!text-white truncate !text-sm">{userInfo.name || 'Scholar'}</h3>
                            <p className="text-xs text-[#F48F56] font-bold truncate">{rewardPoints} Reward Points</p>
                        </div>
                    </div>

                    {/* My Achievements */}
                    {careerProgress && (
                        <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                            <h3 className="!font-inter !text-sm !font-bold !text-gray-900 dark:!text-white mb-4">My Achievements</h3>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="w-9 h-9 mx-auto rounded-xl bg-[#4C1D95]/10 dark:bg-[#4C1D95]/25 text-[#4C1D95] dark:text-[#C026FF] flex items-center justify-center mb-1.5">
                                        <Award size={16} />
                                    </div>
                                    <p className="text-sm font-extrabold text-gray-900 dark:!text-white">{certificatesEarnedCount}</p>
                                    <p className="text-[9px] text-gray-400 dark:!text-white font-semibold">Certificates</p>
                                </div>
                                <div>
                                    <div className="w-9 h-9 mx-auto rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-1.5">
                                        <Flame size={16} />
                                    </div>
                                    <p className="text-sm font-extrabold text-gray-900 dark:!text-white">{careerProgress.currentStreak}</p>
                                    <p className="text-[9px] text-gray-400 dark:!text-white font-semibold">Day Streak</p>
                                </div>
                                <div>
                                    <div className="w-9 h-9 mx-auto rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5">
                                        <Sparkles size={16} />
                                    </div>
                                    <p className="text-sm font-extrabold text-gray-900 dark:!text-white">{rewardPoints}</p>
                                    <p className="text-[9px] text-gray-400 dark:!text-white font-semibold">Points</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Deadline */}
                    {nextDeadline && (
                        <div className="bg-[#F3E8FF] dark:bg-[#4C1D95]/10 rounded-[16px] p-4 border border-[#4C1D95]/10 dark:border-[#C026FF]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ClipboardCheck size={14} className="text-[#4C1D95] dark:text-[#C026FF]" />
                                <h3 className="!font-inter !text-xs !font-bold !text-[#4C1D95] dark:!text-[#C026FF] uppercase tracking-wider">Upcoming Deadline</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:!text-white mb-1">{nextDeadline.title || 'Assessment'}</p>
                            <p className="text-xs text-gray-500 dark:!text-white mb-3">Due {new Date(nextDeadline.scheduledStartTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            <button
                                onClick={() => navigate('/dashboard/exams')}
                                className="w-full text-center px-4 py-2 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
                            >
                                Start Assessment <ArrowRight size={13} />
                            </button>
                        </div>
                    )}

                    {/* Course Finder summary - real state from users.course_finder_status */}
                    {courseFinderStatus === 'COMPLETED' && courseFinderResult?.recommendations?.[0] && (
                        <div className="bg-[#F3E8FF] dark:bg-[#4C1D95]/10 rounded-[16px] p-4 border border-[#4C1D95]/10 dark:border-[#C026FF]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-[#4C1D95] dark:text-[#C026FF]" />
                                <h3 className="!font-inter !text-xs !font-bold !text-[#4C1D95] dark:!text-[#C026FF] uppercase tracking-wider">Your Career Match</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:!text-white mb-1">{courseFinderResult.recommendations[0].careerRole}</p>
                            <p className="text-xs text-gray-500 dark:!text-white mb-3">{courseFinderResult.recommendations[0].score}% Match &middot; Continue your recommended learning path.</p>
                            <button
                                onClick={() => navigate('/dashboard/course-finder')}
                                className="w-full text-center px-4 py-2 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
                            >
                                View Career Path <ArrowRight size={13} />
                            </button>
                        </div>
                    )}
                    {(courseFinderStatus === 'NOT_STARTED' || courseFinderStatus === 'DISMISSED') && (
                        <div className="bg-[#F3E8FF] dark:bg-[#4C1D95]/10 rounded-[16px] p-4 border border-[#4C1D95]/10 dark:border-[#C026FF]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-[#4C1D95] dark:text-[#C026FF]" />
                                <h3 className="!font-inter !text-xs !font-bold !text-[#4C1D95] dark:!text-[#C026FF] uppercase tracking-wider">Find Your Career Path</h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:!text-white mb-3">Not sure which course is right for you? Take our 2-minute Course Finder.</p>
                            <button
                                onClick={() => navigate('/dashboard/course-finder')}
                                className="w-full text-center px-4 py-2 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
                            >
                                Find My Course <ArrowRight size={13} />
                            </button>
                        </div>
                    )}
                    {courseFinderStatus === 'IN_PROGRESS' && (
                        <div className="bg-[#F3E8FF] dark:bg-[#4C1D95]/10 rounded-[16px] p-4 border border-[#4C1D95]/10 dark:border-[#C026FF]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-[#4C1D95] dark:text-[#C026FF]" />
                                <h3 className="!font-inter !text-xs !font-bold !text-[#4C1D95] dark:!text-[#C026FF] uppercase tracking-wider">Course Finder</h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:!text-white mb-3">You're partway through - pick up right where you left off.</p>
                            <button
                                onClick={() => navigate('/dashboard/course-finder')}
                                className="w-full text-center px-4 py-2 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
                            >
                                Resume Course Finder <ArrowRight size={13} />
                            </button>
                        </div>
                    )}

                    {/* Calendar Widget */}
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel transition-all duration-300">
                        <div className="flex items-center justify-between mb-5 cursor-pointer group" onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}>
                            <div className="flex items-center gap-2">
                                {isCalendarExpanded && (
                                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:bg-white/10 rounded-full transition-colors text-gray-500 dark:!text-white">
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                <h3 className="!font-inter !font-bold !text-gray-900 dark:!text-white !text-sm">
                                    {isCalendarExpanded ? viewingMonthStr : currentMonth}
                                </h3>
                                {isCalendarExpanded && (
                                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:bg-white/10 rounded-full transition-colors text-gray-500 dark:!text-white">
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                                <ChevronRight size={16} className={`text-gray-400 dark:!text-white transition-transform duration-300 ${isCalendarExpanded ? '-rotate-90' : 'rotate-90'}`} />
                            </div>
                        </div>

                        {!isCalendarExpanded ? (
                            <div className="flex justify-between items-center text-center">
                                {currentWeekDates.map((d, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 dark:!text-white">{d.day}</span>
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${d.isToday ? 'bg-[#F48F56] text-white shadow-md shadow-[#F48F56]/30' : 'text-gray-500 dark:!text-white hover:bg-gray-50 cursor-pointer'}`}>
                                            {d.dateNum}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="text-[10px] font-bold text-gray-400 dark:!text-white py-1">
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
                                                                ? 'text-gray-700 hover:bg-gray-100 dark:bg-white/10'
                                                                : 'text-gray-300 hover:bg-gray-50'
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
                            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 dark:!text-white uppercase tracking-wider">Schedule</h4>
                                    <span className="text-[10px] font-semibold text-[#4C1D95]">{selectedDate.toLocaleDateString()}</span>
                                </div>

                                {filteredSessions.length === 0 && filteredExams.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:!text-white text-center py-4 bg-gray-50 rounded-xl border border-gray-100">No schedule for this date</p>
                                ) : (
                                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {filteredSessions.map(session => (
                                            <div key={session._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-[#C026FF]/20 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/live-classes')}>
                                                <div className="w-8 h-8 rounded-full bg-[#4C1D95]/10 dark:bg-[#4C1D95]/25 flex items-center justify-center text-[#4C1D95] dark:text-[#C026FF] shrink-0 mt-0.5">
                                                    <Play size={12} className="ml-0.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 dark:!text-white truncate leading-tight mb-0.5">{session.topic || 'Live Session'}</h4>
                                                    <p className="text-[9px] font-semibold text-gray-500 dark:!text-white">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredExams.map(exam => (
                                            <div key={exam._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-[#C026FF]/20 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/exams')}>
                                                <div className="w-8 h-8 rounded-full bg-[#F48F56]/10 flex items-center justify-center text-[#F48F56] shrink-0 mt-0.5">
                                                    <CalendarIcon size={12} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 dark:!text-white truncate leading-tight mb-0.5">{exam.title || 'Exam'}</h4>
                                                    <p className="text-[9px] font-semibold text-gray-500 dark:!text-white">{new Date(exam.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tasks of the month */}
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="!font-inter !font-bold !text-gray-900 dark:!text-white !text-sm">Tasks of the month</h3>
                            <span className="text-[10px] font-bold text-[#F48F56] bg-[#F48F56]/10 px-2 py-1 rounded-md">{currentMonth.split(' ')[0]}</span>
                        </div>

                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-2 relative overflow-hidden">
                            <div className="bg-[#F48F56] h-full rounded-full transition-all duration-1000" style={{ width: `${stats.completionRate || 0}%` }}></div>
                        </div>
                        <div className="text-right text-xs font-bold text-gray-500 dark:!text-white">{stats.completionRate || 0}%</div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm glass-panel">
                        <h3 className="!font-inter !font-bold !text-gray-900 dark:!text-white mb-5 !text-sm">Leaderboard</h3>

                        <div className="space-y-4">
                            {leaderboard.length > 0 ? leaderboard.map((user, i) => {
                                const level = Math.floor((user.xp || 0) / 1000) + 1;
                                const userImg = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=4C1D95&color=fff`;
                                return (
                                    <div key={user.id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                        <img src={userImg} alt={user.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:!text-white truncate">{user.name || 'User'}</h4>
                                            <p className="text-[10px] font-medium text-gray-400 dark:!text-white">Level {level} • {user.xp || 0} XP</p>
                                        </div>
                                        <div className="text-xs font-bold text-gray-900 dark:!text-white bg-gray-100 dark:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">#{i + 1}</div>
                                    </div>
                                );
                            }) : (
                                <p className="text-xs text-gray-400 dark:!text-white text-center py-4">No top students yet</p>
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
