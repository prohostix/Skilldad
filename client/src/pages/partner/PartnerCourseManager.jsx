import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    BookOpen,
    Eye,
    Layout,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ChevronRight,
    Play,
    Upload
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/media';

const PartnerCourseManager = () => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [brochureUploading, setBrochureUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        isPublished: false,
        brochure_url: '',
        university_tools: []
    });
    
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleBrochureFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('brochure', file);

        setBrochureUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const { data } = await axios.post('/api/courses/upload-brochure-file', formDataUpload, config);
            setFormData(prev => ({ ...prev, brochure_url: data.brochure_url }));
            showToast('Brochure uploaded from device successfully!', 'success');
        } catch (error) {
            console.error('Brochure upload error:', error);
            showToast(error.response?.data?.message || 'Failed to upload brochure file', 'error');
        } finally {
            setBrochureUploading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) return;
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/courses/admin', config);
            setCourses(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch courses', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreate = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            price: 0,
            isPublished: false,
            brochure_url: '',
            university_tools: []
        });
        setEditingCourse(null);
        setShowCreateModal(true);
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            price: course.price,
            isPublished: course.isPublished || false,
            brochure_url: course.brochure_url || '',
            university_tools: course.university_tools || []
        });
        setEditingCourse(course);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingCourse) {
                await axios.put(`/api/courses/${editingCourse._id}`, formData, config);
                showToast('Course updated successfully!', 'success');
            } else {
                await axios.post('/api/courses', formData, config);
                showToast('Course submitted for approval!', 'success');
            }

            setShowCreateModal(false);
            fetchCourses();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving course', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`/api/courses/${id}`, config);
            showToast('Course deleted', 'success');
            fetchCourses();
        } catch (error) {
            showToast('Error deleting course', 'error');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <DashboardHeading title="My Courses" />
                    <p className="text-gray-400 mt-2">Manage your institution's course offerings and curriculum.</p>
                </div>
                <ModernButton onClick={handleCreate} className="w-full md:w-auto h-12 flex items-center justify-center">
                    <Plus size={18} className="mr-2" /> Add New Course
                </ModernButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full py-20">
                        <GlassCard className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/20">
                            <BookOpen size={48} className="text-white/20 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
                            <p className="text-white/50 max-w-sm mb-6">Start by creating your first course. It will be sent to the admin for review before appearing on the platform.</p>
                            <ModernButton onClick={handleCreate} variant="secondary" className="border border-white/10">
                                Create Your First Course
                            </ModernButton>
                        </GlassCard>
                    </div>
                ) : filteredCourses.map((course) => (
                    <GlassCard key={course._id} className="group overflow-hidden flex flex-col border-white/10 hover:border-primary/30 transition-all duration-300">
                        <div className="relative h-32 bg-zinc-900 overflow-hidden">
                            {course.thumbnail ? (
                                <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                    <BookOpen size={40} className="text-primary/20" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                                    course.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    course.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}>
                                    {course.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-end items-start mb-2">
                                <span className="text-sm font-bold text-white">₹{course.price}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                            <p className="text-xs text-white/50 line-clamp-2 mb-3 flex-1">
                                {course.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => navigate(`/partner/courses/${course._id}`)}
                                        className="p-2 bg-white/5 hover:bg-primary/20 rounded-lg text-white/70 hover:text-primary transition-all"
                                        title="Manage Content"
                                    >
                                        <Layout size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(course)}
                                        className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-white/70 hover:text-emerald-400 transition-all"
                                        title="Edit Details"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(course._id)}
                                        className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-all"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate(`/partner/courses/${course._id}`)}
                                    className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors"
                                >
                                    Manage <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4" onClick={(e) => { 
                    if (e.target === e.currentTarget) setShowCreateModal(false);
                }}>
                    <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border-white/20 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{editingCourse ? 'Edit Course Details' : 'Create New Course'}</h2>
                                <p className="text-sm text-white/40 mt-1">Fill in the fields below to {editingCourse ? 'update' : 'submit'} your course.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Course Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 transition-all outline-none"
                                        placeholder="e.g. Advanced Graphic Design Mastery"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 transition-all outline-none"
                                        placeholder="499"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 transition-all outline-none resize-none"
                                        placeholder="Detailed course description, objectives, and what students will learn..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                 <div>
                                     <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Brochure (PDF / File)</label>
                                     <div className="flex gap-2">
                                         <input
                                             type="text"
                                             className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 transition-all outline-none font-mono text-sm"
                                             placeholder="https://example.com/syllabus.pdf or upload file"
                                             value={formData.brochure_url}
                                             onChange={(e) => setFormData({...formData, brochure_url: e.target.value})}
                                         />
                                         <input
                                             type="file"
                                             id="partner-brochure-file-input"
                                             className="hidden"
                                             accept=".pdf,.doc,.docx"
                                             onChange={handleBrochureFileUpload}
                                         />
                                         <button
                                             type="button"
                                             onClick={() => document.getElementById('partner-brochure-file-input')?.click()}
                                             disabled={brochureUploading}
                                             className="px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
                                         >
                                             <Upload size={14} className={brochureUploading ? "animate-spin" : ""} />
                                             {brochureUploading ? 'Uploading...' : 'Upload File'}
                                         </button>
                                     </div>
                                     <p className="text-[10px] text-white/40 mt-1.5 font-medium">Upload a brochure file from your device or paste a URL link above.</p>
                                 </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <ModernButton 
                                    type="button" 
                                    variant="secondary" 
                                    className="flex-1 border border-white/10" 
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </ModernButton>
                                <ModernButton type="submit" className="flex-1">
                                    {editingCourse ? 'Save Changes' : 'Submit for Approval'}
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PartnerCourseManager;
