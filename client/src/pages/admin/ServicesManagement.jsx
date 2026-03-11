import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X, 
    Search, 
    Layout, 
    ToggleLeft, 
    ToggleRight,
    ChevronDown,
    ChevronUp,
    Briefcase,
    BookOpen,
    Video,
    Users,
    Brain,
    ClipboardCheck,
    Smartphone,
    Cloud,
    Shield,
    Code,
    Database,
    Headphones,
    Target
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { useToast } from '../../context/ToastContext';

const iconMap = {
    BookOpen, Users, Video, Brain, Briefcase, ClipboardCheck, 
    Smartphone, Cloud, Shield, Code, Database, Headphones, Target
};

const ServicesManagement = () => {
    const { showToast } = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon_name: 'BookOpen',
        features: [],
        color_class: 'text-purple-500',
        bg_class: 'bg-purple-500/10',
        details: '',
        sub_services: [],
        category: 'main',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/services/admin', config);
            setServices(data);
            setLoading(false);
        } catch (error) {
            showToast('Failed to fetch services', 'error');
            setLoading(false);
        }
    };

    const handleOpenModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                ...service,
                features: Array.isArray(service.features) ? service.features : [],
                sub_services: Array.isArray(service.sub_services) ? service.sub_services : []
            });
        } else {
            setEditingService(null);
            setFormData({
                title: '',
                description: '',
                icon_name: 'BookOpen',
                features: [],
                color_class: 'text-purple-500',
                bg_class: 'bg-purple-500/10',
                details: '',
                sub_services: [],
                category: 'main',
                display_order: services.length + 1,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            if (editingService) {
                await axios.put(`/api/services/${editingService.id}`, formData, config);
                showToast('Service updated successfully', 'success');
            } else {
                await axios.post('/api/services', formData, config);
                showToast('Service created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchServices();
        } catch (error) {
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/services/${id}`, config);
            showToast('Service deleted', 'success');
            fetchServices();
        } catch (error) {
            showToast('Failed to delete service', 'error');
        }
    };

    const toggleStatus = async (service) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/services/${service.id}`, { ...service, is_active: !service.is_active }, config);
            fetchServices();
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const filteredServices = services.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleFeatureChange = (index, val) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = val;
        setFormData({ ...formData, features: newFeatures });
    };

    const addSubService = () => {
        setFormData({ ...formData, sub_services: [...formData.sub_services, { title: '', desc: '' }] });
    };

    const removeSubService = (index) => {
        const newSubs = formData.sub_services.filter((_, i) => i !== index);
        setFormData({ ...formData, sub_services: newSubs });
    };

    const handleSubChange = (index, field, val) => {
        const newSubs = [...formData.sub_services];
        newSubs[index][field] = val;
        setFormData({ ...formData, sub_services: newSubs });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white font-space tracking-tight">Services Management</h1>
                    <p className="text-white/50 text-sm">Configure and manage dynamic platform services</p>
                </div>
                <ModernButton onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" /> Add Service
                </ModernButton>
            </div>

            <GlassCard className="!p-0">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search services..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white/60">
                            {filteredServices.length} Total
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">Order</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-white/30 italic">Loading services...</td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-white/30 italic">No services found matching your search.</td>
                                </tr>
                            ) : filteredServices.map((service) => (
                                <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${service.color_class}`}>
                                                {iconMap[service.icon_name] ? React.createElement(iconMap[service.icon_name], { size: 18 }) : <Layout size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{service.title}</p>
                                                <p className="text-xs text-white/40 truncate max-w-[200px]">{service.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${service.category === 'main' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/60 border-white/10'}`}>
                                            {service.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-mono text-white/60">{service.display_order}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => toggleStatus(service)}
                                            className="transition-colors"
                                        >
                                            {service.is_active ? 
                                                <ToggleRight className="text-primary" size={24} /> : 
                                                <ToggleLeft className="text-white/20" size={24} />
                                            }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenModal(service)}
                                                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-primary hover:border-primary/50 transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-rose-500 hover:border-rose-500/50 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0A0714] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-white font-space uppercase tracking-wider">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="text-white/40" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Title</label>
                                        <input 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Icon Name (Lucide)</label>
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={formData.icon_name}
                                            onChange={(e) => setFormData({...formData, icon_name: e.target.value})}
                                        >
                                            {Object.keys(iconMap).map(icon => (
                                                <option key={icon} value={icon} className="bg-[#0A0714]">{icon}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Short Description</label>
                                    <textarea 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Category</label>
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="main" className="bg-[#0A0714]">Main Service</option>
                                            <option value="additional" className="bg-[#0A0714]">Additional Feature</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Display Order</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                {formData.category === 'main' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Detailed Explanation</label>
                                            <textarea 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px]"
                                                value={formData.details}
                                                onChange={(e) => setFormData({...formData, details: e.target.value})}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Features</label>
                                                <button type="button" onClick={addFeature} className="text-[10px] text-primary hover:underline uppercase font-black">Add Feature</button>
                                            </div>
                                            <div className="space-y-3">
                                                {formData.features.map((feature, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input 
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                                            value={feature}
                                                            onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                                            placeholder="Interactive Courses..."
                                                        />
                                                        <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-white/30 hover:text-rose-500"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Sub-Services</label>
                                                <button type="button" onClick={addSubService} className="text-[10px] text-primary hover:underline uppercase font-black">Add Sub-Service</button>
                                            </div>
                                            <div className="space-y-4">
                                                {formData.sub_services.map((sub, idx) => (
                                                    <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                                                        <div className="flex justify-between">
                                                            <input 
                                                                className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-white placeholder:text-white/20 outline-none"
                                                                value={sub.title}
                                                                onChange={(e) => handleSubChange(idx, 'title', e.target.value)}
                                                                placeholder="Sub-service Title"
                                                            />
                                                            <button type="button" onClick={() => removeSubService(idx)} className="text-white/30 hover:text-rose-500"><Trash2 size={16} /></button>
                                                        </div>
                                                        <input 
                                                            className="w-full bg-transparent border-none p-0 text-xs text-white/50 placeholder:text-white/10 outline-none"
                                                            value={sub.desc}
                                                            onChange={(e) => handleSubChange(idx, 'desc', e.target.value)}
                                                            placeholder="Sub-service description..."
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-8 flex gap-4">
                                    <ModernButton variant="secondary" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</ModernButton>
                                    <ModernButton className="flex-1" type="submit">{editingService ? 'Save Changes' : 'Create Service'}</ModernButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServicesManagement;
