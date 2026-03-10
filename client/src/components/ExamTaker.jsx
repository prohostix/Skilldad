import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, AlertTriangle, CheckCircle, Upload, Download,
    Wifi, WifiOff, Send, ChevronLeft, ChevronRight,
    Flag, Timer, X, FileText, Zap, Save, BookOpen,
    PenLine, BarChart2, AlignLeft, Circle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

/* ─── tiny helpers ──────────────────────────────────────────── */
const wordCount = (str = '') => str.trim().split(/\s+/).filter(Boolean).length;

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
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const socketRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const textareaRef = useRef(null);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    useEffect(() => {
        startExam();
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
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [examId]);

    useEffect(() => {
        if (submission && exam) setupWebSocket();
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [submission, exam]);

    /* auto-focus textarea when question changes */
    useEffect(() => {
        if (textareaRef.current) textareaRef.current.focus();
    }, [currentQuestionIndex]);

    const setupWebSocket = () => {
        const socketUrl = import.meta.env.VITE_API_URL || 'https://skilldad-server.onrender.com';
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        socketRef.current = io(socketUrl, { auth: { token: userInfo.token } });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
            socketRef.current.emit('join-exam', { examId: exam._id, studentId: userInfo.id || userInfo._id });
        });
        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            showToast('Connection lost. Answers will be saved via backup method.', 'warning');
        });
        socketRef.current.on('connect_error', () => {
            setIsConnected(false);
            if (reconnectAttemptsRef.current < 5) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current++;
                setTimeout(() => socketRef.current.connect(), delay);
            }
        });
        socketRef.current.on('time-remaining', (data) => {
            if (data.examId === exam._id) setTimeRemaining(data.timeRemaining);
        });
        socketRef.current.on('time-warning', (data) => {
            showToast(data.message, 'warning');
        });
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
            const accessResponse = await axios.get(`/api/exams/${examId}/access`, getAuthConfig());
            if (!accessResponse.data.data.canAccess) {
                showToast(accessResponse.data.data.reason, 'error');
                navigate('/dashboard/exams');
                return;
            }
            const startResponse = await axios.post(`/api/exams/${examId}/start`, {}, getAuthConfig());
            const startData = startResponse.data.data || startResponse.data;
            const { submission: newSubmission, questions: examQuestions, exam: examData, questionPaperUrl } = startData;
            setExam(examData);
            setSubmission(newSubmission);
            setTimeRemaining(accessResponse.data.data.timeRemaining);

            if (examData.examType === 'pdf-based') {
                setExam(prev => ({ ...prev, questionPaperUrl }));
            } else {
                setQuestions(examQuestions || []);
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
            const msg = error.response?.data?.message || 'Error starting exam. Please try again.';
            showToast(msg, 'error');
            navigate('/dashboard/exams');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(() => saveAnswer(questionId, answer), 1500);
    };

    const saveAnswer = async (questionId, answer) => {
        setIsSaving(true);
        try {
            await axios.post(`/api/exams/${submission._id}/answer`, { questionId, ...answer }, getAuthConfig());
            setLastSaved(new Date());
        } catch (_) { /* silent */ } finally {
            setIsSaving(false);
        }
    };

    const handleAnswerSheetUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) { showToast('Please upload a PDF or image file', 'error'); e.target.value = ''; return; }
        if (file.size > 20 * 1024 * 1024) { showToast('File must be less than 20MB', 'error'); e.target.value = ''; return; }
        setAnswerSheetFile(file);
        setUploadingAnswerSheet(true);
        try {
            const formData = new FormData();
            formData.append('answerSheet', file);
            await axios.post(`/api/exams/${submission._id}/answer-sheet`, formData, {
                ...getAuthConfig(),
                headers: { ...getAuthConfig().headers, 'Content-Type': 'multipart/form-data' },
                timeout: 60000
            });
            showToast('Answer sheet uploaded successfully', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error uploading answer sheet', 'error');
            setAnswerSheetFile(null);
            e.target.value = '';
        } finally {
            setUploadingAnswerSheet(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(`/api/exams/${submission._id}/submit`, { isAutoSubmit: false }, getAuthConfig());
            showToast('Exam submitted successfully!', 'success');
            if (socketRef.current) socketRef.current.disconnect();
            navigate(`/dashboard/exam/${examId}/submitted`);
        } catch (error) {
            const msg = error.response?.data?.message || error.request ? 'Network error. Your answers are saved.' : 'Error submitting exam';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setShowSubmitConfirm(false);
        }
    };

    const handleAutoSubmit = async () => {
        try {
            await axios.post(`/api/exams/${submission._id}/submit`, { isAutoSubmit: true }, getAuthConfig());
            if (socketRef.current) socketRef.current.disconnect();
            navigate(`/dashboard/exam/${examId}/submitted`);
        } catch (e) { console.error(e); }
    };

    const toggleFlag = (questionId) => {
        setFlaggedQuestions(prev => {
            const s = new Set(prev);
            s.has(questionId) ? s.delete(questionId) : s.add(questionId);
            return s;
        });
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const isUrgent = timeRemaining <= 300;
    const isCritical = timeRemaining <= 60;
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    /* ── Loading ───────────────────────────────────────────────── */
    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.loadingBox}>
                    <div style={styles.spinnerRing}>
                        <div style={styles.spinnerInner}><PenLine size={22} color="#7C6FF7" /></div>
                    </div>
                    <p style={styles.loadingTitle}>Preparing Your Exam</p>
                    <p style={styles.loadingSubtitle}>Setting up a comfortable writing environment…</p>
                </div>
            </div>
        );
    }

    if (!exam || !submission) {
        return (
            <div style={styles.loadingWrap}>
                <div style={{ ...styles.loadingBox, border: '1.5px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 16 }} />
                    <p style={styles.loadingTitle}>Unable to Load Exam</p>
                    <p style={styles.loadingSubtitle}>Please return and try again.</p>
                    <button style={styles.retryBtn} onClick={() => navigate('/dashboard/exams')}>Back to Exams</button>
                </div>
            </div>
        );
    }

    /* ── PDF-Based ─────────────────────────────────────────────── */
    if (exam.examType === 'pdf-based') {
        return (
            <div style={styles.root}>
                <TopBar exam={exam} timeRemaining={timeRemaining} isUrgent={isUrgent} isCritical={isCritical}
                    isConnected={isConnected} formatTime={formatTime} progress={0}
                    onFinish={() => setShowSubmitConfirm(true)} isSubmitting={isSubmitting}
                    isSaving={isSaving} lastSaved={lastSaved} />
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={styles.pdfCard}>
                        <div style={styles.pdfIcon}><FileText size={32} color="#7C6FF7" /></div>
                        <h2 style={styles.pdfTitle}>PDF-Based Assessment</h2>
                        <p style={styles.pdfSub}>Download the question paper, complete it on paper, then upload your answer sheet.</p>
                        <button onClick={() => window.open(exam.questionPaperUrl, '_blank')} style={styles.downloadBtn}>
                            <Download size={16} /> Download Question Paper
                        </button>
                        <div style={styles.uploadSection}>
                            <p style={styles.uploadLabel}>Upload Answer Sheet</p>
                            <label style={styles.uploadZone(!!answerSheetFile)}>
                                <Upload size={24} color={answerSheetFile ? '#22c55e' : '#7C6FF7'} style={{ marginBottom: 8 }} />
                                <span style={{ fontSize: 13, color: answerSheetFile ? '#22c55e' : '#c4c4d4', fontWeight: 600 }}>
                                    {answerSheetFile ? answerSheetFile.name : 'Click to upload PDF or image'}
                                </span>
                                <span style={{ fontSize: 11, color: '#666', marginTop: 4 }}>PDF, JPG, PNG · Max 20MB</span>
                                <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleAnswerSheetUpload} disabled={uploadingAnswerSheet} />
                            </label>
                        </div>
                        <button onClick={() => setShowSubmitConfirm(true)} disabled={!answerSheetFile || isSubmitting} style={styles.submitBtn(!answerSheetFile || isSubmitting)}>
                            <Send size={15} /> {isSubmitting ? 'Submitting…' : 'Submit Exam'}
                        </button>
                    </div>
                </main>
                <AnimatePresence>
                    {showSubmitConfirm && <SubmitConfirmModal onConfirm={handleSubmit} onCancel={() => setShowSubmitConfirm(false)} isSubmitting={isSubmitting} answeredCount={answeredCount} totalQuestions={totalQuestions} flaggedCount={flaggedQuestions.size} />}
                </AnimatePresence>
            </div>
        );
    }

    /* ── No Questions ──────────────────────────────────────────── */
    if (!questions || questions.length === 0) {
        return (
            <div style={styles.loadingWrap}>
                <div style={{ ...styles.loadingBox, border: '1.5px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 16 }} />
                    <p style={styles.loadingTitle}>No Questions Found</p>
                    <p style={styles.loadingSubtitle}>Contact your instructor.</p>
                    <button style={styles.retryBtn} onClick={() => navigate('/dashboard/exams')}>Back to Exams</button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestionIndex];
    const currentAnswer = answers[question._id] || {};
    const currentText = currentAnswer.textAnswer || '';
    const isWritingQuestion = question.questionType === 'short-answer' || question.questionType === 'essay' || question.type === 'text';
    const isMCQ = (question.questionType === 'mcq' || question.type === 'multiple-choice' || question.options) && question.options;

    /* ── Main Online Exam ──────────────────────────────────────── */
    return (
        <div style={styles.root}>
            <TopBar
                exam={exam} timeRemaining={timeRemaining} isUrgent={isUrgent} isCritical={isCritical}
                isConnected={isConnected} formatTime={formatTime} progress={progress}
                onFinish={() => setShowSubmitConfirm(true)} isSubmitting={isSubmitting}
                isSaving={isSaving} lastSaved={lastSaved}
                answeredCount={answeredCount} totalQuestions={totalQuestions}
            />

            <div style={styles.body}>
                {/* ── Sidebar ── */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 256, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={styles.sidebar}
                        >
                            <div style={styles.sidebarHeader}>
                                <BookOpen size={13} color="#7C6FF7" />
                                <span style={styles.sidebarHeading}>Question Navigator</span>
                            </div>

                            {/* Progress ring summary */}
                            <div style={styles.progressSummary}>
                                <div style={styles.progressRing}>
                                    <svg width="64" height="64" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(124,111,247,0.12)" strokeWidth="5" />
                                        <circle cx="32" cy="32" r="26" fill="none" stroke="#7C6FF7" strokeWidth="5"
                                            strokeDasharray={`${2 * Math.PI * 26}`}
                                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 32 32)" />
                                    </svg>
                                    <span style={styles.progressRingText}>{Math.round(progress)}%</span>
                                </div>
                                <div>
                                    <p style={styles.progressLabel}>{answeredCount} of {totalQuestions} answered</p>
                                    <p style={styles.progressSub}>{totalQuestions - answeredCount} remaining</p>
                                </div>
                            </div>

                            {/* Question grid */}
                            <div style={styles.qGrid}>
                                {questions.map((q, idx) => {
                                    const isAnswered = answers[q._id] !== undefined;
                                    const isCurr = currentQuestionIndex === idx;
                                    const isFlagged = flaggedQuestions.has(q._id);
                                    return (
                                        <button key={idx} onClick={() => setCurrentQuestionIndex(idx)}
                                            style={styles.qBtn(isCurr, isAnswered)}>
                                            {idx + 1}
                                            {isFlagged && <span style={styles.flagDot} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={styles.legend}>
                                {[
                                    { color: '#7C6FF7', label: 'Current' },
                                    { color: '#22c55e', label: 'Answered' },
                                    { color: 'rgba(255,255,255,0.08)', label: 'Not answered', border: '1px solid rgba(255,255,255,0.08)' },
                                    { color: '#f59e0b', label: 'Flagged', dot: true },
                                ].map(item => (
                                    <div key={item.label} style={styles.legendItem}>
                                        <span style={{ ...styles.legendDot, background: item.color, border: item.border || 'none' }} />
                                        <span style={styles.legendText}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Sidebar toggle pill */}
                <button onClick={() => setSidebarOpen(p => !p)} style={styles.sidebarToggle} title={sidebarOpen ? 'Hide navigator' : 'Show navigator'}>
                    {sidebarOpen ? <ChevronLeft size={14} /> : <AlignLeft size={14} />}
                </button>

                {/* ── Main Content ── */}
                <div style={styles.main}>
                    <div style={styles.mainInner}>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentQuestionIndex}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}>

                                {/* Question meta row */}
                                <div style={styles.questionMeta}>
                                    <div style={styles.questionBadgeRow}>
                                        <span style={styles.qBadge}>Question {currentQuestionIndex + 1} <span style={{ color: 'rgba(255,255,255,0.3)' }}>/ {totalQuestions}</span></span>
                                        {question.marks && <span style={styles.marksBadge}>{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>}
                                        {flaggedQuestions.has(question._id) && (
                                            <span style={styles.flaggedBadge}><Flag size={9} fill="currentColor" /> Flagged</span>
                                        )}
                                    </div>
                                    <button onClick={() => toggleFlag(question._id)} style={styles.flagBtn(flaggedQuestions.has(question._id))} title="Flag for review">
                                        <Flag size={15} fill={flaggedQuestions.has(question._id) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                {/* Question text */}
                                <div style={styles.questionCard}>
                                    <div style={styles.questionIcon}><PenLine size={16} color="#7C6FF7" /></div>
                                    <h2 style={styles.questionText}>{question.questionText || question.question}</h2>
                                </div>

                                {/* MCQ Options */}
                                {isMCQ && (
                                    <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
                                        {question.options.map((option, index) => {
                                            const isSelected = answers[question._id]?.selectedOption === index || answers[question._id] === index;
                                            const optText = typeof option === 'object' ? option.text : option;
                                            return (
                                                <button key={index} onClick={() => handleAnswerChange(question._id, { selectedOption: index })}
                                                    style={styles.mcqOption(isSelected)}>
                                                    <span style={styles.mcqLetter(isSelected)}>{String.fromCharCode(65 + index)}</span>
                                                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)', textAlign: 'left' }}>{optText}</span>
                                                    {isSelected && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                            <CheckCircle size={18} color="#7C6FF7" fill="#7C6FF7" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Writing Answer */}
                                {isWritingQuestion && (
                                    <div style={styles.writingWrap}>
                                        <div style={styles.writingHeader}>
                                            <span style={styles.writingLabel}><PenLine size={12} color="#7C6FF7" style={{ marginRight: 5 }} /> Your Answer</span>
                                            <div style={styles.writingStats}>
                                                <span style={styles.statChip}>{wordCount(currentText)} words</span>
                                                <span style={styles.statChip}>{currentText.length} chars</span>
                                            </div>
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={currentText}
                                            onChange={(e) => handleAnswerChange(question._id, { textAnswer: e.target.value })}
                                            rows={question.questionType === 'essay' ? 14 : 7}
                                            placeholder="Start writing your answer here…"
                                            style={styles.textarea}
                                            spellCheck
                                        />
                                        {/* Writing tips for essays */}
                                        {question.questionType === 'essay' && (
                                            <div style={styles.writingTip}>
                                                <span style={{ color: '#7C6FF7', fontSize: 11 }}>💡 Tip:</span>
                                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}> Structure your essay with an introduction, body paragraphs, and a conclusion for full marks.</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Navigation Controls */}
                                <div style={styles.navRow}>
                                    <button
                                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        style={styles.navBtn(currentQuestionIndex === 0)}>
                                        <ChevronLeft size={16} /> Previous
                                    </button>

                                    <div style={styles.dotsRow}>
                                        {questions.map((q, i) => (
                                            <div key={i} onClick={() => setCurrentQuestionIndex(i)}
                                                style={styles.dot(i, currentQuestionIndex, answers[q._id])} />
                                        ))}
                                    </div>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button onClick={() => setCurrentQuestionIndex(p => p + 1)} style={styles.nextBtn}>
                                            Next <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <button onClick={() => setShowSubmitConfirm(true)} disabled={isSubmitting} style={styles.submitNavBtn(isSubmitting)}>
                                            <Send size={14} /> Submit Exam
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Submit Confirm Modal */}
            <AnimatePresence>
                {showSubmitConfirm && (
                    <SubmitConfirmModal
                        onConfirm={handleSubmit} onCancel={() => setShowSubmitConfirm(false)}
                        isSubmitting={isSubmitting} answeredCount={answeredCount}
                        totalQuestions={totalQuestions} flaggedCount={flaggedQuestions.size}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Top Bar ────────────────────────────────────────────────── */
const TopBar = ({ exam, timeRemaining, isUrgent, isCritical, isConnected, formatTime, progress, onFinish, isSubmitting, isSaving, lastSaved, answeredCount, totalQuestions }) => {
    const timerColor = isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#7C6FF7';
    const timerBg = isCritical ? 'rgba(239,68,68,0.1)' : isUrgent ? 'rgba(245,158,11,0.1)' : 'rgba(124,111,247,0.08)';
    const timerBorder = isCritical ? 'rgba(239,68,68,0.25)' : isUrgent ? 'rgba(245,158,11,0.25)' : 'rgba(124,111,247,0.2)';

    return (
        <header style={styles.topBar}>
            <div style={styles.topBarInner}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={styles.examInfo}>
                        <span style={styles.examLabel}>Writing Exam</span>
                        <span style={styles.examTitle}>{exam?.title}</span>
                    </div>
                    {answeredCount !== undefined && (
                        <div style={styles.progressPill}>
                            <BarChart2 size={12} color="#7C6FF7" />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                                {answeredCount}/{totalQuestions}
                            </span>
                        </div>
                    )}
                </div>

                {/* Center: autosave status */}
                <div style={styles.saveStatus}>
                    {isSaving ? (
                        <><div style={styles.savingDot} /><span style={styles.saveText}>Saving…</span></>
                    ) : lastSaved ? (
                        <><Save size={11} color="#22c55e" /><span style={{ ...styles.saveText, color: '#22c55e' }}>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>
                    ) : null}
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Connection */}
                    <div style={styles.connBadge(isConnected)}>
                        {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
                        <span>{isConnected ? 'Live' : 'Offline'}</span>
                    </div>

                    {/* Timer */}
                    <div style={{ ...styles.timerBox, background: timerBg, border: `1.5px solid ${timerBorder}` }}>
                        <Timer size={14} color={timerColor} style={isCritical ? { animation: 'pulse 1s infinite' } : {}} />
                        <span style={{ ...styles.timerText, color: timerColor }}>{formatTime(timeRemaining)}</span>
                    </div>

                    {/* Finish */}
                    <button onClick={onFinish} disabled={isSubmitting} style={styles.finishBtn}>
                        <Send size={13} /> Finish Exam
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div style={styles.globalProgressTrack}>
                <motion.div style={styles.globalProgressFill} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
        </header>
    );
};

/* ─── Submit Modal ───────────────────────────────────────────── */
const SubmitConfirmModal = ({ onConfirm, onCancel, isSubmitting, answeredCount, totalQuestions, flaggedCount = 0 }) => {
    const unanswered = totalQuestions - answeredCount;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={styles.modalBox}>

                <div style={styles.modalIcon}>
                    <Send size={26} color="#7C6FF7" />
                </div>
                <h3 style={styles.modalTitle}>Ready to Submit?</h3>
                <p style={styles.modalSub}>Once submitted, you cannot make changes.</p>

                <div style={styles.modalStats}>
                    <div style={styles.modalStat}>
                        <span style={{ ...styles.modalStatNum, color: '#22c55e' }}>{answeredCount}</span>
                        <span style={styles.modalStatLabel}>Answered</span>
                    </div>
                    <div style={styles.modalStat}>
                        <span style={{ ...styles.modalStatNum, color: unanswered > 0 ? '#f59e0b' : '#22c55e' }}>{unanswered}</span>
                        <span style={styles.modalStatLabel}>Unanswered</span>
                    </div>
                    <div style={styles.modalStat}>
                        <span style={{ ...styles.modalStatNum, color: flaggedCount > 0 ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>{flaggedCount}</span>
                        <span style={styles.modalStatLabel}>Flagged</span>
                    </div>
                </div>

                {unanswered > 0 && (
                    <div style={styles.warningBox}>
                        ⚠️ You still have <strong>{unanswered}</strong> unanswered question{unanswered > 1 ? 's' : ''}.
                    </div>
                )}

                <div style={styles.modalActions}>
                    <button onClick={onCancel} disabled={isSubmitting} style={styles.cancelBtn}>Go Back</button>
                    <button onClick={onConfirm} disabled={isSubmitting} style={styles.confirmBtn}>
                        {isSubmitting ? 'Submitting…' : 'Submit Now'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Styles Object ──────────────────────────────────────────── */
const styles = {
    root: { minHeight: '100vh', background: '#0f0f14', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    loadingWrap: { minHeight: '100vh', background: '#0f0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    loadingBox: { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 360 },
    spinnerRing: { width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(124,111,247,0.15)', borderTop: '3px solid #7C6FF7', animation: 'spin 1s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
    spinnerInner: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    loadingTitle: { color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 },
    loadingSubtitle: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
    retryBtn: { marginTop: 20, padding: '10px 24px', background: '#7C6FF7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' },

    topBar: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,15,20,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    topBarInner: { maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    examInfo: { display: 'flex', flexDirection: 'column', gap: 1 },
    examLabel: { fontSize: 9, fontWeight: 800, color: '#7C6FF7', textTransform: 'uppercase', letterSpacing: '0.14em' },
    examTitle: { fontSize: 13, fontWeight: 700, color: '#fff', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    progressPill: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.15)', borderRadius: 20 },
    saveStatus: { display: 'flex', alignItems: 'center', gap: 6 },
    savingDot: { width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' },
    saveText: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 },
    connBadge: (connected) => ({ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: connected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 20, fontSize: 10, fontWeight: 700, color: connected ? '#22c55e' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }),
    timerBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 12 },
    timerText: { fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: '0.04em' },
    finishBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(124,111,247,0.12)', border: '1.5px solid rgba(124,111,247,0.3)', borderRadius: 10, color: '#7C6FF7', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
    globalProgressTrack: { height: 3, background: 'rgba(255,255,255,0.04)' },
    globalProgressFill: { height: '100%', background: 'linear-gradient(90deg,#7C6FF7,#a78bfa)', borderRadius: 99 },

    body: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
    sidebar: { background: '#0a0a10', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '20px 16px', overflowY: 'auto', flexShrink: 0 },
    sidebarHeader: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 },
    sidebarHeading: { fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em' },
    progressSummary: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(124,111,247,0.05)', border: '1px solid rgba(124,111,247,0.1)', borderRadius: 14, marginBottom: 16 },
    progressRing: { position: 'relative', flexShrink: 0 },
    progressRingText: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#7C6FF7' },
    progressLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
    progressSub: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
    qGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 'auto' },
    qBtn: (curr, answered) => ({
        position: 'relative', height: 36, borderRadius: 8, fontSize: 10, fontWeight: 800, fontFamily: 'monospace',
        border: curr ? 'none' : answered ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.06)',
        background: curr ? '#7C6FF7' : answered ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
        color: curr ? '#fff' : answered ? '#22c55e' : 'rgba(255,255,255,0.3)',
        cursor: 'pointer', transition: 'all 0.15s',
        transform: curr ? 'scale(1.08)' : 'scale(1)',
        boxShadow: curr ? '0 3px 12px rgba(124,111,247,0.4)' : 'none',
    }),
    flagDot: { position: 'absolute', top: -3, right: -3, width: 8, height: 8, background: '#f59e0b', borderRadius: '50%', border: '2px solid #0a0a10' },
    legend: { marginTop: 20, padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 },
    legendItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 },
    legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
    legendText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 },

    sidebarToggle: { position: 'absolute', top: 80, left: 0, zIndex: 10, width: 22, height: 44, background: '#0a0a10', border: '1px solid rgba(255,255,255,0.06)', borderLeft: 'none', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', transition: 'all 0.2s' },

    main: { flex: 1, overflowY: 'auto', paddingBottom: 48 },
    mainInner: { maxWidth: 780, margin: '0 auto', padding: '32px 24px' },

    questionMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    questionBadgeRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    qBadge: { fontSize: 12, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 99 },
    marksBadge: { fontSize: 10, fontWeight: 800, color: '#7C6FF7', background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.2)', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' },
    flaggedBadge: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' },
    flagBtn: (active) => ({ padding: '7px 10px', borderRadius: 10, border: `1.5px solid ${active ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#f59e0b' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }),

    questionCard: { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px 28px', marginBottom: 28, display: 'flex', gap: 16, alignItems: 'flex-start' },
    questionIcon: { width: 34, height: 34, borderRadius: 10, background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
    questionText: { fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.6, margin: 0 },

    mcqOption: (selected) => ({
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14,
        border: `1.5px solid ${selected ? 'rgba(124,111,247,0.5)' : 'rgba(255,255,255,0.07)'}`,
        background: selected ? 'rgba(124,111,247,0.1)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer', transition: 'all 0.2s', width: '100%',
        boxShadow: selected ? '0 0 20px rgba(124,111,247,0.12)' : 'none',
    }),
    mcqLetter: (selected) => ({
        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 12, fontWeight: 800, flexShrink: 0,
        background: selected ? '#7C6FF7' : 'rgba(255,255,255,0.05)',
        color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
    }),

    writingWrap: { background: 'rgba(255,255,255,0.025)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', marginBottom: 28 },
    writingHeader: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' },
    writingLabel: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' },
    writingStats: { display: 'flex', gap: 8 },
    statChip: { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 9px', borderRadius: 99 },
    textarea: {
        width: '100%', background: 'transparent', border: 'none', outline: 'none',
        padding: '20px 22px', color: '#e8e8f0', fontSize: 15, lineHeight: 1.8,
        fontFamily: "'Georgia', 'Times New Roman', serif", resize: 'vertical',
        boxSizing: 'border-box', caretColor: '#7C6FF7',
    },
    writingTip: { padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(124,111,247,0.04)', fontSize: 11, display: 'flex', gap: 4 },

    navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' },
    dotsRow: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 99, border: '1px solid rgba(255,255,255,0.05)' },
    dot: (i, curr, answered) => ({
        borderRadius: 99, cursor: 'pointer', transition: 'all 0.3s',
        width: i === curr ? 18 : 7, height: 7,
        background: i === curr ? '#7C6FF7' : answered !== undefined ? '#22c55e' : 'rgba(255,255,255,0.15)',
    }),
    navBtn: (disabled) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all 0.2s' }),
    nextBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#7C6FF7', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,111,247,0.3)', transition: 'all 0.2s' },
    submitNavBtn: (disabled) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: disabled ? 'rgba(34,197,94,0.3)' : '#22c55e', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.25)', transition: 'all 0.2s' }),

    // PDF card
    pdfCard: { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', maxWidth: 520, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
    pdfIcon: { width: 64, height: 64, borderRadius: 18, background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    pdfTitle: { fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', margin: 0 },
    pdfSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6, margin: 0 },
    downloadBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(124,111,247,0.1)', border: '1.5px solid rgba(124,111,247,0.25)', borderRadius: 12, color: '#a78bfa', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center', transition: 'all 0.2s' },
    uploadSection: { width: '100%' },
    uploadLabel: { fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 },
    uploadZone: (hasFile) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px', border: `2px dashed ${hasFile ? 'rgba(34,197,94,0.4)' : 'rgba(124,111,247,0.25)'}`, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', background: hasFile ? 'rgba(34,197,94,0.04)' : 'rgba(124,111,247,0.03)' }),
    submitBtn: (disabled) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 0', background: disabled ? 'rgba(34,197,94,0.25)' : '#22c55e', border: 'none', borderRadius: 13, color: '#fff', fontSize: 14, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', justifyContent: 'center', opacity: disabled ? 0.6 : 1, boxShadow: disabled ? 'none' : '0 4px 20px rgba(34,197,94,0.3)' }),

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', padding: 16 },
    modalBox: { background: '#13131a', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '36px 32px', maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' },
    modalIcon: { width: 60, height: 60, borderRadius: 18, background: 'rgba(124,111,247,0.1)', border: '1.5px solid rgba(124,111,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
    modalTitle: { fontSize: 20, fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 6px' },
    modalSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 24 },
    modalStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 },
    modalStat: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
    modalStatNum: { fontSize: 22, fontWeight: 800 },
    modalStatLabel: { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' },
    warningBox: { background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'rgba(245,158,11,0.9)', textAlign: 'center', marginBottom: 16 },
    modalActions: { display: 'flex', gap: 10 },
    cancelBtn: { flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
    confirmBtn: { flex: 1, padding: '12px', background: '#7C6FF7', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,111,247,0.35)', transition: 'all 0.2s' },
};

export default ExamTaker;
