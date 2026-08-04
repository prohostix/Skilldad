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
    Timer,
    Send,
    HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showSubmitModal, setShowSubmitModal] = useState(false);

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
    const [uploadingPaper, setUploadingPaper] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { socket } = useSocket();

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
            // Block non-PDF exams with no questions
            if (exam.examType !== 'pdf-based' && (!exam.questions || exam.questions.length === 0)) {
                showToast('This exam has no questions yet. Please contact your instructor.', 'error');
                return;
            }

            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Register attempt on backend
            const { data: response } = await axios.post(`/api/exams/${exam._id}/start`, {}, config);

            console.log('[startExam] Submission response:', response);

            const submissionData = response.submission || response.data?.submission;
            const submissionId = submissionData?._id || submissionData?.id;
            const liveQuestions = response.questions || response.data?.questions || exam.questions || [];

            console.log('[startExam] Submission ID:', submissionId);
            console.log('[startExam] Live questions fetched:', liveQuestions.length);

            const finalSubmissionId = submissionId;

            setActiveExam({ 
                ...exam, 
                questions: liveQuestions, 
                currentSubmissionId: finalSubmissionId 
            });
            setCurrentQuestion(0);
            setAnswers({});
            setTimeRemaining(response.timeRemaining || (exam.duration * 60));
            setExamStarted(true);
        } catch (err) {
            console.error('Failed to initialize exam session:', err);
            showToast(err.response?.data?.message || 'Could not start the assessment. Please verify your enrollment.', 'error');
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
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` },
                responseType: 'blob'
            };

            const response = await axios.get(`/api/exams/${exam._id}/question-paper`, config);
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `${exam.title}-question-paper.pdf`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showToast('Question paper downloaded!', 'success');
        } catch (err) {
            const msg = 'Could not access question paper';
            showToast(msg, 'error');
        } finally {
            setDownloadingPaper(null);
        }
    };

    const uploadAnswerSheet = async (exam, file) => {
        if (!file) return;
        setUploadingPaper(exam._id);
        try {
            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            
            const formData = new FormData();
            formData.append('document', file);
            formData.append('examId', exam._id);

            const config = { 
                headers: { 
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };

            await axios.post(`/api/exams/${exam._id}/upload-answer`, formData, config);
            
            showToast('Answer sheet uploaded successfully!', 'success');
            fetchExams();
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload failed';
            showToast(msg, 'error');
        } finally {
            setUploadingPaper(null);
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
                if (q.questionType === 'descriptive') {
                    return {
                        questionId: qId,
                        answer: answer  // String answer for descriptive
                    };
                }

                // Handle MCQ questions (answer is the option index)
                return {
                    questionId: qId,
                    answer: answer  // Send the index directly for MCQ
                };
            });

            console.log('[handleSubmitExam] Submitting to:', `/api/exams/${activeExam.currentSubmissionId}/submit`);
            console.log('[handleSubmitExam] Answers:', formattedAnswers);

            const { data } = await axios.post(
                `/api/exams/${activeExam.currentSubmissionId}/submit`,
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
        { value: 'completed', label: 'Completed', count: exams.filter(e => getExamActualStatus(e) === 'completed').length }
    ];

    if (activeExam && examStarted) {
        if (!activeExam.questions || activeExam.questions.length === 0) {
            return (
                <div className="min-h-screen bg-[#050505] p-6 flex items-center justify-center">
                    <GlassCard className="p-12 text-center max-w-md border-primary/20">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            {activeExam.examType === 'pdf-based' ? (
                                <Download size={40} className="text-primary" />
                            ) : (
                                <AlertCircle size={40} className="text-red-500" />
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                            {activeExam.examType === 'pdf-based' ? 'PDF ASSESSMENT READY' : 'ASSESSMENT UNAVAILABLE'}
                        </h2>
                        <p className="text-white/50 mb-8 font-medium text-sm">
                            {activeExam.examType === 'pdf-based' 
                                ? 'This assessment is paper-based. Please download the question paper and submit your answers.' 
                                : 'This assessment currently contains no questions. Please notify your instructor or system administrator to verify the configuration.'}
                        </p>
                        <div className="flex flex-col gap-3">
                            {activeExam.examType === 'pdf-based' && (
                                <div className="space-y-4">
                                    <ModernButton 
                                        onClick={() => downloadQuestionPaper(activeExam)} 
                                        className="w-full"
                                        disabled={downloadingPaper === activeExam._id}
                                    >
                                        <Download size={18} className="mr-2" />
                                        {downloadingPaper === activeExam._id ? 'Downloading...' : 'Download Question Paper'}
                                    </ModernButton>
                                    
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="answer-upload"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => uploadAnswerSheet(activeExam, e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="answer-upload"
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-2xl text-emerald-400 font-bold cursor-pointer hover:bg-emerald-500/20 transition-all"
                                        >
                                            {uploadingPaper === activeExam._id ? (
                                                <Activity size={18} className="animate-spin" />
                                            ) : (
                                                <Upload size={18} />
                                            )}
                                            {uploadingPaper === activeExam._id ? 'Uploading...' : 'Upload Answer Sheet'}
                                        </label>
                                    </div>
                                </div>
                            )}
                            <ModernButton variant="secondary" onClick={() => { setActiveExam(null); setExamStarted(false); }} className="w-full">
                                Terminate Session
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>
            );
        }

        const question = activeExam.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / activeExam.questions.length) * 100;
        const answeredCount = Object.keys(answers).length;

        return (
            <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-inter">
                {/* Standardized LMS Header */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                            <Activity size={18} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-[400px]">
                                {activeExam.title}
                            </h1>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                {activeExam.course?.title || 'General Assessment'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 py-1.5 px-4 bg-slate-50 border border-slate-200 rounded-full">
                            <Clock size={16} className={timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-slate-400"} />
                            <span className={`font-mono text-sm font-bold ${timeRemaining < 300 ? "text-red-600" : "text-slate-700"}`}>
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                        <ModernButton
                            onClick={() => setShowSubmitModal(true)}
                            className="!bg-emerald-600 !text-white !px-6 !h-10 !text-xs !rounded-full shadow-lg shadow-emerald-600/20"
                        >
                            Submit Exam
                        </ModernButton>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Question Area */}
                    <main className="flex-1 overflow-y-auto bg-slate-50">
                        <div className="max-w-3xl mx-auto p-2 md:p-4 space-y-3">
                            {/* Progress bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        Question {currentQuestion + 1} of {activeExam.questions.length}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary">
                                        {Math.round(progress)}% Complete
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-3"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                                                {question.questionType === 'mcq' ? 'Multiple Choice' : 'Descriptive'}
                                            </span>
                                            {flaggedQuestions.has(question._id || question.id) && (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                                                    <Flag size={10} fill="currentColor" /> Flagged
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleFlag(question._id || question.id)}
                                            className={`p-2 rounded-lg transition-all ${
                                                flaggedQuestions.has(question._id || question.id)
                                                    ? 'bg-amber-100 text-amber-600'
                                                    : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
                                            }`}
                                            title="Flag for later"
                                        >
                                            <Flag size={20} fill={flaggedQuestions.has(question._id || question.id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
                                        {question.question || question.questionText}
                                    </h2>
                                </div>

                                {/* Options or Input */}
                                {question.questionType === 'descriptive' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Write your answer below
                                            </label>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {(answers[question._id || question.id] || '').length} characters
                                            </span>
                                        </div>
                                        <textarea
                                            value={answers[question._id || question.id] || ''}
                                            onChange={(e) => setAnswers(prev => ({
                                                ...prev,
                                                [question._id || question.id]: e.target.value
                                            }))}
                                            placeholder="Provide a detailed explanation..."
                                            rows={8}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none font-medium leading-relaxed text-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {(question.options || []).map((option, index) => {
                                            const isSelected = answers[question._id || question.id] === index;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(question._id || question.id, index)}
                                                    className={`
                                                        flex items-center p-2.5 rounded-xl border-2 transition-all duration-200 group
                                                        ${isSelected ?
                                                            'bg-primary/5 border-primary shadow-sm' :
                                                            'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-7 h-7 rounded-lg flex items-center justify-center mr-4 text-[10px] font-bold transition-all
                                                        ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}
                                                    `}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className={`text-[13px] font-medium flex-1 text-left ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {typeof option === 'object' ? option.text : option}
                                                    </span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        isSelected ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white'
                                                    }`}>
                                                        {isSelected && <CheckCircle size={14} fill="currentColor" className="text-white" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>

                            {/* Footer Navigation */}
                            <div className="flex items-center justify-between pb-4">
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} /> Previous Question
                                </button>
                                
                                {currentQuestion < activeExam.questions.length - 1 ? (
                                    <ModernButton
                                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                                        className="!px-10 !h-12 !rounded-xl shadow-lg"
                                    >
                                        Save & Next <ChevronRight size={18} className="ml-2" />
                                    </ModernButton>
                                ) : (
                                    <ModernButton
                                        onClick={() => setShowSubmitModal(true)}
                                        className="!bg-emerald-600 !text-white !px-10 !h-12 !rounded-xl shadow-lg shadow-emerald-600/20"
                                    >
                                        Review & Finish <Activity size={18} className="ml-2" />
                                    </ModernButton>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Question Palette Sidebar */}
                    <aside className="hidden lg:flex w-72 bg-white border-l border-slate-200 flex-col">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Question Palette</h3>
                            <div className="flex flex-wrap gap-2">
                                {activeExam.questions.map((_, idx) => {
                                    const isAnswered = answers[activeExam.questions[idx]._id || activeExam.questions[idx].id] !== undefined;
                                    const isCurrent = currentQuestion === idx;
                                    const isFlagged = flaggedQuestions.has(activeExam.questions[idx]._id || activeExam.questions[idx].id);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestion(idx)}
                                            className={`
                                                w-9 h-9 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center
                                                ${isCurrent ? 'ring-2 ring-primary ring-offset-2 bg-primary text-white' :
                                                    isAnswered ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}
                                            `}
                                        >
                                            {idx + 1}
                                            {isFlagged && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 space-y-5">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legend</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                                        <div className="w-2.5 h-2.5 rounded bg-primary"></div> Current
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                                        <div className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-100"></div> Answered
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                                        <div className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-100"></div> Not Answered
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Flagged
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Summary</h4>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">Total</span>
                                        <span className="font-bold text-slate-700">{activeExam.questions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">Answered</span>
                                        <span className="font-bold text-emerald-600">{answeredCount}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">Flagged</span>
                                        <span className="font-bold text-amber-600">{flaggedQuestions.size}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400">
                                <LifeBuoy size={16} />
                                <span className="text-xs font-medium">Need help? Contact proctor</span>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Styled Submit Modal */}
                <AnimatePresence>
                    {showSubmitModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-md w-full text-slate-900 space-y-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                                        <Send size={24} />
                                    </div>
                                    <button
                                        onClick={() => setShowSubmitModal(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-space text-slate-900">
                                        Confirm Final Submission
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-inter">
                                        Are you sure you want to finish and submit your exam? Once submitted, you cannot change your responses.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                        <span className="text-lg font-black text-slate-800">{activeExam.questions.length}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Answered</span>
                                        <span className="text-lg font-black text-emerald-600">{answeredCount}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged</span>
                                        <span className="text-lg font-black text-amber-600">{flaggedQuestions.size}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setShowSubmitModal(false)}
                                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Back to Exam
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSubmitModal(false);
                                            handleSubmitExam();
                                        }}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all"
                                    >
                                        Yes, Submit Now
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
    return (
        <div className="space-y-4 pb-12 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="Academic Grid" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Verify your progress and manage upcoming assessments.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full overflow-x-auto hide-scrollbar">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                filter === option.value
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            {option.label}
                            {option.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    filter === option.value ? 'bg-white/20' : 'bg-white/10'
                                }`}>
                                    {option.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <p className="text-[11px] text-white/30 font-medium tracking-wide">
                {filteredExams.length} {filteredExams.length === 1 ? 'assessment' : 'assessments'} found
            </p>

            {/* Exams List */}
            <div className="flex flex-col gap-2">
                {filteredExams.map((exam, idx) => {
                    const status = getExamActualStatus(exam);
                    const statusStyles = {
                        available: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <Play size={10} /> },
                        scheduled: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: <Clock size={10} /> },
                        completed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={10} /> },
                        failed: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: <AlertCircle size={10} /> },
                        'in-progress': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Activity size={10} /> },
                    };
                    const sc = statusStyles[status] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/40', icon: null };

                    return (
                        <motion.div
                            key={exam._id || exam.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 group">
                                
                                {/* 1. Title + Course + Type (Left Column) */}
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                        <div className={`shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded border ${sc.bg} ${sc.border} ${sc.text}`}>
                                            {sc.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                                                {exam.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1 text-[11px] text-primary/70">
                                                    <Award size={10} />
                                                    <span className="font-medium truncate">{exam.course?.title || exam.course || 'Core Subject'}</span>
                                                </div>
                                                {exam.type && (
                                                    <>
                                                        <span className="text-white/20">·</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                                            exam.type.toLowerCase() === 'final' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            exam.type.toLowerCase() === 'midterm' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        }`}>
                                                            {exam.type}
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-white/20">·</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.text}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Stats (Middle Column) */}
                                <div className="hidden lg:flex items-center gap-4 text-[10px] font-medium shrink-0">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white/30 uppercase tracking-wider text-[8px] font-bold">Duration</span>
                                        <span className="flex items-center gap-1 text-white/70"><Clock size={9} />{exam.duration || 60}m</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white/30 uppercase tracking-wider text-[8px] font-bold">Questions</span>
                                        <span className="flex items-center gap-1 text-white/70"><FileText size={9} />{exam.totalQuestions || exam.questions?.length || '—'}</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white/30 uppercase tracking-wider text-[8px] font-bold">Attempts</span>
                                        <span className="flex items-center gap-1 text-white/70"><RotateCcw size={9} />{exam.attemptsUsed || 0}/{exam.maxAttempts || 1}</span>
                                    </div>
                                </div>

                                {/* Mobile Stats (Only visible on small screens) */}
                                <div className="flex lg:hidden items-center gap-3 text-[10px] font-medium pt-3 border-t border-white/5">
                                    <span className="flex items-center gap-1 text-white/60"><Clock size={9} />{exam.duration || 60}m</span>
                                    <span className="flex items-center gap-1 text-white/60"><FileText size={9} />{exam.totalQuestions || exam.questions?.length || '—'} Qs</span>
                                    <span className="flex items-center gap-1 text-white/60"><RotateCcw size={9} />{exam.attemptsUsed || 0}/{exam.maxAttempts || 1}</span>
                                </div>

                                {/* 3. Actions / Footer (Right Column) */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/5">
                                    {status === 'completed' && exam.submission ? (
                                        <div className="flex sm:flex-col items-center gap-3 sm:gap-1">
                                            <div className="text-left sm:text-right">
                                                <p className={`text-[13px] font-black leading-none ${exam.submission.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {(Number(exam.submission.percentage) || 0).toFixed(0)}%
                                                </p>
                                                <p className="text-[8px] text-white/30 font-bold uppercase mt-0.5">{exam.submission.passed ? 'Passed' : 'Failed'}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/dashboard/exam/${exam._id}/result`)}
                                                className="text-[10px] font-bold text-white/60 hover:text-white px-3 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                                            >
                                                View Results
                                            </button>
                                        </div>
                                    ) : status === 'scheduled' ? (
                                        <div className="text-left sm:text-right">
                                            <p className="text-[11px] font-bold text-white/70">
                                                {exam.scheduledStartTime && !isNaN(new Date(exam.scheduledStartTime))
                                                    ? new Date(exam.scheduledStartTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : 'TBD'}
                                            </p>
                                            <p className="text-[8px] text-white/30 font-bold uppercase mt-0.5">Unlocks</p>
                                        </div>
                                    ) : status === 'failed' && (exam.attemptsUsed || 0) < (exam.maxAttempts || 1) ? (
                                        <button
                                            onClick={() => startExam(exam)}
                                            className="text-[11px] font-bold text-red-500 hover:text-white px-4 py-1.5 bg-red-500/10 hover:bg-red-500 rounded border border-red-500/20 hover:border-red-500 transition-all flex items-center gap-1.5"
                                        >
                                            <RotateCcw size={11} /> Retry Try
                                        </button>
                                    ) : status === 'failed' ? (
                                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-wide px-2 text-center">No attempts<br/>left</span>
                                    ) : status === 'available' ? (
                                        <button
                                            onClick={() => exam.examType === 'pdf-based' ? downloadQuestionPaper(exam) : startExam(exam)}
                                            className="text-[11px] font-bold text-primary px-4 py-1.5 bg-primary/10 hover:bg-primary hover:text-white rounded border border-primary/20 hover:border-primary transition-all flex items-center gap-1.5 shadow-sm"
                                        >
                                            {exam.examType === 'pdf-based' ? <Download size={11} /> : <Play size={11} />}
                                            {exam.examType === 'pdf-based' ? 'Download' : 'Start Exam'}
                                        </button>
                                    ) : null}
                                </div>

                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredExams.length === 0 && (
                <div className="col-span-full py-14 text-center flex flex-col items-center gap-3">
                    <div className="p-3.5 bg-white/5 rounded-full">
                        <FileText size={28} className="text-white/20" />
                    </div>
                    <p className="text-sm font-semibold text-white/40">No assessments found</p>
                    {filter !== 'all' && (
                        <button onClick={() => setFilter('all')} className="text-xs text-primary/70 hover:text-primary transition-colors mt-1">
                            Clear active filters
                        </button>
                    )}
                </div>
            )}

            {/* Professional Final Exam Submission Modal */}
            <AnimatePresence>
                {showSubmitModal && activeExam && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                            className="w-full max-w-md bg-[#0F1420] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-left"
                        >
                            {/* Emerald top accent bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <Send size={22} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-poppins">Ready to Submit?</h3>
                                        <p className="text-xs text-white/50 mt-0.5">Please review your exam progress before finalizing</p>
                                    </div>
                                </div>

                                {/* Summary Stats Box */}
                                <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 border border-white/5 rounded-xl my-5 text-center">
                                    <div className="p-2">
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Total</p>
                                        <p className="text-lg font-bold text-white mt-0.5">{activeExam.questions?.length || 0}</p>
                                    </div>
                                    <div className="p-2 border-x border-white/10">
                                        <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Answered</p>
                                        <p className="text-lg font-bold text-emerald-400 mt-0.5">
                                            {activeExam.questions?.filter(q => answers[q._id || q.id] !== undefined).length || 0}
                                        </p>
                                    </div>
                                    <div className="p-2">
                                        <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Flagged</p>
                                        <p className="text-lg font-bold text-amber-400 mt-0.5">{flaggedQuestions.size}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-white/60 leading-relaxed mb-6">
                                    Once submitted, your answers will be locked and sent for evaluation. You will not be able to modify your choices.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowSubmitModal(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                                    >
                                        Return to Exam
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSubmitModal(false);
                                            handleSubmitExam();
                                        }}
                                        className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <CheckCircle size={15} /> Confirm & Submit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Exams;

