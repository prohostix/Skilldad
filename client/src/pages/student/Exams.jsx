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
    Upload
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [filter, setFilter] = useState('all');
    const [activeExam, setActiveExam] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [examStarted, setExamStarted] = useState(false);

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
            const { data } = await axios.get('/api/exams/my-exams', config);
            setExams(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('Failed to sync with the academic grid. Please refresh.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();

        if (socket) {
            socket.on('exam_published', (data) => {
                showToast(`New Exam Published: ${data.message}`, 'info');
                fetchExams();
            });
            socket.on('exam_update', () => {
                fetchExams();
            });
        }

        // Auto-refresh every 60 seconds as fallback
        const interval = setInterval(fetchExams, 60000);

        return () => {
            clearInterval(interval);
            if (socket) {
                socket.off('exam_published');
                socket.off('exam_update');
            }
        };
    }, []);

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
        switch (type) {
            case 'final': return 'text-red-600 bg-red-50';
            case 'midterm': return 'text-orange-600 bg-orange-50';
            case 'quiz': return 'text-purple-600 bg-purple-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const startExam = async (exam) => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Register attempt on backend
            const { data: submission } = await axios.post(`/api/exams/${exam._id}/start`, {}, config);

            setActiveExam({ ...exam, currentSubmissionId: submission._id });
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

            // Format answers for backend
            const formattedAnswers = Object.keys(answers).map(qId => {
                const q = activeExam.questions.find(que => (que._id || que.id).toString() === qId);
                const opt = q.options[answers[qId]];
                return {
                    questionId: qId,
                    answer: typeof opt === 'object' ? opt.text : opt
                };
            });

            const { data } = await axios.put(`/api/exams/${activeExam._id}/submit`, { answers: formattedAnswers }, config);

            setExams(prev => prev.map(e => e._id === activeExam._id ? { ...e, submission: data, status: 'submitted' } : e));
            setActiveExam(null);
            setExamStarted(false);
            setTimeRemaining(0);
        } catch (err) {
            console.error('Submission failed:', err);
            alert('Submission protocol failed. Please verify your connection.');
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

    const filteredExams = exams.filter(exam => {
        if (filter === 'all') return true;
        return exam.status === filter;
    });

    const filterOptions = [
        { value: 'all', label: 'All Exams', count: exams.length },
        { value: 'available', label: 'Available', count: exams.filter(e => e.status === 'available').length },
        { value: 'scheduled', label: 'Scheduled', count: exams.filter(e => e.status === 'scheduled').length },
        { value: 'completed', label: 'Completed', count: exams.filter(e => e.status === 'completed').length },
        { value: 'failed', label: 'Failed', count: exams.filter(e => e.status === 'failed').length }
    ];

    // Exam taking interface
    if (activeExam && examStarted) {
        const question = activeExam.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / activeExam.questions.length) * 100;

        return (
            <div className="min-h-screen bg-slate-900 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Exam Header */}
                    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                        <div>
                            <h1 className="text-base font-semibold text-white font-inter">{activeExam.title}</h1>
                            <p className="text-white/70 text-xs">Question {currentQuestion + 1} of {activeExam.questions.length}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={18} />
                                <span className="font-mono text-base">{formatTime(timeRemaining)}</span>
                            </div>
                            <ModernButton variant="secondary" onClick={handleSubmitExam}>
                                Submit Exam
                            </ModernButton>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Question */}
                    <GlassCard className="p-8">
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold text-white leading-relaxed">
                                {question.question}
                            </h2>

                            <div className="space-y-3">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(question._id || question.id, index)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[question._id || question.id] === index
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-600 hover:border-slate-500 text-slate-300'
                                            }`}
                                    >
                                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {typeof option === 'object' ? option.text : option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <ModernButton
                            variant="secondary"
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </ModernButton>

                        {currentQuestion < activeExam.questions.length - 1 ? (
                            <ModernButton
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                            >
                                Next
                            </ModernButton>
                        ) : (
                            <ModernButton onClick={handleSubmitExam}>
                                Submit Exam
                            </ModernButton>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-base font-semibold text-white font-inter">Exams & Assessments</h1>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === option.value
                            ? 'bg-primary text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                            }`}
                    >
                        {option.label} ({option.count})
                    </button>
                ))}
            </div>

            {/* Exams Grid */}
            <div className="grid gap-4">
                {filteredExams.map((exam) => (
                    <GlassCard key={exam._id || exam.id} className="p-4 space-y-4">
                        {/* Exam Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-base font-semibold text-white">{exam.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(exam.type)}`}>
                                        {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-white/70 text-xs">{exam.course?.title || exam.course}</p>
                                <p className="text-white/90 text-sm">{exam.description}</p>
                            </div>
                        </div>

                        {/* Exam Details */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <div className="space-y-1">
                                <p className="text-white/50">Duration</p>
                                <p className="text-white font-medium">{exam.duration} minutes</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/50">Questions</p>
                                <p className="text-white font-medium">{exam.totalQuestions}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/50">Passing Score</p>
                                <p className="text-white font-medium">{exam.passingScore}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/50">Attempts</p>
                                <p className="text-white font-medium">{exam.attemptsUsed}/{exam.maxAttempts}</p>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        {(exam.status === 'scheduled' || exam.status === 'available') && (
                            <div className="bg-purple-50/10 border border-purple-200/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={14} className="text-white" />
                                    <span className="text-purple-400 font-medium text-xs">Scheduled</span>
                                </div>
                                <p className="text-white/90 text-xs">
                                    {new Date(exam.scheduledDate).toLocaleDateString()} at {exam.scheduledTime || new Date(exam.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                    Deadline: {new Date(exam.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {/* Results */}
                        {exam.submission && (
                            <div className={`rounded-lg p-3 ${exam.submission.passed
                                ? 'bg-emerald-50/10 border border-emerald-200/20'
                                : 'bg-red-50/10 border border-red-200/20'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {exam.submission.passed ? (
                                        <CheckCircle size={18} className="text-emerald-500" />
                                    ) : (
                                        <AlertCircle size={18} className="text-red-500" />
                                    )}
                                    <span className={`font-medium text-sm ${exam.submission.passed ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {exam.submission.passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <p className="text-white/50">Score</p>
                                        <p className="text-white font-medium">{exam.submission.score}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Percentage</p>
                                        <p className="text-white font-medium">
                                            {exam.submission.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Time Spent</p>
                                        <p className="text-white font-medium">{exam.submission.timeSpent} min</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Completed</p>
                                        <p className="text-white font-medium">
                                            {new Date(exam.submission.endTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            {exam.status === 'available' && exam.attemptsUsed < exam.maxAttempts && (
                                <>
                                    {exam.examMode === 'paper-based' ? (
                                        <div className="flex gap-2 w-full flex-wrap">
                                            <ModernButton
                                                className="flex-1 text-xs py-2 bg-indigo-600"
                                                disabled={downloadingPaper === exam._id}
                                                onClick={() => downloadQuestionPaper(exam)}
                                            >
                                                <Download size={14} className="mr-1" />
                                                {downloadingPaper === exam._id ? 'Fetching...' : 'Download Question Paper'}
                                            </ModernButton>
                                            <ModernButton
                                                variant="secondary"
                                                className="flex-1 text-xs py-2"
                                                onClick={() => showToast('Please submit your handwritten answers to the University portal.', 'info')}
                                            >
                                                <Upload size={14} className="mr-1" />
                                                Submit Script
                                            </ModernButton>
                                        </div>
                                    ) : (
                                        <ModernButton onClick={() => startExam(exam)} className="text-xs py-2">
                                            <Play size={14} className="mr-1" />
                                            Start Digital Exam
                                        </ModernButton>
                                    )}
                                </>
                            )}

                            {exam.status === 'scheduled' && exam.examMode === 'paper-based' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 font-medium w-fit">
                                    <Clock size={14} className="text-amber-500" />
                                    <span>Question paper unlocks when exam starts · <span className="text-amber-400">{new Date(exam.scheduledDate).toLocaleString()}</span></span>
                                </div>
                            )}

                            {exam.status === 'failed' && exam.attemptsUsed < exam.maxAttempts && (
                                <ModernButton onClick={() => startExam(exam)} className="text-xs py-2">
                                    <RotateCcw size={14} className="mr-1" />
                                    Retake Exam
                                </ModernButton>
                            )}

                            {exam.results && (
                                <ModernButton
                                    variant="secondary"
                                    className="text-xs py-2"
                                    onClick={() => alert(`Exam Results:\n\nScore: ${exam.results.score}%\nCorrect Answers: ${exam.results.correctAnswers}/${exam.results.totalQuestions}\nTime Spent: ${exam.results.timeSpent} minutes\nStatus: ${exam.results.passed ? 'Passed' : 'Failed'}\n\nNote: Detailed results view coming soon!`)}
                                >
                                    <Eye size={14} className="mr-1" />
                                    View Results
                                </ModernButton>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>

            {
                filteredExams.length === 0 && (
                    <GlassCard className="p-12 text-center">
                        <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white font-inter mb-2">No Exams Found</h3>
                        <p className="text-white/70 text-sm">No exams match your current filter criteria.</p>
                    </GlassCard>
                )
            }
        </div >
    );
};

export default Exams;
