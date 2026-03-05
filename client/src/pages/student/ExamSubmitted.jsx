import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, FileText, Home, Eye } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

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
                axios.get(`/api/exam-submissions/exam/${examId}/my-submission`, getAuthConfig()),
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
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-6">
                {/* Success Animation */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500/30 mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
                        Exam Submitted!
                    </h1>
                    <p className="text-white/60 text-lg">
                        Your answers have been recorded successfully
                    </p>
                </div>

                {/* Submission Details */}
                <GlassCard className="p-8">
                    <div className="space-y-6">
                        <div className="text-center pb-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-2">{exam?.title}</h2>
                            <p className="text-white/50">{exam?.course?.title}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Submission Time */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                    <Clock size={16} />
                                    <span className="font-bold uppercase tracking-wider">Submitted At</span>
                                </div>
                                <p className="text-white text-lg font-semibold">
                                    {submission?.submittedAt 
                                        ? new Date(submission.submittedAt).toLocaleString()
                                        : 'Just now'
                                    }
                                </p>
                            </div>

                            {/* Time Spent */}
                            {submission?.timeSpent && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Clock size={16} />
                                        <span className="font-bold uppercase tracking-wider">Time Spent</span>
                                    </div>
                                    <p className="text-white text-lg font-semibold">
                                        {formatTime(submission.timeSpent)}
                                    </p>
                                </div>
                            )}

                            {/* Submission Type */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                    <FileText size={16} />
                                    <span className="font-bold uppercase tracking-wider">Submission Type</span>
                                </div>
                                <p className="text-white text-lg font-semibold">
                                    {submission?.isAutoSubmitted ? 'Auto-submitted' : 'Manual'}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                    <CheckCircle size={16} />
                                    <span className="font-bold uppercase tracking-wider">Status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${
                                        submission?.status === 'graded'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {submission?.status === 'graded' ? 'Graded' : 'Pending Grading'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Auto-submission Notice */}
                        {submission?.isAutoSubmitted && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <p className="text-amber-400 text-sm">
                                    <strong>Note:</strong> This exam was automatically submitted when the time expired. 
                                    All your saved answers have been recorded.
                                </p>
                            </div>
                        )}

                        {/* Next Steps */}
                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg font-bold text-white mb-3">What's Next?</h3>
                            <ul className="space-y-2 text-white/70 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>Your submission is being processed and will be graded by your instructor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>You will receive a notification once your results are published</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>Results will be available in the exam results section</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <ModernButton
                        onClick={() => navigate('/dashboard')}
                        variant="secondary"
                    >
                        <Home size={16} className="mr-2" />
                        Back to Dashboard
                    </ModernButton>
                    
                    <ModernButton
                        onClick={() => navigate('/dashboard/exams')}
                        className="!bg-primary hover:!bg-primary-dark"
                    >
                        <Eye size={16} className="mr-2" />
                        View All Exams
                    </ModernButton>
                </div>

                {/* Confirmation Message */}
                <div className="text-center">
                    <p className="text-white/40 text-sm">
                        A confirmation email has been sent to your registered email address
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExamSubmitted;
