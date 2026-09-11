import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Edit2, Building2, MapPin, Globe, Phone, Mail } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/media';

const DEFAULT_ACHIEVEMENTS = [
    { title: "Academic Excellence 2024", desc: "Ranked #1 for regional innovation and research quality.", image: "" },
    { title: "Industry Integration Leader", desc: "Strategic partnerships with 100+ Fortune 500 companies.", image: "" }
];

const SkillDadUniversities = () => {
    const navigate = useNavigate();
    const [universities, setUniversities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState(null);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        website: '',
        phone: '',
        email: '',
        description: '',
        achievements: [],
        videos: []
    });
    const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchUniversities = async () => {
        try {
            const { data } = await axios.get('/api/admin/skilldad-universities', getAuthConfig());
            setUniversities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching SkillDad universities:', error);
            showToast('Error fetching universities', 'error');
            setUniversities([]);
        }
    };

    useEffect(() => {
        fetchUniversities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let universityId;
            if (editingUniversity) {
                const res = await axios.put(`/api/admin/skilldad-universities/${editingUniversity._id}`, formData, getAuthConfig());
                universityId = res.data._id || editingUniversity._id;
                showToast('University updated successfully!', 'success');
            } else {
                const res = await axios.post('/api/admin/skilldad-universities', formData, getAuthConfig());
                universityId = res.data._id;
                showToast('University added successfully!', 'success');
            }

            // Upload gallery images if selected
            if (selectedGalleryImages.length > 0 && universityId) {
                const galleryData = new FormData();
                selectedGalleryImages.forEach(file => {
                    galleryData.append('galleryImages', file);
                });
                await axios.post(`/api/admin/skilldad-universities/${universityId}/upload-gallery`, galleryData, {
                    headers: {
                        ...getAuthConfig().headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showToast('Gallery images uploaded successfully!', 'success');
            }

            setShowModal(false);
            setEditingUniversity(null);
            setSelectedGalleryImages([]);
            setFormData({
                name: '',
                location: '',
                website: '',
                phone: '',
                email: '',
                description: '',
                achievements: [],
                videos: []
            });
            fetchUniversities();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving university', 'error');
        }
    };

    const handleMediaUpload = async (file) => {
        if (!file) return null;
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const { data } = await axios.post('/api/upload/media', uploadData, config);
            return data.url;
        } catch (error) {
            console.error('Media upload error:', error);
            showToast('Failed to upload file', 'error');
            return null;
        }
    };

    const handleEdit = (university) => {
        setEditingUniversity(university);
        setFormData({
            name: university.name || '',
            location: university.location || '',
            website: university.website || '',
            phone: university.phone || '',
            email: university.email || '',
            description: university.description || '',
            achievements: (university.achievements && university.achievements.length > 0) ? university.achievements : [...DEFAULT_ACHIEVEMENTS],
            videos: university.videos || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this university?')) {
            try {
                await axios.delete(`/api/admin/skilldad-universities/${id}`, getAuthConfig());
                fetchUniversities();
                showToast('University deleted successfully', 'success');
            } catch (error) {
                showToast(error.response?.data?.message || 'Error deleting university', 'error');
            }
        }
    };

    const handleAddNew = () => {
        setEditingUniversity(null);
        setFormData({
            name: '',
            location: '',
            website: '',
            phone: '',
            email: '',
            description: '',
            achievements: [...DEFAULT_ACHIEVEMENTS],
            videos: []
        });
        setShowModal(true);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <DashboardHeading title="SkillDad Universities" />
                        <p className="text-white/50 text-sm mt-2">Manage SkillDad-owned university partners</p>
                    </div>
                    <ModernButton onClick={handleAddNew} className="!px-4 !py-2 text-sm">
                        <Plus size={16} className="mr-1.5" /> Add University
                    </ModernButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {universities.map((university) => (
                        <GlassCard
                            key={university._id}
                            className="!p-6 cursor-pointer hover:border-primary/40 transition-all"
                            onClick={() => navigate(`/admin/skilldad-universities/${university._id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                                    {university.profile_image ? (
                                        <img src={getMediaUrl(university.profile_image)} alt={university.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(university); }}
                                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(university._id); }}
                                        className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-white font-semibold text-lg mb-3">{university.name}</h3>

                            <div className="space-y-2 text-sm">
                                {university.location && (
                                    <div className="flex items-center text-white/60">
                                        <MapPin size={14} className="mr-2 flex-shrink-0" />
                                        <span>{university.location}</span>
                                    </div>
                                )}
                                {university.email && (
                                    <div className="flex items-center text-white/60">
                                        <Mail size={14} className="mr-2 flex-shrink-0" />
                                        <span className="truncate">{university.email}</span>
                                    </div>
                                )}
                                {university.phone && (
                                    <div className="flex items-center text-white/60">
                                        <Phone size={14} className="mr-2 flex-shrink-0" />
                                        <span>{university.phone}</span>
                                    </div>
                                )}
                                {university.website && (
                                    <div className="flex items-center text-white/60">
                                        <Globe size={14} className="mr-2 flex-shrink-0" />
                                        <a 
                                            href={university.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="truncate hover:text-primary transition-colors"
                                        >
                                            {university.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {university.description && (
                                <p className="text-white/50 text-xs mt-4 line-clamp-3">{university.description}</p>
                            )}
                        </GlassCard>
                    ))}

                    {universities.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Building2 size={48} className="mx-auto text-white/20 mb-4" />
                            <p className="text-white/30 text-sm">No SkillDad universities added yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <GlassCard className="w-full max-w-2xl relative z-[100000] my-8 bg-black/95 border-white/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-white mb-4 font-inter">
                            {editingUniversity ? 'Edit University' : 'Add New University'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">University Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., SkillDad University of Technology"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., New York, USA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="e.g., +1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="e.g., contact@university.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Website</label>
                                    <input
                                        type="url"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="e.g., https://university.edu"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description about the university"
                                />
                            </div>

                            {/* Milestones Editor */}
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center">
                                    <label className="block text-white/90 text-sm font-semibold">National & Global Milestones</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ 
                                            ...formData, 
                                            achievements: [...(formData.achievements || []), { title: '', desc: '' }] 
                                        })}
                                        className="text-primary text-xs hover:text-white transition-colors flex items-center"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Milestone
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.achievements?.map((ach, index) => (
                                        <div key={index} className="flex gap-2 items-start relative">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={ach.title}
                                                    onChange={(e) => {
                                                        const newAch = [...formData.achievements];
                                                        newAch[index].title = e.target.value;
                                                        setFormData({ ...formData, achievements: newAch });
                                                    }}
                                                    placeholder="Milestone Title (e.g. Academic Excellence 2024)"
                                                    className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                                />
                                                <textarea
                                                    rows="2"
                                                    value={ach.desc}
                                                    onChange={(e) => {
                                                        const newAch = [...formData.achievements];
                                                        newAch[index].desc = e.target.value;
                                                        setFormData({ ...formData, achievements: newAch });
                                                    }}
                                                    placeholder="Milestone Description"
                                                    className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white resize-none"
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={ach.image || ''}
                                                        onChange={(e) => {
                                                            const newAch = [...formData.achievements];
                                                            newAch[index].image = e.target.value;
                                                            setFormData({ ...formData, achievements: newAch });
                                                        }}
                                                        placeholder="Image URL (optional)"
                                                        className="flex-1 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                                    />
                                                    <label className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors">
                                                        Upload
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                if(e.target.files && e.target.files[0]) {
                                                                    const url = await handleMediaUpload(e.target.files[0]);
                                                                    if(url) {
                                                                        const newAch = [...formData.achievements];
                                                                        newAch[index].image = url;
                                                                        setFormData({ ...formData, achievements: newAch });
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newAch = formData.achievements.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, achievements: newAch });
                                                }}
                                                className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors mt-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.achievements || formData.achievements.length === 0) && (
                                        <p className="text-white/40 text-xs italic">No custom milestones added. Default milestones will be displayed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Success Stories Editor */}
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center">
                                    <label className="block text-white/90 text-sm font-semibold">Success Stories (YouTube URLs)</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ 
                                            ...formData, 
                                            videos: [...(formData.videos || []), ''] 
                                        })}
                                        className="text-primary text-xs hover:text-white transition-colors flex items-center"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Video
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.videos?.map((vid, index) => (
                                        <div key={index} className="flex gap-2 items-center relative">
                                            <input
                                                type="text"
                                                value={vid}
                                                onChange={(e) => {
                                                    const newVids = [...formData.videos];
                                                    newVids[index] = e.target.value;
                                                    setFormData({ ...formData, videos: newVids });
                                                }}
                                                placeholder="YouTube URL or Local Upload"
                                                className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                            />
                                            <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center" title="Upload from Device">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                <input 
                                                    type="file" 
                                                    accept="video/*,image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        if(e.target.files && e.target.files[0]) {
                                                            const url = await handleMediaUpload(e.target.files[0]);
                                                            if(url) {
                                                                const newVids = [...formData.videos];
                                                                newVids[index] = url;
                                                                setFormData({ ...formData, videos: newVids });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newVids = formData.videos.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, videos: newVids });
                                                }}
                                                className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.videos || formData.videos.length === 0) && (
                                        <p className="text-white/40 text-xs italic">No success stories added.</p>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Image Upload */}
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="block text-white/90 text-sm font-semibold">Gallery Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setSelectedGalleryImages(Array.from(e.target.files))}
                                    className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                {selectedGalleryImages.length > 0 && (
                                    <p className="text-xs text-white/50 mt-2">{selectedGalleryImages.length} file(s) selected for upload</p>
                                )}
                                {editingUniversity?.gallery?.length > 0 && (
                                    <p className="text-xs text-white/50 mt-1">{editingUniversity.gallery.length} existing image(s) in gallery</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1 !py-2 text-sm">
                                    {editingUniversity ? 'Update University' : 'Add University'}
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </>
    );
};

export default SkillDadUniversities;
