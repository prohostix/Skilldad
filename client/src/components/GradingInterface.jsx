import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Filter, Search, Eye, FileText, CheckCircle, 
    Clock, Award, AlertCircle, Zap, Download 
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const GradingInterface = ({ examId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [statusFilter, setStatusFilter] = useState('submitted');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(false);
    const [autoGrading, setAutoGrading] = useState(false);
    const [gradingData, setGradingData] = useState({});
    const [overallFeedback, setOverallFeedback] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchSubmissions();
    }, [examId, statusFilter]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.get(
                `/api/submissions/exam/${examId}?status=${statusFilter}`,
                config
            );
            setSubmissions(response.data.submissions || response.data);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            
            let errorMessage = 'Failed to fetch submissions';
            
            if (err.response) {
                errorMessage = err.response.data?.message || errorMessage;
                
                if (err.response.status === 403) {
                    errorMessage = 'Not authorized to view submissions for this exam.';
                } else if (err.response.status === 404) {
                    errorMessage = 'Exam not found.';
                }
            } else if (err.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoGrade = async () => {
        if (!window.confirm('Auto-grade all MCQ questions for this exam?')) return;

        setAutoGrading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.post(
                `/api/exams/${examId}/auto-grade`,
                {},
                config
            );
            
            showToast(`Auto-graded ${response.data.gradedCount} submissions`, 'success');
            fetchSubmissions();
        } catch (err) {
            showToast(err.response?.data?.message || 'Auto-grading failed', 'error');
        } finally {
            setAutoGrading(false);
        }
    };

    const handleSelectSubmission = async (submission) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.get(
                `/api/submissions/${submission._id}`,
                config
            );
            
            setSelectedSubmission(response.data);
            
            // Initialize grading data
            const initialGradingData = {};
            response.data.answers.forEach(answer => {
                initialGradingData[answer.question._id] = {
                    marksAwarded: answer.marksAwarded || 0,
                    feedback: answer.feedback || ''
                };
            });
            setGradingData(initialGradingData);
            setOverallFeedback(response.data.overallFeedback || '');
        } catch (err) {
            showToast('Failed to load submission details', 'error');
        }
    };

    const handleGradeChange = (questionId, field, value) => {
        setGradingData(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value
            }
        }));
    };

    const handleSubmitGrading = async () => {
        if (!selectedSubmission) return;

        // Validate all questions have marks
        const allQuestionsGraded = selectedSubmission.answers.every(answer => {
            const grading = gradingData[answer.question._id];
            return grading && grading.marksAwarded !== undefined && grading.marksAwarded !== null;
        });

        if (!allQuestionsGraded) {
            showToast('Please assign marks to all questions before submitting', 'error');
            return;
        }

        // Validate marks are within valid range
        const invalidMarks = selectedSubmission.answers.find(answer => {
            const grading = gradingData[answer.question._id];
            const maxMarks = answer.question.marks;
            return grading && (grading.marksAwarded < 0 || grading.marksAwarded > maxMarks);
        });

        if (invalidMarks) {
            showToast(`Invalid marks for a question. Marks must be between 0 and ${invalidMarks.question.marks}`, 'error');
            return;
        }

        setGrading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const gradingPayload = {
                answers: selectedSubmission.answers.map(answer => ({
                    questionId: answer.question._id,
                    marksAwarded: parseFloat(gradingData[answer.question._id].marksAwarded),
                    feedback: gradingData[answer.question._id].feedback || ''
                })),
                overallFeedback
            };

            await axios.post(
                `/api/submissions/${selectedSubmission._id}/grade`,
                gradingPayload,
                config
            );

            showToast('Grading submitted successfully', 'success');
            setSelectedSubmission(null);
            setGradingData({});
            setOverallFeedback('');
            fetchSubmissions();
        } catch (err) {
            console.error('Error submitting grading:', err);
            
            let errorMessage = 'Failed to submit grading';
            
            if (err.response) {
                errorMessage = err.response.data?.message || errorMessage;
                
                if (err.response.status === 400) {
                    errorMessage = 'Invalid grading data. ' + errorMessage;
                } else if (err.response.status === 403) {
                    errorMessage = 'Not authorized to grade this submission.';
                } else if (err.response.status === 404) {
                    errorMessage = 'Submission not found.';
                }
            } else if (err.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setGrading(false);
        }
    };

    const handleViewAnswerSheet = (url) => {
        window.open(url, '_blank');
    };

    const filteredSubmissions = submissions.filter(sub =>
        sub.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Grading Interface</h3>
                        <p className="text-sm text-white/50">
                            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <ModernButton
                        onClick={handleAutoGrade}
                        disabled={autoGrading}
                        variant="secondary"
                    >
                        <Zap size={18} className="mr-2" />
                        {autoGrading ? 'Auto-grading...' : 'Auto-grade MCQs'}
                    </ModernButton>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['submitted', 'graded'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                    statusFilter === status
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Submissions
                        </h4>
                        
                        {loading ? (
                            <div className="text-center py-8 text-white/50">Loading...</div>
                        ) : filteredSubmissions.length === 0 ? (
                            <div className="text-center py-8 text-white/30">
                                <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No submissions found</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredSubmissions.map(submission => (
                                    <motion.div
                                        key={submission._id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSelectSubmission(submission)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                                            selectedSubmission?._id === submission._id
                                                ? 'bg-primary/20 border-2 border-primary'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-white text-sm">
                                                    {submission.student?.name || 'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-white/50">
                                                    {submission.student?.email}
                                                </p>
                                            </div>
                                            {submission.status === 'graded' && (
                                                <CheckCircle size={16} className="text-green-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <Clock size={12} />
                                            {new Date(submission.submittedAt).toLocaleString()}
                                        </div>
                                        {submission.status === 'graded' && (
                                            <div className="mt-2 text-xs font-semibold text-primary">
                                                Score: {submission.obtainedMarks}/{submission.totalMarks}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Grading Panel */}
                <div className="lg:col-span-2">
                    {selectedSubmission ? (
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-xl font-bold text-white">
                                        {selectedSubmission.student?.name}
                                    </h4>
                                    <p className="text-sm text-white/50">
                                        Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                                {selectedSubmission.answerSheetUrl && (
                                    <ModernButton
                                        variant="secondary"
                                        onClick={() => handleViewAnswerSheet(selectedSubmission.answerSheetUrl)}
                                    >
                                        <Eye size={18} className="mr-2" />
                                        View Answer Sheet
                                    </ModernButton>
                                )}
                            </div>

                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                                {selectedSubmission.answers.map((answer, index) => (
                                    <div
                                        key={answer.question._id}
                                        className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl"
                                    >
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-bold">
                                                Q{index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-white mb-2">{answer.question.questionText}</p>
                                                <span className="text-xs text-white/50">
                                                    Max marks: {answer.question.marks}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Student Answer */}
                                        <div className="mb-4 p-4 bg-white/5 rounded-xl">
                                            <p className="text-xs text-white/50 mb-2">Student's Answer:</p>
                                            {answer.questionType === 'mcq' ? (
                                                <div className="space-y-2">
                                                    {answer.question.options.map((option, optIndex) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`p-2 rounded-lg ${
                                                                optIndex === answer.selectedOption
                                                                    ? option.isCorrect
                                                                        ? 'bg-green-500/20 border border-green-500/30'
                                                                        : 'bg-red-500/20 border border-red-500/30'
                                                                    : option.isCorrect
                                                                    ? 'bg-green-500/10 border border-green-500/20'
                                                                    : 'bg-white/5'
                                                            }`}
                                                        >
                                                            <span className={`text-sm ${
                                                                optIndex === answer.selectedOption
                                                                    ? option.isCorrect
                                                                        ? 'text-green-400 font-semibold'
                                                                        : 'text-red-400 font-semibold'
                                                                    : option.isCorrect
                                                                    ? 'text-green-400'
                                                                    : 'text-white/70'
                                                            }`}>
                                                                {option.text}
                                                                {optIndex === answer.selectedOption && ' (Selected)'}
                                                                {option.isCorrect && ' ✓'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-white text-sm whitespace-pre-wrap">
                                                    {answer.textAnswer || 'No answer provided'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Grading Inputs */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-white/50 mb-2">
                                                    Marks Awarded *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={answer.question.marks}
                                                    step="0.5"
                                                    value={gradingData[answer.question._id]?.marksAwarded || 0}
                                                    onChange={(e) => handleGradeChange(
                                                        answer.question._id,
                                                        'marksAwarded',
                                                        parseFloat(e.target.value)
                                                    )}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-all"
                                                    disabled={answer.questionType === 'mcq' && answer.isCorrect !== undefined}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs text-white/50 mb-2">
                                                    Feedback (Optional)
                                                </label>
                                                <textarea
                                                    value={gradingData[answer.question._id]?.feedback || ''}
                                                    onChange={(e) => handleGradeChange(
                                                        answer.question._id,
                                                        'feedback',
                                                        e.target.value
                                                    )}
                                                    placeholder="Provide feedback for this answer..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all resize-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Overall Feedback */}
                            <div className="mt-6">
                                <label className="block text-sm font-semibold text-white/70 mb-2">
                                    Overall Feedback
                                </label>
                                <textarea
                                    value={overallFeedback}
                                    onChange={(e) => setOverallFeedback(e.target.value)}
                                    placeholder="Provide overall feedback for the student..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 flex gap-4">
                                <ModernButton
                                    variant="secondary"
                                    onClick={() => setSelectedSubmission(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </ModernButton>
                                <ModernButton
                                    onClick={handleSubmitGrading}
                                    disabled={grading}
                                    className="flex-1"
                                >
                                    <Award size={18} className="mr-2" />
                                    {grading ? 'Submitting...' : 'Submit Grading'}
                                </ModernButton>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-12">
                            <div className="text-center text-white/30">
                                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-semibold">Select a submission to start grading</p>
                                <p className="text-sm mt-2">Choose a student from the list on the left</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradingInterface;
