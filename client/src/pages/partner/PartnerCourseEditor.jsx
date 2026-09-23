import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft, Plus, Save, Trash2, Video,
    Upload, FileText, CheckCircle2, AlertCircle, X,
    Layout, BookOpen, Clock, Users, Link,
    ChevronDown, ChevronUp, ArrowLeft, Image as ImageIcon,
    HelpCircle, Play, Send, Download, FileSpreadsheet,
    Edit2, CheckSquare, Pencil
} from 'lucide-react';
import * as XLSX from 'xlsx';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import BatchManagement from '../../components/ui/BatchManagement';
import { getMediaUrl } from '../../utils/media';

const PartnerCourseEditor = () => {
    const { id } = useParams();
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
    const [brochureUploading, setBrochureUploading] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [lessonMode, setLessonMode] = useState('link'); // 'link' | 'video' | 'document'
    const [selectedDocFile, setSelectedDocFile] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'batches'
    
    // Delete Confirmation Modal State
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, text: '', onConfirm: null });

    // Quiz editor state (Module or Class/Lesson wise)
    const [openQuizEditor, setOpenQuizEditor] = useState(false);
    const [quizTarget, setQuizTarget] = useState('module'); // 'module' | 'lesson'
    const [activeQuizModuleId, setActiveQuizModuleId] = useState(null);
    const [activeQuizVideoId, setActiveQuizVideoId] = useState(null);
    const [quizTargetTitle, setQuizTargetTitle] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizSaving, setQuizSaving] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '', options: ['', '', '', ''], correctIndex: 0, explanation: ''
    });

    // Edit Lesson / Document state
    const [openEditLesson, setOpenEditLesson] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null); // { moduleId, lesson }
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonUrl, setEditLessonUrl] = useState('');
    const [editLessonThumbnail, setEditLessonThumbnail] = useState('');
    const [editLessonThumbnailUploading, setEditLessonThumbnailUploading] = useState(false);
    const [editLessonFile, setEditLessonFile] = useState(null);
    const [editLessonSaving, setEditLessonSaving] = useState(false);

    // Publish-to-batch state
    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [activePublishModuleId, setActivePublishModuleId] = useState(null);
    const [selectedPublishBatchIds, setSelectedPublishBatchIds] = useState([]);
    const [publishSaving, setPublishSaving] = useState(false);

    // Safe auth helpers — prevent "Cannot read properties of null (reading 'token')"
    const getAuthToken = () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo?.token) {
                navigate('/login?session=expired');
                return null;
            }
            return userInfo.token;
        } catch {
            navigate('/login?session=expired');
            return null;
        }
    };

    const getAuthConfig = (contentType) => {
        const token = getAuthToken();
        if (!token) return null;
        const headers = { Authorization: `Bearer ${token}` };
        if (contentType) headers['Content-Type'] = contentType;
        return { headers };
    };

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const config = getAuthConfig();
            const { data } = await axios.get(`/api/courses/${id}`, config || undefined);
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
            const { data } = await axios.get(`/api/batches/course/${id}`);
            setBatches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    useEffect(() => {
        fetchCourse();
        fetchBatches();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const config = getAuthConfig();
        if (!config) return;
        try {
            await axios.put(`/api/courses/${id}`, course, config);
            showToast('Course updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update course', 'error');
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle) return;
        const config = getAuthConfig();
        if (!config) return;
        try {
            await axios.post(`/api/courses/${id}/modules`, { title: newModuleTitle }, config);
            setOpenAddModule(false);
            setNewModuleTitle('');
            fetchCourse();
            showToast('Module added!', 'success');
        } catch (error) {
            showToast('Failed to add module', 'error');
        }
    };

    const handleDeleteModule = (moduleId) => {
        setDeleteConfirm({
            isOpen: true,
            text: 'Delete this entire module and its videos?',
            onConfirm: async () => {
                const config = getAuthConfig();
                if (!config) return;
                try {
                    await axios.delete(`/api/courses/${id}/modules/${moduleId}`, config);
                    fetchCourse();
                    showToast('Module removed', 'success');
                } catch (error) {
                    showToast('Deletion failed', 'error');
                }
            }
        });
    };

    const handleLessonCoverUpload = async (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file (PNG, JPG, WEBP)', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('coverImage', file);

        const config = getAuthConfig('multipart/form-data');
        if (!config) return;

        if (isEdit) {
            setEditLessonThumbnailUploading(true);
        } else {
            setLessonCoverUploading(true);
        }

        try {
            const { data } = await axios.post('/api/courses/upload-cover-image', formData, config);
            const coverPath = data.url || data.imageUrl || data.thumbnail;
            if (isEdit) {
                setEditLessonThumbnail(coverPath);
            } else {
                setNewVideoData(prev => ({ ...prev, thumbnail: coverPath }));
            }
            showToast('Cover image uploaded!', 'success');
        } catch (error) {
            console.error('Cover upload error:', error);
            showToast(error.response?.data?.message || 'Failed to upload cover image', 'error');
        } finally {
            if (isEdit) {
                setEditLessonThumbnailUploading(false);
            } else {
                setLessonCoverUploading(false);
            }
            if (e.target) e.target.value = '';
        }
    };

    const handleAddVideo = async () => {
        if (!newVideoData.title) return;
        const config = getAuthConfig();
        if (!config) return;
        try {
            await axios.post(`/api/courses/${id}/modules/${activeModuleId}/videos`, {
                title: newVideoData.title,
                url: newVideoData.url,
                thumbnail: newVideoData.thumbnail || ''
            }, config);
            setOpenAddVideo(false);
            setNewVideoData({ title: '', url: '', thumbnail: '' });
            fetchCourse();
            showToast('Chapter added!', 'success');
        } catch (error) {
            showToast('Failed to add video', 'error');
        }
    };

    const handleDeleteVideo = (moduleId, videoId) => {
        setDeleteConfirm({
            isOpen: true,
            text: 'Delete this chapter?',
            onConfirm: async () => {
                const config = getAuthConfig();
                if (!config) return;
                try {
                    await axios.delete(`/api/courses/${id}/modules/${moduleId}/videos/${videoId}`, config);
                    fetchCourse();
                    showToast('Chapter removed', 'success');
                } catch (error) {
                    showToast('Deletion failed', 'error');
                }
            }
        });
    };

    const thumbnailInputRef = React.useRef(null);

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('thumbnail', file);

        setThumbnailUploading(true);
        try {
            const config = getAuthConfig('multipart/form-data');
            if (!config) return;
            const { data } = await axios.post(`/api/courses/${id}/upload-thumbnail`, formData, config);
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

        // Validating file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid video format. Use MP4, WEBM, or OGG.', 'error');
            return;
        }

        if (!newVideoData.title) {
            showToast('Please enter a lesson title first', 'error');
            return;
        }

        const config = getAuthConfig();
        if (!config) return;
        
        setVideoUploading(true);
        try {
            // 1. Create the video record first with thumbnail
            const { data: videoRecord } = await axios.post(`/api/courses/${id}/modules/${activeModuleId}/videos`, {
                title: newVideoData.title,
                url: 'uploading...',
                thumbnail: newVideoData.thumbnail || ''
            }, config);

            // 2. Upload the file to that record
            const formData = new FormData();
            formData.append('video', file);
            
            const uploadConfig = getAuthConfig('multipart/form-data');
            if (!uploadConfig) return;

            const { data: uploadRes } = await axios.post(
                `/api/courses/${id}/modules/${activeModuleId}/videos/${videoRecord._id}/upload`, 
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
        if (!file) {
            console.log('[Upload] No file selected');
            return;
        }

        console.log('[Upload] Starting file upload:', { moduleId, videoId, fileName: file.name, fileSize: file.size });

        const config = getAuthConfig('multipart/form-data');
        if (!config) return;

        const formData = new FormData();
        formData.append('file', file);

        setFileUploading(true);
        try {
            await axios.post(`/api/courses/${id}/modules/${moduleId}/videos/${videoId}/files`, formData, config);
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
        const config = getAuthConfig('multipart/form-data');
        if (!config) return;
        const formData = new FormData();
        formData.append('document', selectedDocFile);
        formData.append('title', newVideoData.title);
        setDocumentUploading(true);
        try {
            await axios.post(
                `/api/courses/${id}/modules/${activeModuleId}/upload-document`,
                formData,
                config
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

    const handleDeleteFile = (moduleId, videoId, fileId) => {
        setDeleteConfirm({
            isOpen: true,
            text: 'Delete this file?',
            onConfirm: async () => {
                const config = getAuthConfig();
                if (!config) return;
                try {
                    await axios.delete(`/api/courses/${id}/modules/${moduleId}/videos/${videoId}/files/${encodeURIComponent(fileId)}`, config);
                    
                    const updatedCourse = { ...course };
                    const mIdx = updatedCourse.modules.findIndex(m => m._id === moduleId);
                    if (mIdx !== -1) {
                        const vIdx = updatedCourse.modules[mIdx].videos.findIndex(v => v._id === videoId);
                        if (vIdx !== -1 && updatedCourse.modules[mIdx].videos[vIdx].attachments) {
                            updatedCourse.modules[mIdx].videos[vIdx].attachments = updatedCourse.modules[mIdx].videos[vIdx].attachments.filter(f => f._id !== fileId && f.name !== fileId && f.url !== fileId);
                        }
                    }
                    setCourse(updatedCourse);
                    showToast('File deleted', 'success');
                } catch (error) {
                    console.error('File delete failed:', error);
                    showToast('Deletion failed', 'error');
                }
            }
        });
    };

    // ---- Quiz Editor (Module & Lesson/Class Wise) ----
    const handleOpenQuizEditor = (mod) => {
        setQuizTarget('module');
        setActiveQuizModuleId(mod._id);
        setActiveQuizVideoId(null);
        setQuizTargetTitle(mod.title);
        setQuizQuestions(mod.quiz?.questions || []);
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
        setOpenQuizEditor(true);
    };

    const handleOpenLessonQuiz = (mod, vid) => {
        setQuizTarget('lesson');
        setActiveQuizModuleId(mod._id);
        setActiveQuizVideoId(vid._id);
        setQuizTargetTitle(vid.title);
        // Load quiz questions if available, or convert existing exercises
        let existingQuestions = vid.quiz?.questions || [];
        if (existingQuestions.length === 0 && vid.exercises && vid.exercises.length > 0) {
            existingQuestions = vid.exercises.map((ex, i) => ({
                _id: ex._id || `q_${Date.now()}_${i}`,
                question: ex.question || '',
                options: ex.options || ['', '', '', ''],
                correctIndex: ex.options?.indexOf(ex.correctAnswer) >= 0 ? ex.options.indexOf(ex.correctAnswer) : 0,
                explanation: ex.explanation || ''
            }));
        }
        setQuizQuestions(existingQuestions);
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
        setOpenQuizEditor(true);
    };

    // ---- Edit Lesson / Document Handler ----
    const handleOpenEditLesson = (modId, vid) => {
        setEditingLesson({ moduleId: modId, lesson: vid });
        setEditLessonTitle(vid.title || '');
        setEditLessonUrl(vid.url || '');
        setEditLessonThumbnail(vid.thumbnail || '');
        setEditLessonFile(null);
        setOpenEditLesson(true);
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
            if (lesson.contentType === 'document' || editLessonFile) {
                const config = getAuthConfig('multipart/form-data');
                if (!config) return;
                const formData = new FormData();
                formData.append('title', editLessonTitle);
                if (editLessonThumbnail) {
                    formData.append('thumbnail', editLessonThumbnail);
                }
                if (editLessonFile) {
                    formData.append('document', editLessonFile);
                }
                await axios.put(`/api/courses/${id}/modules/${moduleId}/videos/${lesson._id}/update-document`, formData, config);
            } else {
                const config = getAuthConfig();
                if (!config) return;
                await axios.put(`/api/courses/${id}/modules/${moduleId}/videos/${lesson._id}`, {
                    title: editLessonTitle,
                    url: editLessonUrl,
                    thumbnail: editLessonThumbnail
                }, config);
            }
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

    const handleAddQuestion = () => {
        if (!newQuestion.question.trim()) { showToast('Enter a question', 'error'); return; }
        if (newQuestion.options.some(o => !o.trim())) { showToast('Fill all 4 options', 'error'); return; }
        
        if (newQuestion._id) {
            setQuizQuestions(prev => prev.map(q => q._id === newQuestion._id ? { ...newQuestion } : q));
            showToast('Question updated', 'success');
        } else {
            setQuizQuestions(prev => [...prev, { ...newQuestion, _id: `q_${Date.now()}` }]);
        }
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
    };
    
    const handleEditQuestion = (q) => {
        setNewQuestion({
            _id: q._id,
            question: q.question,
            options: [...q.options],
            correctIndex: q.correctIndex,
            explanation: q.explanation || ''
        });
        // Scroll to form
        document.getElementById('quiz-question-form')?.scrollIntoView({ behavior: 'smooth' });
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
        const config = getAuthConfig();
        if (!config) return;
        setQuizSaving(true);
        try {
            if (quizTarget === 'lesson') {
                await axios.put(`/api/courses/${id}/modules/${activeQuizModuleId}/videos/${activeQuizVideoId}/quiz`, { questions: quizQuestions }, config);
                showToast('Class assessment saved!', 'success');
            } else {
                await axios.put(`/api/courses/${id}/modules/${activeQuizModuleId}/quiz`, { questions: quizQuestions }, config);
                showToast('Section quiz saved!', 'success');
            }
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
        const config = getAuthConfig();
        if (!config) return;
        setPublishSaving(true);
        try {
            await axios.put(`/api/courses/${id}/modules/${activePublishModuleId}/publish`, { batchIds: selectedPublishBatchIds }, config);
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
                        onClick={() => navigate('/partner/courses')}
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
                <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-1.5 p-1 bg-[#edeef5] dark:bg-white/5 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'curriculum' 
                                    ? 'cb-tab-active shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                            }`}
                        >
                            Curriculum Builder
                        </button>
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
                                            className="p-4 sm:px-6 sm:py-3.5 flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleModule(mod._id)}
                                        >
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                <div className="text-slate-700 dark:text-white/80 text-sm font-bold w-6 shrink-0">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{mod.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
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
                                                                {(vid.quiz?.questions?.length > 0 || vid.exercises?.length > 0) && (
                                                                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                                                                        ✓ {vid.quiz?.questions?.length || vid.exercises?.length}Q Assessment
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {/* Class Wise Assessment Button */}
                                                                <button
                                                                    type="button"
                                                                    className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                                                                        vid.quiz?.questions?.length > 0 || vid.exercises?.length > 0
                                                                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                                                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                                                                    }`}
                                                                    onClick={() => handleOpenLessonQuiz(mod, vid)}
                                                                    title="Class Assessment (Quiz)"
                                                                >
                                                                    <CheckSquare size={14} />
                                                                    <span className="text-[10px] font-bold hidden sm:inline">
                                                                        {vid.quiz?.questions?.length > 0 || vid.exercises?.length > 0 ? 'Assessment' : '+ Assessment'}
                                                                    </span>
                                                                </button>

                                                                {/* Edit Document/Lesson Button */}
                                                                <button
                                                                    type="button"
                                                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                    onClick={() => handleOpenEditLesson(mod._id, vid)}
                                                                    title="Edit Lesson / Replace Document"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>

                                                                {/* Upload Attachment */}
                                                                <label className="p-1.5 text-slate-400 hover:text-[#380e6f] hover:bg-purple-50 rounded-lg transition-all cursor-pointer" title="Upload Attachment">
                                                                    <Upload size={14} />
                                                                    <input type="file" className="hidden" onChange={(e) => handleLessonFileUpload(mod._id, vid._id, e)} />
                                                                </label>

                                                                {/* Delete Lesson */}
                                                                <button 
                                                                    type="button"
                                                                    className="p-1.5 text-slate-400 group-hover/item:text-red-500 hover:!text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    onClick={() => handleDeleteVideo(mod._id, vid._id)}
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Attachments List */}
                                                        {vid.attachments?.length > 0 && (
                                                            <div className="ml-8 space-y-1">
                                                                {vid.attachments.map((file, fIdx) => (
                                                                    <div key={file._id || file.url || fIdx} className="flex items-center justify-between p-2 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 rounded-lg group/file shadow-2xs">
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <FileText size={12} className="text-slate-400" />
                                                                            <span className="text-[10px] text-slate-600 dark:text-white/60 truncate max-w-[150px]">{file.name}</span>
                                                                        </div>
                                                                        <button 
                                                                            type="button"
                                                                            className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/file:opacity-100 transition-all"
                                                                            onClick={() => handleDeleteFile(mod._id, vid._id, file._id || file.url || file.name)}
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
                                                    className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-extrabold text-slate-500 dark:text-white/40 uppercase tracking-wider hover:border-purple-300 hover:bg-purple-50/50 hover:text-[#380e6f] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                    onClick={() => { setActiveModuleId(mod._id); setOpenAddVideo(true); }}
                                                >
                                                    <Plus size={14} /> Add Lesson to Section
                                                </button>
                                                <button
                                                    className="w-full p-3 border-2 border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-xl text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                    onClick={() => handleOpenQuizEditor(mod)}
                                                >
                                                    <HelpCircle size={14} /> {mod.quiz?.questions?.length ? `Edit Quiz (${mod.quiz.questions.length} Q)` : 'Add Quiz Exercise'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                            <BatchManagement courseId={id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {openAddModule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4" onClick={() => setOpenAddModule(false)}>
                    <div className="w-full max-w-sm p-6 sm:p-8 bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Section</h4>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Section Name</label>
                                <input 
                                    autoFocus
                                    className="w-full px-4 py-3.5 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all text-sm font-semibold"
                                    placeholder="e.g. Introduction of Healthcare"
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddModule()}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all" 
                                    onClick={() => setOpenAddModule(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#380e6f] hover:bg-[#2d0b59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all" 
                                    onClick={handleAddModule}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {openAddVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4" onClick={() => { setOpenAddVideo(false); setLessonMode('link'); setSelectedDocFile(null); }}>
                    <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Add New Lesson</h4>
                            <button onClick={() => { setOpenAddVideo(false); setLessonMode('link'); setSelectedDocFile(null); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-[#edeef5] dark:bg-white/5 p-1 rounded-2xl">
                            {[
                                { key: 'link', label: '🔗 Video Link' },
                                { key: 'video', label: '🎬 Upload Video' },
                                { key: 'document', label: '📄 Upload Notes' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setLessonMode(tab.key)}
                                    className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                                        lessonMode === tab.key
                                            ? 'bg-[#380e6f] text-white shadow-sm'
                                            : 'text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {/* Lesson Title */}
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Lesson Title</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] focus:bg-white dark:focus:bg-black/30 transition-all font-semibold text-sm"
                                    placeholder="e.g. Overview of Patient Care"
                                    value={newVideoData.title}
                                    onChange={e => setNewVideoData({...newVideoData, title: e.target.value})}
                                />
                            </div>

                            {/* Cover Image (Optional) */}
                            {(lessonMode === 'link' || lessonMode === 'video') && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                            Cover Image / Thumbnail (Optional)
                                        </label>
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
                                                <label className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer transition-colors shadow-sm">
                                                    Change Image
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLessonCoverUpload(e, false)} disabled={lessonCoverUploading} />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewVideoData(prev => ({ ...prev, thumbnail: '' }))}
                                                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold transition-colors shadow-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center gap-3 w-full px-4 py-3 border border-dashed rounded-2xl cursor-pointer transition-all ${
                                            lessonCoverUploading ? 'border-purple-500/50 bg-purple-50/50' : 'border-slate-200 dark:border-white/10 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}>
                                            <ImageIcon size={18} className="text-slate-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-slate-500 dark:text-white/50 block truncate">
                                                    {lessonCoverUploading ? 'Uploading cover...' : 'Upload custom cover image (PNG, JPG, WEBP)'}
                                                </span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLessonCoverUpload(e, false)} disabled={lessonCoverUploading} />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* VIDEO LINK MODE */}
                            {lessonMode === 'link' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Video / Content URL (Optional)</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] focus:bg-white transition-all text-xs font-mono font-medium"
                                            placeholder="https://vimeo.com/..."
                                            value={newVideoData.url}
                                            onChange={e => setNewVideoData({...newVideoData, url: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Leave blank to create the lesson now and add the link later from Edit Lesson.</p>
                                    <div className="flex gap-3 mt-6">
                                        <button 
                                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all" 
                                            onClick={() => setOpenAddVideo(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="flex-1 py-2.5 px-4 rounded-xl bg-[#380e6f] hover:bg-[#2d0b59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all" 
                                            onClick={handleAddVideo}
                                        >
                                            Add to Module
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD VIDEO MODE */}
                            {lessonMode === 'video' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Video File (MP4, WEBM, MOV)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        videoUploading ? 'border-purple-500/50 bg-purple-50/50' : 'border-slate-200 dark:border-white/10 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}>
                                        <Video size={24} className="text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500 dark:text-white/40 font-medium">{videoUploading ? 'Uploading...' : 'Click to select video file'}</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileUpload} disabled={videoUploading} />
                                    </label>
                                    {videoUploading && (
                                        <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#380e6f] animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button 
                                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all" 
                                            onClick={() => setOpenAddVideo(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD DOCUMENT MODE */}
                            {lessonMode === 'document' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Document (PDF, Word, Excel, PPT)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        documentUploading ? 'border-emerald-500/50 bg-emerald-50/5' :
                                        selectedDocFile ? 'border-emerald-500/40 bg-emerald-50/5' :
                                        'border-slate-200 dark:border-white/10 hover:border-emerald-400/30 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}>
                                        <FileText size={28} className={selectedDocFile ? 'text-emerald-500 mb-2' : 'text-slate-400 mb-2'} />
                                        {selectedDocFile ? (
                                            <>
                                                <span className="text-xs font-bold text-emerald-600 max-w-[200px] truncate">{selectedDocFile.name}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">{(selectedDocFile.size / 1024).toFixed(0)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs text-slate-500 font-medium">Click to select document</span>
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
                                        <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button 
                                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all" 
                                            onClick={() => { setOpenAddVideo(false); setSelectedDocFile(null); setLessonMode('link'); }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                                            onClick={handleDocumentLessonUpload}
                                            disabled={documentUploading || !selectedDocFile}
                                        >
                                            {documentUploading ? 'Uploading...' : 'Upload Notes'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* QUIZ EDITOR MODAL */}
            {openQuizEditor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4" onClick={() => setOpenQuizEditor(false)}>
                    <div className="w-full max-w-2xl p-6 sm:p-8 bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                            <div>
                                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <HelpCircle className={quizTarget === 'lesson' ? 'text-blue-500' : 'text-emerald-500'} /> 
                                    {quizTarget === 'lesson' ? 'Class Assessment (Quiz)' : 'Section Assessment (Quiz)'}
                                </h4>
                                {quizTargetTitle && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        For: <span className="text-slate-800 dark:text-white font-bold">{quizTargetTitle}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={downloadQuizExcelTemplate}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Download sample Excel template"
                                >
                                    <Download size={13} />
                                    Template
                                </button>
                                <input
                                    type="file"
                                    id="partner-quiz-excel-upload"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    onChange={handleQuizExcelBulkUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('partner-quiz-excel-upload')?.click()}
                                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#380e6f] border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Bulk upload questions from Excel"
                                >
                                    <FileSpreadsheet size={13} />
                                    Bulk Upload
                                </button>
                                <button onClick={() => setOpenQuizEditor(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-2 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Existing Questions List */}
                            {quizQuestions.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Existing Questions ({quizQuestions.length})</h5>
                                    {quizQuestions.map((q, idx) => (
                                        <div key={q._id || idx} className="p-4 bg-[#f4f6fa] dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 relative group">
                                            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditQuestion(q)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-500 bg-white dark:bg-white/10 rounded-lg shadow-xs transition-all"
                                                    title="Edit Question"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveQuestion(q._id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-white/10 rounded-lg shadow-xs transition-all"
                                                    title="Delete Question"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white mb-2 pr-16">{idx + 1}. {q.question}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`text-xs p-2 rounded-xl ${oIdx === q.correctIndex ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-white dark:bg-black/20 text-slate-600 dark:text-white/60 border border-slate-200/60 dark:border-white/5'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add/Edit Question Form */}
                            <div id="quiz-question-form" className={`p-5 rounded-2xl border border-dashed space-y-4 ${newQuestion._id ? 'bg-purple-50/50 border-purple-300' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'}`}>
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        {newQuestion._id ? 'Edit Question' : 'Add New Question'}
                                    </h5>
                                    {newQuestion._id && (
                                        <button 
                                            onClick={() => setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })}
                                            className="text-[10px] uppercase font-bold text-purple-600 hover:text-purple-700"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-1">Question Text</label>
                                    <input 
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] text-sm font-medium shadow-xs"
                                        placeholder="What is the main role of...?"
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
                                                className={`w-full pl-9 pr-3 py-2 bg-white dark:bg-white/5 border rounded-xl text-xs outline-none transition-all shadow-xs ${newQuestion.correctIndex === i ? 'border-purple-500 bg-purple-50/40 text-slate-900 font-semibold' : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 focus:border-[#380e6f]'}`}
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
                                <p className="text-[10px] text-purple-600 italic mt-1 ml-1">Select the radio button next to the correct answer.</p>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-1 mt-3">Explanation (Optional)</label>
                                    <input 
                                        className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white outline-none focus:border-[#380e6f] text-xs font-medium shadow-xs"
                                        placeholder="This is correct because..."
                                        value={newQuestion.explanation}
                                        onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                    />
                                </div>

                                <button 
                                    onClick={handleAddQuestion} 
                                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    {newQuestion._id ? 'Save Question Changes' : <><Plus size={15} /> Add Question to Quiz</>}
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <button 
                                    className="py-2.5 px-5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all"
                                    onClick={() => setOpenQuizEditor(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveQuiz} 
                                    disabled={quizSaving} 
                                    className="py-2.5 px-6 rounded-xl bg-[#380e6f] hover:bg-[#2d0b59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                                >
                                    {quizSaving ? 'Saving...' : (quizTarget === 'lesson' ? 'Save Class Assessment' : 'Save Section Assessment')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT LESSON / DOCUMENT MODAL */}
            {openEditLesson && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4" onClick={() => setOpenEditLesson(false)}>
                    <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 size={18} className="text-amber-500" /> Edit Lesson
                            </h4>
                            <button onClick={() => setOpenEditLesson(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Lesson Title</label>
                                <input
                                    className="w-full px-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] focus:bg-white transition-all text-sm font-semibold"
                                    placeholder="Enter lesson title"
                                    value={editLessonTitle}
                                    onChange={e => setEditLessonTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {editingLesson?.lesson?.contentType === 'document' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                        Replace Document File (Optional)
                                    </label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        editLessonFile ? 'border-emerald-500/50 bg-emerald-50/5' : 'border-slate-200 dark:border-white/10 hover:border-emerald-400/30 hover:bg-slate-50'
                                    }`}>
                                        <FileText size={24} className={editLessonFile ? 'text-emerald-500 mb-2' : 'text-slate-400 mb-2'} />
                                        {editLessonFile ? (
                                            <>
                                                <span className="text-xs font-bold text-emerald-600 max-w-[220px] truncate">{editLessonFile.name}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">{(editLessonFile.size / 1024).toFixed(0)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs text-slate-500 font-medium">Current: {editingLesson?.lesson?.fileName || 'Document uploaded'}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">Click to select new file</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                            className="hidden"
                                            onChange={e => setEditLessonFile(e.target.files[0] || null)}
                                        />
                                    </label>
                                </div>
                            )}

                            {editingLesson?.lesson?.contentType !== 'document' && (
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Video / Content URL (Optional)</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-[#f4f6fa] dark:bg-white/5 border border-[#e2e6f0] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#380e6f] focus:bg-white transition-all text-xs font-mono font-medium"
                                            placeholder="https://vimeo.com/..."
                                            value={editLessonUrl}
                                            onChange={e => setEditLessonUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {editingLesson?.lesson?.contentType !== 'document' && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                            Cover Image / Thumbnail (Optional)
                                        </label>
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
                                                <label className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer transition-colors shadow-sm">
                                                    Change Image
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLessonCoverUpload(e, true)} disabled={editLessonThumbnailUploading} />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditLessonThumbnail('')}
                                                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold transition-colors shadow-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center gap-3 w-full px-4 py-3 border border-dashed rounded-2xl cursor-pointer transition-all ${
                                            editLessonThumbnailUploading ? 'border-amber-500/50 bg-amber-50/50' : 'border-slate-200 dark:border-white/10 hover:border-amber-400/30 hover:bg-slate-50'
                                        }`}>
                                            <ImageIcon size={18} className="text-slate-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-slate-500 block truncate">
                                                    {editLessonThumbnailUploading ? 'Uploading cover...' : 'Upload custom cover image (PNG, JPG, WEBP)'}
                                                </span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLessonCoverUpload(e, true)} disabled={editLessonThumbnailUploading} />
                                        </label>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all" 
                                    onClick={() => setOpenEditLesson(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#380e6f] hover:bg-[#2d0b59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
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

            {/* PUBLISH TO BATCH MODAL */}
            {openPublishModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4" onClick={() => setOpenPublishModal(false)}>
                    <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#121424] rounded-3xl border border-purple-100/90 dark:border-white/10 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Send size={18} className="text-[#380e6f]" /> Publish to Batch(es)
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
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
                                    <label key={batch.id} className="flex items-center gap-3 p-3 bg-[#f4f6fa] dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl cursor-pointer hover:border-purple-300 transition-all">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-[#380e6f] focus:ring-[#380e6f]"
                                            checked={selectedPublishBatchIds.includes(String(batch.id))}
                                            onChange={(e) => {
                                                const batchIdStr = String(batch.id);
                                                setSelectedPublishBatchIds(prev =>
                                                    e.target.checked ? [...prev, batchIdStr] : prev.filter(id => id !== batchIdStr)
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-slate-800 dark:text-white font-medium">{batch.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all" 
                                onClick={() => setOpenPublishModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#380e6f] hover:bg-[#2d0b59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                                onClick={handleSavePublishTargets}
                                disabled={publishSaving}
                            >
                                {publishSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[500] flex items-center justify-center p-4" onClick={() => setDeleteConfirm({ isOpen: false, text: '', onConfirm: null })}>
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-[#151728] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="text-red-500" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Confirm Deletion</h3>
                        </div>
                        <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                            {deleteConfirm.text}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, text: '', onConfirm: null })} 
                                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm"
                                onClick={() => {
                                    if(deleteConfirm.onConfirm) deleteConfirm.onConfirm();
                                    setDeleteConfirm({ isOpen: false, text: '', onConfirm: null });
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerCourseEditor;
