import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Camera, Save, Plus, Trash2, 
    PlayCircle, BookOpen, FileText, Layout, Image as ImageIcon,
    ChevronDown, ChevronUp, X, Loader2
} from 'lucide-react';
import axios from 'axios';
import { getMediaUrl } from '../../utils/media';
import GlassCard from '../../components/ui/GlassCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

const getModuleIcon = (type) => {
    switch(type) {
        case 'video': return <PlayCircle size={16} className="text-blue-400" />;
        case 'reading': return <BookOpen size={16} className="text-emerald-400" />;
        case 'pdf': return <FileText size={16} className="text-red-400" />;
        case 'assignment': return <Layout size={16} className="text-purple-400" />;
        case 'image': return <ImageIcon size={16} className="text-yellow-400" />;
        default: return <PlayCircle size={16} className="text-blue-400" />;
    }
};

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modals & Forms
    const [openModule, setOpenModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    
    const [openVideo, setOpenVideo] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [newVideoData, setNewVideoData] = useState({ title: '', url: '', type: 'video', duration: '', description: '', thumbnail: '' });
    
    const [expandedModules, setExpandedModules] = useState({});
    
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [brochureUploading, setBrochureUploading] = useState(false);
    const [contentUploading, setContentUploading] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const fileInputRef = useRef(null);
    const brochureInputRef = useRef(null);
    const contentInputRef = useRef(null);
    const videoThumbnailInputRef = useRef(null);
    const [videoThumbnailUploading, setVideoThumbnailUploading] = useState(false);

    const fetchCourse = async () => {
        try {
            const { data } = await axios.get(`/api/courses/${id}`);
            setCourse(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const handleUpdate = async (e) => {
        if(e) e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.put(`/api/courses/${id}`, course, config);
            toast.success('Course Updated!');
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
            toast.error('Update failed');
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post(`/api/courses/${id}/modules`, { title: newModuleTitle }, config);
            setOpenModule(false);
            setNewModuleTitle('');
            fetchCourse();
        } catch (error) {
            toast.error('Failed to add module');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        setItemToDelete({ type: 'module', moduleId });
    };

    const handleAddVideo = async () => {
        if (!newVideoData.title.trim()) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post(`/api/courses/${id}/modules/${activeModuleId}/videos`, newVideoData, config);
            setOpenVideo(false);
            setNewVideoData({ title: '', url: '', type: 'video', duration: '', description: '', thumbnail: '' });
            fetchCourse();
        } catch (error) {
            toast.error('Failed to add content item');
        }
    };

    const handleDeleteVideo = async (moduleId, videoId) => {
        setItemToDelete({ type: 'video', moduleId, videoId });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            if (itemToDelete.type === 'module') {
                await axios.delete(`/api/courses/${id}/modules/${itemToDelete.moduleId}`, config);
            } else if (itemToDelete.type === 'video') {
                await axios.delete(`/api/courses/${id}/modules/${itemToDelete.moduleId}/videos/${itemToDelete.videoId}`, config);
            }
            fetchCourse();
        } catch (error) {
            toast.error('Failed to delete item');
        } finally {
            setItemToDelete(null);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('thumbnail', file);

        setThumbnailUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`/api/courses/${id}/upload-thumbnail`, formData, config);
            fetchCourse();
            toast.success('Thumbnail uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload thumbnail');
        } finally {
            setThumbnailUploading(false);
        }
    };

    const handleBrochureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('brochure', file);

        setBrochureUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`/api/courses/${id}/upload-brochure`, formData, config);
            fetchCourse();
            toast.success('Brochure uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload brochure');
        } finally {
            setBrochureUploading(false);
        }
    };

    const handleVideoThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setVideoThumbnailUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.post(`/api/upload/media`, formData, config);
            setNewVideoData({ ...newVideoData, thumbnail: data.url });
            toast.success('Thumbnail uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload thumbnail');
        } finally {
            setVideoThumbnailUploading(false);
            if (videoThumbnailInputRef.current) videoThumbnailInputRef.current.value = '';
        }
    };
    
    const handleContentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setContentUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.post(`/api/upload/media`, formData, config);
            setNewVideoData({ ...newVideoData, url: data.url });
            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload file');
        } finally {
            setContentUploading(false);
            if (contentInputRef.current) contentInputRef.current.value = '';
        }
    };
    
    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    if (loading || !course) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 font-inter text-white">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate('/admin/courses')}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                        <p className="text-white/50 text-sm mt-1">{course.title}</p>
                    </div>
                </div>

                <GlassCard className="!p-6 md:!p-8 border-white/10 shadow-2xl bg-white dark:bg-white/5">
                    <form onSubmit={handleUpdate} className="space-y-8">
                        
                        {/* Thumbnail & Basics */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-shrink-0 space-y-3">
                                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider">Thumbnail Image</label>
                                <div className="w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                                    {course.thumbnail ? (
                                        <img src={getMediaUrl(course.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-white/30">No Thumbnail</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover flex items-center gap-2"
                                            disabled={thumbnailUploading}
                                        >
                                            <Camera size={16} />
                                            {thumbnailUploading ? 'Uploading...' : 'Change Image'}
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleThumbnailUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="Or paste Direct URL"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                        value={course.thumbnail || ''}
                                        onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Course Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                        value={course.title}
                                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50 resize-none"
                                        value={course.description}
                                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <hr className="border-white/10" />
                        
                        {/* Overrides & Brochure */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Instructor Name (Override)</label>
                                <input
                                    type="text"
                                    placeholder="Manual override for instructor name"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                    value={course.instructorName || ''}
                                    onChange={(e) => setCourse({ ...course, instructorName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">University Name (Override)</label>
                                <input
                                    type="text"
                                    placeholder="Manual override for university name"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                    value={course.universityName || ''}
                                    onChange={(e) => setCourse({ ...course, universityName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                            <label className="block text-sm font-medium text-white/70 mb-3">Course Brochure (PDF)</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <input
                                    type="text"
                                    placeholder="Brochure URL (Manual Override)"
                                    className="flex-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                    value={course.brochure_url || ''}
                                    onChange={(e) => setCourse({ ...course, brochure_url: e.target.value })}
                                />
                                <input
                                    type="file"
                                    ref={brochureInputRef}
                                    onChange={handleBrochureUpload}
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                />
                                <button 
                                    type="button"
                                    onClick={() => brochureInputRef.current?.click()}
                                    className="px-6 py-2.5 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors whitespace-nowrap w-full sm:w-auto"
                                    disabled={brochureUploading}
                                >
                                    {brochureUploading ? 'Uploading...' : 'Upload PDF'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Tools & Resources */}
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                <span className="text-primary text-xl">✦</span> University Tools & Resources
                            </h3>
                            <p className="text-sm text-white/50 mb-6">Add specialized toolsets and exclusive resources provided for this course.</p>
                            
                            <div className="space-y-4 mb-4">
                                {(course.university_tools || []).map((tool, idx) => (
                                    <div key={idx} className="flex gap-4 items-start p-4 bg-black/30 rounded-xl border border-white/5">
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Tool Name"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                                value={tool.name || ''}
                                                onChange={(e) => {
                                                    const updated = [...course.university_tools];
                                                    updated[idx].name = e.target.value;
                                                    setCourse({ ...course, university_tools: updated });
                                                }}
                                            />
                                            <textarea
                                                rows={2}
                                                placeholder="Description"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50 resize-none"
                                                value={tool.description || ''}
                                                onChange={(e) => {
                                                    const updated = [...course.university_tools];
                                                    updated[idx].description = e.target.value;
                                                    setCourse({ ...course, university_tools: updated });
                                                }}
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const updated = course.university_tools.filter((_, i) => i !== idx);
                                                setCourse({ ...course, university_tools: updated });
                                            }}
                                            className="p-2 text-gray-500 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    const tools = course.university_tools || [];
                                    setCourse({ ...course, university_tools: [...tools, { name: '', description: '' }] });
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                <Plus size={16} /> Add New Tool
                            </button>
                        </div>
                        
                        {/* Learning Outcomes */}
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                <span className="text-primary text-xl">✦</span> What You'll Learn
                            </h3>
                            <p className="text-sm text-white/50 mb-6">Add structured learning outcomes with a title, description, and an icon identifier.</p>
                            
                            <div className="space-y-4 mb-4">
                                {(course.learning_outcomes || []).map((outcome, idx) => {
                                    const isString = typeof outcome === 'string';
                                    const title = isString ? outcome : outcome.title;
                                    const description = isString ? '' : (outcome.description || '');
                                    const icon = isString ? 'check' : (outcome.icon || 'check');
                                    
                                    return (
                                        <div key={idx} className="flex gap-4 items-start p-4 bg-black/30 rounded-xl border border-white/5">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Icon ID (e.g. globe)"
                                                        className="w-1/3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                                        value={icon}
                                                        onChange={(e) => {
                                                            const updated = [...course.learning_outcomes];
                                                            if (typeof updated[idx] === 'string') updated[idx] = { title: updated[idx], description: '', icon: 'check' };
                                                            updated[idx].icon = e.target.value;
                                                            setCourse({ ...course, learning_outcomes: updated });
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Outcome Title"
                                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                                        value={title || ''}
                                                        onChange={(e) => {
                                                            const updated = [...course.learning_outcomes];
                                                            if (typeof updated[idx] === 'string') updated[idx] = { title: updated[idx], description: '', icon: 'check' };
                                                            updated[idx].title = e.target.value;
                                                            setCourse({ ...course, learning_outcomes: updated });
                                                        }}
                                                    />
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Detailed Description"
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50 resize-none"
                                                    value={description || ''}
                                                    onChange={(e) => {
                                                        const updated = [...course.learning_outcomes];
                                                        if (typeof updated[idx] === 'string') updated[idx] = { title: updated[idx], description: '', icon: 'check' };
                                                        updated[idx].description = e.target.value;
                                                        setCourse({ ...course, learning_outcomes: updated });
                                                    }}
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const updated = course.learning_outcomes.filter((_, i) => i !== idx);
                                                    setCourse({ ...course, learning_outcomes: updated });
                                                }}
                                                className="p-2 text-gray-500 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    const outcomes = course.learning_outcomes || [];
                                    setCourse({ ...course, learning_outcomes: [...outcomes, { title: '', description: '', icon: 'check' }] });
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                <Plus size={16} /> Add New Outcome
                            </button>
                        </div>

                        {/* Top Features Checkbox */}
                        <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors w-fit">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary focus:ring-offset-background"
                                checked={course.isFeatured || false}
                                onChange={(e) => setCourse({ ...course, isFeatured: e.target.checked })}
                            />
                            <span className="text-sm font-medium text-white/90">Featured in Top 3 on Landing Page</span>
                        </label>
                        
                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button 
                                type="submit"
                                className="px-8 py-3 bg-[#4C1D95] hover:bg-[#3B1673] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#4C1D95]/25 transition-all flex items-center gap-2"
                            >
                                <Save size={20} /> Save Course Details
                            </button>
                        </div>
                    </form>
                </GlassCard>

                {/* Modules Section */}
                <GlassCard className="!p-6 md:!p-8 border-white/10 shadow-2xl bg-white dark:bg-white/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Syllabus & Modules</h2>
                            <p className="text-white/50 text-sm mt-1">Manage sections and upload content (videos, PDFs, etc.)</p>
                        </div>
                        <button 
                            onClick={() => setOpenModule(true)}
                            className="px-5 py-2.5 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
                        >
                            <Plus size={18} /> Add Module
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(course.modules || []).length === 0 ? (
                            <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                                <p className="text-white/50">No modules added yet. Create one to get started!</p>
                            </div>
                        ) : null}

                        {(course.modules || []).map((module, idx) => (
                            <div key={module._id} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20">
                                <div 
                                    className="w-full flex items-center justify-between p-5 bg-black/20 cursor-pointer"
                                    onClick={() => toggleModule(module._id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{module.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                                            className="p-2 text-gray-500 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            title="Delete Module"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="text-white/50">
                                            {expandedModules[module._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                                
                                {expandedModules[module._id] && (
                                    <div className="p-5 border-t border-white/5">
                                        <div className="space-y-3 mb-5">
                                            {(module.videos || []).length === 0 ? (
                                                <p className="text-sm text-white/40 italic px-2">No content items in this module.</p>
                                            ) : null}
                                            
                                            {(module.videos || []).map((content) => (
                                                <div key={content._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        {content.thumbnail ? (
                                                            <div className="w-16 h-12 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0 mt-0.5">
                                                                <img src={getMediaUrl(content.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 bg-white/10 rounded-lg mt-0.5 shrink-0">
                                                                {getModuleIcon(content.type)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold text-white text-sm">{content.title} <span className="text-xs text-white/40 font-normal ml-2 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full">{content.type || 'video'}</span></h4>
                                                            <div className="text-xs text-white/50 mt-1 flex items-center gap-2">
                                                                {content.duration && <span>{content.duration}</span>}
                                                                {content.duration && <span className="w-1 h-1 rounded-full bg-white/20"></span>}
                                                                <span className="truncate max-w-[200px] sm:max-w-[400px] block">{content.url || 'No URL'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteVideo(module._id, content._id)}
                                                        className="p-2 text-gray-500 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button 
                                            onClick={() => { setActiveModuleId(module._id); setOpenVideo(true); }}
                                            className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add Content Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
                
            </div>

            {/* Modal: Add Module */}
            {openModule && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <GlassCard className="w-full max-w-md bg-[#0F0A1F] border-white/10 !p-6 shadow-2xl relative">
                        <button onClick={() => setOpenModule(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-6">Create New Module</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white/70 mb-2">Module Title</label>
                            <input
                                type="text"
                                autoFocus
                                placeholder="e.g. Week 1: Introduction"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary/50"
                                value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setOpenModule(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white rounded-xl text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAddModule} className="px-5 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-sm font-bold transition-colors">
                                Add Module
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

        {/* Modal: Add Content Item */}
            {openVideo && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <GlassCard className="w-full max-w-lg bg-white dark:bg-[#0F0A1F] border-gray-200 dark:border-white/10 !p-5 shadow-2xl relative rounded-2xl">
                        <button onClick={() => setOpenVideo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">Add Content Item</h2>
                        
                        <div className="space-y-3 mb-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">Content Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                    value={newVideoData.type}
                                    onChange={(e) => setNewVideoData({ ...newVideoData, type: e.target.value })}
                                >
                                    <option value="video" className="dark:bg-[#0F0A1F]">Video</option>
                                    <option value="reading" className="dark:bg-[#0F0A1F]">Reading / Article</option>
                                    <option value="pdf" className="dark:bg-[#0F0A1F]">PDF Document</option>
                                    <option value="assignment" className="dark:bg-[#0F0A1F]">Assignment</option>
                                    <option value="image" className="dark:bg-[#0F0A1F]">Image</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter item title"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                    value={newVideoData.title}
                                    onChange={(e) => setNewVideoData({ ...newVideoData, title: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">URL / File Upload</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="flex-1 w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                        value={newVideoData.url}
                                        onChange={(e) => setNewVideoData({ ...newVideoData, url: e.target.value })}
                                    />
                                    <input
                                        type="file"
                                        ref={contentInputRef}
                                        onChange={handleContentUpload}
                                        className="hidden"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => contentInputRef.current?.click()}
                                        className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors whitespace-nowrap border border-gray-200 dark:border-white/10 shadow-sm"
                                        disabled={contentUploading}
                                    >
                                        {contentUploading ? 'Uploading...' : 'Upload File'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">Duration <span className="font-normal normal-case text-gray-400 dark:text-white/30">(Optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10 mins"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                        value={newVideoData.duration}
                                        onChange={(e) => setNewVideoData({ ...newVideoData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">Thumbnail <span className="font-normal normal-case text-gray-400 dark:text-white/30">(Optional)</span></label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            className="flex-1 w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                            value={newVideoData.thumbnail || ''}
                                            onChange={(e) => setNewVideoData({ ...newVideoData, thumbnail: e.target.value })}
                                        />
                                        <input
                                            type="file"
                                            ref={videoThumbnailInputRef}
                                            onChange={handleVideoThumbnailUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => videoThumbnailInputRef.current?.click()}
                                            className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm"
                                            disabled={videoThumbnailUploading}
                                        >
                                            {videoThumbnailUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1 uppercase tracking-wider">Description <span className="font-normal normal-case text-gray-400 dark:text-white/30">(Optional)</span></label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief description..."
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all resize-none"
                                    value={newVideoData.description}
                                    onChange={(e) => setNewVideoData({ ...newVideoData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
                            <button onClick={() => setOpenVideo(false)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white rounded-lg text-sm font-semibold transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAddVideo} className="px-5 py-2 bg-[#4C1D95] text-white hover:bg-primary-hover rounded-lg text-sm font-semibold shadow-sm transition-colors">
                                Add Item
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
            <ConfirmDialog
                open={!!itemToDelete}
                title={itemToDelete?.type === 'module' ? "Delete this module?" : "Delete this content item?"}
                message={itemToDelete?.type === 'module' ? "This completely removes the module and all its content items. This cannot be undone." : "This removes the content item from the module. This cannot be undone."}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
};

export default CourseEditor;
