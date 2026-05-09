import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Upload,
    Download,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Trash2,
    CheckCircle,
    Clock,
    BookOpen,
    ShieldCheck,
    Calendar,
    AlertCircle,
    RefreshCw,
    Edit,
    Users,
    Award,
    Plus
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
    const toLocalDateTimeString = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    const [activeTab, setActiveTab] = useState('questions');
    const [searchTerm, setSearchTerm] = useState('');
    const [questionPapers, setQuestionPapers] = useState([]);
    const [answerKeys, setAnswerKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingSubmissionsId, setFetchingSubmissionsId] = useState(null);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [courses, setCourses] = useState([]);
    const [excelFile, setExcelFile] = useState(null);
    const [uploadingExcel, setUploadingExcel] = useState(false);
    const { showToast } = useToast();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [examData, setExamData] = useState({
        title: '',
        course: '',
        duration: 60,
        passingScore: 70,
        totalMarks: 100,
        scheduledStartTime: '',
        scheduledEndTime: '',
        maxAttempts: 1,
        isPublished: true,
        examMode: 'paper-based',
        mandatedSlotId: '',
        linkedPaper: '',
        answerKey: '',
        examType: 'pdf-based'
    });

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        type: 'exam_paper',
        course: ''
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [exams, setExams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedExamForGrading, setSelectedExamForGrading] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradingData, setGradingData] = useState({});

    const fetchData = async (showSuccessToast = false) => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [docsRes, coursesRes, examsRes] = await Promise.all([
                axios.get('/api/documents', config),
                axios.get('/api/courses/admin', config),
                axios.get('/api/exams', config)
            ]);

            console.log('[University Exams] Fetched exams:', examsRes.data);
            setQuestionPapers(docsRes.data.filter(d => d.type === 'exam_paper'));
            setAnswerKeys(docsRes.data.filter(d => d.type === 'answer_sheet'));
            setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
            setCourses(coursesRes.data);
            setLoading(false);
            if (showSuccessToast) {
                showToast('Exam list refreshed', 'success');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to sync Exam Vault', 'error');
            setExams([]);
            setLoading(false);
        }
    };

    const fetchSubmissions = async (examId) => {
        try {
            setFetchingSubmissionsId(examId);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`/api/submissions/exam/${examId}`, config);
            console.log('[Submissions] Fetched:', data);
            
            // Clear individual grading view if open
            setSelectedSubmission(null);
            
            setSubmissions(data.submissions || []);
            setSelectedExamForGrading(examId);
            setActiveTab('grading');
        } catch (err) {
            console.error('Error fetching submissions:', err);
            showToast('Failed to fetch submissions', 'error');
            setSubmissions([]);
        } finally {
            setFetchingSubmissionsId(null);
        }
    };

    // Add socket listener for new submissions
    useEffect(() => {
        if (socket && selectedExamForGrading) {
            const handleNewSubmission = (data) => {
                console.log('[ExamManagement] New submission received:', data);
                showToast(`New submission from ${data.studentName}`, 'info');
                // Refresh submissions for the current exam
                fetchSubmissions(selectedExamForGrading);
            };

            socket.on('EXAM_SUBMISSION_RECEIVED', handleNewSubmission);

            return () => {
                socket.off('EXAM_SUBMISSION_RECEIVED', handleNewSubmission);
            };
        }
    }, [socket, selectedExamForGrading]);

    const handleGradeSubmission = async (submissionId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Format answers for grading
            const answers = Object.keys(gradingData).map(questionId => ({
                questionId,
                marksAwarded: Number(gradingData[questionId].marks || 0),
                feedback: gradingData[questionId].feedback || ''
            }));

            await axios.post(`/api/submissions/${submissionId}/grade`, { answers }, config);
            showToast('Submission graded successfully', 'success');
            setSelectedSubmission(null);
            setGradingData({});

            // Refresh submissions
            if (selectedExamForGrading) {
                fetchSubmissions(selectedExamForGrading);
            }
        } catch (err) {
            console.error('Error grading submission:', err);
            showToast(err.response?.data?.message || 'Failed to grade submission', 'error');
        }
    };

    const handlePublishResults = async (examId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Confirm before publishing
            if (!window.confirm('Are you sure you want to publish results? Students will be able to view their scores.')) {
                return;
            }

            const { data } = await axios.post(`/api/results/exams/${examId}/publish-results`, {}, config);
            showToast(`Results published successfully! ${data.publishedCount} students notified.`, 'success');

            // Refresh submissions to update UI
            fetchSubmissions(examId);
        } catch (err) {
            console.error('Error publishing results:', err);
            showToast(err.response?.data?.message || 'Failed to publish results', 'error');
        }
    };

    const viewSubmissionForGrading = async (submission) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch full submission details with answers
            const { data } = await axios.get(`/api/exams/${submission._id}/for-grading`, config);
            console.log('[Grading] Full submission data:', data);

            const fullSubmission = data.submission || data;
            setSelectedSubmission(fullSubmission);

            // Initialize grading data with marksAwarded from backend
            const initialGrading = {};
            (fullSubmission.answers || []).forEach(answer => {
                const questionId = answer.question?._id || answer.questionId;
                initialGrading[questionId] = {
                    marks: answer.marksAwarded || 0,  // Use marksAwarded from backend
                    feedback: answer.feedback || ''
                };
            });
            setGradingData(initialGrading);
        } catch (err) {
            console.error('Error fetching submission details:', err);
            showToast('Failed to load submission details', 'error');
            // Fallback: use the submission data we have
            setSelectedSubmission(submission);
            const initialGrading = {};
            (submission.answers || []).forEach(answer => {
                const questionId = answer.question?._id || answer.questionId;
                initialGrading[questionId] = {
                    marks: answer.marksAwarded || 0,  // Use marksAwarded from backend
                    feedback: answer.feedback || ''
                };
            });
            setGradingData(initialGrading);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return showToast('Please select a file', 'error');

        setUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('document', uploadFile);
            formData.append('title', uploadData.title || uploadFile.name);
            formData.append('description', uploadData.description || 'Exam vault material');
            formData.append('type', uploadData.type);
            formData.append('course', uploadData.course || '');

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            console.log('[Vault] Starting upload of:', uploadFile.name);
            const response = await axios.post('/api/documents/upload', formData, config);
            console.log('[Vault] Upload success:', response.data);

            showToast('Document securely uploaded to Vault.', 'success');
            setShowUploadModal(false);
            setUploadData({ title: '', description: '', type: 'exam_paper', course: '' });
            setUploadFile(null);
            fetchData();
        } catch (err) {
            console.error('[Vault Upload Trace]', err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || 'Upload rejected by server';
            showToast(errMsg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleScheduleExam = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const payload = {
                ...examData,
                scheduledStartTime: examData.scheduledStartTime ? new Date(examData.scheduledStartTime).toISOString() : null,
                scheduledEndTime: examData.scheduledEndTime ? new Date(examData.scheduledEndTime).toISOString() : null,
                description: `Institutional Deployment: ${examData.title}`
            };

            await axios.post('/api/exams', payload, config);
            showToast('✓ Session Materials Deployed. System Active.', 'success');
            setOpenSchedule(false);
            setExamData({
                title: '',
                course: '',
                duration: 60,
                passingScore: 40,
                totalMarks: 100,
                scheduledStartTime: '',
                scheduledEndTime: '',
                maxAttempts: 1,
                isPublished: true,
                examMode: 'paper-based',
                mandatedSlotId: '',
                linkedPaper: '',
                answerKey: '',
                examType: 'pdf-based'
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to schedule exam', 'error');
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Option (A/B/C/D)", "Marks", "Negative Marks"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
            "What is React?,A Javascript library,A Database,A CSS framework,A Server,A,1,0.25";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "exam_questions_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Template downloaded. Please fill and upload.', 'success');
    };

    const handleExcelUpload = async (examId) => {
        if (!excelFile) return showToast('Please select an Excel/CSV file', 'error');

        setUploadingExcel(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('excel', excelFile);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post(`/api/exams/${examId}/bulk-upload-questions`, formData, config);
            showToast('Questions uploaded successfully!', 'success');
            setExcelFile(null);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to upload questions', 'error');
        } finally {
            setUploadingExcel(false);
        }
    };

    const handleView = (item) => {
        const url = item.fileUrl?.startsWith('http') ? item.fileUrl : `${import.meta.env.VITE_API_URL || ''}/${item.fileUrl}`;
        window.open(url, '_blank');
    };

    const handleDownload = (item) => {
        const url = item.fileUrl?.startsWith('http') ? item.fileUrl : `${import.meta.env.VITE_API_URL || ''}/${item.fileUrl}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = item.fileName || item.title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderGradingTab = () => {
        if (!selectedSubmission) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h5 className="text-sm font-black text-white/60 uppercase tracking-widest">
                            {selectedExamForGrading 
                                ? `Managing: ${exams.find(e => e._id === selectedExamForGrading)?.title || 'Exam'}`
                                : 'Select Exam to Grade'
                            }
                        </h5>
                        {selectedExamForGrading && (
                            <div className="flex gap-3">
                                {(() => {
                                    const allGraded = submissions.every(s => s.status === 'graded');
                                    const hasSubmissions = submissions.length > 0;
                                    const currentExam = exams.find(e => e._id === selectedExamForGrading);
                                    const resultsPublished = currentExam?.resultsPublished;

                                    return (
                                        <>
                                            {hasSubmissions && allGraded && !resultsPublished && (
                                                <ModernButton
                                                    size="sm"
                                                    onClick={() => handlePublishResults(selectedExamForGrading)}
                                                    className="!bg-emerald-500 !text-white hover:!bg-emerald-600"
                                                >
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Publish Results
                                                </ModernButton>
                                            )}
                                            {resultsPublished && (
                                                <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                                                    <CheckCircle size={14} className="inline mr-2" />
                                                    Results Published
                                                </span>
                                            )}
                                            <ModernButton
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setSelectedExamForGrading(null);
                                                    setSubmissions([]);
                                                }}
                                            >
                                                Back to Exams
                                            </ModernButton>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {!selectedExamForGrading ? (
                        <div className="py-20 text-center text-white/20">
                            <Edit size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold uppercase tracking-widest text-sm">Go to "Conduct Exams" tab, then click "Manage" on an exam to begin grading.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.length > 0 && (() => {
                                const gradedCount = submissions.filter(s => s.status === 'graded').length;
                                const totalCount = submissions.length;
                                const allGraded = gradedCount === totalCount;
                                const percentage = (gradedCount / totalCount) * 100;

                                return (
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-xs font-black text-white/40 uppercase tracking-widest">Grading Progress</p>
                                                <p className="text-2xl font-black text-white mt-1">{gradedCount} / {totalCount}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${allGraded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                                {allGraded ? 'Ready to Publish' : 'In Progress'}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${allGraded ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex flex-col gap-2">
                                {submissions.map((submission) => (
                                    <div key={submission._id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${submission.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {submission.status === 'graded' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{submission.student?.name || 'Student'}</h4>
                                                <p className="text-[10px] text-white/40 truncate">{submission.student?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Score</p>
                                                <p className="text-xs font-bold text-white">{submission.status === 'graded' ? `${submission.obtainedMarks}/${submission.totalMarks}` : 'Pending'}</p>
                                            </div>
                                            <button
                                                onClick={() => viewSubmissionForGrading(submission)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${submission.status === 'graded' ? 'bg-white/5 text-white/40' : 'bg-primary text-white'}`}
                                            >
                                                {submission.status === 'graded' ? 'Review' : 'Grade'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="text-lg font-black text-white">Grading: {selectedSubmission.student?.name}</h5>
                            <p className="text-xs text-white/40 mt-1">{selectedSubmission.student?.email}</p>
                        </div>
                        <ModernButton size="sm" variant="secondary" onClick={() => { setSelectedSubmission(null); setGradingData({}); }}>
                            Back to Submissions
                        </ModernButton>
                    </div>

                    <div className="space-y-4">
                        {(!selectedSubmission.answers || selectedSubmission.answers.length === 0) ? (
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <p className="text-white/40 text-sm">No answers found or PDF submission.</p>
                                {selectedSubmission.answer_sheet_url && (
                                    <ModernButton size="sm" className="mt-4" onClick={() => window.open(selectedSubmission.answer_sheet_url.startsWith('http') ? selectedSubmission.answer_sheet_url : `${import.meta.env.VITE_API_URL}/${selectedSubmission.answer_sheet_url}`, '_blank')}>
                                        Download PDF
                                    </ModernButton>
                                )}
                            </div>
                        ) : (
                            selectedSubmission.answers.map((answer, idx) => {
                                const questionId = answer.question?._id || answer.questionId;
                                return (
                                    <div key={questionId || idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                                        <div className="flex justify-between">
                                            <p className="text-xs font-bold text-white/60">Q{idx + 1}: {answer.question?.questionText || 'Custom Question'}</p>
                                            <span className="text-[10px] text-white/30">{answer.question?.marks || 0} pts</span>
                                        </div>
                                        <div className="p-3 bg-white/[0.03] rounded-lg text-sm text-white">
                                            {answer.questionType === 'mcq' ? `Selected: ${answer.selectedOption + 1}` : (answer.textAnswer || 'No answer')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="number" 
                                                placeholder="Marks" 
                                                className="px-3 py-2 bg-white/5 rounded-lg text-sm text-white border border-white/10"
                                                value={gradingData[questionId]?.marks ?? answer.marksAwarded ?? 0}
                                                onChange={e => setGradingData({ ...gradingData, [questionId]: { ...gradingData[questionId], marks: parseFloat(e.target.value) || 0 }})}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Feedback" 
                                                className="px-3 py-2 bg-white/5 rounded-lg text-sm text-white border border-white/10"
                                                value={gradingData[questionId]?.feedback || ''}
                                                onChange={e => setGradingData({ ...gradingData, [questionId]: { ...gradingData[questionId], feedback: e.target.value }})}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                        <ModernButton variant="secondary" onClick={() => setSelectedSubmission(null)}>Cancel</ModernButton>
                        <ModernButton onClick={() => handleGradeSubmission(selectedSubmission._id)}>Publish Grade</ModernButton>
                    </div>
                </div>
            );
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'grading':
                return renderGradingTab();

            case 'questions':
                return (
                    <div className="flex flex-col gap-2">
                        {questionPapers.length > 0 ? questionPapers.map((paper) => (
                            <div key={paper._id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{paper.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Institutional Asset</span>
                                            <span className="text-white/10">|</span>
                                            <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{new Date(paper.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDoc(paper);
                                            setExamData(prev => ({ ...prev, title: paper.title, linkedPaper: paper._id }));
                                            setOpenSchedule(true);
                                        }}
                                        className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Deploy
                                    </button>
                                    <div className="flex items-center bg-white/5 rounded-lg p-0.5 ml-2">
                                        <button onClick={() => handleView(paper)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="View"><Eye size={14} /></button>
                                        <button onClick={() => handleDownload(paper)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Download"><Download size={14} /></button>
                                        <button onClick={() => handleDelete(paper._id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-sm">No Question Papers Received</p>
                            </div>
                        )}
                    </div>
                );

            case 'answers':
                return (
                    <div className="flex flex-col gap-2">
                        {answerKeys.length > 0 ? answerKeys.map((key) => (
                            <div key={key._id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/10">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{key.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Solution Shield</span>
                                            <span className="text-white/10">|</span>
                                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded">Official Key</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDoc(key);
                                            setExamData(prev => ({ ...prev, title: key.title, answerKey: key._id }));
                                            setOpenSchedule(true);
                                        }}
                                        className="px-3 py-1.5 bg-emerald-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Deploy
                                    </button>
                                    <div className="flex items-center bg-white/5 rounded-lg p-0.5 ml-2">
                                        <button onClick={() => handleView(key)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="View"><Eye size={14} /></button>
                                        <button onClick={() => handleDownload(key)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Download"><Download size={14} /></button>
                                        <button onClick={() => handleDelete(key._id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-sm">No Answer Sheets Received</p>
                            </div>
                        )}
                    </div>
                );

            case 'conduct':
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Examination Deployment</h5>
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                            >
                                <Download size={14} />
                                Download MCQ Template
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                        {exams.length > 0 ? exams.map((exam) => (
                            <div key={exam._id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/10">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{exam.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{new Date(exam.scheduledStartTime || exam.scheduledDate).toLocaleDateString()}</span>
                                            <span className="text-white/10">|</span>
                                            <div className="flex gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${exam.linkedPaper ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {exam.linkedPaper ? 'Paper Active' : 'No Paper'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => fetchSubmissions(exam._id)}
                                        disabled={fetchingSubmissionsId === exam._id}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {fetchingSubmissionsId === exam._id ? 'Syncing...' : 'Manage'}
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/university/exams/${exam._id}/questions`)}
                                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
                                    >
                                        Questions
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-sm">No Active Exams</p>
                            </div>
                        )}
                    </div>
                </div>
                );

            case 'schedule':
                return (
                    <div className="flex flex-col gap-2">
                        {exams.filter(ex => ex.createdBy?.role === 'university').length > 0 ? exams.filter(ex => ex.createdBy?.role === 'university').map((exam) => (
                            <div key={exam._id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{exam.title}</h4>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{new Date(exam.scheduledStartTime || exam.scheduledDate).toLocaleDateString()}</span>
                                            <span className="text-white/10">|</span>
                                            <div className="flex gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${exam.linkedPaper ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {exam.linkedPaper ? 'Paper' : 'No Paper'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button 
                                        onClick={() => navigate('/university/exams')}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        View Report
                                    </button>
                                    <button onClick={() => handleDelete(exam._id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <p className="font-bold uppercase tracking-widest text-sm">No University-scheduled History</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="py-20 text-center text-white/20">
                        <p className="font-bold uppercase tracking-widest text-sm">Select a tab to view content</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Digital Exam Vault" />
                    <p className="text-white/50 mt-1">Manage official assessments and secure materials from SkillDad Admin.</p>
                </div>
                <div className="flex gap-3">
                    <ModernButton
                        variant="secondary"
                        onClick={() => fetchData(true)}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh Exams'}
                    </ModernButton>
                    <ModernButton onClick={() => setShowUploadModal(true)}>
                        <Upload size={18} className="mr-2" />
                        Upload Material
                    </ModernButton>
                </div>
            </div>

            <div className="flex space-x-1 bg-white/5 p-1 rounded-xl w-fit backdrop-blur-md border border-white/10">
                {[
                    { id: 'conduct', label: 'Conduct Exams', icon: Calendar },
                    { id: 'grading', label: 'Grade Submissions', icon: Edit },
                    { id: 'questions', label: 'Question Bank', icon: FileText },
                    { id: 'answers', label: 'Solution Vault', icon: CheckCircle },
                    { id: 'schedule', label: 'Schedule History', icon: ShieldCheck }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} className="mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search in vault..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-primary transition-all font-inter"
                        />
                    </div>
                </div>
                <div className="grid gap-4">
                    {renderTabContent()}
                </div>

            </GlassCard>

            {/* Schedule Exam Modal */}
            <AnimatePresence>
                {openSchedule && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto pt-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <GlassCard className="p-8 border-white/20 shadow-2xl relative">
                                <button onClick={() => setOpenSchedule(false)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <Trash2 size={24} className="rotate-45" />
                                </button>

                                <h3 className="text-2xl font-black text-white font-inter mb-1">Schedule Institutional Exam</h3>
                                <p className="text-xs text-indigo-400 mb-8 uppercase tracking-[0.2em] font-black">Official Assessment Deployment</p>

                                <form onSubmit={handleScheduleExam} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Exam Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Mid-Term Assessment"
                                                className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition-all font-inter text-sm"
                                                value={examData.title}
                                                onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                                            />
                                        </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Target Course</label>
                                                    <select
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs"
                                                        value={examData.course}
                                                        onChange={(e) => setExamData({ ...examData, course: e.target.value })}
                                                    >
                                                        <option value="">Select Course</option>
                                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Attached Material (Optional)</label>
                                                    <select
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs"
                                                        value={examData.linkedPaper}
                                                        onChange={e => setExamData({ ...examData, linkedPaper: e.target.value })}
                                                    >
                                                        <option value="">Select Question Paper</option>
                                                        {questionPapers.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Start Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white [color-scheme:dark]"
                                                        value={examData.scheduledStartTime}
                                                        onChange={(e) => setExamData({ ...examData, scheduledStartTime: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Expiry Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white [color-scheme:dark]"
                                                        value={examData.scheduledEndTime}
                                                        onChange={(e) => setExamData({ ...examData, scheduledEndTime: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Duration (Min)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white font-inter text-sm"
                                                        value={examData.duration}
                                                        onChange={(e) => setExamData({ ...examData, duration: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Max Marks</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white font-inter text-sm"
                                                        value={examData.totalMarks}
                                                        onChange={(e) => setExamData({ ...examData, totalMarks: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Pass %</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white font-inter text-sm"
                                                        value={examData.passingScore}
                                                        onChange={(e) => setExamData({ ...examData, passingScore: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Exam Mode</label>
                                                    <select
                                                        required
                                                        value={examData.examType}
                                                        onChange={(e) => setExamData({ ...examData, examType: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all font-inter appearance-none"
                                                    >
                                                        <option value="online-mcq" className="bg-slate-900">Online MCQ (Automatic Grading)</option>
                                                        <option value="pdf-based" className="bg-slate-900">PDF Question + Paper Answer (Manual Grading)</option>
                                                        <option value="hybrid" className="bg-slate-900">Online Descriptive (Manual Grading)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Instructions (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Use blue pen only"
                                                        value={examData.instructions || ''}
                                                        onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all font-inter"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setOpenSchedule(false)}
                                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
                                        >
                                            Abort
                                        </button>
                                        <ModernButton
                                            type="submit"
                                            className="flex-[2] !py-4 font-black uppercase text-[10px] tracking-[0.3em]"
                                        >
                                            Finalize & Notify
                                        </ModernButton>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto pt-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlassCard className="p-8 border-white/20 shadow-2xl relative">
                                <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white">
                                    <Trash2 size={24} className="rotate-45" />
                                </button>
                                <h3 className="text-2xl font-black text-white mb-6">Upload Exam Material</h3>
                                <form onSubmit={handleFileUpload} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white"
                                            value={uploadData.title}
                                            onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Type</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white"
                                            value={uploadData.type}
                                            onChange={e => setUploadData({ ...uploadData, type: e.target.value })}
                                        >
                                            <option value="exam_paper">Question Paper</option>
                                            <option value="answer_sheet">Answer Sheet</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Select File</label>
                                        <input
                                            type="file"
                                            required
                                            accept=".pdf,.doc,.docx,.jpg,.png"
                                            onChange={e => setUploadFile(e.target.files[0])}
                                            className="w-full text-sm text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-4">
                                        <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 text-white/40 text-xs font-black uppercase tracking-widest">Cancel</button>
                                        <ModernButton type="submit" disabled={uploading} className="flex-1">
                                            {uploading ? 'Uploading...' : 'Upload Now'}
                                        </ModernButton>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamManagement;
