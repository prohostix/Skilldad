import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, FileText, AlertCircle, CheckCircle, PlayCircle, Eye } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const StudentExamList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const socket = useSocket();

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for real-time exam scheduled notifications
        const handleExamScheduled = (data) => {
            console.log('[StudentExamList] Received EXAM_SCHEDULED event:', data);
            showToast(`New exam scheduled: ${data.examTitle}`, 'success');
            // Refresh exam list
            fetchExams();
        };

        socket.on('EXAM_SCHEDULED', handleExamScheduled);

        // Cleanup listener on unmount
        return () => {
            socket.off('EXAM_SCHEDULED', handleExamScheduled);
        };
    }, [socket]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            console.log('[StudentExamList] Fetching exams...');
            const response = await axios.get('/api/exams/student/my-exams', getAuthConfig());
            console.log('[StudentExamList] API Response:', response.data);
            
            // API returns { success: true, count: X, data: [...] }
            const examData = response.data.data || response.data || [];
            console.log('[StudentExamList] Parsed exam data:', examData);
            console.log('[StudentExamList] Number of exams:', examData.length);
            
            setExams(examData);
        } catch (error) {
            console.error('[StudentExamList] Error fetching exams:', error);
            console.error('[StudentExamList] Error response:', error.response?.data);
            console.error('[StudentExamList] Error status:', error.response?.status);
            showToast(error.response?.data?.message || 'Error loading exams', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const start = new Date(exam.scheduledStartTime);
        const end = new Date(exam.scheduledEndTime);

        // Check if student has submitted
        if (exam.submission && (exam.submission.status === 'submitted' || exam.submission.status === 'graded')) {
            return 'completed';
        }

        // Check if exam is ongoing
        if (now >= start && now <= end) {
            return 'ongoing';
        }

        // Check if exam is upcoming
        if (now < start) {
            return 'upcoming';
        }

        // Exam has ended
        return 'ended';
    };

    const getTimeDisplay = (exam) => {
        const now = new Date();
        const start = new Date(exam.scheduledStartTime);
        const end = new Date(exam.scheduledEndTime);
        const status = getExamStatus(exam);

        if (status === 'upcoming') {
            const diff = start - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                return `Starts in ${days} day${days > 1 ? 's' : ''}`;
            }
            return `Starts in ${hours}h ${minutes}m`;
        }

        if (status === 'ongoing') {
            const diff = end - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m remaining`;
        }

        if (status === 'completed') {
            return 'Submitted';
        }

        return 'Ended';
    };

    const getStatusBadge = (exam) => {
        const status = getExamStatus(exam);

        const badges = {
            upcoming: {
                bg: 'bg-blue-500/20',
                text: 'text-blue-400',
                border: 'border-blue-500/30',
                label: 'UPCOMING',
                icon: Calendar
            },
            ongoing: {
                bg: 'bg-emerald-500/20',
                text: 'text-emerald-400',
                border: 'border-emerald-500/30',
                label: 'ONGOING',
                icon: Clock,
                pulse: true
            },
            completed: {
                bg: 'bg-purple-500/20',
                text: 'text-purple-400',
                border: 'border-purple-500/30',
                label: 'COMPLETED',
                icon: CheckCircle
            },
            ended: {
                bg: 'bg-red-500/20',
                text: 'text-red-400',
                border: 'border-red-500/30',
                label: 'ENDED',
                icon: AlertCircle
            }
        };

        const badge = badges[status];
        const Icon = badge.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${badge.bg} ${badge.text} border ${badge.border} ${badge.pulse ? 'animate-pulse' : ''}`}>
                <Icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">{badge.label}</span>
            </div>
        );
    };

    const getExamTypeBadge = (examType) => {
        const colors = {
            'pdf-based': 'bg-purple-500/20 text-purple-400',
            'online-mcq': 'bg-emerald-500/20 text-emerald-400',
            'online-descriptive': 'bg-blue-500/20 text-blue-400',
            'mixed': 'bg-indigo-500/20 text-indigo-400'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colors[examType] || 'bg-white/10 text-white/60'}`}>
                {examType?.replace('-', ' ') || 'N/A'}
            </span>
        );
    };

    const handleStartExam = async (examId) => {
        try {
            // Check access first
            const accessResponse = await axios.get(`/api/exams/${examId}/access`, getAuthConfig());
            
            if (!accessResponse.data.canAccess) {
                showToast(accessResponse.data.reason, 'error');
                return;
            }

            // Navigate to exam taking page
            navigate(`/dashboard/exam/${examId}/take`);
        } catch (error) {
            showToast(error.response?.data?.message || 'Error accessing exam', 'error');
        }
    };

    const handleViewResult = (examId) => {
        navigate(`/dashboard/exam/${examId}/result`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (exams.length === 0) {
        return (
            <GlassCard className="p-12 text-center">
                <FileText size={48} className="mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Exams Available</h3>
                <p className="text-white/50 text-sm">You don't have any scheduled exams at the moment.</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">My Exams</h2>
                    <p className="text-white/50 text-sm mt-1">View and take your scheduled exams</p>
                </div>
            </div>

            <div className="grid gap-4">
                {exams.map((exam) => {
                    const status = getExamStatus(exam);
                    const canStart = status === 'ongoing';
                    const canViewResult = status === 'completed' && exam.submission;

                    return (
                        <GlassCard key={exam._id} className="p-6 hover:border-primary/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <FileText size={24} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">{exam.title}</h3>
                                                {exam.isMockExam && (
                                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded">
                                                        Mock
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/60 text-sm mb-2">{exam.description || 'No description provided'}</p>
                                            <div className="flex items-center gap-4 text-xs text-white/50">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(exam.scheduledStartTime).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {exam.duration} minutes
                                                </span>
                                                <span>
                                                    {exam.totalMarks} marks
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        {getStatusBadge(exam)}
                                        {getExamTypeBadge(exam.examType)}
                                        <div className="text-xs font-bold text-white/70">
                                            {getTimeDisplay(exam)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 md:items-end">
                                    {canStart && (
                                        <ModernButton
                                            onClick={() => handleStartExam(exam._id)}
                                            className="!bg-primary hover:!bg-primary-dark"
                                        >
                                            <PlayCircle size={16} className="mr-2" />
                                            Start Exam
                                        </ModernButton>
                                    )}
                                    {canViewResult && (
                                        <ModernButton
                                            onClick={() => handleViewResult(exam._id)}
                                            variant="secondary"
                                        >
                                            <Eye size={16} className="mr-2" />
                                            View Result
                                        </ModernButton>
                                    )}
                                    {status === 'upcoming' && (
                                        <div className="text-xs text-white/40 text-center">
                                            Available at {new Date(exam.scheduledStartTime).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentExamList;
