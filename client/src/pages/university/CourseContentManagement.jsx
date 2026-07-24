import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft, Plus, Save, Trash2, Video,
    Upload, FileText, CheckCircle2, AlertCircle, X,
    Layout, BookOpen, Clock, Users, Link,
    ChevronDown, ChevronUp, ArrowLeft, Image as ImageIcon,
    HelpCircle, Play, ClipboardList, Send, Download, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import BatchManagement from '../../components/ui/BatchManagement';
import { getMediaUrl } from '../../utils/media';

const CourseContentManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState([]);
    const [openAddModule, setOpenAddModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const [openAddVideo, setOpenAddVideo] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [newVideoData, setNewVideoData] = useState({ title: '', url: '' });

    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [documentUploading, setDocumentUploading] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [lessonMode, setLessonMode] = useState('link'); // 'link' | 'video' | 'document'
    const [selectedDocFile, setSelectedDocFile] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'batches'

    // Quiz editor state
    const [openQuizEditor, setOpenQuizEditor] = useState(false);
    const [activeQuizModuleId, setActiveQuizModuleId] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizSaving, setQuizSaving] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '', options: ['', '', '', ''], correctIndex: 0, explanation: ''
    });

    // Publish-to-batch state
    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [activePublishModuleId, setActivePublishModuleId] = useState(null);
    const [selectedPublishBatchIds, setSelectedPublishBatchIds] = useState([]);
    const [publishSaving, setPublishSaving] = useState(false);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/courses/${courseId}`, getAuthConfig());
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
            showToast('Failed to fetch course data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get(`/api/batches/course/${courseId}`);
            setBatches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    useEffect(() => {
        fetchCourse();
        fetchBatches();
    }, [courseId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/courses/${courseId}`, course, getAuthConfig());
            showToast('Course updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update course', 'error');
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle) return;
        try {
            await axios.post(`/api/courses/${courseId}/modules`, { title: newModuleTitle }, getAuthConfig());
            setOpenAddModule(false);
            setNewModuleTitle('');
            fetchCourse();
            showToast('Module added!', 'success');
        } catch (error) {
            showToast('Failed to add module', 'error');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Delete this entire module and its videos?')) return;
        try {
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}`, getAuthConfig());
            fetchCourse();
            showToast('Module removed', 'success');
        } catch (error) {
            showToast('Deletion failed', 'error');
        }
    };

    const handleAddVideo = async () => {
        if (!newVideoData.title || !newVideoData.url) return;
        try {
            await axios.post(`/api/courses/${courseId}/modules/${activeModuleId}/videos`, newVideoData, getAuthConfig());
            setOpenAddVideo(false);
            setNewVideoData({ title: '', url: '' });
            fetchCourse();
            showToast('Chapter added!', 'success');
        } catch (error) {
            showToast('Failed to add video', 'error');
        }
    };

    const handleDeleteVideo = async (moduleId, videoId) => {
        if (!window.confirm('Delete this chapter?')) return;
        try {
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/videos/${videoId}`, getAuthConfig());
            fetchCourse();
            showToast('Chapter removed', 'success');
        } catch (error) {
            showToast('Deletion failed', 'error');
        }
    };

    const thumbnailInputRef = React.useRef(null);

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('thumbnail', file);

        setThumbnailUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthConfig().headers
                }
            };
            const { data } = await axios.post(`/api/courses/${courseId}/upload-thumbnail`, formData, config);
            setCourse(prev => ({ ...prev, thumbnail: data.thumbnail }));
            fetchCourse();
            showToast('Thumbnail updated!', 'success');
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            showToast(error.response?.data?.message || 'Thumbnail upload failed', 'error');
        } finally {
            setThumbnailUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleVideoFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid video format. Use MP4, WEBM, or OGG.', 'error');
            return;
        }

        if (!newVideoData.title) {
            showToast('Please enter a lesson title first', 'error');
            return;
        }

        setVideoUploading(true);
        try {
            // 1. Create the video record first
            const { data: videoRecord } = await axios.post(`/api/courses/${courseId}/modules/${activeModuleId}/videos`, {
                title: newVideoData.title,
                url: 'uploading...'
            }, getAuthConfig());

            // 2. Upload the file to that record
            const formData = new FormData();
            formData.append('video', file);

            const uploadConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthConfig().headers
                }
            };

            await axios.post(
                `/api/courses/${courseId}/modules/${activeModuleId}/videos/${videoRecord._id}/upload`,
                formData,
                uploadConfig
            );

            showToast('Video uploaded and saved!', 'success');
            setOpenAddVideo(false);
            setNewVideoData({ title: '', url: '' });
            fetchCourse();
        } catch (error) {
            console.error(error);
            showToast('Video upload failed', 'error');
        } finally {
            setVideoUploading(false);
        }
    };

    const handleLessonFileUpload = async (moduleId, videoId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthConfig().headers
            }
        };

        const formData = new FormData();
        formData.append('file', file);

        setFileUploading(true);
        try {
            await axios.post(`/api/courses/${courseId}/modules/${moduleId}/videos/${videoId}/files`, formData, config);
            fetchCourse();
            showToast('File uploaded successfully!', 'success');
        } catch (error) {
            showToast('File upload failed', 'error');
        } finally {
            setFileUploading(false);
        }
    };

    const handleDocumentLessonUpload = async () => {
        if (!newVideoData.title) {
            showToast('Please enter a lesson title first', 'error');
            return;
        }
        if (!selectedDocFile) {
            showToast('Please select a document file', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('document', selectedDocFile);
        formData.append('title', newVideoData.title);
        setDocumentUploading(true);
        try {
            await axios.post(
                `/api/courses/${courseId}/modules/${activeModuleId}/upload-document`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig().headers } }
            );
            showToast('Document lesson uploaded!', 'success');
            setOpenAddVideo(false);
            setNewVideoData({ title: '', url: '' });
            setSelectedDocFile(null);
            setLessonMode('link');
            fetchCourse();
        } catch (error) {
            showToast(error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setDocumentUploading(false);
        }
    };

    const handleDeleteFile = async (moduleId, videoId, fileId) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            const updatedCourse = { ...course };
            const mIdx = updatedCourse.modules.findIndex(m => m._id === moduleId);
            const vIdx = updatedCourse.modules[mIdx].videos.findIndex(v => v._id === videoId);
            updatedCourse.modules[mIdx].videos[vIdx].attachments = updatedCourse.modules[mIdx].videos[vIdx].attachments.filter(f => f._id !== fileId);

            await axios.put(`/api/courses/${courseId}`, updatedCourse, getAuthConfig());
            fetchCourse();
            showToast('File removed', 'success');
        } catch (error) {
            showToast('Failed to remove file', 'error');
        }
    };

    // ---- Quiz Editor ----
    const handleOpenQuizEditor = (mod) => {
        setActiveQuizModuleId(mod._id);
        setQuizQuestions(mod.quiz?.questions || []);
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
        setOpenQuizEditor(true);
    };

    const handleAddQuestion = () => {
        if (!newQuestion.question.trim()) { showToast('Enter a question', 'error'); return; }
        if (newQuestion.options.some(o => !o.trim())) { showToast('Fill all 4 options', 'error'); return; }
        setQuizQuestions(prev => [...prev, { ...newQuestion, _id: `q_${Date.now()}` }]);
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
    };

    const downloadQuizExcelTemplate = () => {
        const templateData = [
            {
                "Question": "What is the primary role of a Hospital Administrator?",
                "Option A": "Managing healthcare facility operations and staff",
                "Option B": "Performing surgeries",
                "Option C": "Manufacturing medicines",
                "Option D": "Designing architectural blueprints",
                "Correct Option (A/B/C/D)": "A",
                "Explanation": "Hospital administrators oversee the operational, financial, and organizational aspects of healthcare facilities."
            },
            {
                "Question": "Which department handles patient billing and medical records?",
                "Option A": "Emergency Room",
                "Option B": "Health Information Management",
                "Option C": "Radiology",
                "Option D": "Pharmacy",
                "Correct Option (A/B/C/D)": "B",
                "Explanation": "HIM handles records, compliance, coding, and billing documentation."
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Template");
        XLSX.writeFile(workbook, "quiz_questions_template.xlsx");
        showToast('Quiz Excel Template downloaded!', 'success');
    };

    const handleQuizExcelBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (!jsonData || jsonData.length === 0) {
                    showToast('Excel file is empty or formatted incorrectly', 'error');
                    return;
                }

                const parsedQuestions = jsonData.map((row, idx) => {
                    const questionText = row["Question"] || row["Question Text"] || row["question"] || `Question ${idx + 1}`;
                    const optA = String(row["Option A"] || row["Option 1"] || row["option_a"] || '').trim();
                    const optB = String(row["Option B"] || row["Option 2"] || row["option_b"] || '').trim();
                    const optC = String(row["Option C"] || row["Option 3"] || row["option_c"] || '').trim();
                    const optD = String(row["Option D"] || row["Option 4"] || row["option_d"] || '').trim();

                    const options = [optA || 'Option A', optB || 'Option B', optC || 'Option C', optD || 'Option D'];

                    const correctStr = String(row["Correct Option (A/B/C/D)"] || row["Correct Option"] || row["Correct Answer"] || row["Answer"] || 'A').toUpperCase().trim();

                    let correctIndex = 0;
                    if (correctStr === 'B' || correctStr === '2') correctIndex = 1;
                    else if (correctStr === 'C' || correctStr === '3') correctIndex = 2;
                    else if (correctStr === 'D' || correctStr === '4') correctIndex = 3;

                    const explanation = String(row["Explanation"] || row["Solution"] || '');

                    return {
                        _id: `q_${Date.now()}_${idx}`,
                        question: String(questionText).trim(),
                        options: options,
                        correctIndex: correctIndex,
                        explanation: explanation
                    };
                });

                setQuizQuestions(prev => [...prev, ...parsedQuestions]);
                showToast(`Bulk imported ${parsedQuestions.length} questions from Excel!`, 'success');
            } catch (err) {
                console.error('Excel parse error:', err);
                showToast('Failed to parse Excel file. Please use the downloaded template format.', 'error');
            } finally {
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleRemoveQuestion = (qid) => {
        setQuizQuestions(prev => prev.filter(q => q._id !== qid));
    };

    const handleSaveQuiz = async () => {
        setQuizSaving(true);
        try {
            await axios.put(`/api/courses/${courseId}/modules/${activeQuizModuleId}/quiz`, { questions: quizQuestions }, getAuthConfig());
            showToast('Quiz saved!', 'success');
            setOpenQuizEditor(false);
            fetchCourse();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save quiz', 'error');
        } finally {
            setQuizSaving(false);
        }
    };

    const toggleModule = (modId) => {
        setExpandedModules(prev => ({
            ...prev,
            [modId]: !prev[modId]
        }));
    };

    // ---- Publish to Batch ----
    const handleOpenPublishModal = (mod) => {
        setActivePublishModuleId(mod._id);
        setSelectedPublishBatchIds(Array.isArray(mod.publishedBatches) ? mod.publishedBatches : []);
        setOpenPublishModal(true);
    };

    const handleSavePublishTargets = async () => {
        setPublishSaving(true);
        try {
            await axios.put(`/api/courses/${courseId}/modules/${activePublishModuleId}/publish`, { batchIds: selectedPublishBatchIds }, getAuthConfig());
            showToast('Publish settings saved!', 'success');
            setOpenPublishModal(false);
            fetchCourse();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save publish settings', 'error');
        } finally {
            setPublishSaving(false);
        }
    };

    if (loading || !course) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/university/courses')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all shadow-xl"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <DashboardHeading title="Course Builder" />
                        <p className="text-gray-400 mt-1">Building <span className="text-primary font-bold italic">"{course.title}"</span></p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center ${
                        course.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                        {course.status || 'Pending'} Approval
                    </span>
                    <ModernButton onClick={handleUpdate} className="flex items-center h-12">
                        <Save size={18} className="mr-2" /> Save Draft
                    </ModernButton>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sidebar: Course Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Course Thumbnail</label>
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                        />
                        <div 
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="relative group overflow-hidden rounded-2xl bg-black border border-white/10 aspect-video flex items-center justify-center cursor-pointer"
                        >
                            {course.thumbnail ? (
                                <img src={getMediaUrl(course.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            ) : (
                                <ImageIcon size={48} className="text-white/20" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        thumbnailInputRef.current?.click();
                                    }}
                                    disabled={thumbnailUploading}
                                    className="px-4 py-2 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <Upload size={14} className={thumbnailUploading ? "animate-spin" : ""} />
                                    {thumbnailUploading ? 'UPDATING...' : 'CHANGE COVER'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/30 mt-3 text-center uppercase tracking-wider font-medium">Recommended: 16:9 Aspect ratio (PNG/JPG)</p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Course Details</label>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all shadow-inner"
                                    value={course.title}
                                    onChange={e => setCourse({...course, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all shadow-inner resize-none"
                                    value={course.description || ''}
                                    onChange={e => setCourse({...course, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5 ml-1">Price (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all shadow-inner"
                                    value={course.price || ''}
                                    onChange={e => setCourse({...course, price: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all shadow-inner font-bold"
                                    value={course.category || ''}
                                    onChange={e => setCourse({...course, category: e.target.value})}
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'curriculum' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                            Curriculum Builder
                        </button>
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'batches' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                            Student Batches
                        </button>
                    </div>

                    {activeTab === 'curriculum' ? (
                        <GlassCard className="p-1 overflow-hidden h-fit">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Layout size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Curriculum Builder</h3>
                                        <p className="text-xs text-white/40">Manage sections and learning materials</p>
                                    </div>
                                </div>
                                <ModernButton
                                    variant="secondary"
                                    className="!py-2 !px-4 h-auto text-xs border border-white/10 hover:bg-white/5"
                                    onClick={() => setOpenAddModule(true)}
                                >
                                    <Plus size={16} className="mr-1.5" /> ADD SECTION
                                </ModernButton>
                            </div>

                            <div className="p-6 space-y-4">
                                {course.modules?.length === 0 ? (
                                    <div className="text-center py-20 px-4 bg-white/[0.02] rounded-3xl border-2 border-dashed border-white/5">
                                        <Play size={48} className="text-white/10 mx-auto mb-4" />
                                        <h4 className="text-white/60 font-bold mb-2">Build Your Curriculum</h4>
                                        <p className="text-white/30 text-xs mb-6 max-w-xs mx-auto">Create sections and add your instructional videos or documents to build the course path.</p>
                                        <ModernButton onClick={() => setOpenAddModule(true)} size="sm" variant="secondary" className="border border-white/10">
                                            Start with First Section
                                        </ModernButton>
                                    </div>
                                ) : course.modules?.map((mod, idx) => (
                                    <div key={mod._id} className="overflow-hidden bg-white/5 rounded-2xl border border-white/10 group">
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                                            onClick={() => toggleModule(mod._id)}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-black text-xs font-black text-white/50 flex items-center justify-center">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </div>
                                                <h4 className="text-sm font-bold text-white truncate">{mod.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">{mod.videos?.length || 0} Lessons</span>
                                                {mod.quiz?.questions?.length > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                                        ✓ {mod.quiz.questions.length}Q Quiz
                                                    </span>
                                                )}
                                                {!Array.isArray(mod.publishedBatches) ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/10 text-white/40 border border-white/10" title="Visible to every enrolled student (default)">
                                                        OPEN TO ALL
                                                    </span>
                                                ) : mod.publishedBatches.length === 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/20" title="Not visible to any students yet">
                                                        DRAFT
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/20" title="Only visible to students in the selected batch(es)">
                                                        {mod.publishedBatches.length} BATCH{mod.publishedBatches.length > 1 ? 'ES' : ''}
                                                    </span>
                                                )}
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 text-white/20 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all mr-1"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenPublishModal(mod); }}
                                                        title="Publish to Batch(es)"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-white/20 hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-all mr-1"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/university/courses/${courseId}/modules/${mod._id}/content/manage`); }}
                                                        title="Interactive Content (Manage & Add)"
                                                    >
                                                        <ClipboardList size={16} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all mr-1"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod._id); }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="text-white/40">
                                                        {expandedModules[mod._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedModules[mod._id] && (
                                            <div className="px-10 pb-4 space-y-1.5 border-t border-white/5 pt-4 bg-black/20 animate-in slide-in-from-top-4 duration-300">
                                                {mod.videos?.map((vid) => (
                                                    <div key={vid._id} className="space-y-2">
                                                        <div
                                                            className="p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 flex items-center justify-between transition-all group/item"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Video size={16} className="text-white/30 group-hover/item:text-primary transition-colors" />
                                                                <span className="text-xs text-white/60 group-hover/item:text-white font-medium">{vid.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <label className="p-1.5 text-white/10 hover:text-primary-light hover:bg-white/5 rounded-lg transition-all cursor-pointer" title="Upload Attachment">
                                                                    <Upload size={14} />
                                                                    <input type="file" className="hidden" onChange={(e) => handleLessonFileUpload(mod._id, vid._id, e)} />
                                                                </label>
                                                                <button
                                                                    className="p-1.5 text-white/10 group-hover/item:text-red-500/50 hover:!text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    onClick={() => handleDeleteVideo(mod._id, vid._id)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Attachments List */}
                                                        {vid.attachments?.length > 0 && (
                                                            <div className="ml-8 space-y-1">
                                                                {vid.attachments.map(file => (
                                                                    <div key={file._id} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg group/file">
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <FileText size={12} className="text-white/20" />
                                                                            <span className="text-[10px] text-white/40 truncate max-w-[150px]">{file.name}</span>
                                                                        </div>
                                                                        <button
                                                                            className="p-1 text-white/10 hover:text-red-500 opacity-0 group-file/file:opacity-100 transition-all"
                                                                            onClick={() => handleDeleteFile(mod._id, vid._id, file._id)}
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    className="w-full p-3 border-2 border-dashed border-white/5 rounded-xl text-[10px] font-black text-white/30 uppercase tracking-widest hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2"
                                                    onClick={() => { setActiveModuleId(mod._id); setOpenAddVideo(true); }}
                                                >
                                                    <Plus size={14} /> Add Lesson to Section
                                                </button>
                                                <button
                                                    className="w-full p-3 border-2 border-dashed border-white/5 rounded-xl text-[10px] font-black text-white/30 uppercase tracking-widest hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
                                                    onClick={() => handleOpenQuizEditor(mod)}
                                                >
                                                    <HelpCircle size={14} /> {mod.quiz?.questions?.length ? `Edit Quiz (${mod.quiz.questions.length} Q)` : 'Add Quiz Exercise'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    ) : (
                        <BatchManagement courseId={courseId} />
                    )}
                </div>
            </div>

            {/* Modals */}
            {openAddModule && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setOpenAddModule(false)}>
                    <GlassCard className="w-full max-w-sm p-8 border-white/20" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-bold text-white mb-6">Create New Section</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Section Name</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all shadow-inner"
                                    placeholder="e.g. Introduction to Figma"
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddModule()}
                                />
                            </div>
                            <div className="flex gap-4">
                                <ModernButton variant="secondary" className="flex-1 border border-white/10" onClick={() => setOpenAddModule(false)}>Cancel</ModernButton>
                                <ModernButton className="flex-1" onClick={handleAddModule}>Create</ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {openAddVideo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => { setOpenAddVideo(false); setLessonMode('link'); setSelectedDocFile(null); }}>
                    <GlassCard className="w-full max-w-md p-8 border-white/20" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-bold text-white mb-4">Add New Lesson</h4>

                        {/* Tabs */}
                        <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl">
                            {[
                                { key: 'link', label: '🔗 Video Link' },
                                { key: 'video', label: '🎬 Upload Video' },
                                { key: 'document', label: '📄 Upload Notes' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setLessonMode(tab.key)}
                                    className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                        lessonMode === tab.key
                                            ? 'bg-primary text-white shadow'
                                            : 'text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            {/* Lesson Title - always shown */}
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Lesson Title</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-bold"
                                    placeholder="e.g. Setting up your workspace"
                                    value={newVideoData.title}
                                    onChange={e => setNewVideoData({...newVideoData, title: e.target.value})}
                                />
                            </div>

                            {/* VIDEO LINK MODE */}
                            {lessonMode === 'link' && (
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Video / Content URL</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all text-xs font-mono"
                                            placeholder="https://vimeo.com/..."
                                            value={newVideoData.url}
                                            onChange={e => setNewVideoData({...newVideoData, url: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <ModernButton variant="secondary" className="flex-1 border border-white/10" onClick={() => setOpenAddVideo(false)}>Cancel</ModernButton>
                                        <ModernButton className="flex-1" onClick={handleAddVideo}>Add to Module</ModernButton>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD VIDEO MODE */}
                            {lessonMode === 'video' && (
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Video File (MP4, WEBM, MOV)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                        videoUploading ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'
                                    }`}>
                                        <Video size={24} className="text-white/20 mb-2" />
                                        <span className="text-xs text-white/30">{videoUploading ? 'Uploading...' : 'Click to select video file'}</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileUpload} disabled={videoUploading} />
                                    </label>
                                    {videoUploading && (
                                        <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-4 mt-4">
                                        <ModernButton variant="secondary" className="flex-1 border border-white/10" onClick={() => setOpenAddVideo(false)}>Cancel</ModernButton>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD DOCUMENT MODE */}
                            {lessonMode === 'document' && (
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Document (PDF, Word, Excel, PPT)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                        documentUploading ? 'border-emerald-500/50 bg-emerald-500/5' :
                                        selectedDocFile ? 'border-emerald-500/40 bg-emerald-500/5' :
                                        'border-white/10 hover:border-emerald-400/30 hover:bg-white/5'
                                    }`}>
                                        <FileText size={28} className={selectedDocFile ? 'text-emerald-400 mb-2' : 'text-white/20 mb-2'} />
                                        {selectedDocFile ? (
                                            <>
                                                <span className="text-xs font-bold text-emerald-400 max-w-[200px] truncate">{selectedDocFile.name}</span>
                                                <span className="text-[10px] text-white/30 mt-1">{(selectedDocFile.size / 1024).toFixed(0)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs text-white/30">Click to select document</span>
                                                <span className="text-[10px] text-white/20 mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                            className="hidden"
                                            onChange={e => setSelectedDocFile(e.target.files[0] || null)}
                                            disabled={documentUploading}
                                        />
                                    </label>
                                    {documentUploading && (
                                        <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-4 mt-4">
                                        <ModernButton variant="secondary" className="flex-1 border border-white/10" onClick={() => { setOpenAddVideo(false); setSelectedDocFile(null); setLessonMode('link'); }}>Cancel</ModernButton>
                                        <ModernButton
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-400"
                                            onClick={handleDocumentLessonUpload}
                                            disabled={documentUploading || !selectedDocFile}
                                        >
                                            {documentUploading ? 'Uploading...' : '📤 Upload as Lesson'}
                                        </ModernButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
            {openQuizEditor && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setOpenQuizEditor(false)}>
                    <GlassCard className="w-full max-w-2xl p-8 border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                <HelpCircle className="text-emerald-400" /> Module Assessment (Quiz)
                            </h4>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={downloadQuizExcelTemplate}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                    title="Download sample Excel template"
                                >
                                    <Download size={13} />
                                    Template
                                </button>
                                <input
                                    type="file"
                                    id="univ-quiz-excel-upload"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    onChange={handleQuizExcelBulkUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('univ-quiz-excel-upload')?.click()}
                                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                    title="Bulk upload questions from Excel"
                                >
                                    <FileSpreadsheet size={13} />
                                    Bulk Upload Excel
                                </button>
                                <button onClick={() => setOpenQuizEditor(false)} className="text-white/40 hover:text-white ml-2">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Existing Questions List */}
                            {quizQuestions.length > 0 && (
                                <div className="space-y-3 mb-8">
                                    <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Existing Questions ({quizQuestions.length})</h5>
                                    {quizQuestions.map((q, idx) => (
                                        <div key={q._id || idx} className="p-4 bg-white/5 rounded-xl border border-white/10 relative group">
                                            <button
                                                onClick={() => handleRemoveQuestion(q._id)}
                                                className="absolute top-3 right-3 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <p className="font-bold text-sm text-white mb-2">{idx + 1}. {q.question}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`text-xs p-2 rounded-lg ${oIdx === q.correctIndex ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-black/20 text-white/50 border border-transparent'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Question Form */}
                            <div className="p-5 bg-white/[0.02] rounded-2xl border border-dashed border-white/20 space-y-4">
                                <h5 className="text-[12px] font-black text-white/60 uppercase tracking-widest">Add New Question</h5>

                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-1">Question Text</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 text-sm"
                                        placeholder="What is the main advantage of...?"
                                        value={newQuestion.question}
                                        onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    className="w-3 h-3 accent-emerald-500 cursor-pointer"
                                                    checked={newQuestion.correctIndex === i}
                                                    onChange={() => setNewQuestion({...newQuestion, correctIndex: i})}
                                                />
                                            </div>
                                            <input
                                                className={`w-full pl-9 pr-3 py-2 bg-black/40 border rounded-lg text-xs outline-none transition-all ${newQuestion.correctIndex === i ? 'border-emerald-500/50 text-white bg-emerald-500/5' : 'border-white/10 text-white/70 focus:border-primary/50'}`}
                                                placeholder={`Option ${i + 1}`}
                                                value={newQuestion.options[i]}
                                                onChange={e => {
                                                    const newOpts = [...newQuestion.options];
                                                    newOpts[i] = e.target.value;
                                                    setNewQuestion({...newQuestion, options: newOpts});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-emerald-400/80 italic mt-1 ml-1">Select the radio button next to the correct answer.</p>

                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-1 mt-3">Explanation (Optional, shown after answering)</label>
                                    <input
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 outline-none focus:border-primary/50 text-xs"
                                        placeholder="This is correct because..."
                                        value={newQuestion.explanation}
                                        onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                    />
                                </div>

                                <ModernButton onClick={handleAddQuestion} variant="secondary" size="sm" className="w-full mt-4 border-white/10 hover:border-white/20">
                                    <Plus size={16} className="mr-2" /> Add Question to Quiz
                                </ModernButton>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <ModernButton variant="secondary" onClick={() => setOpenQuizEditor(false)}>
                                    Cancel
                                </ModernButton>
                                <ModernButton onClick={handleSaveQuiz} disabled={quizSaving} className="bg-emerald-500 hover:bg-emerald-400">
                                    {quizSaving ? 'Saving...' : 'Save Quiz Assessment'}
                                </ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {openPublishModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setOpenPublishModal(false)}>
                    <GlassCard className="w-full max-w-md p-8 border-white/20" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Send size={18} className="text-blue-400" /> Publish to Batch(es)
                        </h4>
                        <p className="text-xs text-white/40 mb-6 leading-relaxed">
                            Select which batch(es) can access this section. Leave everything unchecked to keep it as a draft
                            (hidden from all students). If you never publish a section at all, it stays open to every
                            enrolled student by default.
                        </p>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {batches.filter(b => b.is_active !== false).length === 0 ? (
                                <p className="text-xs text-white/30 italic text-center py-6">
                                    No active batches for this course yet. Create one in the Student Batches tab first.
                                </p>
                            ) : (
                                batches.filter(b => b.is_active !== false).map(batch => (
                                    <label key={batch.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-blue-500/30 transition-all">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                            checked={selectedPublishBatchIds.includes(String(batch.id))}
                                            onChange={(e) => {
                                                const batchIdStr = String(batch.id);
                                                setSelectedPublishBatchIds(prev =>
                                                    e.target.checked ? [...prev, batchIdStr] : prev.filter(id => id !== batchIdStr)
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-white/80 font-medium">{batch.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <ModernButton variant="secondary" className="flex-1 border border-white/10" onClick={() => setOpenPublishModal(false)}>
                                Cancel
                            </ModernButton>
                            <ModernButton
                                className="flex-1 bg-blue-500 hover:bg-blue-400"
                                onClick={handleSavePublishTargets}
                                disabled={publishSaving}
                            >
                                {publishSaving ? 'Saving...' : 'Save'}
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default CourseContentManagement;
