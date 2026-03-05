import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Award, CheckCircle, XCircle, Clock, Calendar, 
    TrendingUp, FileText, ChevronDown, ChevronUp, Home, Eye, Download 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { useToast } from '../../context/ToastContext';

const ExamResult = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [result, setResult] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [exam, setExam] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [loading, setLoading] = useState(true);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    useEffect(() => {
        fetchResult();
    }, [examId]);

    const fetchResult = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const [resultRes, submissionRes, examRes] = await Promise.all([
                axios.get(`/api/exam-results/exam/${examId}/student/${userInfo._id}`, getAuthConfig()),
                axios.get(`/api/exam-submissions/exam/${examId}/my-submission`, getAuthConfig()),
                axios.get(`/api/exams/${examId}`, getAuthConfig())
            ]);

            setResult(resultRes.data);
            setSubmission(submissionRes.data);
            setExam(examRes.data);
        } catch (error) {
            console.error('Error fetching result:', error);
            if (error.response?.status === 403) {
                showToast('Results have not been published yet', 'error');
            } else {
                showToast(error.response?.data?.message || 'Error loading result', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A+': 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
            'A': 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
            'B+': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
            'B': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
            'C': 'text-amber-400 bg-amber-500/20 border-amber-500/30',
            'D': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
            'F': 'text-red-400 bg-red-500/20 border-red-500/30'
        };
        return colors[grade] || 'text-white/60 bg-white/10 border-white/20';
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <GlassCard className="p-8 text-center max-w-md">
                    <FileText size={48} className="mx-auto text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Result Not Available</h3>
                    <p className="text-white/50 mb-4">
                        Results for this exam have not been published yet. Please check back later.
                    </p>
                    <ModernButton onClick={() => navigate('/dashboard/exams')}>
                        Back to Exams
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="max-w-6xl mx-auto space-y-6 py-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-4 border-primary/30">
                        <Award size={40} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
                            Exam Results
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-white/60">{exam?.title}</p>
                            {exam?.isMockExam && (
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-black uppercase rounded-lg border border-amber-500/30">
                                    Mock Exam
                                </span>
                            )}
                        </div>
                        <p className="text-white/40 text-sm">{exam?.course?.title}</p>
                    </div>
                </div>

                {/* Result Summary Card */}
                <GlassCard className="p-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Score */}
                        <div className="text-center space-y-2">
                            <div className="text-4xl font-black text-white">
                                {result.obtainedMarks}
                                <span className="text-white/40 text-2xl">/{result.totalMarks}</span>
                            </div>
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Score</p>
                        </div>

                        {/* Percentage */}
                        <div className="text-center space-y-2">
                            <div className="text-4xl font-black text-primary">
                                {result.percentage.toFixed(1)}%
                            </div>
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Percentage</p>
                        </div>

                        {/* Grade */}
                        <div className="text-center space-y-2">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 ${getGradeColor(result.grade)}`}>
                                <span className="text-3xl font-black">{result.grade}</span>
                            </div>
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Grade</p>
                        </div>

                        {/* Status */}
                        <div className="text-center space-y-2">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${
                                result.isPassed 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                                {result.isPassed ? (
                                    <CheckCircle size={20} />
                                ) : (
                                    <XCircle size={20} />
                                )}
                                <span className="font-black uppercase text-sm">
                                    {result.isPassed ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Status</p>
                        </div>
                    </div>

                    {/* Rank */}
                    {result.rank && (
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                <span className="text-white/70">Your Rank:</span>
                                <span className="text-2xl font-black text-primary">#{result.rank}</span>
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Overall Feedback */}
                {result.overallFeedback && (
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            Instructor Feedback
                        </h3>
                        <p className="text-white/80 leading-relaxed">{result.overallFeedback}</p>
                    </GlassCard>
                )}

                {/* Submission Details */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Submission Details</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/50">
                                <Calendar size={14} />
                                <span className="font-bold uppercase tracking-wider">Submitted At</span>
                            </div>
                            <p className="text-white">
                                {submission?.submittedAt 
                                    ? new Date(submission.submittedAt).toLocaleString()
                                    : 'N/A'
                                }
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/50">
                                <Clock size={14} />
                                <span className="font-bold uppercase tracking-wider">Time Spent</span>
                            </div>
                            <p className="text-white">
                                {submission?.timeSpent 
                                    ? `${Math.floor(submission.timeSpent / 60)}m ${submission.timeSpent % 60}s`
                                    : 'N/A'
                                }
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/50">
                                <FileText size={14} />
                                <span className="font-bold uppercase tracking-wider">Submission Type</span>
                            </div>
                            <p className="text-white">
                                {submission?.isAutoSubmitted ? 'Auto-submitted' : 'Manual'}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Detailed Answers */}
                {submission?.answers && submission.answers.length > 0 && (
                    <GlassCard className="p-6">
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Eye size={20} className="text-primary" />
                                Detailed Answer Breakdown
                            </h3>
                            {showAnswers ? (
                                <ChevronUp size={20} className="text-white/50" />
                            ) : (
                                <ChevronDown size={20} className="text-white/50" />
                            )}
                        </button>

                        {showAnswers && (
                            <div className="mt-6 space-y-6">
                                {submission.answers.map((answer, index) => (
                                    <div key={answer._id || index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-black">
                                                    Q{index + 1}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    answer.isCorrect 
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {answer.marksAwarded || 0} / {answer.question?.marks || 0} marks
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-white mb-3">{answer.question?.questionText}</p>

                                        {answer.questionType === 'mcq' ? (
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="text-white/50">Your Answer: </span>
                                                    <span className={answer.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                                                        {answer.question?.options[answer.selectedOption]?.text || 'Not answered'}
                                                    </span>
                                                </div>
                                                {!answer.isCorrect && (
                                                    <div className="text-sm">
                                                        <span className="text-white/50">Correct Answer: </span>
                                                        <span className="text-emerald-400">
                                                            {answer.question?.options.find(opt => opt.isCorrect)?.text || 'N/A'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-white/50 text-sm mb-1">Your Answer:</p>
                                                    <div className="p-3 bg-white/5 rounded-lg text-white/80 text-sm">
                                                        {answer.textAnswer || 'Not answered'}
                                                    </div>
                                                </div>
                                                {answer.feedback && (
                                                    <div>
                                                        <p className="text-white/50 text-sm mb-1">Instructor Feedback:</p>
                                                        <div className="p-3 bg-primary/10 rounded-lg text-white/80 text-sm">
                                                            {answer.feedback}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                )}

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
                        onClick={handlePrint}
                        variant="secondary"
                    >
                        <Download size={16} className="mr-2" />
                        Print / Download
                    </ModernButton>
                    
                    <ModernButton
                        onClick={() => navigate('/dashboard/exams')}
                        className="!bg-primary hover:!bg-primary-dark"
                    >
                        <FileText size={16} className="mr-2" />
                        View All Exams
                    </ModernButton>
                </div>
            </div>
        </div>
    );
};

export default ExamResult;
