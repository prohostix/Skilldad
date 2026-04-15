import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, 
    School, 
    BookOpen, 
    Plus, 
    Edit2, 
    Trash2, 
    ChevronRight, 
    Save, 
    X,
    ExternalLink,
    DollarSign,
    Clock,
    FileText,
    Calendar
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { toast } from 'react-hot-toast';

const StudyAbroadManagement = () => {
    const [activeTab, setActiveTab] = useState('countries');
    const [loading, setLoading] = useState(false);
    
    // Data State
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [courses, setCourses] = useState([]);
    
    // Selection State
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    
    // Form State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            fetchUniversities(selectedCountry.id);
        } else {
            setUniversities([]);
            setSelectedUniversity(null);
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedUniversity) {
            fetchCourses(selectedUniversity.id);
        } else {
            setCourses([]);
        }
    }, [selectedUniversity]);

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/study-abroad/countries');
            setCountries(data);
        } catch (error) {
            toast.error('Failed to fetch countries');
        } finally {
            setLoading(false);
        }
    };

    const fetchUniversities = async (countryId) => {
        try {
            const { data } = await axios.get(`/api/admin/study-abroad/countries/${countryId}/universities`);
            setUniversities(data);
        } catch (error) {
            toast.error('Failed to fetch universities');
        }
    };

    const fetchCourses = async (universityId) => {
        try {
            const { data } = await axios.get(`/api/admin/study-abroad/universities/${universityId}/courses`);
            setCourses(data);
        } catch (error) {
            toast.error('Failed to fetch courses');
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        const endpoint = `/api/admin/study-abroad/${activeTab}`;
        const method = editingItem ? 'put' : 'post';
        const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

        try {
            await axios[method](url, formData);
            toast.success(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'added'} successfully`);
            setShowModal(false);
            setEditingItem(null);
            
            // Refresh data
            if (activeTab === 'countries') fetchCountries();
            else if (activeTab === 'universities') fetchUniversities(selectedCountry.id);
            else if (activeTab === 'courses') fetchCourses(selectedUniversity.id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
        
        try {
            await axios.delete(`/api/admin/study-abroad/${type}/${id}`);
            toast.success(`${type.slice(0, -1)} deleted successfully`);
            
            if (type === 'countries') fetchCountries();
            else if (type === 'universities') fetchUniversities(selectedCountry.id);
            else if (type === 'courses') fetchCourses(selectedUniversity.id);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        if (activeTab === 'countries') {
            setFormData({ name: '', image_url: '', description: '', is_active: true });
        } else if (activeTab === 'universities') {
            if (!selectedCountry) return toast.error('Please select a country first');
            setFormData({ country_id: selectedCountry.id, name: '', logo_url: '', website_url: '', description: '', location: '' });
        } else if (activeTab === 'courses') {
            if (!selectedUniversity) return toast.error('Please select a university first');
            setFormData({ university_id: selectedUniversity.id, name: '', level: 'UG', duration: '', fees: '', requirements: '', description: '', intakes: '' });
        }
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DashboardHeading 
                    title="Study Abroad Management" 
                    subtitle="Manage global educational opportunities" 
                />
                <ModernButton onClick={openAddModal}>
                    <Plus size={20} className="mr-2" /> Add {activeTab.slice(0, -1)}
                </ModernButton>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                {[
                    { id: 'countries', label: 'Countries', icon: Globe },
                    { id: 'universities', label: 'Universities', icon: School },
                    { id: 'courses', label: 'Courses', icon: BookOpen }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Selection Panels */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard title="Selection" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 block">1. Select Country</label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {countries.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCountry(c)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                selectedCountry?.id === c.id 
                                                ? 'bg-primary/20 border-primary text-white' 
                                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="font-medium truncate">{c.name}</span>
                                            <ChevronRight size={16} className={selectedCountry?.id === c.id ? 'opacity-100' : 'opacity-20'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedCountry && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 block">2. Select University</label>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {universities.length === 0 ? (
                                                <p className="text-white/20 text-xs italic p-4 text-center border border-dashed border-white/10 rounded-xl">No universities added yet</p>
                                            ) : (
                                                universities.map(u => (
                                                    <button
                                                        key={u.id}
                                                        onClick={() => setSelectedUniversity(u)}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                            selectedUniversity?.id === u.id 
                                                            ? 'bg-blue-500/20 border-blue-500 text-white' 
                                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <span className="font-medium truncate">{u.name}</span>
                                                        <ChevronRight size={16} className={selectedUniversity?.id === u.id ? 'opacity-100' : 'opacity-20'} />
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </GlassCard>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <GlassCard>
                        {activeTab === 'countries' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Globe className="text-primary" /> Countries ({countries.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {countries.map(c => (
                                        <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl group relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg text-white">{c.name}</h4>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(c)} className="p-2 bg-white/5 hover:bg-primary/20 rounded-lg transition-colors"><Edit2 size={14}/></button>
                                                    <button onClick={() => handleDelete(c.id, 'countries')} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/40 line-clamp-2">{c.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'universities' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <School className="text-blue-500" /> Universities in {selectedCountry?.name || '...'}
                                </h3>
                                {!selectedCountry ? (
                                    <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <Globe size={48} className="mx-auto mb-4 text-white/10" />
                                        <p className="text-white/30">Please select a country from the left panel</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {universities.map(u => (
                                            <div key={u.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/20">
                                                        {u.logo_url ? <img src={u.logo_url} alt="" className="w-full h-full object-cover"/> : <School size={24} className="text-white/20"/>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{u.name}</h4>
                                                        <p className="text-xs text-white/40">{u.location || 'Location not specified'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(u)} className="p-2.5 bg-white/5 hover:bg-primary/20 rounded-xl transition-all border border-white/10"><Edit2 size={16}/></button>
                                                    <button onClick={() => handleDelete(u.id, 'universities')} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all border border-white/10"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BookOpen className="text-emerald-500" /> Courses at {selectedUniversity?.name || '...'}
                                </h3>
                                {!selectedUniversity ? (
                                    <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <School size={48} className="mx-auto mb-4 text-white/10" />
                                        <p className="text-white/30">Please select a university from the left panel</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {courses.map(c => (
                                            <div key={c.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">{c.level}</span>
                                                            <h4 className="font-bold text-white text-lg">{c.name}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                                            <span className="flex items-center gap-1"><Clock size={12}/> {c.duration}</span>
                                                            <span className="flex items-center gap-1"><DollarSign size={12}/> {c.fees}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openEditModal(c)} className="p-2 bg-white/5 hover:bg-primary/20 rounded-lg transition-colors"><Edit2 size={14}/></button>
                                                        <button onClick={() => handleDelete(c.id, 'courses')} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="text-left text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                        <p className="text-white/30 font-bold uppercase tracking-wider mb-2">Requirements</p>
                                                        <p className="text-white/60 line-clamp-3">{c.requirements || 'None specified'}</p>
                                                    </div>
                                                    <div className="text-left text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                        <p className="text-white/30 font-bold uppercase tracking-wider mb-2">Intakes</p>
                                                        <p className="text-white/60">{c.intakes || 'Not specified'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* CRUD Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0B0F1A] border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {editingItem ? <Edit2 className="text-primary"/> : <Plus className="text-primary"/>}
                                    {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X/></button>
                            </div>

                            <form onSubmit={handleAction} className="space-y-6">
                                {activeTab === 'countries' && (
                                    <div className="grid grid-cols-1 gap-6 text-left">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Country Name</label>
                                            <input 
                                                type="text" required value={formData.name || ''} 
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Image URL</label>
                                            <input 
                                                type="text" value={formData.image_url || ''} 
                                                onChange={e => setFormData({...formData, image_url: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="https://example.com/country.jpg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Description</label>
                                            <textarea 
                                                rows="4" value={formData.description || ''} 
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'universities' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">University Name</label>
                                            <input 
                                                type="text" required value={formData.name || ''} 
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Logo URL</label>
                                            <input 
                                                type="text" value={formData.logo_url || ''} 
                                                onChange={e => setFormData({...formData, logo_url: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Website URL</label>
                                            <input 
                                                type="text" value={formData.website_url || ''} 
                                                onChange={e => setFormData({...formData, website_url: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">Location</label>
                                            <input 
                                                type="text" value={formData.location || ''} 
                                                onChange={e => setFormData({...formData, location: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                                placeholder="e.g. Toronto, Ontario"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">About</label>
                                            <textarea 
                                                rows="3" value={formData.description || ''} 
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'courses' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">Course Name</label>
                                            <input 
                                                type="text" required value={formData.name || ''} 
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Level</label>
                                            <select 
                                                value={formData.level || 'UG'} 
                                                onChange={e => setFormData({...formData, level: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            >
                                                <option value="UG" className="bg-[#0B0F1A]">Undergraduate</option>
                                                <option value="PG" className="bg-[#0B0F1A]">Postgraduate</option>
                                                <option value="PhD" className="bg-[#0B0F1A]">PhD / Research</option>
                                                <option value="Diploma" className="bg-[#0B0F1A]">Diploma</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Duration</label>
                                            <input 
                                                type="text" value={formData.duration || ''} 
                                                onChange={e => setFormData({...formData, duration: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                                placeholder="e.g. 4 Years"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Fees</label>
                                            <input 
                                                type="text" value={formData.fees || ''} 
                                                onChange={e => setFormData({...formData, fees: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                                placeholder="e.g. $25,000 / Year"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Intakes</label>
                                            <input 
                                                type="text" value={formData.intakes || ''} 
                                                onChange={e => setFormData({...formData, intakes: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                                placeholder="e.g. Fall, Winter"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">Entry Requirements</label>
                                            <textarea 
                                                rows="3" value={formData.requirements || ''} 
                                                onChange={e => setFormData({...formData, requirements: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-white/60">Course Overview</label>
                                            <textarea 
                                                rows="3" value={formData.description || ''} 
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <ModernButton type="button" onClick={() => setShowModal(false)} className="flex-1 !bg-white/5 !border-white/10 whitespace-nowrap">
                                        Cancel
                                    </ModernButton>
                                    <ModernButton type="submit" className="flex-1">
                                        <Save size={18} className="mr-2"/> {editingItem ? 'Update' : 'Save'} {activeTab.slice(0, -1)}
                                    </ModernButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudyAbroadManagement;
