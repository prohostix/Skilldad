import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Building2, MapPin, Globe, Phone, Mail } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const SkillDadUniversities = () => {
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
        description: ''
    });

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
            if (editingUniversity) {
                await axios.put(`/api/admin/skilldad-universities/${editingUniversity._id}`, formData, getAuthConfig());
                showToast('University updated successfully!', 'success');
            } else {
                await axios.post('/api/admin/skilldad-universities', formData, getAuthConfig());
                showToast('University added successfully!', 'success');
            }

            setShowModal(false);
            setEditingUniversity(null);
            setFormData({
                name: '',
                location: '',
                website: '',
                phone: '',
                email: '',
                description: ''
            });
            fetchUniversities();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving university', 'error');
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
            description: university.description || ''
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
            description: ''
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
                        <GlassCard key={university._id} className="!p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(university)}
                                        className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(university._id)}
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
