import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Plus,
    Activity,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    FileCheck,
    HelpCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';

const PartnerExamManagement = () => {
    // Standardizing assessment workflows for partner ecosystem
    const toLocalDateTimeString = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    const [activeTab, setActiveTab] = useState('conduct');
    const [activeVaultFolder, setActiveVaultFolder] = useState('exam_paper');
    const [searchTerm, setSearchTerm] = useState('');
    const [questionPapers, setQuestionPapers] = useState([]);
    const [answerKeys, setAnswerKeys] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
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
        passingScore: 40,
        totalMarks: 100,
        scheduledStartTime: '',
        scheduledEndTime: '',
        maxAttempts: 1,
        isPublished: true,
        examMode: 'online-mcq',
        mandatedSlotId: '',
        linkedPaper: '',
        answerKey: '',
        examType: 'pdf-based',
        existingExamId: '',
        deploymentMode: 'new',
        batchId: ''
    });
    const [availableBatches, setAvailableBatches] = useState([]);

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

    // Stats
    const stats = {
        totalExams: exams.length,
        pendingGrading: exams.filter(e => {
            // Logic to find exams with pending submissions
            return true; // Simplified for now
        }).length,
        totalMaterials: questionPapers.length + answerKeys.length,
        activeStudents: 128 // Placeholder
    };

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

            setQuestionPapers(docsRes.data.filter(d => d.type === 'exam_paper'));
            setAnswerKeys(docsRes.data.filter(d => d.type === 'answer_sheet'));
            setAllDocuments(docsRes.data);
            setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
            setCourses(coursesRes.data);
            setLoading(false);
            if (showSuccessToast) {
                showToast('Exam system synchronized', 'success');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to sync system data', 'error');
            setExams([]);
            setLoading(false);
        }
    };

    const fetchSubmissions = async (examId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`/api/submissions/exam/${examId}`, config);
            setSubmissions(data.submissions || []);
            setSelectedExamForGrading(examId);
            setActiveTab('grading'); // Switch tab when viewing submissions
        } catch (err) {
            console.error('Error fetching submissions:', err);
            showToast('Access denied to submissions', 'error');
            setSubmissions([]);
        }
    };

    useEffect(() => {
        if (socket && selectedExamForGrading) {
            const handleNewSubmission = (data) => {
                showToast(`New submission: ${data.studentName}`, 'info');
                fetchSubmissions(selectedExamForGrading);
            };
            socket.on('EXAM_SUBMISSION_RECEIVED', handleNewSubmission);
            return () => socket.off('EXAM_SUBMISSION_RECEIVED', handleNewSubmission);
        }
    }, [socket, selectedExamForGrading]);

    const handleGradeSubmission = async (submissionId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const answers = Object.keys(gradingData).map(questionId => ({
                questionId,
                marksAwarded: Number(gradingData[questionId].marks || 0),
                feedback: gradingData[questionId].feedback || ''
            }));

            await axios.post(`/api/submissions/${submissionId}/grade`, { answers }, config);
            showToast('Grades synchronized successfully', 'success');
            setSelectedSubmission(null);
            setGradingData({});

            if (selectedExamForGrading) {
                fetchSubmissions(selectedExamForGrading);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Grading submission failed', 'error');
        }
    };

    const handlePublishResults = async (examId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (!window.confirm('Broadcast results to all students? This action will enable score visibility.')) {
                return;
            }

            const { data } = await axios.post(`/api/results/exams/${examId}/publish-results`, {}, config);
            showToast(`Results Broadcasted: ${data.publishedCount} notifications sent.`, 'success');
            fetchSubmissions(examId);
        } catch (err) {
            showToast(err.response?.data?.message || 'Publishing failed', 'error');
        }
    };

    const viewSubmissionForGrading = async (submission) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`/api/exams/exam-submissions/${submission._id}`, config);
            const fullSubmission = data.submission || data;
            setSelectedSubmission(fullSubmission);

            const initialGrading = {};
            (fullSubmission.answers || []).forEach(answer => {
                const questionId = answer.question?._id || answer.questionId;
                initialGrading[questionId] = {
                    marks: answer.marksAwarded || 0,
                    feedback: answer.feedback || ''
                };
            });
            setGradingData(initialGrading);
        } catch (err) {
            showToast('Failed to load full submission payload', 'error');
            setSelectedSubmission(submission);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return showToast('No file selected', 'error');

        setUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('document', uploadFile);
            formData.append('title', uploadData.title || uploadFile.name);
            formData.append('description', uploadData.description || 'System asset');
            formData.append('type', uploadData.type);
            formData.append('course', uploadData.course || '');

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post('/api/documents/upload', formData, config);
            showToast('Asset secured in vault.', 'success');
            setShowUploadModal(false);
            setUploadData({ title: '', description: '', type: 'exam_paper', course: '' });
            setUploadFile(null);
            fetchData();
        } catch (err) {
            showToast('Vault rejection: ' + (err.response?.data?.message || 'Check connection'), 'error');
        } finally {
            setUploading(false);
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

    const handleScheduleExam = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (examData.deploymentMode === 'existing' && examData.existingExamId) {
                await axios.put(`/api/exams/admin/${examData.existingExamId}/link-paper`, { linkedPaperId: examData.linkedPaper }, config);
                showToast('Protocol linked to existing exam slot.', 'success');
            } else {
                const payload = {
                    ...examData,
                    scheduledStartTime: examData.scheduledStartTime ? new Date(examData.scheduledStartTime).toISOString() : null,
                    scheduledEndTime: examData.scheduledEndTime ? new Date(examData.scheduledEndTime).toISOString() : null,
                    description: `B2B Deployment: ${examData.title}`
                };
                await axios.post('/api/exams', payload, config);
                showToast('Assessment deployed to production.', 'success');
            }

            setOpenSchedule(false);
            setExamData({
                title: '', course: '', duration: 60, passingScore: 40, totalMarks: 100,
                scheduledStartTime: '', scheduledEndTime: '', maxAttempts: 1, isPublished: true,
                examMode: 'online-mcq', mandatedSlotId: '', linkedPaper: '', answerKey: '', examType: 'pdf-based',
                existingExamId: '', deploymentMode: 'new'
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Deployment failed', 'error');
        }
    };

    const handleExcelUpload = async (examId) => {
        if (!excelFile) return showToast('Selection required', 'error');
        setUploadingExcel(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('excel', excelFile);
            const config = {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post(`/api/exams/${examId}/bulk-upload-questions`, formData, config);
            showToast('Logic bank synchronized.', 'success');
            setExcelFile(null);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Batch sync failed', 'error');
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

    const handleDelete = async (id) => {
        if (window.confirm("Permanently remove asset?")) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`/api/documents/${id}`, config);
                showToast('Asset removed.', 'success');
                fetchData();
            } catch (err) {
                showToast('Action restricted', 'error');
            }
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Permanently delete this exam? This action cannot be undone.')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/exams/admin/${examId}`, config);
            showToast('Exam deleted successfully.', 'success');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete exam', 'error');
        }
    };

    const isExamCompleted = (exam) => {
        if (exam.status === 'completed') return true;
        if (exam.scheduledEndTime && new Date(exam.scheduledEndTime) < new Date()) return true;
        return false;
    };

    const activeExams = exams.filter(e => !isExamCompleted(e));
    const completedExams = exams.filter(e => isExamCompleted(e));

    const filteredExams = activeExams.filter(e => 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHistoryExams = completedExams.filter(e => 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPapers = questionPapers.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVaultDocs = allDocuments.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) && p.type === activeVaultFolder
    );

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                if (id !== 'grading') setSelectedExamForGrading(null);
            }}
            className={`flex items-center px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative group ${
                activeTab === id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
            }`}
        >
            <Icon size={14} className={`mr-2 transition-transform duration-500 ${activeTab === id ? 'scale-110' : 'group-hover:scale-105'}`} />
            {label}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-6 right-6 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    );

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <GlassCard style={{ borderRadius: '8px' }} className="p-0.5 h-10 flex items-center justify-between group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10 pl-1.5">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0">{title}</p>
                <h3 className="text-base font-black text-white leading-none">{value}</h3>
            </div>
            <div className={`p-1 rounded bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                <Icon size={12} strokeWidth={2.5} />
            </div>
        </GlassCard>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-inter pb-10 selection:bg-primary/30">
            <div className="max-w-7xl mx-auto px-6 pt-0 space-y-0">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 -mt-8 mb-4">
                    <div className="space-y-0">
                        <DashboardHeading title="Exam Management" className="!text-2xl !tracking-tighter" />
                    </div>
                    <div className="flex items-center gap-4">
                        <ModernButton
                            variant="secondary"
                            onClick={() => fetchData(true)}
                            disabled={loading}
                            className="!px-4 !py-2 !rounded-xl !bg-white/5 !border-white/10 hover:!bg-white/10 transition-all group !text-xs"
                        >
                            <RefreshCw size={14} className={`mr-2 transition-all ${loading ? 'animate-spin text-primary' : 'group-hover:rotate-180'}`} />
                            {loading ? 'Syncing...' : 'Sync System'}
                        </ModernButton>
                        <ModernButton 
                            onClick={() => setShowUploadModal(true)}
                            className="!px-4 !py-2 !rounded-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all !text-xs"
                        >
                            <Plus size={14} className="mr-2" />
                            New Asset
                        </ModernButton>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    <StatCard title="Active Exams" value={stats.totalExams} icon={Activity} color="blue" />
                    <StatCard title="Pending Grading" value={stats.pendingGrading} icon={Clock} color="amber" />
                    <StatCard title="Total Materials" value={stats.totalMaterials} icon={FileText} color="purple" />
                    <StatCard title="Enrolled Pulse" value={stats.activeStudents} icon={TrendingUp} color="emerald" />
                </div>

                {/* Navigation & Search Bar */}
                <div className="sticky top-1 z-40 flex flex-col xl:flex-row xl:items-center justify-between gap-2 p-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl mt-0">
                    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar px-1">
                        <TabButton id="conduct" label="Conduct" icon={Calendar} />
                        <TabButton id="grading" label="Grading" icon={Edit} />
                        <TabButton id="questions" label="Vault" icon={ShieldCheck} />
                        <TabButton id="history" label="History" icon={Clock} />
                    </div>
                    <div className="relative group w-full xl:w-72 px-1">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + (selectedExamForGrading || '')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="mt-4 space-y-6"
                    >
                        {/* CONDUCT TAB */}
                        {activeTab === 'conduct' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-black text-white/90 tracking-tight flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        Active Examination Protocols
                                    </h3>
                                    <div className="flex gap-2">
                                        <ModernButton size="sm" variant="secondary" onClick={handleDownloadTemplate} className="!rounded-lg !bg-white/5 !border-white/10 !text-[10px] !px-3">
                                            <Download size={12} className="mr-1.5" /> Template
                                        </ModernButton>
                                        <ModernButton size="sm" onClick={() => {
                                            setSelectedDoc(null);
                                            setExamData({
                                                ...examData,
                                                title: '', course: '', examMode: 'online-mcq', examType: 'online-mcq'
                                            });
                                            setOpenSchedule(true);
                                        }} className="!rounded-lg !text-[10px] !px-3">
                                            <Plus size={12} className="mr-1.5" /> Launch Exam
                                        </ModernButton>
                                    </div>
                                </div>
                                
                                {filteredExams.length > 0 ? filteredExams.map((exam) => (
                                    <GlassCard key={exam._id} className="p-4 group hover:bg-white/[0.04] transition-all duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-base font-bold text-white tracking-tight">{exam.title}</h4>
                                                    <p className="text-[10px] text-white/40 font-medium">{exam.course?.title || 'General Assessment'}</p>
                                                    <div className="flex items-center gap-3 pt-0.5">
                                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/30">
                                                            <Calendar size={10} /> {new Date(exam.scheduledStartTime || exam.scheduledDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/30">
                                                            <Clock size={10} /> {exam.duration} Min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/partner/exams/${exam._id}/questions`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
                                                    title="Manage Questions"
                                                >
                                                    <HelpCircle size={12} /> Questions
                                                </button>
                                                <div className="flex flex-col gap-1">
                                                    <input 
                                                        type="file" 
                                                        id={`excel-${exam._id}`}
                                                        className="hidden" 
                                                        onChange={(e) => setExcelFile(e.target.files[0])}
                                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    />
                                                    <div className="flex items-center gap-1.5">
                                                        <label 
                                                            htmlFor={`excel-${exam._id}`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-white/60 hover:bg-white/10 cursor-pointer transition-all tracking-widest"
                                                        >
                                                            <Upload size={12} /> 
                                                            {excelFile ? 'Ready' : 'Bulk Questions'}
                                                        </label>
                                                        {excelFile && (
                                                            <button 
                                                                onClick={() => handleExcelUpload(exam._id)}
                                                                className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all"
                                                            >
                                                                <RefreshCw size={12} className={uploadingExcel ? 'animate-spin' : ''} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <ModernButton
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => fetchSubmissions(exam._id)}
                                                    className="!rounded-lg !border-white/10 !text-[9px] !px-3 !py-1.5 !font-black !uppercase !tracking-widest"
                                                >
                                                    <Users size={12} className="mr-1.5" /> Results
                                                </ModernButton>
                                                <button
                                                    onClick={() => handleDeleteExam(exam._id)}
                                                    className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )) : (
                                    <div className="py-24 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-[2rem]">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                            <Calendar size={32} className="text-white/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-bold text-xl tracking-tight">No Protocols Deployed</p>
                                            <p className="text-white/30 text-sm max-w-xs mx-auto">Ready to conduct an examination? Start by launching a new protocol.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GRADING TAB */}
                        {activeTab === 'grading' && (
                            <div className="space-y-8">
                                {!selectedSubmission ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {selectedExamForGrading && (
                                                    <button 
                                                        onClick={() => setSelectedExamForGrading(null)}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white/60 transition-all"
                                                    >
                                                        <ArrowLeft size={20} />
                                                    </button>
                                                )}
                                                <h3 className="text-xl font-black text-white/90 tracking-tight flex items-center gap-3">
                                                    <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                                    {selectedExamForGrading ? 'Assessment Submissions' : 'Submissions Command'}
                                                </h3>
                                            </div>
                                            {selectedExamForGrading && (
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const currentExam = exams.find(e => e._id === selectedExamForGrading);
                                                        const allGraded = submissions.length > 0 && submissions.every(s => s.status === 'graded');
                                                        return (
                                                            <>
                                                                {allGraded && !currentExam?.resultsPublished && (
                                                                    <ModernButton 
                                                                        size="sm" 
                                                                        onClick={() => handlePublishResults(selectedExamForGrading)}
                                                                        className="!bg-emerald-500 !text-white shadow-xl shadow-emerald-500/20"
                                                                    >
                                                                        <TrendingUp size={16} className="mr-2" /> Publish Results
                                                                    </ModernButton>
                                                                )}
                                                                {currentExam?.resultsPublished && (
                                                                    <div className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                        <FileCheck size={14} /> Records Live
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                        {!selectedExamForGrading ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {exams.map(exam => (
                                                    <GlassCard key={exam._id} className="p-6 group cursor-pointer hover:bg-white/[0.04] transition-all duration-500" onClick={() => fetchSubmissions(exam._id)}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform duration-500">
                                                                    <Edit size={24} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{exam.title}</h4>
                                                                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">{exam.course?.title}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-1" />
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Progress Monitor */}
                                                {submissions.length > 0 && (() => {
                                                    const gradedCount = submissions.filter(s => s.status === 'graded').length;
                                                    const total = submissions.length;
                                                    const percent = (gradedCount / total) * 100;
                                                    return (
                                                        <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] space-y-6">
                                                            <div className="flex items-end justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Grading Velocity</p>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-4xl font-black text-white">{gradedCount}</span>
                                                                        <span className="text-lg font-bold text-white/20">/ {total} Synchronized</span>
                                                                    </div>
                                                                </div>
                                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${percent === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                                                    {percent === 100 ? 'Analysis Complete' : 'Analysis In Progress'}
                                                                </div>
                                                            </div>
                                                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percent}%` }}
                                                                    className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-primary'} shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]`}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Submission List */}
                                                <div className="grid grid-cols-1 gap-3">
                                                    {submissions.map(sub => (
                                                        <GlassCard key={sub._id} className="p-5 flex items-center justify-between group hover:bg-white/[0.04] transition-all duration-500">
                                                            <div className="flex items-center gap-5">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${sub.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                                                    <Users size={20} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h5 className="font-bold text-white">{sub.student?.name || 'Anonymous Student'}</h5>
                                                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                                                        <span className="text-white/30">{sub.student?.email}</span>
                                                                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                                                                        <span className={sub.status === 'graded' ? 'text-emerald-400' : 'text-amber-500'}>{sub.status}</span>
                                                                        {sub.status === 'graded' && (
                                                                            <>
                                                                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                                                                <span className="text-white/60">Score: {sub.obtainedMarks} / {sub.totalMarks}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ModernButton
                                                                size="sm"
                                                                variant={sub.status === 'graded' ? 'secondary' : 'primary'}
                                                                onClick={() => viewSubmissionForGrading(sub)}
                                                                className="!rounded-lg !text-[10px] !px-3 !py-1 mt-2"
                                                            >
                                                                {sub.status === 'graded' ? 'Review Logic' : 'Execute Grading'}
                                                            </ModernButton>
                                                        </GlassCard>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* DETAILED GRADING VIEW */
                                    <div className="max-w-4xl mx-auto space-y-8">
                                        <div className="flex items-center justify-between pb-8 border-b border-white/10">
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => setSelectedSubmission(null)} className="p-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all">
                                                    <ArrowLeft size={24} />
                                                </button>
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">Student Analysis</p>
                                                    <h3 className="text-3xl font-black text-white tracking-tight">{selectedSubmission.student?.name}</h3>
                                                    <p className="text-sm text-white/40 font-medium">{selectedSubmission.student?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Submission Token</p>
                                                <p className="text-xs font-mono text-white/40">{selectedSubmission._id}</p>
                                            </div>
                                        </div>

                                        {/* Answer Sheet Preview if exists */}
                                        {selectedSubmission.answer_sheet_url && (
                                            <GlassCard className="p-8 bg-emerald-500/5 border-emerald-500/20 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                        <FileCheck size={32} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-lg font-bold text-white tracking-tight">External Asset Detected</h5>
                                                        <p className="text-sm text-white/40">Paper-based submission found. Review the file before finalizing scores.</p>
                                                    </div>
                                                </div>
                                                <ModernButton 
                                                    onClick={() => {
                                                        const url = selectedSubmission.answer_sheet_url.startsWith('http') 
                                                            ? selectedSubmission.answer_sheet_url 
                                                            : `${import.meta.env.VITE_API_URL || ''}/${selectedSubmission.answer_sheet_url}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="!bg-emerald-500 !rounded-2xl"
                                                >
                                                    <Download size={18} className="mr-2" /> Open Asset
                                                </ModernButton>
                                            </GlassCard>
                                        )}

                                        {/* Question Grading List */}
                                        <div className="space-y-6">
                                            {selectedSubmission.answers?.map((ans, idx) => {
                                                const qId = ans.question?._id || ans.questionId;
                                                const question = ans.question;
                                                return (
                                                    <div key={qId || idx} className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                                                        <div className="absolute top-0 right-0 p-8">
                                                            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Block {idx + 1}</span>
                                                        </div>
                                                        <div className="max-w-2xl">
                                                            <h6 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Question Protocol</h6>
                                                            <p className="text-xl font-bold text-white leading-relaxed">{question?.questionText || 'Standard Logic Query'}</p>
                                                        </div>

                                                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3">
                                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                                <Activity size={12} /> Captured Response
                                                            </p>
                                                            {ans.questionType === 'mcq' ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                                                    <p className="text-white text-lg font-medium">{question?.options?.[ans.selectedOption]?.text || `Selected Option ID: ${ans.selectedOption}`}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-white/80 text-lg font-medium whitespace-pre-wrap leading-relaxed">{ans.textAnswer || 'NULL_RESPONSE_RETRY_MANDATORY'}</p>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Score Assignment</label>
                                                                <div className="relative">
                                                                    <input 
                                                                        type="number"
                                                                        max={question?.marks || 100}
                                                                        min="0"
                                                                        step="0.5"
                                                                        value={gradingData[qId]?.marks ?? ans.marksAwarded ?? 0}
                                                                        onChange={(e) => setGradingData({...gradingData, [qId]: {...gradingData[qId], marks: parseFloat(e.target.value) || 0}})}
                                                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-primary/50 transition-all text-xl"
                                                                    />
                                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-xs uppercase">/ {question?.marks || 0} MAX</div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Logic Feedback</label>
                                                                <input 
                                                                    type="text"
                                                                    placeholder="Optional qualitative feedback..."
                                                                    value={gradingData[qId]?.feedback || ''}
                                                                    onChange={(e) => setGradingData({...gradingData, [qId]: {...gradingData[qId], feedback: e.target.value}})}
                                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary/50 transition-all text-sm placeholder:text-white/10"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between pt-10 border-t border-white/10">
                                            <p className="text-white/30 text-xs italic font-medium max-w-xs">Confirming these scores will synchronize the data with the Student Results Vault and trigger a status update.</p>
                                            <div className="flex gap-4">
                                                <ModernButton variant="secondary" onClick={() => setSelectedSubmission(null)} className="!px-10 !rounded-2xl">Cancel</ModernButton>
                                                <ModernButton onClick={() => handleGradeSubmission(selectedSubmission._id)} className="!px-10 !rounded-2xl !bg-emerald-500 shadow-2xl shadow-emerald-500/20">Finalize Analysis</ModernButton>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VAULT TAB (Questions & Answers) */}
                        {activeTab === 'questions' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-black text-white/90 tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-8 bg-purple-500 rounded-full" />
                                        Secure Material Vault
                                    </h3>
                                    <ModernButton size="sm" onClick={() => setShowUploadModal(true)} className="!rounded-xl !bg-purple-500">
                                        <Plus size={16} className="mr-2" /> Add Asset
                                    </ModernButton>
                                </div>

                                <div className="flex items-center gap-2 mb-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-fit">
                                    <button 
                                        onClick={() => setActiveVaultFolder('exam_paper')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeVaultFolder === 'exam_paper' ? 'bg-purple-500 text-white' : 'text-white/40 hover:bg-white/5'}`}
                                    >
                                        Question Papers
                                    </button>
                                    <button 
                                        onClick={() => setActiveVaultFolder('answer_sheet')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeVaultFolder === 'answer_sheet' ? 'bg-emerald-500 text-white' : 'text-white/40 hover:bg-white/5'}`}
                                    >
                                        Solution Keys
                                    </button>
                                    <button 
                                        onClick={() => setActiveVaultFolder('other')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeVaultFolder === 'other' ? 'bg-blue-500 text-white' : 'text-white/40 hover:bg-white/5'}`}
                                    >
                                        General Assets
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {filteredVaultDocs.length > 0 ? filteredVaultDocs.map((paper) => (
                                        <GlassCard key={paper._id} className="p-3 group hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden" style={{ borderRadius: '8px' }}>
                                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">{paper.title}</h4>
                                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">
                                                            <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                                            <span>{(paper.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ModernButton 
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedDoc(paper);
                                                            setExamData({...examData, title: paper.title, linkedPaper: paper._id});
                                                            setOpenSchedule(true);
                                                        }}
                                                        className="!bg-white/5 !border-white/10 hover:!bg-purple-500 !transition-all !rounded-lg text-[10px] !py-1.5 !px-3 font-black uppercase tracking-widest whitespace-nowrap"
                                                    >
                                                        Deploy
                                                    </ModernButton>
                                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                                                        <button onClick={() => {
                                                            const url = paper.fileUrl?.startsWith('http') ? paper.fileUrl : `${import.meta.env.VITE_API_URL || ''}/${paper.fileUrl}`;
                                                            window.open(url, '_blank');
                                                        }} className="p-1.5 text-white/30 hover:text-white transition-all"><Eye size={14} /></button>
                                                        <button onClick={() => handleDelete(paper._id)} className="p-1.5 text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    )) : (
                                        <div className="col-span-full py-16 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                                            <ShieldCheck size={32} className="mx-auto mb-3 text-white/10" />
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Vault Empty: Initialize Sequence Required</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HISTORY TAB */}
                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-white/90 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                    Deployment Logs
                                </h3>
                                <div className="space-y-4">
                                    {filteredHistoryExams.length > 0 ? filteredHistoryExams.map(exam => (
                                        <div key={exam._id} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 border border-white/10">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white tracking-tight">{exam.title}</h5>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Finalized {new Date(exam.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Pass Rate</p>
                                                    <p className="text-lg font-black text-emerald-400">92%</p>
                                                </div>
                                                <ModernButton size="sm" variant="secondary" onClick={() => fetchSubmissions(exam._id)} className="!rounded-xl !bg-white/5 !border-white/10">View Audit</ModernButton>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-24 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-[2rem]">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                <Activity size={32} className="text-white/20" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-white font-bold text-xl tracking-tight">No Deployment History</p>
                                                <p className="text-white/30 text-sm max-w-xs mx-auto">Completed examinations will appear here for auditing.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* MODALS (Simplified Styles) */}
            {openSchedule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-black/80">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                        <GlassCard className="p-6 border-white/20 shadow-[0_0_60px_rgba(var(--primary-rgb),0.1)]">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-white tracking-tighter uppercase">Deploy Protocol</h2>
                                <button onClick={() => setOpenSchedule(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40"><ArrowLeft size={16} className="rotate-45" /></button>
                            </div>
                            <form onSubmit={handleScheduleExam} className="space-y-4">
                                {examData.linkedPaper && (
                                    <div className="flex bg-white/5 rounded-xl p-1 mb-2 border border-white/10">
                                        <button 
                                            type="button"
                                            onClick={() => setExamData({...examData, deploymentMode: 'new'})} 
                                            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${examData.deploymentMode === 'new' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            New Slot
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setExamData({...examData, deploymentMode: 'existing'})} 
                                            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${examData.deploymentMode === 'existing' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            Existing Slot
                                        </button>
                                    </div>
                                )}

                                {(!examData.linkedPaper || examData.deploymentMode === 'new') ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Protocol Label</label>
                                            <input required type="text" value={examData.title} onChange={e => setExamData({...examData, title: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary transition-all text-white text-sm" placeholder="Exam Title" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Subject Vector</label>
                                            <select
                                                required
                                                value={examData.course}
                                                onChange={async (e) => {
                                                    const courseId = e.target.value;
                                                    setExamData({ ...examData, course: courseId, batchId: '' });
                                                    if (courseId) {
                                                        try {
                                                            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                                                            const { data } = await axios.get(`/api/batches/course/${courseId}`, config);
                                                            setAvailableBatches(data);
                                                        } catch (err) {
                                                            console.error('Error fetching batches:', err);
                                                            setAvailableBatches([]);
                                                        }
                                                    } else {
                                                        setAvailableBatches([]);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary transition-all text-white/60 text-sm"
                                            >
                                                <option value="">Select Domain</option>
                                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        {examData.course && (
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Target Batch (Optional)</label>
                                                <select
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary transition-all text-white/60 text-sm"
                                                    value={examData.batchId}
                                                    onChange={e => setExamData({ ...examData, batchId: e.target.value })}
                                                >
                                                    <option value="">All Students in Course</option>
                                                    {availableBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Duration (MIN)</label>
                                            <input type="number" value={examData.duration} onChange={e => setExamData({...examData, duration: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Launch Sequence</label>
                                            <input required type="datetime-local" value={examData.scheduledStartTime} onChange={e => setExamData({...examData, scheduledStartTime: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Termination Sequence</label>
                                            <input required type="datetime-local" value={examData.scheduledEndTime} onChange={e => setExamData({...examData, scheduledEndTime: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Total Marks</label>
                                            <input required type="number" value={examData.totalMarks} onChange={e => setExamData({...examData, totalMarks: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Passing Score</label>
                                            <input required type="number" value={examData.passingScore} onChange={e => setExamData({...examData, passingScore: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Select Target Slot</label>
                                        <select required value={examData.existingExamId} onChange={e => setExamData({...examData, existingExamId: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary transition-all text-white/60 text-sm">
                                            <option value="">Choose an existing examination...</option>
                                            {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setOpenSchedule(false)} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all">Abort</button>
                                    <button type="submit" className="flex-1 py-2 bg-primary rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30 hover:bg-primary/80 transition-all">Deploy System</button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-black/80">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
                        <GlassCard className="p-6 border-white/20">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-white tracking-tighter uppercase">Secure Upload</h2>
                                <button type="button" onClick={() => setShowUploadModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40"><ArrowLeft size={16} className="rotate-45" /></button>
                            </div>
                            <form onSubmit={handleFileUpload} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Asset Label</label>
                                    <input required type="text" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm" placeholder="Document Title" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Classification</label>
                                        <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
                                            <option value="exam_paper">Question Protocol</option>
                                            <option value="answer_sheet">Solution Key</option>
                                            <option value="other">General Asset</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Domain Link</label>
                                        <select value={uploadData.course} onChange={e => setUploadData({...uploadData, course: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
                                            <option value="">Global Domain</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-all group text-center cursor-pointer relative">
                                    <input type="file" onChange={e => setUploadFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload size={20} className="mx-auto mb-2 text-white/20 group-hover:text-primary transition-colors" />
                                    <p className="text-xs font-bold text-white/40">{uploadFile ? uploadFile.name : 'Click or Drop Asset Here'}</p>
                                    <p className="text-[9px] text-white/10 mt-1 font-black uppercase tracking-widest">Max 50MB</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40 uppercase tracking-widest">Cancel</button>
                                    <button type="submit" disabled={uploading} className="flex-1 py-2 bg-primary rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                        {uploading ? 'Securing...' : 'Seal & Upload'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PartnerExamManagement;
