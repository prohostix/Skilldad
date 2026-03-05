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
    RefreshCw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
    const [activeTab, setActiveTab] = useState('questions');
    const [searchTerm, setSearchTerm] = useState('');
    const [questionPapers, setQuestionPapers] = useState([]);
    const [answerKeys, setAnswerKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [courses, setCourses] = useState([]);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [examData, setExamData] = useState({
        title: '',
        course: '',
        duration: 60,
        passingScore: 70,
        totalPoints: 100,
        scheduledDate: '',
        deadline: '',
        maxAttempts: 1,
        isPublished: true,
        examMode: 'paper-based',
        mandatedSlotId: '',
        linkedPaper: '',
        answerKey: ''
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

    const fetchData = async () => {
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
            showToast('Exam list refreshed', 'success');
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to sync Exam Vault', 'error');
            setExams([]);
            setLoading(false);
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
                scheduledDate: '',
                deadline: '',
                maxAttempts: 1,
                isPublished: true,
                examMode: 'paper-based',
                mandatedSlotId: '',
                linkedPaper: '',
                answerKey: ''
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to schedule exam', 'error');
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
        if (window.confirm("Are you sure you want to remove this document?")) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`/api/documents/${id}`, config);
                showToast('Document removed', 'success');
                fetchData();
            } catch (err) {
                showToast('Failed to delete', 'error');
            }
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
                        onClick={fetchData}
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
                    {activeTab === 'questions' ? (
                        questionPapers.length > 0 ? questionPapers.map((paper) => (
                            <div key={paper._id} className="group relative flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg tracking-tight">{paper.title}</h4>
                                        <div className="flex items-center gap-4 text-xs text-white/40 mt-1.5 font-medium">
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider"><BookOpen size={14} className="text-white/20" /> Institutional Asset</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-white/20" /> {new Date(paper.createdAt).toLocaleDateString()}</span>
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-[10px] font-black uppercase tracking-widest">Admin Verified</span>
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
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 text-white transition-all duration-300 text-xs font-black uppercase tracking-widest"
                                    >
                                        <Plus size={16} /> Deploy Question
                                    </button>
                                    <div className="flex items-center bg-white/5 rounded-xl p-1 ml-2">
                                        <button onClick={() => handleView(paper)} className="p-2 text-white/40 hover:text-white transition-colors" title="View"><Eye size={18} /></button>
                                        <button onClick={() => handleDownload(paper)} className="p-2 text-white/40 hover:text-white transition-colors" title="Download"><Download size={18} /></button>
                                        <button onClick={() => handleDelete(paper._id)} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-sm">No Question Papers Received</p>
                            </div>
                        )
                    ) : activeTab === 'answers' ? (
                        answerKeys.length > 0 ? answerKeys.map((key) => (
                            <div key={key._id} className="group relative flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircle size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg tracking-tight">{key.title}</h4>
                                        <div className="flex items-center gap-4 text-xs text-white/40 mt-1.5 font-medium">
                                            <span className="flex items-center gap-1.5 uppercase tracking-wider"><ShieldCheck size={14} className="text-white/20" /> Solution Shield</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-white/20" /> {new Date(key.createdAt).toLocaleDateString()}</span>
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded">Official Key</span>
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
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 text-white transition-all duration-300 text-xs font-black uppercase tracking-widest"
                                    >
                                        <Plus size={16} /> Deploy Solution
                                    </button>
                                    <div className="flex items-center bg-white/5 rounded-xl p-1 ml-2">
                                        <button onClick={() => handleView(key)} className="p-2 text-white/40 hover:text-white transition-colors" title="View"><Eye size={18} /></button>
                                        <button onClick={() => handleDownload(key)} className="p-2 text-white/40 hover:text-white transition-colors" title="Download"><Download size={18} /></button>
                                        <button onClick={() => handleDelete(key._id)} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-sm">No Answer Sheets Received</p>
                            </div>
                        )
                    ) : activeTab === 'conduct' ? (
                        <div className="space-y-6">
                            {(() => {
                                const mandatedSlots = exams.filter(ex => ex.instructor?.role === 'admin' || (ex.instructor?._role === 'admin'));
                                const now = new Date();
                                const liveExams = exams.filter(ex => {
                                    const start = new Date(ex.scheduledDate);
                                    const end = ex.deadline ? new Date(ex.deadline) : new Date(start.getTime() + ex.duration * 60000);
                                    return now >= start && now <= end;
                                });

                                return (
                                    <>
                                        {liveExams.length > 0 && (
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-pulse">
                                                <p className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span> Ongoing Live Assessments
                                                </p>
                                                {liveExams.map(ex => (
                                                    <div key={ex._id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5 mb-2">
                                                        <div>
                                                            <p className="text-white text-sm font-bold">{ex.title}</p>
                                                            <p className="text-white/40 text-[10px]">{ex.course?.title}</p>
                                                        </div>
                                                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">LIVE NOW</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Mandated Admin Slots - Deployment Required</h5>
                                        {mandatedSlots.length > 0 ? mandatedSlots.map(slot => {
                                            const isDeployed = exams.some(ex => ex.mandatedSlotId === slot._id || (ex.scheduledDate === slot.scheduledDate && ex.instructor?.role === 'university'));
                                            return (
                                                <div key={slot._id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden group">
                                                    {!isDeployed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                                                    <div className="flex items-center gap-5">
                                                        <div className={`p-4 rounded-2xl ${isDeployed ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            {isDeployed ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-lg">{new Date(slot.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })} • Session</h4>
                                                            <div className="flex items-center gap-4 text-[10px] mt-2 font-bold uppercase tracking-wider">
                                                                <span className="text-white/60">Module: {slot.course?.title || 'Unknown'}</span>
                                                                <span className="text-indigo-400 flex items-center gap-1"><Clock size={12} /> {new Date(slot.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {isDeployed ? (
                                                                    <span className="text-emerald-400 flex items-center gap-1 uppercase tracking-tighter"><ShieldCheck size={10} /> Material Deployed</span>
                                                                ) : (
                                                                    <span className="text-amber-500 flex items-center gap-1 animate-pulse">Action Required • No Material</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ModernButton
                                                        size="sm"
                                                        variant={isDeployed ? "secondary" : "primary"}
                                                        onClick={() => {
                                                            setActiveTab('questions');
                                                            setExamData(prev => ({
                                                                ...prev,
                                                                mandatedSlotId: slot._id,
                                                                course: slot.course?._id || slot.course,
                                                                scheduledDate: slot.scheduledDate ? new Date(slot.scheduledDate).toISOString().slice(0, 16) : '',
                                                                deadline: slot.deadline ? new Date(slot.deadline).toISOString().slice(0, 16) : '',
                                                                duration: slot.duration,
                                                                totalPoints: slot.totalPoints || 100
                                                            }));
                                                            showToast("Pick a question paper for this slot", "info");
                                                        }}
                                                    >
                                                        {isDeployed ? "Manage Deploy" : "Assign Paper"}
                                                    </ModernButton>
                                                </div>
                                            );
                                        }) : (
                                            <div className="py-20 text-center text-white/20">
                                                <p className="font-bold uppercase tracking-widest text-sm">No Upcoming Mandated Slots from Admin</p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        exams.filter(ex => ex.instructor?.role === 'university').length > 0 ? exams.filter(ex => ex.instructor?.role === 'university').map((exam) => (
                            <div key={exam._id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{exam.title}</h4>
                                        <p className="text-xs text-white/40">{exam.course?.title}</p>
                                        <div className="flex items-center gap-4 text-[10px] mt-2 font-bold uppercase tracking-wider">
                                            <span className="text-emerald-400 flex items-center gap-1"><Clock size={12} /> {new Date(exam.scheduledDate).toLocaleString()}</span>
                                            <span className="text-white/30">•</span>
                                            <span className="text-white/30">{exam.duration} Minutes</span>
                                            <span className={`px-2 py-0.5 rounded ${exam.linkedPaper ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {exam.linkedPaper ? 'Paper Attached' : 'MISSING PAPER'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded ${exam.answerKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500/70'}`}>
                                                {exam.answerKey ? 'Solution Attached' : 'MISSING SOLUTION'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <ModernButton size="sm" variant="secondary" onClick={() => navigate('/university/exams')}>View Report</ModernButton>
                                    <button onClick={() => handleDelete(exam._id)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-white/20">
                                <p className="font-bold uppercase tracking-widest text-sm">No University-scheduled History</p>
                            </div>
                        )
                    )}
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
                                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Assessment Title</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition-all font-inter text-sm"
                                                value={examData.title}
                                                onChange={e => setExamData({ ...examData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Assign to Admin Slot</label>
                                                <select
                                                    className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition-all font-inter text-sm"
                                                    onChange={(e) => {
                                                        const slot = exams.find(ex => ex._id === e.target.value);
                                                        if (slot) {
                                                            setExamData({
                                                                ...examData,
                                                                course: slot.course?._id || slot.course,
                                                                scheduledDate: slot.scheduledDate ? new Date(slot.scheduledDate).toISOString().slice(0, 16) : '',
                                                                deadline: slot.deadline ? new Date(slot.deadline).toISOString().slice(0, 16) : '',
                                                                duration: slot.duration,
                                                                passingScore: slot.passingScore || 70,
                                                                maxAttempts: slot.maxAttempts || 1,
                                                                totalPoints: slot.totalPoints || 100,
                                                                mandatedSlotId: slot._id
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Mandated Slot</option>
                                                    {exams.filter(ex => ex.instructor?.role === 'admin').map(slot => (
                                                        <option key={slot._id} value={slot._id}>
                                                            {new Date(slot.scheduledDate).toLocaleDateString()} - {slot.course?.title || 'Course Details'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[9px] text-amber-500 mt-2 font-black uppercase tracking-tighter">Note: SkillDad Policy enforces matching Admin-defined slots.</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Attached Material</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <select
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs"
                                                        value={examData.linkedPaper}
                                                        onChange={e => setExamData({ ...examData, linkedPaper: e.target.value })}
                                                    >
                                                        <option value="">Select Question Paper</option>
                                                        {questionPapers.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                                    </select>
                                                    <select
                                                        className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs"
                                                        value={examData.answerKey}
                                                        onChange={e => setExamData({ ...examData, answerKey: e.target.value })}
                                                    >
                                                        <option value="">Select Answer Key (Optional)</option>
                                                        {answerKeys.map(k => <option key={k._id} value={k._id}>{k.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Target Course (Inherited)</label>
                                                <select
                                                    required
                                                    disabled
                                                    className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white opacity-50 cursor-not-allowed text-xs"
                                                    value={examData.course}
                                                >
                                                    <option value="">Select Course</option>
                                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Duration (Mins)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 font-inter text-sm"
                                                    value={examData.duration}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Total Marks (Inherited)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 font-inter text-sm"
                                                    value={examData.totalPoints}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Passing Score % (Inherited)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 font-inter text-sm"
                                                    value={examData.passingScore}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Max Attempts (Inherited)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 font-inter text-sm"
                                                    value={examData.maxAttempts}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Activation (Inherited)</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 [color-scheme:dark]"
                                                    value={examData.scheduledDate}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Deadline (Inherited)</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    readOnly
                                                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white opacity-50 [color-scheme:dark]"
                                                    value={examData.deadline}
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
