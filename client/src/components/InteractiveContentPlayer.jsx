import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RotateCcw,
    Send,
    Lightbulb,
    Trophy,
    Target
} from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import { useUser } from '../context/UserContext';

const InteractiveContentPlayer = ({ contentId, onComplete }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    // State management
    const [content, setContent] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [showSolutions, setShowSolutions] = useState(false);

    useEffect(() => {
        fetchContent();
    }, [contentId]);

    // Timer effect
    useEffect(() => {
        if (content?.timeLimit && timeRemaining !== null && timeRemaining > 0 && !submission) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining, content, submission]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            // Fetch content details
            const { data } = await axios.get(`/api/courses/content/${contentId}`, config);
            setContent(data);

            // Initialize answers
            const initialAnswers = {};
            data.questions.forEach((q, index) => {
                initialAnswers[index] = q.type === 'multiple-choice' && q.multipleCorrect ? [] : '';
            });
            setAnswers(initialAnswers);

            // Set timer if timed content
            if (data.timeLimit) {
                setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
            }

            // Record start time
            setStartTime(Date.now());
            setError(null);
        } catch (err) {
            console.error('Error fetching content:', err);
            setError(err.response?.data?.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: value
        }));
    };

    const handleMultipleChoiceToggle = (questionIndex, option) => {
        setAnswers(prev => {
            const current = prev[questionIndex] || [];
            const newValue = current.includes(option)
                ? current.filter(o => o !== option)
                : [...current, option];
            return { ...prev, [questionIndex]: newValue };
        });
    };

    const handleAutoSubmit = () => {
        handleSubmit(true);
    };

    const handleSubmit = async (autoSubmit = false) => {
        try {
            setSubmitting(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            // Calculate time spent
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            // Format answers for submission
            const formattedAnswers = content.questions.map((q, index) => ({
                questionId: q._id || index,
                answer: answers[index]
            }));

            const { data } = await axios.post('/api/submissions', {
                contentId: content._id,
                answers: formattedAnswers,
                timeSpent,
                startedAt: new Date(startTime)
            }, config);

            setSubmission(data);

            // Show solutions if configured
            if (content.showSolutionAfter === 'immediate' || content.showSolutionAfter === 'submission') {
                setShowSolutions(true);
            }

            if (onComplete) {
                onComplete(data);
            }

            setError(null);
        } catch (err) {
            console.error('Error submitting answers:', err);
            setError(err.response?.data?.message || 'Failed to submit answers');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = async () => {
        try {
            setSubmitting(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.post(`/api/submissions/${submission._id}/retry`, {}, config);

            // Reset state
            setSubmission(null);
            setShowSolutions(false);
            const initialAnswers = {};
            content.questions.forEach((q, index) => {
                initialAnswers[index] = q.type === 'multiple-choice' && q.multipleCorrect ? [] : '';
            });
            setAnswers(initialAnswers);

            // Reset timer
            if (content.timeLimit) {
                setTimeRemaining(content.timeLimit * 60);
            }
            setStartTime(Date.now());
            setError(null);
        } catch (err) {
            console.error('Error retrying:', err);
            setError(err.response?.data?.message || 'Failed to retry');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderQuestion = (question, index) => {
        const answer = answers[index];
        const isSubmitted = !!submission;
        const questionResult = submission?.answers?.[index];

        return (
            <div key={index} className="p-6 bg-white/5 rounded-xl border border-white/10">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-lg">
                                Question {index + 1}
                            </span>
                            <span className="text-xs text-slate-400 font-bold uppercase">
                                {question.type.replace('-', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                                {question.points} {question.points === 1 ? 'point' : 'points'}
                            </span>
                        </div>
                        <p className="text-white font-medium text-lg">{question.questionText}</p>
                    </div>
                    {isSubmitted && questionResult && (
                        <div className="ml-4">
                            {questionResult.isCorrect ? (
                                <CheckCircle size={24} className="text-emerald-400" />
                            ) : questionResult.pointsEarned !== undefined ? (
                                <XCircle size={24} className="text-red-400" />
                            ) : (
                                <Clock size={24} className="text-yellow-400" />
                            )}
                        </div>
                    )}
                </div>

                {/* Question Input */}
                <div className="mt-4">
                    {question.type === 'multiple-choice' && (
                        <div className="space-y-3">
                            {question.options.map((option, optIndex) => (
                                <label
                                    key={optIndex}
                                    className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${question.multipleCorrect
                                            ? answer?.includes(option)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/10 hover:border-white/20'
                                            : answer === option
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/10 hover:border-white/20'
                                        } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <input
                                        type={question.multipleCorrect ? 'checkbox' : 'radio'}
                                        name={`question-${index}`}
                                        value={option}
                                        checked={question.multipleCorrect ? answer?.includes(option) : answer === option}
                                        onChange={() => {
                                            if (!isSubmitted) {
                                                if (question.multipleCorrect) {
                                                    handleMultipleChoiceToggle(index, option);
                                                } else {
                                                    handleAnswerChange(index, option);
                                                }
                                            }
                                        }}
                                        disabled={isSubmitted}
                                        className="mr-3"
                                    />
                                    <span className="text-white font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {question.type === 'true-false' && (
                        <div className="space-y-3">
                            {['True', 'False'].map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${answer === option
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/10 hover:border-white/20'
                                        } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answer === option}
                                        onChange={(e) => !isSubmitted && handleAnswerChange(index, e.target.value)}
                                        disabled={isSubmitted}
                                        className="mr-3"
                                    />
                                    <span className="text-white font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {question.type === 'short-answer' && (
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => !isSubmitted && handleAnswerChange(index, e.target.value)}
                            disabled={isSubmitted}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                            placeholder="Type your answer here..."
                        />
                    )}

                    {question.type === 'code-submission' && (
                        <textarea
                            value={answer}
                            onChange={(e) => !isSubmitted && handleAnswerChange(index, e.target.value)}
                            disabled={isSubmitted}
                            rows="10"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                            placeholder={`// Write your ${question.language || 'code'} here...`}
                        />
                    )}

                    {question.type === 'essay' && (
                        <textarea
                            value={answer}
                            onChange={(e) => !isSubmitted && handleAnswerChange(index, e.target.value)}
                            disabled={isSubmitted}
                            rows="8"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                            placeholder="Write your essay here..."
                        />
                    )}
                </div>

                {/* Feedback */}
                {isSubmitted && questionResult && (
                    <div className="mt-4">
                        {questionResult.feedback && (
                            <div className={`p-4 rounded-lg ${questionResult.isCorrect
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : questionResult.pointsEarned !== undefined
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-yellow-500/10 border border-yellow-500/20'
                                }`}>
                                <p className={`text-sm font-medium ${questionResult.isCorrect
                                        ? 'text-emerald-400'
                                        : questionResult.pointsEarned !== undefined
                                            ? 'text-red-400'
                                            : 'text-yellow-400'
                                    }`}>
                                    {questionResult.feedback}
                                </p>
                            </div>
                        )}

                        {questionResult.pointsEarned !== undefined && (
                            <div className="mt-2 text-sm text-slate-400 font-bold">
                                Score: {questionResult.pointsEarned} / {question.points} points
                            </div>
                        )}
                    </div>
                )}

                {/* Solution */}
                {showSolutions && question.solution && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Lightbulb size={16} className="text-blue-400" />
                            <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                Solution
                            </span>
                        </div>
                        <p className="text-white text-sm">{question.solution}</p>
                        {question.explanation && (
                            <p className="text-slate-300 text-sm mt-2">{question.explanation}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !content) {
        return (
            <GlassCard className="bg-red-500/10 border-red-500/20">
                <div className="flex items-center space-x-3">
                    <AlertCircle size={24} className="text-red-400" />
                    <p className="text-red-400 font-bold">{error}</p>
                </div>
            </GlassCard>
        );
    }

    const attemptsRemaining = content.attemptLimit === -1
        ? 'Unlimited'
        : content.attemptLimit - (submission?.attemptNumber || 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary-purple/10 border-primary/20">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded uppercase tracking-wider">
                                {content.contentType}
                            </span>
                            {content.timeLimit && (
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Clock size={14} />
                                    <span className="text-xs font-bold">
                                        {content.timeLimit} min limit
                                    </span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-extrabold text-white font-poppins mb-2">
                            {content.title}
                        </h1>
                        {content.description && (
                            <p className="text-slate-300 text-sm">{content.description}</p>
                        )}
                    </div>
                    {timeRemaining !== null && !submission && (
                        <div className={`text-right ${timeRemaining < 60 ? 'animate-pulse' : ''}`}>
                            <div className={`text-3xl font-extrabold font-poppins ${timeRemaining < 60 ? 'text-red-400' : 'text-primary'
                                }`}>
                                {formatTime(timeRemaining)}
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                Time Remaining
                            </p>
                        </div>
                    )}
                </div>

                {content.instructions && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-300">{content.instructions}</p>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center space-x-4">
                        <span className="text-slate-400 font-bold">
                            {content.questions.length} {content.questions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                        {!submission && (
                            <span className="text-slate-400 font-bold">
                                Attempts: {attemptsRemaining}
                            </span>
                        )}
                    </div>
                    {submission && (
                        <div className="flex items-center space-x-2">
                            <span className="text-slate-400 font-bold">
                                Attempt #{submission.attemptNumber}
                            </span>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Questions */}
            <div className="space-y-4">
                {content.questions.map((question, index) => renderQuestion(question, index))}
            </div>

            {/* Submission Result */}
            {submission && (
                <GlassCard className={`border-2 ${submission.isPassing
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : submission.status === 'needs-review'
                            ? 'border-yellow-500/50 bg-yellow-500/5'
                            : 'border-red-500/50 bg-red-500/5'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {submission.isPassing ? (
                                <Trophy size={32} className="text-emerald-400" />
                            ) : submission.status === 'needs-review' ? (
                                <Clock size={32} className="text-yellow-400" />
                            ) : (
                                <Target size={32} className="text-red-400" />
                            )}
                            <div>
                                <h3 className="text-xl font-extrabold text-white font-poppins">
                                    {submission.isPassing
                                        ? 'Congratulations! You Passed!'
                                        : submission.status === 'needs-review'
                                            ? 'Submission Under Review'
                                            : 'Keep Trying!'}
                                </h3>
                                <p className="text-slate-400 text-sm font-bold">
                                    {submission.status === 'needs-review'
                                        ? 'Your submission is being reviewed by the instructor'
                                        : `You scored ${submission.score.toFixed(1)}%`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-extrabold font-poppins ${submission.isPassing
                                    ? 'text-emerald-400'
                                    : submission.status === 'needs-review'
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                }`}>
                                {submission.score.toFixed(0)}%
                            </div>
                            {content.contentType === 'quiz' && content.passingScore && (
                                <p className="text-xs text-slate-400 font-bold">
                                    Passing: {content.passingScore}%
                                </p>
                            )}
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
                {!submission ? (
                    <ModernButton
                        onClick={() => handleSubmit(false)}
                        disabled={submitting || Object.values(answers).some(a => !a || (Array.isArray(a) && a.length === 0))}
                        className="flex-1 !py-4"
                    >
                        <Send size={20} className="mr-2" />
                        {submitting ? 'Submitting...' : 'Submit Answers'}
                    </ModernButton>
                ) : (
                    <>
                        {(content.attemptLimit === -1 || submission.attemptNumber < content.attemptLimit) && (
                            <ModernButton
                                onClick={handleRetry}
                                disabled={submitting}
                                variant="secondary"
                                className="flex-1 !py-4"
                            >
                                <RotateCcw size={20} className="mr-2" />
                                {submitting ? 'Processing...' : 'Try Again'}
                            </ModernButton>
                        )}
                        <ModernButton
                            onClick={() => navigate(-1)}
                            variant="secondary"
                            className="flex-1 !py-4"
                        >
                            Back to Course
                        </ModernButton>
                    </>
                )}
            </div>

            {error && (
                <GlassCard className="bg-red-500/10 border-red-500/20">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={20} className="text-red-400" />
                        <p className="text-red-400 font-bold text-sm">{error}</p>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default InteractiveContentPlayer;
