import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    CheckCircle, Clock, FileText, Home, Eye,
    Send, Calendar, Zap, ChevronRight, Award
} from 'lucide-react';

const ExamSubmitted = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    useEffect(() => {
        fetchSubmissionDetails();
    }, [examId]);

    const fetchSubmissionDetails = async () => {
        setLoading(true);
        try {
            const [submissionRes, examRes] = await Promise.all([
                axios.get(`/api/exams/exam-submissions/exam/${examId}/my-submission`, getAuthConfig()),
                axios.get(`/api/exams/${examId}`, getAuthConfig())
            ]);
            setSubmission(submissionRes.data);
            setExam(examRes.data);
        } catch (error) {
            console.error('Error fetching submission details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">Loading submission...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center px-4 py-16 font-inter">
            <div className="max-w-xl w-full space-y-6">

                {/* Hero Success */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="text-center space-y-5"
                >
                    {/* Animated Checkmark Ring */}
                    <div className="relative inline-flex items-center justify-center mx-auto">
                        <div className="w-28 h-28 rounded-full border-2 border-emerald-500/20 animate-ping absolute opacity-30"></div>
                        <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <CheckCircle size={52} className="text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-2">Assessment Complete</p>
                        <h1 className="text-3xl font-black text-white">Exam Submitted!</h1>
                        <p className="text-white/40 text-sm mt-2">Your answers have been recorded and secured.</p>
                    </div>
                </motion.div>

                {/* Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden"
                >
                    {/* Exam Name Header */}
                    <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{exam?.course?.title || 'Course'}</p>
                        <h2 className="text-base font-bold text-white truncate">{exam?.title || 'Assessment'}</h2>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-white/5">
                        {[
                            {
                                icon: Calendar,
                                label: 'Submitted At',
                                value: submission?.submittedAt
                                    ? new Date(submission.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : 'Just now',
                                color: 'text-primary'
                            },
                            {
                                icon: Clock,
                                label: 'Time Spent',
                                value: submission?.timeSpent ? formatTime(submission.timeSpent) : 'N/A',
                                color: 'text-amber-400'
                            },
                            {
                                icon: Send,
                                label: 'Submit Type',
                                value: submission?.isAutoSubmitted ? 'Auto-Submitted' : 'Manual',
                                color: submission?.isAutoSubmitted ? 'text-amber-400' : 'text-emerald-400'
                            },
                            {
                                icon: Award,
                                label: 'Status',
                                value: submission?.status === 'graded' ? 'Graded' : 'Pending Review',
                                color: submission?.status === 'graded' ? 'text-emerald-400' : 'text-amber-400'
                            }
                        ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="bg-[#080808] p-5 space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Icon size={11} className="text-white/20" />
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</p>
                                </div>
                                <p className={`text-sm font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Auto-submit Warning */}
                    {submission?.isAutoSubmitted && (
                        <div className="mx-5 mt-5 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                            <p className="text-amber-400 text-xs font-bold leading-relaxed">
                                ⚠️ This exam was automatically submitted when time expired. All saved answers have been recorded.
                            </p>
                        </div>
                    )}

                    {/* What's Next */}
                    <div className="p-6 border-t border-white/5 mt-5 space-y-3">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">What's Next?</h3>
                        {[
                            'Your submission is now being processed for grading.',
                            'You will receive a notification once results are published.',
                            'Results will be visible in your exam history.'
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs text-white/50 font-medium">
                                <div className="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[8px] font-black text-primary">{i + 1}</span>
                                </div>
                                {step}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Home size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/exams')}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Eye size={16} /> View All Exams <ChevronRight size={14} />
                    </button>
                </motion.div>

                {/* Footnote */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-white/20 text-xs"
                >
                    A confirmation has been sent to your registered email address.
                </motion.p>
            </div>
        </div>
    );
};

export default ExamSubmitted;
