import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft, Plus, Save, Trash2, Video,
    Upload, FileText, CheckCircle2, AlertCircle, X,
    Layout, BookOpen, Clock, Users, Link,
    ChevronDown, ChevronUp, ArrowLeft, Image as ImageIcon,
    HelpCircle, Play, ClipboardList, Send, Download, FileSpreadsheet, Edit2
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
    const [newVideoData, setNewVideoData] = useState({ title: '', url: '', thumbnail: '' });
    const [lessonCoverUploading, setLessonCoverUploading] = useState(false);

    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [documentUploading, setDocumentUploading] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [lessonMode, setLessonMode] = useState('link'); // 'link' | 'video' | 'document'
    const [selectedDocFile, setSelectedDocFile] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'batches'

    // Edit Lesson state - lets a lesson created with just a title get its
    // video link / thumbnail attached later, since Add Lesson no longer requires them upfront.
    const [openEditLesson, setOpenEditLesson] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null); // { moduleId, lesson }
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonUrl, setEditLessonUrl] = useState('');
    const [editLessonThumbnail, setEditLessonThumbnail] = useState('');
    const [editLessonThumbnailUploading, setEditLessonThumbnailUploading] = useState(false);
    const [editLessonSaving, setEditLessonSaving] = useState(false);

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

    const handleLessonCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('coverImage', file);

        setLessonCoverUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthConfig().headers
                }
            };
            const { data } = await axios.post('/api/courses/upload-cover-image', formData, config);
            const coverPath = data.url || data.thumbnail || data.imageUrl;
            setNewVideoData(prev => ({ ...prev, thumbnail: coverPath }));
            showToast('Cover image uploaded!', 'success');
        } catch (error) {
            console.error('Cover upload error:', error);
            showToast(error.response?.data?.message || 'Failed to upload cover image', 'error');
        } finally {
            setLessonCoverUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleAddVideo = async () => {
        if (!newVideoData.title) return;
        try {
            await axios.post(`/api/courses/${courseId}/modules/${activeModuleId}/videos`, {
                title: newVideoData.title,
                url: newVideoData.url,
                thumbnail: newVideoData.thumbnail || ''
            }, getAuthConfig());
            setOpenAddVideo(false);
            setNewVideoData({ title: '', url: '', thumbnail: '' });
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

    const handleOpenEditLesson = (modId, vid) => {
        setEditingLesson({ moduleId: modId, lesson: vid });
        setEditLessonTitle(vid.title || '');
        setEditLessonUrl(vid.url || '');
        setEditLessonThumbnail(vid.thumbnail || '');
        setOpenEditLesson(true);
    };

    const handleEditLessonCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('coverImage', file);

        setEditLessonThumbnailUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthConfig().headers
                }
            };
            const { data } = await axios.post('/api/courses/upload-cover-image', formData, config);
            const coverPath = data.url || data.thumbnail || data.imageUrl;
            setEditLessonThumbnail(coverPath);
            showToast('Cover image uploaded!', 'success');
        } catch (error) {
            console.error('Cover upload error:', error);
            showToast(error.response?.data?.message || 'Failed to upload cover image', 'error');
        } finally {
            setEditLessonThumbnailUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSaveLessonEdit = async () => {
        if (!editLessonTitle.trim()) {
            showToast('Please enter a lesson title', 'error');
            return;
        }
        const { moduleId, lesson } = editingLesson || {};
        if (!moduleId || !lesson) return;

        setEditLessonSaving(true);
        try {
            await axios.put(`/api/courses/${courseId}/modules/${moduleId}/videos/${lesson._id}`, {
                title: editLessonTitle,
                url: editLessonUrl,
                thumbnail: editLessonThumbnail
            }, getAuthConfig());
            showToast('Lesson updated successfully!', 'success');
            setOpenEditLesson(false);
            setEditingLesson(null);
            fetchCourse();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update lesson', 'error');
        } finally {
            setEditLessonSaving(false);
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
                url: 'uploading...',
                thumbnail: newVideoData.thumbnail || ''
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
            setNewVideoData({ title: '', url: '', thumbnail: '' });
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
            setNewVideoData({ title: '', url: '', thumbnail: '' });
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
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/videos/${videoId}/files/${encodeURIComponent(fileId)}`, getAuthConfig());
            fetchCourse();
            showToast('File removed', 'success');
        } catch (error) {
            console.error('File remove failed:', error);
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
        <div className="font-jakarta min-h-screen bg-[#f8fafc] dark:bg-transparent -mx-3 sm:-mx-6 lg:-mx-8 -mt-2 -mb-28 lg:-mb-4 px-4 sm:px-6 lg:px-8 py-5 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <button 
                        onClick={() => navigate('/university/courses')}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all shrink-0 cursor-pointer"
                        title="Back to Courses"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            <span className="cb-page-title font-jakarta" style={{ color: '#380e6f' }}>Course Builder</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                            Building <span className="font-bold text-slate-800 dark:text-white">"{course.title}"</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center ${
                        course.status === 'approved' 
                            ? 'cb-status-approved' 
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                        {course.status === 'approved' ? 'Approved' : `${course.status || 'Pending'} Approval`}
                    </span>
                    <button 
                        onClick={handleUpdate} 
                        className="px-5 py-2.5 rounded-xl cb-primary-btn font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Save size={15} /> Save Draft
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Sidebar: Course Settings (4 cols = 33%) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Course Thumbnail */}
                    <div className="cb-card p-6">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3.5">COURSE THUMBNAIL</label>
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                        />
                        <div 
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="relative group overflow-hidden rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 aspect-video flex items-center justify-center cursor-pointer"
                        >
                            {course.thumbnail ? (
                                <img src={getMediaUrl(course.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            ) : (
                                <ImageIcon size={44} className="text-slate-300 dark:text-white/20" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-xs">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        thumbnailInputRef.current?.click();
                                    }}
                                    disabled={thumbnailUploading}
                                    className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                                >
                                    <Upload size={14} className={thumbnailUploading ? "animate-spin" : ""} />
                                    {thumbnailUploading ? 'UPDATING...' : 'CHANGE COVER'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3.5">RECOMMENDED: 16:9 ASPECT RATIO (PNG/JPG)</p>
                    </div>

                    {/* Course Details */}
                    <div className="cb-card p-6 space-y-4">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">COURSE DETAILS</label>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">TITLE</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 cb-input rounded-2xl text-sm font-semibold transition-all"
                                    value={course.title}
                                    onChange={e => setCourse({...course, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">DESCRIPTION</label>
                                <textarea 
                                    rows="3" 
                                    className="w-full px-4 py-3 cb-input rounded-2xl text-sm font-semibold transition-all resize-none"
                                    value={course.description || ''}
                                    onChange={e => setCourse({...course, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">PRICE (₹)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-3 cb-input rounded-2xl text-sm font-semibold transition-all"
                                    value={course.price === undefined || course.price === null ? '' : course.price}
                                    onChange={e => setCourse({...course, price: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area (8 cols = 67%) */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Top Tab Bar */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-[#edeef5] dark:bg-white/5 rounded-2xl sm:w-fit">
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'curriculum'
                                    ? 'cb-tab-active shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                            }`}
                        >
                            Curriculum Builder
                        </button>
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'batches'
                                    ? 'cb-tab-active shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                            }`}
                        >
                            Student Batches
                        </button>
                    </div>

                    {activeTab === 'curriculum' ? (
                        <div className="cb-card overflow-hidden">
                            <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 flex items-center justify-center text-[#380e6f] dark:text-purple-300 shrink-0">
                                        <Layout size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Curriculum Builder</h3>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">Manage sections and learning materials</p>
                                    </div>
                                </div>
                                <button 
                                    className="px-5 py-2 border border-slate-200 hover:border-slate-300 dark:border-white/20 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer" 
                                    onClick={() => setOpenAddModule(true)}
                                >
                                    <Plus size={14} /> ADD SECTION
                                </button>
                            </div>

                            <div className="p-6 sm:p-7 space-y-3.5">
                                {course.modules?.length === 0 ? (
                                    <div className="text-center py-20 px-4 bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5">
                                        <Play size={44} className="text-slate-300 dark:text-white/10 mx-auto mb-4" />
                                        <h4 className="text-slate-700 dark:text-white/70 font-bold mb-1.5">Build Your Curriculum</h4>
                                        <p className="text-slate-400 dark:text-white/30 text-xs mb-6 max-w-xs mx-auto">Create sections and add your instructional videos or documents to build the course path.</p>
                                        <button 
                                            onClick={() => setOpenAddModule(true)} 
                                            className="px-5 py-2.5 cb-primary-btn rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                                        >
                                            <Plus size={15} /> Start with First Section
                                        </button>
                                    </div>
                                ) : course.modules?.map((mod, idx) => (
                                    <div key={mod._id} className="overflow-hidden cb-section-row transition-all group">
                                        <div
                                            className="p-4 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-y-2 cursor-pointer"
                                            onClick={() => toggleModule(mod._id)}
                                        >
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                <div className="text-slate-700 dark:text-white/80 text-sm font-bold w-6 shrink-0">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{mod.title}</h4>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                                                <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">{mod.videos?.length || 0} LESSONS</span>
                                                {mod.quiz?.questions?.length > 0 && (
                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                                        ✓ {mod.quiz.questions.length}Q Quiz
                                                    </span>
                                                )}
                                                {!Array.isArray(mod.publishedBatches) ? (
                                                    <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#e8edf5] text-slate-600 dark:bg-white/10 dark:text-white/50 border border-slate-200 dark:border-white/5 tracking-wider" title="Visible to every enrolled student (default)">
                                                        OPEN TO ALL
                                                    </span>
                                                ) : mod.publishedBatches.length === 0 ? (
                                                    <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#fef3c7] text-[#d97706] border border-amber-200 tracking-wider" title="Not visible to any students yet">
                                                        DRAFT
                                                    </span>
                                                ) : (
                                                    <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#dbeafe] text-[#1d4ed8] border border-blue-200 tracking-wider" title="Only visible to students in the selected batch(es)">
                                                        {mod.publishedBatches.length} BATCH{mod.publishedBatches.length > 1 ? 'ES' : ''}
                                                    </span>
                                                )}
                                                <div className={`flex items-center gap-1 transition-opacity duration-150 ${expandedModules[mod._id] ? 'opacity-100 ml-1' : 'opacity-0 group-hover:opacity-100 ml-1'}`}>
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenPublishModal(mod); }}
                                                        title="Publish to Batch(es)"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/university/courses/${courseId}/modules/${mod._id}/content/manage`); }}
                                                        title="Interactive Content (Manage & Add)"
                                                    >
                                                        <ClipboardList size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod._id); }}
                                                        title="Delete Section"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div className="text-slate-400 ml-0.5">
                                                        {expandedModules[mod._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedModules[mod._id] && (
                                            <div className="px-6 pb-5 space-y-2 border-t border-slate-200/70 dark:border-white/5 pt-4 bg-white/70 dark:bg-black/20 animate-in slide-in-from-top-4 duration-300">
                                                {mod.videos?.map((vid) => (
                                                    <div key={vid._id} className="space-y-2">
                                                        <div 
                                                            className="p-3.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10 flex items-center justify-between transition-all group/item shadow-xs"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                                                {vid.contentType === 'document' ? (
                                                                    <FileText size={16} className="text-emerald-500 shrink-0" />
                                                                ) : vid.thumbnail ? (
                                                                    <img src={getMediaUrl(vid.thumbnail)} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/20 shrink-0" />
                                                                ) : (
                                                                    <Video size={16} className="text-slate-400 group-hover/item:text-[#380e6f] transition-colors shrink-0" />
                                                                )}
                                                                <span className="text-xs text-slate-800 dark:text-white/90 group-hover/item:text-slate-900 font-semibold truncate">{vid.title}</span>
                                                                {vid.contentType === 'document' && (
                                                                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                                                                        Doc
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <button
                                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                                                                    onClick={() => handleOpenEditLesson(mod._id, vid)}
                                                                    title="Edit Lesson"
                                                                >
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <label className="p-1.5 text-slate-400 hover:text-[#380e6f] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all cursor-pointer" title="Upload Attachment">
                                                                    <Upload size={13} />
                                                                    <input type="file" className="hidden" onChange={(e) => handleLessonFileUpload(mod._id, vid._id, e)} />
                                                                </label>
                                                                <button
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                    onClick={() => handleDeleteVideo(mod._id, vid._id)}
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Attachments List */}
                                                        {vid.attachments?.length > 0 && (
                                                            <div className="ml-8 space-y-1">
                                                                {vid.attachments.map((file, fIdx) => (
                                                                    <div key={file._id || file.url || fIdx} className="flex items-center justify-between p-2.5 bg-[#f4f6fa] dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl group/file">
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <FileText size={13} className="text-slate-400" />
                                                                            <span className="text-[11px] text-slate-600 dark:text-white/60 font-medium truncate max-w-[200px]">{file.name}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/file:opacity-100 transition-all"
                                                                            onClick={() => handleDeleteFile(mod._id, vid._id, file._id || file.url || file.name)}
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                                                    <button
                                                        className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-[#380e6f]/40 dark:hover:border-purple-500/40 rounded-xl text-[11px] font-bold text-slate-500 dark:text-white/40 hover:text-[#380e6f] dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        onClick={() => { setActiveModuleId(mod._id); setOpenAddVideo(true); }}
                                                    >
                                                        <Plus size={14} /> Add Lesson to Section
                                                    </button>
                                                    <button
                                                        className="w-full p-3 border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/30 hover:border-emerald-500/50 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        onClick={() => handleOpenQuizEditor(mod)}
                                                    >
                                                        <HelpCircle size={14} /> {mod.quiz?.questions?.length ? `Edit Quiz (${mod.quiz.questions.length} Q)` : 'Add Quiz Exercise'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <BatchManagement courseId={courseId} />
                    )}
                </div>
            </div>

            {/* MODALS */}
            {/* 1. Add Module / Section Modal */}
            {openAddModule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setOpenAddModule(false)}>
                    <div className="bg-white dark:bg-[#121424] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Section</h4>
                            <button onClick={() => setOpenAddModule(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Section Name</label>
                            <input
                                autoFocus
                                className="w-full px-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all"
                                placeholder="e.g. Introduction to Medical Sciences"
                                value={newModuleTitle}
                                onChange={e => setNewModuleTitle(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAddModule()}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => setOpenAddModule(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="flex-1 py-3 bg-[#380e6f] hover:bg-[#2d0b59] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                                onClick={handleAddModule}
                            >
                                Create Section
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Add Lesson Modal */}
            {openAddVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => { setOpenAddVideo(false); setLessonMode('link'); setSelectedDocFile(null); }}>
                    <div className="bg-white dark:bg-[#121424] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Add New Lesson</h4>
                            <button onClick={() => { setOpenAddVideo(false); setLessonMode('link'); setSelectedDocFile(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Mode Selector */}
                        <div className="flex gap-1.5 p-1 bg-[#edeef5] dark:bg-white/5 rounded-2xl">
                            {[
                                { key: 'link', label: '🔗 Video Link' },
                                { key: 'video', label: '🎬 Upload Video' },
                                { key: 'document', label: '📄 Upload Notes' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setLessonMode(tab.key)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        lessonMode === tab.key
                                            ? 'bg-[#380e6f] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Lesson Title</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all"
                                    placeholder="e.g. Overview of Patient Records"
                                    value={newVideoData.title}
                                    onChange={e => setNewVideoData({...newVideoData, title: e.target.value})}
                                />
                            </div>

                            {/* Cover Image for Link/Video */}
                            {(lessonMode === 'link' || lessonMode === 'video') && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cover Thumbnail (Optional)</label>
                                        {newVideoData.thumbnail && (
                                            <button
                                                type="button"
                                                onClick={() => setNewVideoData(prev => ({ ...prev, thumbnail: '' }))}
                                                className="text-red-500 hover:text-red-600 text-[10px] font-bold lowercase flex items-center gap-0.5 cursor-pointer"
                                            >
                                                <X size={10} /> remove
                                            </button>
                                        )}
                                    </div>
                                    {newVideoData.thumbnail ? (
                                        <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20 group">
                                            <img
                                                src={getMediaUrl(newVideoData.thumbnail)}
                                                alt="Cover preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer hover:bg-slate-100 shadow-md">
                                                    Change Image
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleLessonCoverUpload} disabled={lessonCoverUploading} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center gap-3 w-full px-4 py-3 border border-dashed rounded-2xl cursor-pointer transition-all ${
                                            lessonCoverUploading ? 'border-[#380e6f] bg-purple-50/50' : 'border-slate-300 dark:border-white/10 hover:border-[#380e6f]/50 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}>
                                            <ImageIcon size={18} className="text-slate-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-slate-500 dark:text-white/50 block truncate font-medium">
                                                    {lessonCoverUploading ? 'Uploading cover...' : 'Upload custom cover image (PNG, JPG, WEBP)'}
                                                </span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLessonCoverUpload} disabled={lessonCoverUploading} />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* LINK MODE */}
                            {lessonMode === 'link' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Video / Content URL (Optional)</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all"
                                            placeholder="https://vimeo.com/... or https://youtube.com/..."
                                            value={newVideoData.url}
                                            onChange={e => setNewVideoData({...newVideoData, url: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">You can leave this blank and attach the video later via Edit Lesson.</p>
                                    <div className="flex gap-3 mt-6">
                                        <button className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setOpenAddVideo(false)}>Cancel</button>
                                        <button className="flex-1 py-3 bg-[#380e6f] hover:bg-[#2d0b59] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer" onClick={handleAddVideo}>Add to Module</button>
                                    </div>
                                </div>
                            )}

                            {/* VIDEO UPLOAD MODE */}
                            {lessonMode === 'video' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Video File (MP4, WEBM, MOV)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        videoUploading ? 'border-[#380e6f] bg-purple-50/50' : 'border-slate-300 dark:border-white/10 hover:border-[#380e6f]/50 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}>
                                        <Video size={24} className="text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500 font-medium">{videoUploading ? 'Uploading...' : 'Click to select video file'}</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileUpload} disabled={videoUploading} />
                                    </label>
                                    {videoUploading && (
                                        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#380e6f] animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setOpenAddVideo(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* DOCUMENT UPLOAD MODE */}
                            {lessonMode === 'document' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Document (PDF, Word, Excel, PPT)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        documentUploading ? 'border-emerald-500 bg-emerald-50/40' :
                                        selectedDocFile ? 'border-emerald-500 bg-emerald-50/30' :
                                        'border-slate-300 dark:border-white/10 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}>
                                        <FileText size={28} className={selectedDocFile ? 'text-emerald-600 mb-2' : 'text-slate-400 mb-2'} />
                                        {selectedDocFile ? (
                                            <>
                                                <span className="text-xs font-bold text-emerald-600 max-w-[220px] truncate">{selectedDocFile.name}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">{(selectedDocFile.size / 1024).toFixed(0)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs text-slate-600 dark:text-white/60 font-medium">Click to select document</span>
                                                <span className="text-[10px] text-slate-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</span>
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
                                        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => { setOpenAddVideo(false); setSelectedDocFile(null); setLessonMode('link'); }}>Cancel</button>
                                        <button
                                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                                            onClick={handleDocumentLessonUpload}
                                            disabled={documentUploading || !selectedDocFile}
                                        >
                                            {documentUploading ? 'Uploading...' : 'Upload as Lesson'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Edit Lesson Modal */}
            {openEditLesson && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setOpenEditLesson(false)}>
                    <div className="bg-white dark:bg-[#121424] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 size={18} className="text-amber-500" /> Edit Lesson
                            </h4>
                            <button onClick={() => setOpenEditLesson(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Lesson Title</label>
                                <input
                                    className="w-full px-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all"
                                    placeholder="Enter lesson title"
                                    value={editLessonTitle}
                                    onChange={e => setEditLessonTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Video / Content URL (Optional)</label>
                                <div className="relative">
                                    <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        className="w-full pl-11 pr-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all"
                                        placeholder="https://vimeo.com/..."
                                        value={editLessonUrl}
                                        onChange={e => setEditLessonUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cover Thumbnail (Optional)</label>
                                    {editLessonThumbnail && (
                                        <button
                                            type="button"
                                            onClick={() => setEditLessonThumbnail('')}
                                            className="text-red-500 hover:text-red-600 text-[10px] font-bold lowercase flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <X size={10} /> remove
                                        </button>
                                    )}
                                </div>
                                {editLessonThumbnail ? (
                                    <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20 group">
                                        <img
                                            src={getMediaUrl(editLessonThumbnail)}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <label className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer hover:bg-slate-100 shadow-md">
                                                Change Image
                                                <input type="file" accept="image/*" className="hidden" onChange={handleEditLessonCoverUpload} disabled={editLessonThumbnailUploading} />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex items-center gap-3 w-full px-4 py-3 border border-dashed rounded-2xl cursor-pointer transition-all ${
                                        editLessonThumbnailUploading ? 'border-amber-500 bg-amber-50/40' : 'border-slate-300 dark:border-white/10 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}>
                                        <ImageIcon size={18} className="text-slate-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs text-slate-500 dark:text-white/50 block truncate font-medium">
                                                {editLessonThumbnailUploading ? 'Uploading cover...' : 'Upload custom cover image (PNG, JPG, WEBP)'}
                                            </span>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleEditLessonCoverUpload} disabled={editLessonThumbnailUploading} />
                                    </label>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setOpenEditLesson(false)}>Cancel</button>
                                <button
                                    className="flex-1 py-3 bg-[#380e6f] hover:bg-[#2d0b59] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    onClick={handleSaveLessonEdit}
                                    disabled={editLessonSaving}
                                >
                                    {editLessonSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Quiz Editor Modal */}
            {openQuizEditor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setOpenQuizEditor(false)}>
                    <div className="bg-white dark:bg-[#121424] w-full max-w-2xl p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <HelpCircle className="text-emerald-500" size={20} /> Module Assessment (Quiz)
                            </h4>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={downloadQuizExcelTemplate}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
                                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#380e6f] border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Bulk upload questions from Excel"
                                >
                                    <FileSpreadsheet size={13} />
                                    Bulk Upload Excel
                                </button>
                                <button onClick={() => setOpenQuizEditor(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2 transition-colors cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Existing Questions List */}
                            {quizQuestions.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Existing Questions ({quizQuestions.length})</h5>
                                    {quizQuestions.map((q, idx) => (
                                        <div key={q._id || idx} className="p-4 bg-[#f4f6fa] dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 relative group">
                                            <button
                                                onClick={() => handleRemoveQuestion(q._id)}
                                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white mb-2">{idx + 1}. {q.question}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`text-xs p-2.5 rounded-xl font-medium ${oIdx === q.correctIndex ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-white dark:bg-black/20 text-slate-600 dark:text-white/60 border border-slate-200/60 dark:border-transparent'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Question Form */}
                            <div className="p-5 bg-slate-50/70 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/20 space-y-4">
                                <h5 className="text-[11px] font-extrabold text-slate-600 dark:text-white/70 uppercase tracking-wider">Add New Question</h5>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Question Text</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:border-[#380e6f]"
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
                                                    className="w-3.5 h-3.5 accent-[#380e6f] cursor-pointer"
                                                    checked={newQuestion.correctIndex === i}
                                                    onChange={() => setNewQuestion({...newQuestion, correctIndex: i})}
                                                />
                                            </div>
                                            <input
                                                className={`w-full pl-9 pr-3 py-2.5 bg-white dark:bg-black/40 border rounded-xl text-xs outline-none transition-all ${newQuestion.correctIndex === i ? 'border-[#380e6f] text-slate-900 dark:text-white font-semibold' : 'border-slate-200 dark:border-white/10 text-slate-700'}`}
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
                                <p className="text-[10px] text-slate-500 italic mt-1 ml-1">Select the radio button next to the correct answer.</p>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1 mt-3">Explanation (Optional, shown after answering)</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:border-[#380e6f]"
                                        placeholder="This is correct because..."
                                        value={newQuestion.explanation}
                                        onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                    />
                                </div>

                                <button onClick={handleAddQuestion} className="w-full py-2.5 border border-slate-300 hover:border-[#380e6f] text-slate-700 hover:text-[#380e6f] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white">
                                    <Plus size={15} /> Add Question to Quiz
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                                <button className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setOpenQuizEditor(false)}>
                                    Cancel
                                </button>
                                <button onClick={handleSaveQuiz} disabled={quizSaving} className="px-5 py-2.5 bg-[#380e6f] hover:bg-[#2d0b59] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50">
                                    {quizSaving ? 'Saving...' : 'Save Quiz Assessment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Publish to Batch Modal */}
            {openPublishModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setOpenPublishModal(false)}>
                    <div className="bg-white dark:bg-[#121424] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <Send size={18} className="text-blue-500" /> Publish to Batch(es)
                            </h4>
                            <button onClick={() => setOpenPublishModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Select which batch(es) can access this section. Leave everything unchecked to keep it as a draft
                            (hidden from all students). If you never publish a section at all, it stays open to every
                            enrolled student by default.
                        </p>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {batches.filter(b => b.is_active !== false).length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-6">
                                    No active batches for this course yet. Create one in the Student Batches tab first.
                                </p>
                            ) : (
                                batches.filter(b => b.is_active !== false).map(batch => (
                                    <label key={batch.id} className="flex items-center gap-3 p-3 bg-[#f4f6fa] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-blue-400 transition-all">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedPublishBatchIds.includes(String(batch.id))}
                                            onChange={(e) => {
                                                const batchIdStr = String(batch.id);
                                                setSelectedPublishBatchIds(prev =>
                                                    e.target.checked ? [...prev, batchIdStr] : prev.filter(id => id !== batchIdStr)
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-slate-800 dark:text-white font-semibold">{batch.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button className="flex-1 py-3 border border-slate-200 hover:border-slate-300 dark:border-white/10 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setOpenPublishModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 bg-[#380e6f] hover:bg-[#2d0b59] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                                onClick={handleSavePublishTargets}
                                disabled={publishSaving}
                            >
                                {publishSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseContentManagement;
