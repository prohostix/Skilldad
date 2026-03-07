import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    Play,
    Pause,
    RotateCcw,
    FileText,
    Award,
    TrendingUp,
    Eye,
    Filter,
    Download,
    Upload,
    Activity,
    ChevronLeft,
    ChevronRight,
    Flag,
    X,
    LifeBuoy,
    Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [filter, setFilter] = useState('all');
    const [activeExam, setActiveExam] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [examStarted, setExamStarted] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

    // Mock exam data
    const mockExams = [
        {
            id: 1,
            title: "JavaScript Fundamentals Assessment",
            course: "Web Development Bootcamp",
            type: "midterm",
            duration: 90, // minutes
            totalQuestions: 25,
            passingScore: 70,
            maxAttempts: 2,
            attemptsUsed: 0,
            status: "available",
            scheduledDate: "2024-03-20",
            scheduledTime: "14:00",
            deadline: "2024-03-22",
            description: "Comprehensive assessment covering JavaScript basics, DOM manipulation, and ES6 features.",
            results: null,
            questions: [
                {
                    id: 1,
                    question: "What is the correct way to declare a variable in JavaScript?",
                    type: "multiple-choice",
                    options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
                    correctAnswer: 0
                },
                {
                    id: 2,
                    question: "Which method is used to add an element to the end of an array?",
                    type: "multiple-choice",
                    options: ["push()", "add()", "append()", "insert()"],
                    correctAnswer: 0
                }
            ]
        },
        {
            id: 2,
            title: "React Components & State",
            course: "Advanced React Development",
            type: "quiz",
            duration: 45,
            totalQuestions: 15,
            passingScore: 80,
            maxAttempts: 3,
            attemptsUsed: 1,
            status: "completed",
            scheduledDate: "2024-02-15",
            scheduledTime: "10:00",
            deadline: "2024-02-17",
            description: "Test your understanding of React components, props, and state management.",
            results: {
                score: 87,
                correctAnswers: 13,
                totalQuestions: 15,
                completedAt: "2024-02-15T10:45:00Z",
                timeSpent: 38,
                passed: true
            }
        },
        {
            id: 3,
            title: "Database Design Final Exam",
            course: "Database Management Systems",
            type: "final",
            duration: 120,
            totalQuestions: 40,
            passingScore: 75,
            maxAttempts: 1,
            attemptsUsed: 0,
            status: "scheduled",
            scheduledDate: "2024-03-25",
            scheduledTime: "09:00",
            deadline: "2024-03-25",
            description: "Final examination covering database design principles, SQL queries, and normalization.",
            results: null
        },
        {
            id: 4,
            title: "Python Programming Quiz",
            course: "Python for Data Science",
            type: "quiz",
            duration: 30,
            totalQuestions: 10,
            passingScore: 70,
            maxAttempts: 2,
            attemptsUsed: 2,
            status: "failed",
            scheduledDate: "2024-02-10",
            scheduledTime: "16:00",
            deadline: "2024-02-12",
            description: "Quick assessment on Python syntax and basic programming concepts.",
            results: {
                score: 60,
                correctAnswers: 6,
                totalQuestions: 10,
                completedAt: "2024-02-10T16:25:00Z",
                timeSpent: 25,
                passed: false
            }
        }
    ];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingPaper, setDownloadingPaper] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const socket = useSocket();

    const fetchExams = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) {
                navigate('/login');
                return;
            }
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            console.log('[Exams.jsx] Fetching exams from /api/exams/student/my-exams');
            const { data } = await axios.get('/api/exams/student/my-exams', config);
            console.log('[Exams.jsx] API Response:', data);

            // API returns { success: true, count: X, data: [...] }
            const examData = data.data || data || [];
            console.log('[Exams.jsx] Parsed exam data:', examData);
            console.log('[Exams.jsx] Number of exams:', examData.length);

            // Log each exam's questions
            examData.forEach((exam, idx) => {
                console.log(`[Exams.jsx] Exam ${idx + 1}: ${exam.title} - Questions:`, exam.questions?.length || 0, exam.questions);
            });

            setExams(Array.isArray(examData) ? examData : []);
            setLoading(false);
        } catch (err) {
            console.error('[Exams.jsx] Error fetching exams:', err);
            console.error('[Exams.jsx] Error response:', err.response?.data);
            console.error('[Exams.jsx] Error status:', err.response?.status);
            setError('Failed to sync with the academic grid. Please refresh.');
            setExams([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();

        if (socket) {
            // Listen for real-time exam scheduled notifications
            const handleExamScheduled = (data) => {
                console.log('[Exams.jsx] Received EXAM_SCHEDULED event:', data);
                showToast(`New exam scheduled: ${data.examTitle}`, 'success');
                fetchExams();
            };

            socket.on('EXAM_SCHEDULED', handleExamScheduled);
            socket.on('exam_published', (data) => {
                showToast(`New Exam Published: ${data.message}`, 'info');
                fetchExams();
            });
            socket.on('exam_update', () => {
                fetchExams();
            });

            return () => {
                socket.off('EXAM_SCHEDULED', handleExamScheduled);
                socket.off('exam_published');
                socket.off('exam_update');
            };
        }

        // Auto-refresh every 60 seconds as fallback
        const interval = setInterval(fetchExams, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [socket]);

    // Timer effect for active exam
    useEffect(() => {
        let interval;
        if (examStarted && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [examStarted, timeRemaining]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'text-green-600 bg-green-50';
            case 'scheduled': return 'text-purple-600 bg-purple-50';
            case 'completed': return 'text-emerald-600 bg-emerald-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'in-progress': return 'text-orange-600 bg-orange-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getTypeColor = (type) => {
        if (!type) return 'text-slate-600 bg-slate-50';
        switch (type.toLowerCase()) {
            case 'final': return 'text-red-600 bg-red-50';
            case 'midterm': return 'text-orange-600 bg-orange-50';
            case 'quiz': return 'text-purple-600 bg-purple-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const startExam = async (exam) => {
        try {
            console.log('[startExam] Starting exam:', exam.title);
            console.log('[startExam] Exam has questions:', exam.questions?.length || 0);
            console.log('[startExam] Questions array:', exam.questions);

            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Register attempt on backend
            const { data: submission } = await axios.post(`/api/exams/${exam._id}/start`, {}, config);

            console.log('[startExam] Submission response:', submission);
            console.log('[startExam] Submission ID:', submission?.data?.submission?._id || submission?._id);

            const submissionId = submission?.data?.submission?._id || submission?._id;

            setActiveExam({ ...exam, currentSubmissionId: submissionId });
            setCurrentQuestion(0);
            setAnswers({});
            setTimeRemaining(exam.duration * 60);
            setExamStarted(true);
        } catch (err) {
            console.error('Failed to initialize exam session:', err);
            alert(err.response?.data?.message || 'Could not start the assessment. Please verify your enrollment.');
        }
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const toggleFlag = (questionId) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const downloadQuestionPaper = async (exam) => {
        setDownloadingPaper(exam._id);
        try {
            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`/api/exams/${exam._id}/question-paper`, config);

            // Open the file in a new tab for download/view
            const fileUrl = `${data.paper.fileUrl.startsWith('http') ? '' : '/'}${data.paper.fileUrl}`;
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = data.paper.fileName || `${data.examTitle}-question-paper`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Question paper downloaded!', 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not access question paper';
            showToast(msg, 'error');
        } finally {
            setDownloadingPaper(null);
        }
    };

    const handleSubmitExam = async () => {
        // Real submission to backend
        try {
            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (!activeExam.currentSubmissionId) {
                showToast('No active submission found. Please restart the exam.', 'error');
                return;
            }

            // Format answers for backend
            const formattedAnswers = Object.keys(answers).map(qId => {
                const q = activeExam.questions.find(que => (que._id || que.id).toString() === qId);
                const answer = answers[qId];

                // Handle descriptive questions (answer is a string)
                if (q.questionType === 'descriptive' || typeof answer === 'string') {
                    return {
                        questionId: qId,
                        answer: answer
                    };
                }

                // Handle MCQ questions (answer is an index)
                const opt = q.options[answer];
                return {
                    questionId: qId,
                    answer: typeof opt === 'object' ? opt.text : opt
                };
            });

            console.log('[handleSubmitExam] Submitting to:', `/api/exams/exam-submissions/${activeExam.currentSubmissionId}/submit`);
            console.log('[handleSubmitExam] Answers:', formattedAnswers);

            const { data } = await axios.post(
                `/api/exams/exam-submissions/${activeExam.currentSubmissionId}/submit`,
                { answers: formattedAnswers },
                config
            );

            setExams(prev => prev.map(e => e._id === activeExam._id ? { ...e, submission: data, status: 'submitted' } : e));
            setActiveExam(null);
            setExamStarted(false);
            setTimeRemaining(0);
            showToast('Exam submitted successfully!', 'success');
        } catch (err) {
            console.error('Submission failed:', err);
            console.error('Error response:', err.response?.data);
            showToast(err.response?.data?.message || 'Submission protocol failed. Please verify your connection.', 'error');
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

    const getExamActualStatus = (exam) => {
        const now = new Date();
        const start = new Date(exam.scheduledStartTime);
        const end = new Date(exam.scheduledEndTime);

        // If exam has submission, it's completed
        if (exam.submission && (exam.submission.status === 'submitted' || exam.submission.status === 'graded')) {
            return 'completed';
        }
        // If exam is scheduled and time is in future
        if (exam.status === 'scheduled' && now < start) {
            return 'scheduled';
        }
        // If exam is scheduled and time is now
        if (exam.status === 'scheduled' && now >= start && now <= end) {
            return 'available';
        }
        // If exam ended without submission
        if (exam.status === 'scheduled' && now > end && !exam.submission) {
            return 'failed';
        }

        const status = exam.status || 'available';
        return (status).toLowerCase();
    };

    const filteredExams = exams.filter(exam => {
        if (filter === 'all') return true;
        return getExamActualStatus(exam) === filter;
    });

    const filterOptions = [
        { value: 'all', label: 'All Exams', count: exams.length },
        { value: 'available', label: 'Available', count: exams.filter(e => getExamActualStatus(e) === 'available').length },
        { value: 'scheduled', label: 'Scheduled', count: exams.filter(e => getExamActualStatus(e) === 'scheduled').length },
        { value: 'completed', label: 'Completed', count: exams.filter(e => getExamActualStatus(e) === 'completed').length },
        { value: 'failed', label: 'Failed', count: exams.filter(e => getExamActualStatus(e) === 'failed').length }
    ];

    // Exam taking interface
    if (activeExam && examStarted) {
        if (!activeExam.questions || activeExam.questions.length === 0) {
            return (
                <div className="min-h-screen bg-[#050505] p-6 flex items-center justify-center">
                    <GlassCard className="p-12 text-center max-w-md border-red-500/20">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h2>
                        <p className="text-white/50 mb-8 font-medium">This assessment module contains no valid data payloads. Please contact system administration.</p>
                        <ModernButton onClick={() => { setActiveExam(null); setExamStarted(false); }} className="w-full">
                            Terminate Session
                        </ModernButton>
                    </GlassCard>
                </div>
            );
        }

        const question = activeExam.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / activeExam.questions.length) * 100;
        const answeredCount = Object.keys(answers).length;

        return (
            <div className="min-h-screen bg-[#020202] text-white flex flex-col font-inter">
                {/* Immersive Header */}
                <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Assessment Protocol</span>
                                <h1 className="text-sm font-bold truncate max-w-[300px]">{activeExam.title}</h1>
                            </div>
                            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <Timer size={16} className={timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-primary"} />
                                <span className={`font-mono text-lg font-bold ${timeRemaining < 300 ? "text-red-400" : "text-white"}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex flex-col items-end mr-4">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Progress Metrics</span>
                                <span className="text-xs font-mono font-black text-primary">{answeredCount} OF {activeExam.questions.length} RESOLVED</span>
                            </div>
                            <ModernButton
                                variant="secondary"
                                onClick={handleSubmitExam}
                                className="!bg-red-500/10 !text-red-500 hover:!bg-red-500 hover:!text-white !border-red-500/20 !px-6"
                            >
                                <X size={16} className="mr-2" /> Finish Attempt
                            </ModernButton>
                        </div>
                    </div>
                    {/* Linear Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 w-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    {/* Question Navigator Sidebar */}
                    <aside className="hidden xl:flex w-80 bg-[#080808] border-r border-white/5 flex-col p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <LifeBuoy size={14} className="text-white/20" />
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {activeExam.questions.map((_, idx) => {
                                const isAnswered = answers[activeExam.questions[idx]._id || activeExam.questions[idx].id] !== undefined;
                                const isCurrent = currentQuestion === idx;
                                const isFlagged = flaggedQuestions.has(activeExam.questions[idx]._id || activeExam.questions[idx].id);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`
                                            relative h-10 w-10 rounded-lg text-[10px] font-mono font-black transition-all flex items-center justify-center
                                            ${isCurrent ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30 z-10' :
                                                isAnswered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                    'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'}
                                        `}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#080808]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto space-y-4 pt-8">
                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Legend</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/40">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div> Active Segment
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/40">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div> Resolved
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/40">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> Flagged for Review
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Active Viewport */}
                    <div className="flex-1 overflow-y-auto bg-grid-pattern pb-20">
                        <div className="max-w-4xl mx-auto p-6 md:p-12">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-10"
                            >
                                {/* Question Title Area */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white/40 border border-white/5">
                                                SEGMENT {currentQuestion + 1}
                                            </span>
                                            {flaggedQuestions.has(question._id || question.id) && (
                                                <span className="px-3 py-1 bg-amber-500/10 rounded-full text-[10px] font-black text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
                                                    <Flag size={10} fill="currentColor" /> FLAGGED
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleFlag(question._id || question.id)}
                                            className={`p-2 rounded-xl border transition-all ${flaggedQuestions.has(question._id || question.id)
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                                : 'bg-white/5 border-white/10 text-white/20 hover:text-white'
                                                }`}
                                            title="Flag for later review"
                                        >
                                            <Flag size={18} fill={flaggedQuestions.has(question._id || question.id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                                        {question.question}
                                    </h2>
                                </div>

                                {/* Options Matrix or Descriptive Answer */}
                                {question.questionType === 'descriptive' ? (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                            Your Answer
                                        </label>
                                        <textarea
                                            value={answers[question._id || question.id] || ''}
                                            onChange={(e) => setAnswers(prev => ({
                                                ...prev,
                                                [question._id || question.id]: e.target.value
                                            }))}
                                            placeholder="Type your answer here..."
                                            rows={8}
                                            className="w-full p-6 bg-white/[0.03] border-2 border-white/5 rounded-2xl text-white placeholder-white/20 focus:border-primary focus:bg-primary/5 transition-all resize-none"
                                        />
                                        <p className="text-xs text-white/30">
                                            {(answers[question._id || question.id] || '').length} characters
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {question.options && question.options.length > 0 ? (
                                            question.options.map((option, index) => {
                                                const isSelected = answers[question._id || question.id] === index;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleAnswerSelect(question._id || question.id, index)}
                                                        className={`
                                                            relative group flex items-center p-6 rounded-2xl border-2 transition-all duration-300
                                                            ${isSelected ?
                                                                'bg-primary/10 border-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.15)]' :
                                                                'bg-white/[0.03] border-white/5 text-white/60 hover:border-white/20 hover:bg-white/[0.05]'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-10 h-10 rounded-xl flex items-center justify-center mr-6 text-sm font-mono font-black transition-all
                                                            ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40'}
                                                        `}>
                                                            {String.fromCharCode(65 + index)}
                                                        </div>
                                                        <span className="text-base font-medium flex-1 text-left leading-tight">
                                                            {typeof option === 'object' ? option.text : option}
                                                        </span>
                                                        {isSelected && (
                                                            <motion.div layoutId="check" className="text-primary">
                                                                <CheckCircle size={20} fill="currentColor" className="text-white" />
                                                            </motion.div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                                                <p className="text-red-400 text-sm">No options available for this question</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Intelligent Controls */}
                                <div className="flex items-center justify-between pt-12 border-t border-white/5">
                                    <ModernButton
                                        variant="secondary"
                                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestion === 0}
                                        className="!px-8 !py-4 opacity-50 hover:opacity-100 disabled:opacity-20"
                                    >
                                        <ChevronLeft size={18} className="mr-2" /> Previous
                                    </ModernButton>

                                    <div className="flex items-center gap-1.5 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                                        {activeExam.questions.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuestion ? 'w-6 bg-primary' :
                                                    answers[activeExam.questions[i]._id || activeExam.questions[i].id] !== undefined ? 'w-1.5 bg-emerald-500' :
                                                        'w-1.5 bg-white/10'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>

                                    {currentQuestion < activeExam.questions.length - 1 ? (
                                        <ModernButton
                                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                                            className="!px-10 !py-4 shadow-xl shadow-primary/20"
                                        >
                                            Next Segment <ChevronRight size={18} className="ml-2" />
                                        </ModernButton>
                                    ) : (
                                        <ModernButton
                                            onClick={handleSubmitExam}
                                            className="!bg-emerald-500 !text-white !px-10 !py-4 shadow-xl shadow-emerald-500/20"
                                        >
                                            Submit Final Protocol <Activity size={18} className="ml-2" />
                                        </ModernButton>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4">
            {/* Simple Header */}
            <div className="space-y-2 pb-6">
                <DashboardHeading title="Academic Grid" />
                <p className="text-white/40 text-sm font-medium">Verify your progress and manage upcoming assessments</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${filter === option.value
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {option.label}
                        {option.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${filter === option.value ? 'bg-white/20' : 'bg-white/10'}`}>
                                {option.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Exams List — row layout */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-1.5 overflow-hidden">
                <div className="flex flex-col gap-1.5">
                    {filteredExams.map((exam, idx) => {
                        const status = getExamActualStatus(exam);
                        const statusColors = {
                            available: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' },
                            scheduled: { bg: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.25)', text: '#a78bfa' },
                            completed: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' },
                            failed: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
                            'in-progress': { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
                        };
                        const sc = statusColors[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.4)' };

                        return (
                            <motion.div
                                key={exam._id || exam.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                style={{
                                    background: '#1a1a1f',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 20,
                                    padding: '14px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default',
                                }}
                                whileHover={{
                                    borderColor: 'rgba(124,111,247,0.3)',
                                    backgroundColor: '#202026',
                                    transform: 'translateX(4px)'
                                }}
                            >
                                {/* Status stripe */}
                                <div style={{ width: 4, height: 44, borderRadius: 99, background: sc.text, flexShrink: 0, opacity: 0.7 }} />

                                {/* Title + Course + Description */}
                                <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(124,111,247,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                                            <Award size={9} /> {exam.course?.title || exam.course || 'Core Subject'}
                                        </p>
                                        {exam.type && (
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getTypeColor(exam.type)}`}>
                                                {exam.type}
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {exam.title}
                                    </h3>
                                    {exam.description && (
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {exam.description}
                                        </p>
                                    )}
                                </div>

                                {/* Stats pills */}
                                <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    {[
                                        { icon: <Clock size={11} />, val: `${exam.duration || 60}m` },
                                        { icon: <FileText size={11} />, val: `${exam.totalQuestions || exam.questions?.length || '—'} Qs` },
                                        { icon: <Award size={11} />, val: `${exam.totalMarks || 100} pts` },
                                        { icon: <RotateCcw size={11} />, val: `${exam.attemptsUsed || 0}/${exam.maxAttempts || 1}` },
                                    ].map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 99, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{s.icon}</span> {s.val}
                                        </div>
                                    ))}
                                </div>

                                {/* Status badge */}
                                <div style={{ padding: '4px 12px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 99, fontSize: 10, fontWeight: 800, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
                                    {status}
                                </div>

                                {/* Score (if completed) */}
                                {status === 'completed' && exam.submission && (
                                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 48 }}>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: exam.submission.passed ? '#22c55e' : '#ef4444', margin: 0, lineHeight: 1 }}>
                                            {exam.submission.percentage?.toFixed(0)}%
                                        </p>
                                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                                            {exam.submission.passed ? 'Passed' : 'Failed'}
                                        </p>
                                    </div>
                                )}

                                {/* Scheduled unlock time */}
                                {status === 'scheduled' && (
                                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
                                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Unlocks</p>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                                            {exam.scheduledStartTime && !isNaN(new Date(exam.scheduledStartTime))
                                                ? new Date(exam.scheduledStartTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'TBD'}
                                        </p>
                                    </div>
                                )}

                                {/* Action button */}
                                <div style={{ flexShrink: 0 }}>
                                    {status === 'available' && (
                                        <button
                                            onClick={() => exam.examMode === 'paper-based' ? downloadQuestionPaper(exam) : startExam(exam)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: '#7C6FF7', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(124,111,247,0.35)', whiteSpace: 'nowrap' }}
                                        >
                                            {exam.examMode === 'paper-based' ? <Download size={14} /> : <Play size={14} />}
                                            {exam.examMode === 'paper-based' ? 'Download' : 'Start Exam'}
                                        </button>
                                    )}
                                    {status === 'completed' && (
                                        <button
                                            onClick={() => navigate(`/dashboard/exam/${exam._id}/result`)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            <Eye size={14} /> View Results
                                        </button>
                                    )}
                                    {status === 'failed' && (exam.attemptsUsed || 0) < (exam.maxAttempts || 1) && (
                                        <button
                                            onClick={() => startExam(exam)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            <RotateCcw size={14} /> Retry
                                        </button>
                                    )}
                                    {status === 'failed' && (exam.attemptsUsed || 0) >= (exam.maxAttempts || 1) && (
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No attempts left</span>
                                    )}
                                    {status === 'scheduled' && (
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {filteredExams.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <FileText size={48} className="mx-auto text-white/10 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Exams Found</h3>
                        <p className="text-white/40 text-sm max-w-sm mx-auto">No assessments found for the current filter.</p>
                        <ModernButton variant="secondary" className="mt-8" onClick={() => setFilter('all')}>
                            View All Assessments
                        </ModernButton>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Exams;

