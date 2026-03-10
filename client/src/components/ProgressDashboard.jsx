import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    CheckCircle, 
    Clock, 
    Award, 
    Target,
    Video,
    FileText,
    Code,
    ClipboardCheck,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

const ProgressDashboard = ({ courseId, userId }) => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSubmission, setExpandedSubmission] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, [courseId, userId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };

            const { data } = await axios.get(
                `/api/progress/${userId}/${courseId}`,
                config
            );

            setProgressData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching progress:', err);
            setError(err.response?.data?.message || 'Failed to load progress data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <GlassCard className="bg-red-500/10 border-red-500/20">
                <p className="text-red-400 font-bold">{error}</p>
            </GlassCard>
        );
    }

    const { progress, submissions } = progressData;

    // Calculate content type statistics
    const videoCount = progress.completedVideos?.length || 0;
    const exerciseCount = progress.completedExercises?.length || 0;
    const practiceCount = progress.completedPractices?.length || 0;
    const quizCount = progress.completedQuizzes?.length || 0;

    // Calculate best scores
    const exerciseBestScores = progress.completedExercises?.map(ex => ({
        title: ex.content?.title || 'Exercise',
        score: ex.bestScore,
        attempts: ex.attempts
    })) || [];

    const quizBestScores = progress.completedQuizzes?.map(quiz => ({
        title: quiz.content?.title || 'Quiz',
        score: quiz.bestScore,
        isPassing: quiz.isPassing,
        attempts: quiz.attempts
    })) || [];

    const overallProgress = progress.courseProgress || 0;

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'exercise':
                return <Code size={16} className="text-blue-400" />;
            case 'practice':
                return <FileText size={16} className="text-purple-400" />;
            case 'quiz':
                return <ClipboardCheck size={16} className="text-emerald-400" />;
            default:
                return <FileText size={16} className="text-slate-400" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeSpent = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Overall Progress Card */}
            <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary-purple/10 border-primary/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary/20 rounded-xl">
                            <TrendingUp size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white font-poppins">
                                Overall Progress
                            </h2>
                            <p className="text-sm text-slate-400 font-bold">
                                Weighted average across all content types
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-extrabold text-primary font-poppins">
                            {overallProgress.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Completion
                        </p>
                    </div>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary-purple rounded-full transition-all duration-1000"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>

                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Videos */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                            <Video size={16} className="text-red-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Videos
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-poppins">
                            {videoCount}
                        </div>
                        <p className="text-xs text-slate-500 font-bold">
                            40% weight
                        </p>
                    </div>

                    {/* Exercises */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                            <Code size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Exercises
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-poppins">
                            {exerciseCount}
                        </div>
                        <p className="text-xs text-slate-500 font-bold">
                            20% weight
                        </p>
                    </div>

                    {/* Practices */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                            <FileText size={16} className="text-purple-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Practices
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-poppins">
                            {practiceCount}
                        </div>
                        <p className="text-xs text-slate-500 font-bold">
                            15% weight
                        </p>
                    </div>

                    {/* Quizzes */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                            <ClipboardCheck size={16} className="text-emerald-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Quizzes
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-poppins">
                            {quizCount}
                        </div>
                        <p className="text-xs text-slate-500 font-bold">
                            25% weight
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Best Scores Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exercise Scores */}
                {exerciseBestScores.length > 0 && (
                    <GlassCard className="border-blue-500/20">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Code size={20} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-extrabold text-white font-poppins">
                                Exercise Best Scores
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {exerciseBestScores.map((exercise, index) => (
                                <div 
                                    key={index}
                                    className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">
                                            {exercise.title}
                                        </p>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {exercise.attempts} attempt{exercise.attempts !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-extrabold text-blue-400 font-poppins">
                                            {exercise.score.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* Quiz Scores */}
                {quizBestScores.length > 0 && (
                    <GlassCard className="border-emerald-500/20">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <ClipboardCheck size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-extrabold text-white font-poppins">
                                Quiz Best Scores
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {quizBestScores.map((quiz, index) => (
                                <div 
                                    key={index}
                                    className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-bold text-white">
                                                {quiz.title}
                                            </p>
                                            {quiz.isPassing ? (
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                                                    PASSED
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                    FAILED
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl font-extrabold font-poppins ${
                                            quiz.isPassing ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {quiz.score.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Submission History */}
            {submissions && submissions.length > 0 && (
                <GlassCard className="border-white/10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Clock size={20} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-extrabold text-white font-poppins">
                            Submission History
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {submissions.map((submission) => (
                            <div 
                                key={submission._id}
                                className="border border-white/10 rounded-lg overflow-hidden bg-white/5"
                            >
                                <button
                                    onClick={() => setExpandedSubmission(
                                        expandedSubmission === submission._id ? null : submission._id
                                    )}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="p-2 bg-white/10 rounded-lg">
                                            {getContentTypeIcon(submission.contentType)}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-bold text-white">
                                                {submission.content?.title || 'Untitled'}
                                            </p>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <p className="text-xs text-slate-400 font-bold flex items-center">
                                                    <Calendar size={12} className="mr-1" />
                                                    {formatDate(submission.submittedAt)}
                                                </p>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Attempt #{submission.attemptNumber}
                                                </p>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    {formatTimeSpent(submission.timeSpent)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-extrabold font-poppins ${
                                                submission.score >= 70 ? 'text-emerald-400' : 
                                                submission.score >= 50 ? 'text-yellow-400' : 
                                                'text-red-400'
                                            }`}>
                                                {submission.score.toFixed(0)}%
                                            </div>
                                            {submission.status === 'needs-review' && (
                                                <span className="text-xs text-yellow-400 font-bold">
                                                    Pending Review
                                                </span>
                                            )}
                                            {submission.contentType === 'quiz' && (
                                                <div className="mt-1">
                                                    {submission.isPassing ? (
                                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                                                            PASSED
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                            FAILED
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {expandedSubmission === submission._id ? (
                                                <ChevronUp size={20} className="text-slate-400" />
                                            ) : (
                                                <ChevronDown size={20} className="text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {expandedSubmission === submission._id && (
                                    <div className="p-4 border-t border-white/10 bg-black/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                    Status
                                                </p>
                                                <p className="text-sm text-white font-bold capitalize">
                                                    {submission.status.replace('-', ' ')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                    Max Score
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {submission.maxScore} points
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                    Started At
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {formatDate(submission.startedAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                    Submitted At
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {formatDate(submission.submittedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {submission.feedback && (
                                            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                                    Instructor Feedback
                                                </p>
                                                <p className="text-sm text-white">
                                                    {submission.feedback}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex space-x-3 mt-4">
                                            <ModernButton 
                                                variant="secondary" 
                                                className="flex-1 !py-2 text-sm"
                                                onClick={() => {
                                                    // Navigate to submission details
                                                    window.location.href = `/dashboard/submissions/${submission._id}`;
                                                }}
                                            >
                                                View Details
                                            </ModernButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {(!submissions || submissions.length === 0) && (
                <GlassCard className="border-white/10 text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <Target size={32} className="text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-poppins mb-2">
                                No Submissions Yet
                            </h3>
                            <p className="text-sm text-slate-400">
                                Start completing exercises, practices, and quizzes to track your progress.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default ProgressDashboard;
