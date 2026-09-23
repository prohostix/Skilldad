
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, Building2, User as UserIcon, Users,
    Image as ImageIcon, LayoutGrid, List, Heart, Upload, Loader2,
    Target, Rocket, Globe, Award, Activity, GraduationCap, Eye, EyeOff, Sliders, Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import NetworkDiagramEditor from '../../components/admin/NetworkDiagramEditor';
import { getMediaUrl } from '../../utils/media';

const SiteContentManager = () => {
    const [activeTab, setActiveTab] = useState('corporate'); 
    const [directorSubTab, setDirectorSubTab] = useState('BOARD'); // 'BOARD', 'IIT_LEADERSHIP'
    const [logos, setLogos] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [stories, setStories] = useState([]);
    const [cmsData, setCmsData] = useState({});
    const [landingCmsData, setLandingCmsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', title: '', image: '', logo: '', location: '', 
        students: '', programs: '', order: 0, type: 'corporate', 
        category: 'DIRECTOR', bio: '', linkedin_url: '',
        display_target: 'ABOUT_DIRECTOR',
        university: '',
        accent_color: 'primary',
        campus: '', package: '', video_url: '', story: '', role: ''
    });
    const [videoUploading, setVideoUploading] = useState(null);
    const [uploading, setUploading] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };
            const [logosRes, directorsRes, storiesRes, cmsRes, landingCmsRes] = await Promise.all([
                axios.get('/api/admin/partner-logos', config),
                axios.get('/api/admin/directors', config),
                axios.get('/api/admin/success-stories', config),
                axios.get('/api/public/cms/about_us'),
                axios.get('/api/public/cms/landing_page')
            ]);
            setLogos(logosRes.data);
            setDirectors(directorsRes.data);
            setStories(storiesRes.data);
            setCmsData(cmsRes.data);
            setLandingCmsData(landingCmsRes.data || {});
            setLoading(false);
        } catch (error) {
            showToast('Failed to fetch data', 'error');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            let url = '';
            if (activeTab === 'directors') url = isEditing ? `/api/admin/directors/${editingId}` : '/api/admin/directors';
            else if (activeTab === 'success_stories') url = isEditing ? `/api/admin/success-stories/${editingId}` : '/api/admin/success-stories';
            else url = isEditing ? `/api/admin/partner-logos/${editingId}` : '/api/admin/partner-logos';

            const payload = (activeTab === 'directors' || activeTab === 'success_stories') ? formData : { ...formData, type: activeTab };
            
            if (isEditing) {
                await axios.put(url, payload, config);
            } else {
                await axios.post(url, payload, config);
            }

            showToast(`${activeTab === 'directors' ? 'Team Member' : activeTab === 'success_stories' ? 'Success Story' : 'Asset'} ${isEditing ? 'updated' : 'added'} successfully`, 'success');
            setShowAddModal(false);
            resetForm();
            fetchAll();
        } catch (error) {
            showToast('Submission failed', 'error');
        }
    };

    const handleEditStart = (item) => {
        const id = item._id || item.id;
        setIsEditing(true);
        setEditingId(id);
        setFormData({
            ...formData,
            ...item,
            _id: id,
            id: id,
            logo: item.logo || item.imageUrl || item.image || '',
            image: item.image || item.imageUrl || item.logo || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            let url = '';
            if (activeTab === 'directors') url = `/api/admin/directors/${id}`;
            else if (activeTab === 'success_stories') url = `/api/admin/success-stories/${id}`;
            else url = `/api/admin/partner-logos/${id}`;

            await axios.delete(url, config);
            showToast('Deleted successfully', 'success');
            fetchAll();
        } catch (error) {
            showToast('Deletion failed', 'error');
        }
    };

    const handleCmsUpdate = async (pageOrSection, sectionOrContent, maybeContent) => {
        try {
            let page = 'about_us';
            let section = pageOrSection;
            let content = sectionOrContent;

            if (maybeContent !== undefined) {
                page = pageOrSection;
                section = sectionOrContent;
                content = maybeContent;
            }

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            await axios.put(`/api/admin/cms/${page}/${section}`, { content }, config);
            showToast(`${section.replace('_', ' ')} updated successfully`, 'success');
            fetchAll();
        } catch (error) {
            showToast(`Failed to update ${sectionOrContent}`, 'error');
        }
    };

    const handleFileUpload = async (id, file) => {
        if (!file) return;
        try {
            setUploading(id);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { 
                    Authorization: `Bearer ${userInfo?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const uploadFormData = new FormData();
            const fieldName = (activeTab === 'directors' || activeTab === 'success_stories') ? 'image' : 'logo';
            uploadFormData.append(fieldName, file);

            let url = '';
            if (activeTab === 'directors') url = `/api/admin/directors/${id}/upload`;
            else if (activeTab === 'success_stories') url = `/api/admin/success-stories/${id}/upload`;
            else url = `/api/admin/partner-logos/${id}/upload`;

            await axios.post(url, uploadFormData, config);
            showToast('Image uploaded successfully', 'success');
            fetchAll();
        } catch (error) {
            showToast('Upload failed', 'error');
        } finally {
            setUploading(null);
        }
    };

    const handleVideoUpload = async (id, file) => {
        if (!file) return;
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid video format. Use MP4, WEBM, MOV, or OGG.', 'error');
            return;
        }
        try {
            setVideoUploading(id);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const uploadFormData = new FormData();
            uploadFormData.append('video', file);
            await axios.post(`/api/admin/success-stories/${id}/upload-video`, uploadFormData, {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast('Video uploaded successfully', 'success');
            fetchAll();
        } catch (error) {
            showToast('Video upload failed', 'error');
        } finally {
            setVideoUploading(null);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ 
            name: '', title: '', image: '', logo: '', location: '', 
            students: '', programs: '', order: 0, type: activeTab, 
            category: 'DIRECTOR', bio: '', linkedin_url: '',
            display_target: activeTab === 'directors' 
                ? (directorSubTab === 'IIT_LEADERSHIP' ? 'IIT_LEADERSHIP' : 'ABOUT_DIRECTOR')
                : 'LANDING',
            university: '',
            accent_color: 'primary',
            campus: '', package: '', video_url: '', story: '', role: ''
        });
    };

    const tabs = [
        { id: 'corporate', label: 'Corporate Partners', icon: Building2 },
        { id: 'university', label: 'University Partners (Ticker Banner)', icon: GraduationCap },
        { id: 'directors', label: 'Team & Advisory', icon: UserIcon },
        { id: 'success_stories', label: 'Success Stories', icon: Heart },
        { id: 'diagram', label: 'Network Diagram Nodes', icon: Sparkles },
        { id: 'page_sections', label: 'Landing Page Controls', icon: Sliders },
        { id: 'about_cms', label: 'About Page CMS', icon: ImageIcon },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 font-inter">
            <DashboardHeading 
                title="Site Content Manager" 
                subtitle="Manage your platform's public facing assets and CMS content"
                icon={LayoutGrid}
            />

            {/* Tab Navigation styled like Course Library */}
            <div className="flex bg-slate-100/90 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full flex-wrap gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'diagram' ? (
                    <NetworkDiagramEditor landingCmsData={landingCmsData} onUpdate={handleCmsUpdate} />
                ) : activeTab === 'page_sections' ? (
                    <LandingPageControls landingCmsData={landingCmsData} onUpdate={handleCmsUpdate} />
                ) : activeTab === 'about_cms' ? (
                    <AboutCmsEditor data={cmsData} onUpdate={handleCmsUpdate} />
                ) : (
                    <div className="space-y-5">
                        {activeTab === 'success_stories' && (
                            <LandingPageControls landingCmsData={landingCmsData} onUpdate={handleCmsUpdate} />
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-inter">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <ModernButton onClick={() => { resetForm(); setShowAddModal(true); }} className="w-full sm:w-auto !px-3 !py-1.5 text-xs font-semibold">
                                <Plus size={14} className="mr-1" />
                                Add {activeTab === 'directors' ? 'Member' : activeTab === 'success_stories' ? 'Story' : activeTab === 'university' ? 'Ticker Partner' : 'Logo'}
                            </ModernButton>
                        </div>
                        
                        {activeTab === 'directors' && (
                            <div className="flex flex-wrap gap-1 p-0.5 bg-slate-100/90 dark:bg-white/5 rounded-lg border border-slate-200/80 dark:border-white/10 w-fit">
                                <button
                                    onClick={() => setDirectorSubTab('BOARD')}
                                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                        directorSubTab === 'BOARD' 
                                        ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold' 
                                        : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    BOARD & ADVISORY
                                </button>
                                <button
                                    onClick={() => setDirectorSubTab('IIT_LEADERSHIP')}
                                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                        directorSubTab === 'IIT_LEADERSHIP' 
                                        ? 'bg-primary text-white shadow-sm font-bold' 
                                        : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    IIT LEADERSHIP PANEL
                                </button>
                            </div>
                        )}

                        {(() => {
                            const filteredItems = activeTab === 'directors' 
                                ? directors.filter(d => 
                                    directorSubTab === 'IIT_LEADERSHIP' 
                                        ? d.display_target === 'IIT_LEADERSHIP' 
                                        : d.display_target !== 'IIT_LEADERSHIP'
                                  )
                                : activeTab === 'success_stories' ? stories 
                                : logos.filter(l => l.type === activeTab);

                            if (filteredItems.length === 0) {
                                return (
                                    <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 my-4">
                                        <Building2 className="w-8 h-8 mx-auto text-slate-400 dark:text-white/20 mb-2" />
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-1">
                                            No {tabs.find(t => t.id === activeTab)?.label} Added Yet
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-white/40 max-w-md mx-auto mb-3">
                                            There are currently no items in this category. Click below to add your first item.
                                        </p>
                                        <ModernButton onClick={() => { resetForm(); setShowAddModal(true); }} className="!px-3 !py-1.5 text-xs font-semibold">
                                            <Plus size={13} className="mr-1" />
                                            Add {activeTab === 'directors' ? 'Member' : activeTab === 'success_stories' ? 'Story' : activeTab === 'university' ? 'Ticker Partner' : 'Logo'}
                                        </ModernButton>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                                    {filteredItems.map(item => {
                                        const itemId = item._id || item.id;
                                        return (
                                            <div 
                                                key={itemId} 
                                                className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col items-center text-center justify-between"
                                            >
                                                <div className="flex flex-col items-center text-center w-full">
                                                    <div className="relative mb-2.5">
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-2 flex items-center justify-center transition-all group-hover:border-primary/40">
                                                            <img 
                                                                src={
                                                                    (item.imageUrl || item.image || item.logo) 
                                                                        ? ( (item.imageUrl || item.image || item.logo).startsWith('http') 
                                                                            ? (item.imageUrl || item.image || item.logo) 
                                                                            : `${axios.defaults.baseURL || ''}${item.imageUrl || item.image || item.logo}` )
                                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'N/A')}&background=5B5CFF&color=fff&bold=true`
                                                                } 
                                                                alt={item.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <label className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-md cursor-pointer hover:scale-105 transition-all shadow-sm" title="Change logo/image">
                                                            <Upload size={11} />
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                onChange={(e) => handleFileUpload(itemId, e.target.files[0])}
                                                                disabled={uploading === itemId}
                                                            />
                                                        </label>
                                                        {uploading === itemId && (
                                                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full">
                                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5 text-center font-inter truncate w-full" title={item.name}>{item.name}</h3>
                                                        <p className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-wider text-center font-inter truncate w-full">{item.title || item.role || item.type || item.package || 'Partner'}</p>
                                                        
                                                        {activeTab === 'directors' && (
                                                            <div className="mt-1">
                                                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md inline-block">
                                                                    {item.display_target || 'ABOUT_DIRECTOR'}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {activeTab === 'success_stories' && (
                                                            <div className="mt-1 space-y-1">
                                                                {item.campus && (
                                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md inline-block">
                                                                        {item.campus}
                                                                    </span>
                                                                )}
                                                                <div className="flex items-center justify-center mt-1">
                                                                    <label className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-[9px] font-semibold transition-all ${item.video_url || item.videoUrl ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}>
                                                                        {videoUploading === itemId ? (
                                                                            <Loader2 size={10} className="animate-spin" />
                                                                        ) : (
                                                                            <Upload size={10} />
                                                                        )}
                                                                        {item.video_url || item.videoUrl ? 'Change Video' : 'Upload Video'}
                                                                        <input
                                                                            type="file"
                                                                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                                            className="hidden"
                                                                            onChange={(e) => handleVideoUpload(itemId, e.target.files[0])}
                                                                            disabled={videoUploading === itemId}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Compact Action buttons */}
                                                <div className="flex items-center justify-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200/80 dark:border-white/10 w-full">
                                                    <button 
                                                        onClick={() => handleEditStart(item)} 
                                                        className="flex-1 h-5 px-1.5 bg-slate-100 hover:bg-primary/15 hover:text-primary dark:bg-white/5 dark:hover:bg-primary/20 border border-slate-200/80 hover:border-primary/30 dark:border-white/10 rounded-md text-[10px] font-medium leading-none text-slate-700 dark:text-white/90 flex items-center justify-center gap-1 transition-all shadow-xs"
                                                    >
                                                        <Edit2 size={9.5} />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(itemId)} 
                                                        className="flex-1 h-5 px-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-md text-[10px] font-medium leading-none flex items-center justify-center gap-1 transition-all"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 size={9.5} />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-[#0E0B1A] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit' : 'Add New'} {activeTab === 'directors' ? 'Team Member' : activeTab === 'success_stories' ? 'Success Story' : 'Partner'}</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-white/50"><X size={16} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                     <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">{activeTab === 'success_stories' ? 'Student Name' : 'Name / Company'}</label>
                                     <input 
                                         required
                                         className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                         value={formData.name}
                                         onChange={e => setFormData({ ...formData, name: e.target.value })}
                                     />
                                 </div>

                                 {activeTab === 'directors' && (
                                     <>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Role / Title</label>
                                             <input 
                                                 required
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.title}
                                                 onChange={e => setFormData({ ...formData, title: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Display Location</label>
                                             <select
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.display_target}
                                                 onChange={e => setFormData({ ...formData, display_target: e.target.value })}
                                             >
                                                 <option value="LANDING">Landing Page (Directors)</option>
                                                 <option value="IIT_LEADERSHIP">Managed by IITans</option>
                                                 <option value="ABOUT_DIRECTOR">About Us (Director/CEO)</option>
                                                 <option value="ABOUT_ADVISORY">About Us (Advisory Board)</option>
                                             </select>
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">University / Alumni</label>
                                             <input 
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.university}
                                                 placeholder="e.g. IIT Delhi"
                                                 onChange={e => setFormData({ ...formData, university: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Bio / Description</label>
                                             <textarea 
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all h-20"
                                                 value={formData.bio}
                                                 placeholder="Short description..."
                                                 onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Accent Color (Theme)</label>
                                             <select
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.accent_color}
                                                 onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                                             >
                                                 <option value="primary">SkillDad Indigo (Default)</option>
                                                 <option value="emerald-400">Success Green</option>
                                                 <option value="amber-400">Notice Yellow</option>
                                                 <option value="sky-400">Deep Sky Blue</option>
                                                 <option value="rose-500">Alert Rose</option>
                                             </select>
                                         </div>
                                     </>
                                 )}

                                 {activeTab === 'success_stories' && (
                                     <>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Campus / University</label>
                                             <input 
                                                 required
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.campus}
                                                 placeholder="e.g. CIT Campus"
                                                 onChange={e => setFormData({ ...formData, campus: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Role / Job Title</label>
                                             <input 
                                                 required
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.role}
                                                 placeholder="e.g. Full Stack Dev"
                                                 onChange={e => setFormData({ ...formData, role: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Package (LPA)</label>
                                             <input 
                                                 required
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.package}
                                                 placeholder="e.g. 18 LPA"
                                                 onChange={e => setFormData({ ...formData, package: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Story / Testimonial</label>
                                             <textarea 
                                                 required
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all h-20"
                                                 value={formData.story}
                                                 onChange={e => setFormData({ ...formData, story: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Video URL (YouTube / External Link)</label>
                                             <input 
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.video_url}
                                                 placeholder="https://youtube.com/watch?v=..."
                                                 onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Or Upload Video from Device</label>
                                             {isEditing ? (
                                                 <label className={`flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed rounded-lg cursor-pointer transition-all ${videoUploading === editingId ? 'border-primary/40 bg-primary/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary/40'}`}>
                                                     {videoUploading === editingId ? (
                                                         <>
                                                             <Loader2 size={13} className="animate-spin text-primary" />
                                                             <span className="text-xs text-primary font-semibold">Uploading...</span>
                                                         </>
                                                     ) : (
                                                         <>
                                                             <Upload size={13} className="text-slate-500 dark:text-white/40" />
                                                             <span className="text-xs text-slate-600 dark:text-white/50">{formData.video_url && !formData.video_url.startsWith('http') ? 'Change video file' : 'Choose video file (MP4, WEBM, MOV)'}</span>
                                                         </>
                                                     )}
                                                     <input
                                                         type="file"
                                                         accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                         className="hidden"
                                                         disabled={videoUploading === editingId}
                                                         onChange={async (e) => {
                                                             const file = e.target.files[0];
                                                             if (!file) return;
                                                             await handleVideoUpload(editingId, file);
                                                             const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                                             const res = await axios.get('/api/admin/success-stories', { headers: { Authorization: `Bearer ${userInfo?.token}` } });
                                                             const updated = res.data.find(s => s._id === editingId || s.id === editingId);
                                                             if (updated) setFormData(f => ({ ...f, video_url: updated.video_url || '' }));
                                                         }}
                                                     />
                                                 </label>
                                             ) : (
                                                 <p className="text-[10px] text-slate-400 dark:text-white/30 px-1 py-1">Save the story first, then upload a video file.</p>
                                             )}
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Display Order</label>
                                             <input 
                                                 type="number"
                                                 className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                                 value={formData.order}
                                                 onChange={e => setFormData({ ...formData, order: e.target.value })}
                                             />
                                         </div>
                                     </>
                                 )}

                                 {activeTab !== 'directors' && activeTab !== 'success_stories' && (
                                     <div className="space-y-1">
                                         <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">Order Index</label>
                                         <input 
                                             type="number"
                                             className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                             value={formData.order}
                                             onChange={e => setFormData({ ...formData, order: e.target.value })}
                                         />
                                     </div>
                                 )}

                                 <ModernButton type="submit" className="w-full !py-2 text-xs font-semibold">
                                     {isEditing ? 'Save Changes' : 'Confirm Addition'}
                                 </ModernButton>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AboutCmsEditor = ({ data, onUpdate }) => {
    return (
        <div className="grid lg:grid-cols-2 gap-8 pb-12">
            {/* Mission Section */}
            <CmsSectionCard 
                title="Mission Statement & Visual Collage" 
                icon={Rocket}
                fields={[
                    { key: 'title', label: 'Heading', value: data.mission?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.mission?.description },
                    { key: 'main_image', label: 'Main Tall Photo (Left Large)', type: 'image', value: data.mission?.main_image, defaultVal: '/assets/about/mission_laptop.jpg' },
                    { key: 'top_image', label: 'Top Accent Photo (Upper Right)', type: 'image', value: data.mission?.top_image, defaultVal: '/assets/about/mission_collab.jpg' },
                    { key: 'bottom_image', label: 'Bottom Accent Photo (Lower Right)', type: 'image', value: data.mission?.bottom_image, defaultVal: '/assets/about/mission_headphones.jpg' },
                ]}
                onSave={(content) => onUpdate('mission', content)}
            />

            {/* Vision Section */}
            <CmsSectionCard 
                title="Vision Statement & Visual Collage" 
                icon={Globe}
                fields={[
                    { key: 'title', label: 'Heading', value: data.vision?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.vision?.description },
                    { key: 'main_image', label: 'Main Tall Photo (Right Large)', type: 'image', value: data.vision?.main_image, defaultVal: '/assets/about/vision_campus.jpg' },
                    { key: 'top_image', label: 'Top Accent Photo (Upper Left)', type: 'image', value: data.vision?.top_image, defaultVal: '/assets/about/vision_innovators.jpg' },
                    { key: 'bottom_image', label: 'Bottom Accent Photo (Lower Left)', type: 'image', value: data.vision?.bottom_image, defaultVal: '/assets/about/vision_graduate.jpg' },
                ]}
                onSave={(content) => onUpdate('vision', content)}
            />

            {/* Values Section */}
            <CmsSectionCard 
                title="Core Values & Visual Collage" 
                icon={Award}
                fields={[
                    { key: 'title', label: 'Heading', value: data.values?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.values?.description },
                    { key: 'main_image', label: 'Main Tall Photo (Left Large)', type: 'image', value: data.values?.main_image, defaultVal: '/assets/about/values_mastery.jpg' },
                    { key: 'top_image', label: 'Top Accent Photo (Upper Right)', type: 'image', value: data.values?.top_image, defaultVal: '/assets/about/values_mentor.jpg' },
                    { key: 'bottom_image', label: 'Bottom Accent Photo (Lower Right)', type: 'image', value: data.values?.bottom_image, defaultVal: '/assets/about/values_success.jpg' },
                ]}
                onSave={(content) => onUpdate('values', content)}
            />

            {/* Hero Section */}
            <CmsSectionCard 
                title="Story Hero & Header" 
                icon={Target}
                fields={[
                    { key: 'title', label: 'Main Heading', value: data.hero?.title },
                    { key: 'story', label: 'Long Description', type: 'textarea', value: data.hero?.story },
                ]}
                onSave={(content) => onUpdate('hero', content)}
            />

            {/* Impact Section */}
            <CmsSectionCard 
                title="Impact Hero Section" 
                icon={Activity}
                fields={[
                    { key: 'title', label: 'Section Title', value: data.impact_hero?.title },
                    { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', value: data.impact_hero?.subtitle },
                ]}
                onSave={(content) => onUpdate('impact_hero', content)}
            />

            {/* Team Headers */}
            <CmsSectionCard 
                title="Directors Section Header" 
                icon={Users}
                fields={[
                    { key: 'title', label: 'Section Title', value: data.directors_header?.title },
                    { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', value: data.directors_header?.subtitle },
                ]}
                onSave={(content) => onUpdate('directors_header', content)}
            />

            <CmsSectionCard 
                title="Advisory Section Header" 
                icon={List}
                fields={[
                    { key: 'title', label: 'Section Title', value: data.advisory_header?.title },
                    { key: 'description', label: 'Section Subtitle', type: 'textarea', value: data.advisory_header?.description },
                ]}
                onSave={(content) => onUpdate('advisory_header', content)}
            />
        </div>
    );
};

const CmsSectionCard = ({ title, icon: Icon, fields, onSave }) => {
    const [values, setValues] = useState({});
    const [uploadingField, setUploadingField] = useState(null);
    const { showToast } = useToast();
    
    useEffect(() => {
        const initial = {};
        fields.forEach(f => initial[f.key] = f.value || '');
        setValues(initial);
    }, [fields]);

    const handleImageUpload = async (key, file) => {
        if (!file) return;
        try {
            setUploadingField(key);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const res = await axios.post('/api/upload/media', uploadFormData, config);
            if (res.data?.url) {
                setValues(prev => ({ ...prev, [key]: res.data.url }));
                showToast('Image uploaded successfully! Click save to apply changes.', 'success');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showToast('Failed to upload image. Please check file format and size.', 'error');
        } finally {
            setUploadingField(null);
        }
    };

    const resolvePreview = (url, defaultVal) => {
        const target = url || defaultVal;
        if (!target) return '';
        if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('data:')) {
            return target;
        }
        if (target.startsWith('/assets/') || target.startsWith('assets/')) {
            return target.startsWith('/') ? target : `/${target}`;
        }
        return getMediaUrl(target);
    };

    return (
        <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm h-fit">
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Icon size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs font-inter">{title}</h3>
            </div>

            <div className="space-y-3.5">
                {fields.map(field => {
                    if (field.type === 'image') {
                        const currentVal = values[field.key] || '';
                        const isCustom = currentVal && currentVal !== field.defaultVal;
                        const previewSrc = resolvePreview(currentVal, field.defaultVal);

                        return (
                            <div key={field.key} className="space-y-1.5 text-left p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-700 dark:text-white/70 uppercase tracking-wider">
                                        {field.label}
                                    </label>
                                    {isCustom && (
                                        <button
                                            type="button"
                                            onClick={() => setValues(prev => ({ ...prev, [field.key]: field.defaultVal || '' }))}
                                            className="text-[10px] text-primary hover:underline font-semibold"
                                        >
                                            Reset to Default
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Thumbnail Preview */}
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-white/15 shadow-2xs bg-slate-200 dark:bg-slate-800 shrink-0 relative group">
                                        {previewSrc ? (
                                            <img
                                                src={previewSrc}
                                                alt={field.label}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/placeholders/default.png";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload and manual URL input */}
                                    <div className="flex-1 space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                                                uploadingField === field.key
                                                    ? 'bg-primary/20 text-primary cursor-wait'
                                                    : 'bg-primary text-white hover:bg-primary-dark shadow-2xs'
                                            }`}>
                                                {uploadingField === field.key ? (
                                                    <>
                                                        <Loader2 size={12} className="animate-spin" />
                                                        <span>Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={12} />
                                                        <span>Upload Image</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={uploadingField === field.key}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(field.key, file);
                                                    }}
                                                />
                                            </label>
                                            <span className="text-[10px] text-slate-400 dark:text-white/40 truncate">
                                                {uploadingField === field.key ? 'Processing upload...' : 'or paste URL/path below'}
                                            </span>
                                        </div>

                                        <input
                                            className="w-full px-2.5 py-1 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-md text-[11px] font-mono text-slate-900 dark:text-white focus:border-primary outline-none transition-all truncate"
                                            placeholder={field.defaultVal || "e.g. /uploads/... or https://..."}
                                            value={currentVal}
                                            onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={field.key} className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider px-0.5">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none h-20 transition-all"
                                    value={values[field.key] || ''}
                                    onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                                />
                            ) : (
                                <input
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                                    value={values[field.key] || ''}
                                    onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => onSave(values)}
                className="w-full mt-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 font-inter"
            >
                <Save size={13} />
                <span>Save {title.split(' ')[0]} Section</span>
            </button>
        </div>
    );
};

const HeroBubbleTextsEditor = ({ items, onUpdate }) => {
    const [newText, setNewText] = useState('');
    const [saving, setSaving] = useState(false);

    const persist = async (nextItems) => {
        setSaving(true);
        await onUpdate('landing_page', 'hero_bubbles', { items: nextItems });
        setSaving(false);
    };

    const handleAdd = () => {
        const text = newText.trim();
        if (!text) return;
        setNewText('');
        persist([...items, { id: `hb_${Date.now()}`, text }]);
    };

    const handleRemove = (id) => {
        persist(items.filter(i => i.id !== id));
    };

    return (
        <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-primary/10 text-primary border-primary/20">
                    <Sparkles size={18} />
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-inter">Hero Bubble Pop-up Text</h3>
                    <p className="text-[11px] text-slate-500 dark:text-white/60 mt-0.5 max-w-2xl leading-relaxed font-inter">
                        Text shown when a floating bubble bursts in the homepage hero animation (right side). Rotates automatically.
                    </p>
                </div>
            </div>

            <div className="pt-3.5 flex flex-col sm:flex-row gap-2">
                <input
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                    placeholder="e.g. 1,200+ Data Analyst Openings"
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                />
                <button
                    onClick={handleAdd}
                    disabled={saving || !newText.trim()}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-40 shrink-0 font-inter"
                >
                    Add
                </button>
            </div>

            <div className="pt-3 space-y-1.5">
                {items.length === 0 ? (
                    <p className="text-[11px] text-slate-400 dark:text-white/30 italic px-1 py-1">No entries yet - bubbles will just rise and pop with no text until you add some.</p>
                ) : items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 rounded-lg">
                        <span className="text-xs text-slate-800 dark:text-white/90 font-medium font-inter">{item.text}</span>
                        <button
                            onClick={() => handleRemove(item.id)}
                            disabled={saving}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-40"
                            title="Remove"
                        >
                            <X size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LandingPageControls = ({ landingCmsData, onUpdate }) => {
    const isCampusImpactVisible = landingCmsData?.campus_impact?.show_section === true;
    const heroBubbleItems = landingCmsData?.hero_bubbles?.items || [];

    return (
        <div className="space-y-4 text-left my-2 font-inter">
            <NetworkDiagramEditor landingCmsData={landingCmsData} onUpdate={onUpdate} />
            <HeroBubbleTextsEditor items={heroBubbleItems} onUpdate={onUpdate} />

            <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
                    <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${
                            isCampusImpactVisible 
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                            {isCampusImpactVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-inter">Campus Impact & Testimonials Section</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                    isCampusImpactVisible 
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' 
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                                }`}>
                                    {isCampusImpactVisible ? '● VISIBLE' : '○ HIDDEN'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-white/60 mt-0.5 max-w-2xl leading-relaxed font-inter">
                                Control whether the <span className="text-slate-800 dark:text-white font-semibold">Campus Impact</span> section (Student Success Stories video cards & testimonials) is displayed on the public landing page.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onUpdate('landing_page', 'campus_impact', { show_section: !isCampusImpactVisible })}
                        className={`w-full md:w-auto px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shrink-0 font-inter ${
                            isCampusImpactVisible
                                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {isCampusImpactVisible ? (
                            <>
                                <EyeOff size={13} /> Hide Section
                            </>
                        ) : (
                            <>
                                <Eye size={13} /> Show on Landing Page
                            </>
                        )}
                    </button>
                </div>

                <div className="pt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Sliders size={13} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-inter">Instant Toggle Control</h4>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 font-inter">Toggle visibility anytime without losing student video data.</p>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Heart size={13} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-inter">Success Stories Preserved</h4>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 font-inter">All saved student testimonials remain intact in the database.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteContentManager;
