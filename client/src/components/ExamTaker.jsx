import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
    Clock, AlertTriangle, CheckCircle, Upload, Download, 
    Wifi, WifiOff, Save, Send, ChevronLeft, ChevronRight 
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import QuestionDisplay from './QuestionDisplay';
import { useToast } from '../context/ToastContext';

const ExamTaker = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [exam, setExam] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [answerSheetFile, setAnswerSheetFile] = useState(null);
    const [uploadingAnswerSheet, setUploadingAnswerSheet] = useState(false);
    
    const socketRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    // Initialize exam
    useEffect(() => {
        startExam();
        
        // Prevent page navigation during exam
        const handleBeforeUnload = (e) => {
            if (submission && submission.status === 'in-progress') {
                e.preventDefault();
                e.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [examId]);

    // Setup WebSocket connection
    useEffect(() => {
        if (submission && exam) {
            setupWebSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [submission, exam]);

    const setupWebSocket = () => {
        const socketUrl = import.meta.env.VITE_API_URL || 'https://skilldad-server.onrender.com';
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        socketRef.current = io(socketUrl, {
            auth: { token: userInfo.token }
        });

        socketRef.current.on('connect', () => {
            console.log('[ExamTaker] WebSocket connected');
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
            
            // Join exam room
            socketRef.current.emit('join-exam', {
                examId: exam._id,
                studentId: userInfo._id
            });
        });

        socketRef.current.on('disconnect', () => {
            console.log('[ExamTaker] WebSocket disconnected');
            setIsConnected(false);
            showToast('Connection lost. Answers will be saved via backup method.', 'warning');
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('[ExamTaker] Connection error:', error);
            setIsConnected(false);
            
            // Attempt reconnection with exponential backoff
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current++;
                
                setTimeout(() => {
                    console.log(`[ExamTaker] Reconnection attempt ${reconnectAttemptsRef.current}`);
                    socketRef.current.connect();
                }, delay);
            }
        });

        // Listen for time updates
        socketRef.current.on('time-remaining', (data) => {
            if (data.examId === exam._id) {
                setTimeRemaining(data.timeRemaining);
            }
        });

        // Listen for warnings
        socketRef.current.on('time-warning', (data) => {
            showToast(data.message, 'warning');
        });

        // Listen for auto-submit
        socketRef.current.on('auto-submit', async (data) => {
            if (data.examId === exam._id) {
                showToast('Time expired! Your exam is being submitted automatically.', 'error');
                await handleAutoSubmit();
            }
        });
    };

    const startExam = async () => {
        setLoading(true);
        try {
            // Check access
            const accessResponse = await axios.get(`/api/exams/${examId}/access`, getAuthConfig());
            
            if (!accessResponse.data.data.canAccess) {
                showToast(accessResponse.data.data.reason, 'error');
                navigate('/dashboard/exams');
                return;
            }

            // Start exam
            const startResponse = await axios.post(`/api/exams/${examId}/start`, {}, getAuthConfig());
            const { submission: newSubmission, questions: examQuestions, exam: examData, questionPaperUrl } = startResponse.data.data;
            
            setExam(examData);
            setSubmission(newSubmission);
            setTimeRemaining(accessResponse.data.data.timeRemaining);
            
            if (examData.examType === 'pdf-based') {
                // For PDF exams, store the question paper URL
                setExam(prev => ({ ...prev, questionPaperUrl }));
            } else {
                // For online exams, load questions
                setQuestions(examQuestions || []);
                
                // Initialize answers from existing submission
                if (newSubmission.answers && newSubmission.answers.length > 0) {
                    const existingAnswers = {};
                    newSubmission.answers.forEach(answer => {
                        existingAnswers[answer.question] = {
                            selectedOption: answer.selectedOption,
                            textAnswer: answer.textAnswer
                        };
                    });
                    setAnswers(existingAnswers);
                }
            }
        } catch (error) {
            console.error('Error starting exam:', error);
            const errorMessage = error.response?.data?.message || 'Error starting exam. Please try again.';
            showToast(errorMessage, 'error');
            
            // If it's a network error, offer retry
            if (!error.response) {
                showToast('Network error. Please check your connection and try again.', 'error');
            }
            
            navigate('/dashboard/exams');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));

        // Auto-save with debounce
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            saveAnswer(questionId, answer);
        }, 1000);
    };

    const saveAnswer = async (questionId, answer) => {
        try {
            await axios.post(
                `/api/exam-submissions/${submission._id}/answer`,
                {
                    questionId,
                    ...answer
                },
                getAuthConfig()
            );
        } catch (error) {
            console.error('Error saving answer:', error);
            // Don't show error toast for auto-save failures to avoid disrupting the exam
        }
    };

    const handleAnswerSheetUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            showToast('Please upload a PDF or image file (PDF, JPG, PNG)', 'error');
            e.target.value = ''; // Reset file input
            return;
        }

        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            showToast(`File size must be less than 20MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`, 'error');
            e.target.value = ''; // Reset file input
            return;
        }

        setAnswerSheetFile(file);
        setUploadingAnswerSheet(true);

        try {
            const formData = new FormData();
            formData.append('answerSheet', file);

            await axios.post(
                `/api/exam-submissions/${submission._id}/answer-sheet`,
                formData,
                {
                    ...getAuthConfig(),
                    headers: {
                        ...getAuthConfig().headers,
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 60000 // 60 second timeout for large files
                }
            );

            showToast('Answer sheet uploaded successfully', 'success');
        } catch (error) {
            console.error('Error uploading answer sheet:', error);
            
            let errorMessage = 'Error uploading answer sheet';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Upload timeout. Please check your connection and try again.';
            } else if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            showToast(errorMessage, 'error');
            setAnswerSheetFile(null);
            e.target.value = ''; // Reset file input for retry
        } finally {
            setUploadingAnswerSheet(false);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(
                `/api/exam-submissions/${submission._id}/submit`,
                { isAutoSubmit: false },
                getAuthConfig()
            );

            showToast('Exam submitted successfully!', 'success');
            
            // Disconnect WebSocket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Navigate to confirmation page
            navigate(`/dashboard/exam/${examId}/submitted`);
        } catch (error) {
            console.error('Error submitting exam:', error);
            
            let errorMessage = 'Error submitting exam';
            
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
                
                // Handle specific error cases
                if (error.response.status === 400) {
                    errorMessage = 'Cannot submit exam. ' + errorMessage;
                } else if (error.response.status === 403) {
                    errorMessage = 'Not authorized to submit this exam.';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Your answers are saved. Please try submitting again.';
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutoSubmit = async () => {
        try {
            await axios.post(
                `/api/exam-submissions/${submission._id}/submit`,
                { isAutoSubmit: true },
                getAuthConfig()
            );

            // Disconnect WebSocket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Navigate to confirmation page
            navigate(`/dashboard/exam/${examId}/submitted`);
        } catch (error) {
            console.error('Error auto-submitting exam:', error);
        }
    };

    const downloadQuestionPaper = () => {
        if (exam.questionPaperUrl) {
            window.open(exam.questionPaperUrl, '_blank');
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (timeRemaining <= 60) return 'text-red-500';
        if (timeRemaining <= 300) return 'text-amber-500';
        return 'text-emerald-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/50">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!exam || !submission) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <GlassCard className="p-8 text-center">
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Error Loading Exam</h3>
                    <p className="text-white/50 mb-4">Unable to load exam details</p>
                    <ModernButton onClick={() => navigate('/dashboard/exams')}>
                        Back to Exams
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Header with Timer and Connection Status */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-wider">{exam.title}</h1>
                            <p className="text-xs text-white/50 mt-1">{exam.course?.title}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                                <span className="text-[10px] font-bold uppercase">
                                    {isConnected ? 'Connected' : 'Offline'}
                                </span>
                            </div>

                            {/* Timer */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 ${getTimeColor()}`}>
                                <Clock size={20} />
                                <span className="text-2xl font-black tabular-nums">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto pt-24 pb-8">
                {exam.examType === 'pdf-based' ? (
                    /* PDF-based Exam */
                    <GlassCard className="p-8">
                        <div className="text-center space-y-6">
                            <div className="p-4 bg-primary/10 rounded-xl inline-block">
                                <Download size={48} className="text-primary" />
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2">Download Question Paper</h2>
                                <p className="text-white/60">Download the question paper, solve it, and upload your answer sheet</p>
                            </div>

                            <ModernButton
                                onClick={downloadQuestionPaper}
                                className="!bg-primary hover:!bg-primary-dark"
                            >
                                <Download size={16} className="mr-2" />
                                Download Question Paper
                            </ModernButton>

                            <div className="border-t border-white/10 pt-6 mt-6">
                                <h3 className="text-lg font-bold text-white mb-4">Upload Answer Sheet</h3>
                                
                                <div className="max-w-md mx-auto">
                                    <label className="block">
                                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer">
                                            <Upload size={32} className="mx-auto text-white/40 mb-2" />
                                            <p className="text-sm text-white/60 mb-1">
                                                {answerSheetFile ? answerSheetFile.name : 'Click to upload answer sheet'}
                                            </p>
                                            <p className="text-xs text-white/40">PDF or Image (Max 20MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleAnswerSheetUpload}
                                            disabled={uploadingAnswerSheet}
                                        />
                                    </label>

                                    {uploadingAnswerSheet && (
                                        <div className="mt-4 text-center">
                                            <div className="inline-block w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-xs text-white/50 mt-2">Uploading...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6">
                                <ModernButton
                                    onClick={handleSubmit}
                                    disabled={!answerSheetFile || isSubmitting}
                                    className="!bg-emerald-500 hover:!bg-emerald-600"
                                >
                                    <Send size={16} className="mr-2" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                </ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                ) : (
                    /* Online Exam */
                    <div className="space-y-6">
                        {/* Question Display */}
                        <GlassCard className="p-6">
                            {questions.length > 0 && (
                                <QuestionDisplay
                                    question={questions[currentQuestionIndex]}
                                    questionNumber={currentQuestionIndex + 1}
                                    totalQuestions={questions.length}
                                    answer={answers[questions[currentQuestionIndex]._id]}
                                    onAnswerChange={(answer) => handleAnswerChange(questions[currentQuestionIndex]._id, answer)}
                                />
                            )}
                        </GlassCard>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <ModernButton
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                variant="secondary"
                            >
                                <ChevronLeft size={16} className="mr-2" />
                                Previous
                            </ModernButton>

                            {/* Question Navigator */}
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                {questions.map((q, index) => (
                                    <button
                                        key={q._id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                            index === currentQuestionIndex
                                                ? 'bg-primary text-white'
                                                : answers[q._id]
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-white/5 text-white/40 border border-white/10'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <ModernButton
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="!bg-emerald-500 hover:!bg-emerald-600"
                                >
                                    <Send size={16} className="mr-2" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                </ModernButton>
                            ) : (
                                <ModernButton
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-2" />
                                </ModernButton>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamTaker;
