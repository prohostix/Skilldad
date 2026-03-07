import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, CheckCircle, XCircle, Clock, Calendar,
    TrendingUp, FileText, ChevronDown, ChevronUp,
    Home, Eye, Download, ChevronRight, Zap
} from 'lucide-react';
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

    useEffect(() => { fetchResult(); }, [examId]);

    const fetchResult = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const [resultRes, submissionRes, examRes] = await Promise.all([
                axios.get(`/api/results/exam/${examId}/student/${userInfo._id}`, getAuthConfig()),
                axios.get(`/api/exams/exam-submissions/exam/${examId}/my-submission`, getAuthConfig()),
                axios.get(`/api/exams/${examId}`, getAuthConfig())
            ]);
            setResult(resultRes.data.result || resultRes.data);
            setSubmission(submissionRes.data.submission || submissionRes.data);
            setExam(examRes.data.exam || examRes.data);
        } catch (error) {
            if (error.response?.status === 403) {
                showToast('Results have not been published yet', 'error');
            } else {
                showToast(error.response?.data?.message || 'Error loading result', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const getGradeConfig = (grade) => {
        const configs = {
            'A+': { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
            'A': { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
            'B+': { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
            'B': { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
            'C': { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
            'D': { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
            'F': { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
        };
        return configs[grade] || { color: 'text-white/60', bg: 'bg-white/10', border: 'border-white/20', glow: 'shadow-white/10' };
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="text-center space-y-5">
                    <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                        <div className="absolute inset-3 rounded-full bg-primary/5 flex items-center justify-center">
                            <Zap size={16} className="text-primary" />
                        </div>
                    </div>
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">Fetching Results...</p>
                </div>
            </div>
        );
    }

    // No result
    if (!result) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 text-center max-w-md bg-white/[0.03] border border-white/8 rounded-3xl"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <FileText size={30} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Result Not Available</h3>
                    <p className="text-white/40 text-sm mb-8">Results for this exam have not been published yet. Please check back later.</p>
                    <button
                        onClick={() => navigate('/dashboard/exams')}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 transition-all"
                    >
                        Back to Exams
                    </button>
                </motion.div>
            </div>
        );
    }

    const gradeConfig = getGradeConfig(result.grade);
    const passed = result.isPassed;

    return (
        <div className="min-h-screen bg-[#020202] text-white font-inter py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Hero Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="relative inline-flex items-center justify-center mx-auto mb-2">
                        <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            {passed
                                ? <Award size={44} className="text-emerald-400" strokeWidth={1.5} />
                                : <XCircle size={44} className="text-red-400" strokeWidth={1.5} />
                            }
                        </div>
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                            {passed ? 'Assessment Passed' : 'Assessment Failed'}
                        </p>
                        <h1 className="text-3xl font-black text-white">Exam Results</h1>
                        <p className="text-white/40 text-sm mt-2">{exam?.title}</p>
                        <p className="text-white/25 text-xs">{exam?.course?.title}</p>
                        {exam?.isMockExam && (
                            <span className="inline-block mt-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-black uppercase rounded-lg border border-amber-500/20">
                                Mock Exam
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* ── Score Summary ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                        {/* Score */}
                        <div className="bg-[#0a0a0a] p-6 text-center space-y-2">
                            <p className="text-4xl font-black text-white">
                                {result.obtainedMarks}
                                <span className="text-xl text-white/25">/{result.totalMarks}</span>
                            </p>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Score</p>
                        </div>

                        {/* Percentage */}
                        <div className="bg-[#0a0a0a] p-6 text-center space-y-2">
                            <p className="text-4xl font-black text-primary">
                                {result.percentage.toFixed(1)}
                                <span className="text-2xl">%</span>
                            </p>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Percentage</p>
                        </div>

                        {/* Grade */}
                        <div className="bg-[#0a0a0a] p-6 text-center space-y-2 flex flex-col items-center justify-center">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 shadow-lg ${gradeConfig.bg} ${gradeConfig.border} ${gradeConfig.glow}`}>
                                <span className={`text-2xl font-black ${gradeConfig.color}`}>{result.grade}</span>
                            </div>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Grade</p>
                        </div>

                        {/* Status */}
                        <div className="bg-[#0a0a0a] p-6 text-center space-y-2 flex flex-col items-center justify-center">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${passed ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                                {passed ? <CheckCircle size={18} fill="currentColor" className="opacity-70" /> : <XCircle size={18} fill="currentColor" className="opacity-70" />}
                                <span className="font-black text-sm uppercase">{passed ? 'Passed' : 'Failed'}</span>
                            </div>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Status</p>
                        </div>
                    </div>

                    {/* Rank */}
                    {result.rank && (
                        <div className="px-8 py-5 border-t border-white/5 flex items-center justify-center gap-3">
                            <TrendingUp size={16} className="text-primary" />
                            <span className="text-white/40 text-sm font-medium">Your Class Rank</span>
                            <span className="text-2xl font-black text-primary">#{result.rank}</span>
                        </div>
                    )}
                </motion.div>

                {/* ── Instructor Feedback ── */}
                {result.overallFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/[0.03] border border-white/8 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={16} className="text-primary" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Instructor Feedback</h3>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-4">
                            {result.overallFeedback}
                        </p>
                    </motion.div>
                )}

                {/* ── Submission Details ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white/[0.03] border border-white/8 rounded-2xl p-6"
                >
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Submission Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Calendar,
                                label: 'Submitted At',
                                value: submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'
                            },
                            {
                                icon: Clock,
                                label: 'Time Spent',
                                value: submission?.timeSpent
                                    ? `${Math.floor(submission.timeSpent / 60)}m ${submission.timeSpent % 60}s`
                                    : 'N/A'
                            },
                            {
                                icon: FileText,
                                label: 'Submission Type',
                                value: submission?.isAutoSubmitted ? 'Auto-submitted' : 'Manual'
                            }
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Icon size={11} className="text-white/20" />
                                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">{label}</p>
                                </div>
                                <p className="text-sm font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Detailed Answers ── */}
                {submission?.answers && submission.answers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden"
                    >
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Eye size={16} className="text-primary" />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Answer Breakdown</h3>
                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/40">
                                    {submission.answers.length} Questions
                                </span>
                            </div>
                            <div className={`p-1.5 rounded-lg transition-all ${showAnswers ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/30'}`}>
                                {showAnswers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showAnswers && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden border-t border-white/5"
                                >
                                    <div className="p-6 space-y-4">
                                        {submission.answers.map((answer, index) => {
                                            const isCorrect = answer.isCorrect;
                                            return (
                                                <div
                                                    key={answer._id || index}
                                                    className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3 gap-3">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-black">
                                                                Q{index + 1}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                {answer.marksAwarded || 0} / {answer.question?.marks || 0} marks
                                                            </span>
                                                        </div>
                                                        <div className={`flex-shrink-0 p-1 rounded-lg ${isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                            {isCorrect
                                                                ? <CheckCircle size={16} className="text-emerald-400" />
                                                                : <XCircle size={16} className="text-red-400" />
                                                            }
                                                        </div>
                                                    </div>

                                                    <p className="text-white text-sm font-medium mb-4 leading-relaxed">
                                                        {answer.question?.questionText}
                                                    </p>

                                                    {answer.questionType === 'mcq' ? (
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white/40 font-bold w-28">Your Answer:</span>
                                                                <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                    {answer.question?.options[answer.selectedOption]?.text || 'Not answered'}
                                                                </span>
                                                            </div>
                                                            {!isCorrect && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white/40 font-bold w-28">Correct Answer:</span>
                                                                    <span className="font-bold text-emerald-400">
                                                                        {answer.question?.options.find(opt => opt.isCorrect)?.text || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1.5">Your Answer</p>
                                                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/70 text-xs leading-relaxed">
                                                                    {answer.textAnswer || 'Not answered'}
                                                                </div>
                                                            </div>
                                                            {answer.feedback && (
                                                                <div>
                                                                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1.5">Instructor Feedback</p>
                                                                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-white/70 text-xs leading-relaxed">
                                                                        {answer.feedback}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── Action Buttons ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Home size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Download size={16} /> Print / Download
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/exams')}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 shadow-lg shadow-primary/20 transition-all"
                    >
                        <FileText size={16} /> All Exams <ChevronRight size={14} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default ExamResult;
