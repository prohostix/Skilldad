
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, Building2, User as UserIcon,
    Image as ImageIcon, LayoutGrid, List, Heart, Upload, Loader2,
    Target, Rocket, Globe, Award, Activity
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const SiteContentManager = () => {
    const [activeTab, setActiveTab] = useState('corporate'); // 'corporate', 'university', 'directors', 'about_cms'
    const [logos, setLogos] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [cmsData, setCmsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', title: '', image: '', logo: '', location: '', 
        students: '', programs: '', order: 0, type: 'corporate', 
        category: 'DIRECTOR', bio: '', linkedin_url: '',
        display_target: 'ABOUT_DIRECTOR' 
    });
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
            const [logosRes, directorsRes, cmsRes] = await Promise.all([
                axios.get('/api/admin/partner-logos', config),
                axios.get('/api/admin/directors', config),
                axios.get('/api/public/cms/about_us')
            ]);
            setLogos(logosRes.data);
            setDirectors(directorsRes.data);
            setCmsData(cmsRes.data);
            setLoading(false);
        } catch (error) {
            showToast('Failed to fetch data', 'error');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors' ? '/api/admin/directors' : '/api/admin/partner-logos';
            const payload = activeTab === 'directors' ? formData : { ...formData, type: activeTab };
            await axios.post(url, payload, config);

            showToast(`${activeTab === 'directors' ? 'Team Member' : 'Asset'} added successfully`, 'success');
            setShowAddModal(false);
            resetForm();
            fetchAll();
        } catch (error) {
            showToast('Submission failed', 'error');
        }
    };

    const handleUpdate = async (id) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors'
                ? `/api/admin/directors/${id}`
                : `/api/admin/partner-logos/${id}`;

            await axios.put(url, editingItem, config);
            showToast('Updated successfully', 'success');
            setEditingItem(null);
            fetchAll();
        } catch (error) {
            showToast('Update failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors'
                ? `/api/admin/directors/${id}`
                : `/api/admin/partner-logos/${id}`;

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
            uploadFormData.append(activeTab === 'directors' ? 'image' : 'logo', file);

            const url = activeTab === 'directors' 
                ? `/api/admin/directors/${id}/upload` 
                : `/api/admin/partner-logos/${id}/upload`;

            await axios.post(url, uploadFormData, config);
            showToast('Image uploaded successfully', 'success');
            fetchAll();
        } catch (error) {
            showToast('Upload failed', 'error');
        } finally {
            setUploading(null);
        }
    };

    const resetForm = () => {
        setFormData({ 
            name: '', title: '', image: '', logo: '', location: '', 
            students: '', programs: '', order: 0, type: activeTab, 
            category: 'DIRECTOR', bio: '', linkedin_url: '',
            display_target: activeTab === 'directors' ? 'ABOUT_DIRECTOR' : 'LANDING'
        });
    };

    const tabs = [
        { id: 'corporate', label: 'Corporate Partners', icon: Building2 },
        { id: 'university', label: 'University Partners', icon: GraduationCap },
        { id: 'directors', label: 'Team & Advisory', icon: UserIcon },
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
                                <Plus size={18} className="mr-2" />
                                Add {activeTab === 'directors' ? 'Member' : 'Logo'}
                            </ModernButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(activeTab === 'directors' ? directors : logos.filter(l => l.type === activeTab)).map(item => (
                                <GlassCard key={item._id} className="relative group overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500">
                                    <div className="flex flex-col items-center text-center p-6">
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all bg-black/40">
                                                <img 
                                                    src={item.imageUrl || item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'N/A')}&background=5B5CFF&color=fff&bold=true`} 
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl cursor-pointer hover:scale-110 transition-all shadow-lg">
                                                <Upload size={14} className="text-white" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={(e) => handleFileUpload(item._id, e.target.files[0])}
                                                    disabled={uploading === item._id}
                                                />
                                            </label>
                                            {uploading === item._id && (
                                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {editingItem?._id === item._id ? (
                                            <div className="w-full space-y-3 mt-4">
                                                <input 
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                                                    value={editingItem.name}
                                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                                />
                                                {activeTab === 'directors' && (
                                                    <>
                                                        <input 
                                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                                                            value={editingItem.title || ''}
                                                            placeholder="Role/Title"
                                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                                        />
                                                        <select
                                                            className="w-full px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white text-sm"
                                                            value={editingItem.display_target}
                                                            onChange={e => setEditingItem({ ...editingItem, display_target: e.target.value })}
                                                        >
                                                            <option value="LANDING">Landing Page</option>
                                                            <option value="ABOUT_DIRECTOR">About Us (Director)</option>
                                                            <option value="ABOUT_ADVISORY">About Us (Advisory)</option>
                                                        </select>
                                                    </>
                                                )}
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleUpdate(item._id)} className="flex-1 py-2 bg-primary rounded-xl text-xs font-bold">Save</button>
                                                    <button onClick={() => setEditingItem(null)} className="flex-1 py-2 bg-white/5 rounded-xl text-xs font-bold">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full">
                                                <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                                                <p className="text-[10px] text-white/50 uppercase tracking-widest">{item.title || item.role || item.type}</p>
                                                
                                                {activeTab === 'directors' && (
                                                    <div className="mt-2 text-[8px] font-black px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full inline-block">
                                                        {item.display_target || 'ABOUT_DIRECTOR'}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-center space-x-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingItem(item)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-white/50 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
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
                                <h3 className="text-xl font-black text-white">Add New {activeTab === 'directors' ? 'Team Member' : 'Partner'}</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/50"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Name / Company</label>
                                    <input 
                                        required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'directors' ? (
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
                                                <option value="LANDING">Landing Page</option>
                                                <option value="ABOUT_DIRECTOR">About Us (Director/CEO)</option>
                                                <option value="ABOUT_ADVISORY">About Us (Advisory Board)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Bio (Optional)</label>
                                            <textarea 
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary outline-none transition-all h-24"
                                                value={formData.bio}
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
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
                                    Confirm Addition
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
