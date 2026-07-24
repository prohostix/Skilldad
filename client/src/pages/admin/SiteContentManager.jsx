
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, Building2, User as UserIcon, Users,
    Image as ImageIcon, LayoutGrid, List, Heart, Upload, Loader2,
    Target, Rocket, Globe, Award, Activity, GraduationCap
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const SiteContentManager = () => {
    const [activeTab, setActiveTab] = useState('corporate'); 
    const [directorSubTab, setDirectorSubTab] = useState('BOARD'); // 'BOARD', 'IIT_LEADERSHIP'
    const [logos, setLogos] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [stories, setStories] = useState([]);
    const [cmsData, setCmsData] = useState({});
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
            const [logosRes, directorsRes, storiesRes, cmsRes] = await Promise.all([
                axios.get('/api/admin/partner-logos', config),
                axios.get('/api/admin/directors', config),
                axios.get('/api/admin/success-stories', config),
                axios.get('/api/public/cms/about_us')
            ]);
            setLogos(logosRes.data);
            setDirectors(directorsRes.data);
            setStories(storiesRes.data);
            setCmsData(cmsRes.data);
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

    const handleCmsUpdate = async (section, content) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            await axios.put(`/api/admin/cms/about_us/${section}`, { content }, config);
            showToast(`${section} updated successfully`, 'success');
            fetchAll();
        } catch (error) {
            showToast(`Failed to update ${section}`, 'error');
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
        <div className="space-y-8 pb-20">
            <DashboardHeading 
                title="Site Content Manager" 
                subtitle="Manage your platform's public facing assets and CMS content"
                icon={LayoutGrid}
            />

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all duration-300 ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'about_cms' ? (
                    <AboutCmsEditor data={cmsData} onUpdate={handleCmsUpdate} />
                ) : (
                    <div className="space-y-6">


                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-white px-2">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <ModernButton onClick={() => { resetForm(); setShowAddModal(true); }}>
                                Add {activeTab === 'directors' ? 'Member' : activeTab === 'success_stories' ? 'Story' : activeTab === 'university' ? 'Ticker Partner' : 'Logo'}
                            </ModernButton>
                        </div>
                        
                        {activeTab === 'directors' && (
                            <div className="flex space-x-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
                                <button
                                    onClick={() => setDirectorSubTab('BOARD')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                                        directorSubTab === 'BOARD' 
                                        ? 'bg-white/10 text-white shadow-sm' 
                                        : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    BOARD & ADVISORY
                                </button>
                                <button
                                    onClick={() => setDirectorSubTab('IIT_LEADERSHIP')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                                        directorSubTab === 'IIT_LEADERSHIP' 
                                        ? 'bg-primary/20 text-primary border border-primary/30' 
                                        : 'text-white/30 hover:text-white/60'
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
                                    <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 my-6">
                                        <Building2 className="w-12 h-12 mx-auto text-white/20 mb-3" />
                                        <h3 className="text-base font-bold text-white mb-1">
                                            No {tabs.find(t => t.id === activeTab)?.label} Added Yet
                                        </h3>
                                        <p className="text-xs text-white/40 max-w-md mx-auto mb-5">
                                            There are currently no items in this category. Click the button below to add your first item.
                                        </p>
                                        <ModernButton onClick={() => { resetForm(); setShowAddModal(true); }}>
                                            <Plus size={16} className="mr-2" />
                                            Add {activeTab === 'directors' ? 'Member' : activeTab === 'success_stories' ? 'Story' : activeTab === 'university' ? 'Ticker Partner' : 'Logo'}
                                        </ModernButton>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredItems.map(item => {
                                        const itemId = item._id || item.id;
                                        return (
                                            <GlassCard key={itemId} className="relative group overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500">
                                                <div className="flex flex-col items-center text-center p-6">
                                                    <div className="relative mb-4">
                                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all bg-black/40">
                                                            <img 
                                                                src={
                                                                    (item.imageUrl || item.image || item.logo) 
                                                                        ? ( (item.imageUrl || item.image || item.logo).startsWith('http') 
                                                                            ? (item.imageUrl || item.image || item.logo) 
                                                                            : `${axios.defaults.baseURL || ''}${item.imageUrl || item.image || item.logo}` )
                                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'N/A')}&background=5B5CFF&color=fff&bold=true`
                                                                } 
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <label className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl cursor-pointer hover:scale-110 transition-all shadow-lg" title="Change logo/image">
                                                            <Upload size={14} className="text-white" />
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                onChange={(e) => handleFileUpload(itemId, e.target.files[0])}
                                                                disabled={uploading === itemId}
                                                            />
                                                        </label>
                                                        {uploading === itemId && (
                                                            <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full">
                                                        <h3 className="text-sm font-bold text-white mb-1 text-center">{item.name}</h3>
                                                        <p className="text-[10px] text-white/50 uppercase tracking-widest text-center">{item.title || item.role || item.type || item.package}</p>
                                                        
                                                        <div className="text-center mt-2">
                                                            {activeTab === 'directors' && (
                                                                <div className="text-[8px] font-black px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full inline-block">
                                                                    {item.display_target || 'ABOUT_DIRECTOR'}
                                                                </div>
                                                            )}
                                                            {activeTab === 'success_stories' && (
                                                                <div className="space-y-1">
                                                                    <div className="text-[8px] font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full inline-block">
                                                                        {item.campus}
                                                                    </div>
                                                                    <div className="flex items-center justify-center mt-2">
                                                                        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer text-[9px] font-black uppercase tracking-widest transition-all ${item.video_url || item.videoUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'}`}>
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

                                                        {/* Action buttons - ALWAYS visible so user easily spots the Edit button */}
                                                        <div className="flex items-center justify-center gap-2 mt-5 pt-3 border-t border-white/10 w-full">
                                                            <button 
                                                                onClick={() => handleEditStart(item)} 
                                                                className="flex-1 py-2 px-3 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 rounded-xl text-xs font-bold text-white/90 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                                            >
                                                                <Edit2 size={13} />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(itemId)} 
                                                                className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                                                                title="Delete Item"
                                                            >
                                                                <Trash2 size={13} />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-white">{isEditing ? 'Edit' : 'Add New'} {activeTab === 'directors' ? 'Team Member' : activeTab === 'success_stories' ? 'Success Story' : 'Partner'}</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/50"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">{activeTab === 'success_stories' ? 'Student Name' : 'Name / Company'}</label>
                                     <input 
                                         required
                                         className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                         value={formData.name}
                                         onChange={e => setFormData({ ...formData, name: e.target.value })}
                                     />
                                 </div>

                                 {activeTab === 'directors' && (
                                     <>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Role / Title</label>
                                             <input 
                                                 required
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.title}
                                                 onChange={e => setFormData({ ...formData, title: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Display Location</label>
                                             <select
                                                 className="w-full px-6 py-4 bg-[#1A1A1A] border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.display_target}
                                                 onChange={e => setFormData({ ...formData, display_target: e.target.value })}
                                             >
                                                 <option value="LANDING">Landing Page (Directors)</option>
                                                 <option value="IIT_LEADERSHIP">Managed by IITans</option>
                                                 <option value="ABOUT_DIRECTOR">About Us (Director/CEO)</option>
                                                 <option value="ABOUT_ADVISORY">About Us (Advisory Board)</option>
                                             </select>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">University / Alumni (Internal Notes)</label>
                                             <input 
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.university}
                                                 placeholder="e.g. IIT Delhi"
                                                 onChange={e => setFormData({ ...formData, university: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Bio / Description (Displayed on Landing)</label>
                                             <textarea 
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all h-24"
                                                 value={formData.bio}
                                                 placeholder="Short description for the IIT Leadership section..."
                                                 onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Accent Dot Color (Theme)</label>
                                             <select
                                                 className="w-full px-6 py-4 bg-[#1A1A1A] border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
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
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Campus / University</label>
                                             <input 
                                                 required
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.campus}
                                                 placeholder="e.g. CIT Campus"
                                                 onChange={e => setFormData({ ...formData, campus: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Role / Job Title</label>
                                             <input 
                                                 required
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.role}
                                                 placeholder="e.g. Full Stack Dev"
                                                 onChange={e => setFormData({ ...formData, role: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Package (LPA)</label>
                                             <input 
                                                 required
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.package}
                                                 placeholder="e.g. 18 LPA"
                                                 onChange={e => setFormData({ ...formData, package: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Story / Testimonial</label>
                                             <textarea 
                                                 required
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all h-24"
                                                 value={formData.story}
                                                 onChange={e => setFormData({ ...formData, story: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Video URL (YouTube / External Link)</label>
                                             <input 
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.video_url}
                                                 placeholder="https://youtube.com/watch?v=..."
                                                 onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                             />
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Or Upload Video from Device</label>
                                             {isEditing ? (
                                                 <label className={`flex items-center justify-center gap-2 w-full px-6 py-4 border border-dashed rounded-2xl cursor-pointer transition-all ${videoUploading === editingId ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5'}`}>
                                                     {videoUploading === editingId ? (
                                                         <>
                                                             <Loader2 size={16} className="animate-spin text-primary" />
                                                             <span className="text-sm text-primary font-bold">Uploading...</span>
                                                         </>
                                                     ) : (
                                                         <>
                                                             <Upload size={16} className="text-white/40" />
                                                             <span className="text-sm text-white/40">{formData.video_url && !formData.video_url.startsWith('http') ? 'Change video file' : 'Choose video file (MP4, WEBM, MOV)'}</span>
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
                                                             // refresh formData video_url after upload
                                                             const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                                             const res = await axios.get('/api/admin/success-stories', { headers: { Authorization: `Bearer ${userInfo?.token}` } });
                                                             const updated = res.data.find(s => s._id === editingId || s.id === editingId);
                                                             if (updated) setFormData(f => ({ ...f, video_url: updated.video_url || '' }));
                                                         }}
                                                     />
                                                 </label>
                                             ) : (
                                                 <p className="text-[9px] text-white/30 px-1 py-2">Save the story first, then upload a video file from the card or re-open edit.</p>
                                             )}
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Display Order</label>
                                             <input 
                                                 type="number"
                                                 className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                                 value={formData.order}
                                                 onChange={e => setFormData({ ...formData, order: e.target.value })}
                                             />
                                         </div>
                                     </>
                                 )}

                                 {activeTab !== 'directors' && activeTab !== 'success_stories' && (
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Order Index</label>
                                         <input 
                                             type="number"
                                             className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                             value={formData.order}
                                             onChange={e => setFormData({ ...formData, order: e.target.value })}
                                         />
                                     </div>
                                 )}

                                 <ModernButton type="submit" className="w-full !py-5 uppercase font-black tracking-widest">
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

            {/* Mission Section */}
            <CmsSectionCard 
                title="Mission Statement" 
                icon={Rocket}
                fields={[
                    { key: 'title', label: 'Heading', value: data.mission?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.mission?.description },
                    { key: 'icon', label: 'Lucide Icon Name', value: data.mission?.icon },
                    { key: 'color', label: 'Theme Color (Hex)', value: data.mission?.color },
                ]}
                onSave={(content) => onUpdate('mission', content)}
            />

            {/* Vision Section */}
            <CmsSectionCard 
                title="Vision Statement" 
                icon={Globe}
                fields={[
                    { key: 'title', label: 'Heading', value: data.vision?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.vision?.description },
                    { key: 'icon', label: 'Lucide Icon Name', value: data.vision?.icon },
                    { key: 'color', label: 'Theme Color (Hex)', value: data.vision?.color },
                ]}
                onSave={(content) => onUpdate('vision', content)}
            />

            {/* Values Section */}
            <CmsSectionCard 
                title="Core Values" 
                icon={Award}
                fields={[
                    { key: 'title', label: 'Heading', value: data.values?.title },
                    { key: 'description', label: 'Description', type: 'textarea', value: data.values?.description },
                    { key: 'icon', label: 'Lucide Icon Name', value: data.values?.icon },
                    { key: 'color', label: 'Theme Color (Hex)', value: data.values?.color },
                ]}
                onSave={(content) => onUpdate('values', content)}
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
    
    useEffect(() => {
        const initial = {};
        fields.forEach(f => initial[f.key] = f.value || '');
        setValues(initial);
    }, [fields]);

    return (
        <GlassCard className="h-fit">
            <div className="flex items-center space-x-3 mb-8 border-b border-white/5 pb-4">
                <div className="p-2 bg-primary/20 text-primary rounded-xl">
                    <Icon size={20} />
                </div>
                <h3 className="font-bold text-white uppercase tracking-widest text-sm">{title}</h3>
            </div>

            <div className="space-y-6">
                {fields.map(field => (
                    <div key={field.key} className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-primary outline-none h-24 transition-all"
                                value={values[field.key] || ''}
                                onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                            />
                        ) : (
                            <input
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-primary outline-none transition-all"
                                value={values[field.key] || ''}
                                onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => onSave(values)}
                className="w-full mt-8 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
            >
                Save {title.split(' ')[0]} Section
            </button>
        </GlassCard>
    );
};

export default SiteContentManager;
