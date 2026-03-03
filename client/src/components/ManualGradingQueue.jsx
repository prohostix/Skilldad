import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Clock,
    CheckCircle,
    User,
    FileText,
    Send,
    AlertCircle,
    Calendar,
    Award
} from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

const ManualGradingQueue = ({ courseId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(false);
    const [error, setError] = useState(null);
    const [grades, setGrades] = useState({});
    const [feedback, setFeedback] = useState({});
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchPendingSubmissions();
            fetchGradingStats();
        }
    }, [courseId]);

    const fetchPendingSubmissions = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            const { data } = await axios.get(`/api/grading/pending/${courseId}`, config);
            setSubmissions(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError(err.response?.data?.message || 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchGradingStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            const { data } = await axios.get(`/api/grading/stats/${courseId}`, config);
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleSelectSubmission = (submission) => {
        setSelectedSubmission(submission);
        
        // Initialize grades and feedback for subjective questions
        const initialGrades = {};
        const initialFeedback = {};
        
        submission.answers.forEach((answer, index) => {
            const question = submission.content.questions[index];
            if (question.type === 'code-submission' || question.type === 'essay') {
                initialGrades[index] = answer.pointsEarned || 0;
                initialFeedback[index] = answer.feedback || '';
            }
        });
        
        setGrades(initialGrades);
        setFeedback(initialFeedback);
    };

    const handleGradeChange = (questionIndex, value) => {
        const question = selectedSubmission.content.questions[questionIndex];
        const numValue = parseFloat(value);
        
        // Validate points are within range
        if (numValue < 0 || numValue > question.points) {
            return;
        }
        
        setGrades(prev => ({
            ...prev,
            [questionIndex]: numValue
        }));
    };

    const handleFeedbackChange = (questionIndex, value) => {
        setFeedback(prev => ({
            ...prev,
            [questionIndex]: value
        }));
    };

    const handleSubmitGrades = async () => {
        try {
            setGrading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            // Submit grades for each subjective question
            const gradePromises = Object.entries(grades).map(([questionIndex, points]) => {
                return axios.post(`/api/grading/grade/${selectedSubmission._id}`, {
                    questionIndex: parseInt(questionIndex),
                    pointsEarned: points,
                    feedback: feedback[questionIndex] || ''
                }, config);
            });

            await Promise.all(gradePromises);

            // Refresh submissions list
            await fetchPendingSubmissions();
            await fetchGradingStats();
            
            setSelectedSubmission(null);
            setGrades({});
            setFeedback({});
            setError(null);
        } catch (err) {
            console.error('Error submitting grades:', err);
            setError(err.response?.data?.message || 'Failed to submit grades');
        } finally {
            setGrading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getSubjectiveQuestions = (submission) => {
        return submission.content.questions.filter(
            q => q.type === 'code-submission' || q.type === 'essay'
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Pending</p>
                                <p className="text-3xl font-extrabold text-yellow-400 font-poppins mt-1">
                                    {stats.pendingCount || 0}
                                </p>
                            </div>
                            <Clock size={32} className="text-yellow-400" />
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Graded Today</p>
                                <p className="text-3xl font-extrabold text-emerald-400 font-poppins mt-1">
                                    {stats.gradedToday || 0}
                                </p>
                            </div>
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Avg Time</p>
                                <p className="text-3xl font-extrabold text-blue-400 font-poppins mt-1">
                                    {stats.avgGradingTime ? `${Math.round(stats.avgGradingTime)}m` : 'N/A'}
                                </p>
                            </div>
                            <Award size={32} className="text-blue-400" />
                        </div>
                    </GlassCard>
                </div>
            )}

            {error && (
                <GlassCard className="bg-red-500/10 border-red-500/20">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={20} className="text-red-400" />
                        <p className="text-red-400 font-bold text-sm">{error}</p>
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submissions List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-white font-poppins">
                        Pending Submissions ({submissions.length})
                    </h2>
                    
                    {submissions.length === 0 ? (
                        <GlassCard className="text-center py-12">
                            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">All Caught Up!</h3>
                            <p className="text-slate-400 text-sm">No pending submissions to grade</p>
                        </GlassCard>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((submission) => {
                                const subjectiveCount = getSubjectiveQuestions(submission).length;
                                
                                return (
                                    <GlassCard
                                        key={submission._id}
                                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                                            selectedSubmission?._id === submission._id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-white/10'
                                        }`}
                                        onClick={() => handleSelectSubmission(submission)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <User size={16} className="text-primary" />
                                                    <span className="text-white font-bold">
                                                        {submission.student?.name || 'Unknown Student'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                                                    <FileText size={14} />
                                                    <span>{submission.content?.title}</span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(submission.submittedAt)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg">
                                                    {subjectiveCount} to grade
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Grading Panel */}
                <div>
                    {selectedSubmission ? (
                        <GlassCard className="sticky top-4">
                            <h2 className="text-xl font-extrabold text-white font-poppins mb-4">
                                Grade Submission
                            </h2>
                            
                            {/* Student Info */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <User size={20} className="text-primary" />
                                    <span className="text-white font-bold">
                                        {selectedSubmission.student?.name}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-400">
                                    <p>{selectedSubmission.content?.title}</p>
                                    <p className="text-xs mt-1">
                                        Submitted: {formatDate(selectedSubmission.submittedAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Questions to Grade */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {selectedSubmission.content.questions.map((question, index) => {
                                    if (question.type !== 'code-submission' && question.type !== 'essay') {
                                        return null;
                                    }

                                    const answer = selectedSubmission.answers[index];

                                    return (
                                        <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-white font-bold">Question {index + 1}</h3>
                                                <span className="text-xs text-slate-400 font-bold">
                                                    Max: {question.points} points
                                                </span>
                                            </div>
                                            
                                            <p className="text-slate-300 text-sm mb-3">{question.questionText}</p>
                                            
                                            {/* Student Answer */}
                                            <div className="mb-3">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                                    Student Answer:
                                                </p>
                                                <div className="p-3 bg-black/40 rounded-lg border border-white/10">
                                                    <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                                                        {answer.answer}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Grading Inputs */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                                        Points Earned
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={question.points}
                                                        step="0.5"
                                                        value={grades[index] || 0}
                                                        onChange={(e) => handleGradeChange(index, e.target.value)}
                                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                                        Feedback
                                                    </label>
                                                    <textarea
                                                        value={feedback[index] || ''}
                                                        onChange={(e) => handleFeedbackChange(index, e.target.value)}
                                                        rows="3"
                                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                                        placeholder="Provide feedback to the student..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <ModernButton
                                    onClick={handleSubmitGrades}
                                    disabled={grading}
                                    className="w-full !py-3"
                                >
                                    <Send size={20} className="mr-2" />
                                    {grading ? 'Submitting Grades...' : 'Submit Grades'}
                                </ModernButton>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="text-center py-12">
                            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Select a Submission</h3>
                            <p className="text-slate-400 text-sm">
                                Choose a submission from the list to start grading
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualGradingQueue;
