import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit3,
    Trash2,
    ExternalLink,
    BookOpen
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const CourseManager = () => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        instructorName: '',
        universityName: '',
        isPublished: false
    });
    const [universities, setUniversities] = useState([]);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchUniversities = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/universities', config);
            setUniversities(data);
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/courses/admin', config);
            setCourses(data);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchUniversities();
    }, []);

    const handleCreate = async () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            price: 0,
            instructor: '',
            instructorName: '',
            universityName: '',
            isPublished: true
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
            instructor: course.instructor?._id || course.instructor || '',
            instructorName: course.instructorName || '',
            universityName: course.universityName || '',
            isPublished: course.isPublished || false
        });
        setEditingCourse(course);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || !userInfo.token) {
                showToast('Please login first', 'error');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingCourse) {
                // Update existing course
                await axios.put(`/api/courses/${editingCourse._id}`, formData, config);
                showToast('Course updated successfully!', 'success');
            } else {
                // Create new course
                await axios.post('/api/courses', formData, config);
                showToast('Course created successfully!', 'success');
            }

            setShowCreateModal(false);
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
            showToast(error.response?.data?.message || error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`/api/courses/${id}`, config);
            showToast('Course deleted successfully', 'success');
            fetchCourses();
        } catch (error) {
            showToast('Error deleting course', 'error');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructorName || course.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.universityName || course.instructor?.profile?.universityName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="Course Library" />
                </div>
                <ModernButton onClick={handleCreate} className="!px-4 !py-2 text-sm">
                    <Plus size={16} className="mr-1.5" /> Create New Course
                </ModernButton>
            </div>

            <GlassCard className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Filter courses..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-white/40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white/70 font-inter">Displaying {filteredCourses.length} results</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-inter">
                        <thead className="bg-white/5 text-white/70 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Course Info</th>
                                <th className="px-6 py-4">Instructor</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredCourses.map((course) => (
                                <tr key={course._id} className="hover:bg-primary/[0.05] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{course.title}</p>
                                                <p className="text-xs text-white/50">ID: {course._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                                                <img src={`https://ui-avatars.com/api/?name=${course.instructorName || course.instructor?.name}`} alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm text-white/70 font-bold truncate">
                                                    {course.instructorName || course.instructor?.name || 'Unknown'}
                                                </span>
                                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) ? (
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1 truncate">
                                                        {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-medium text-white/30 italic mt-1">
                                                        No Institution Linked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                            {course.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-white">₹{course.price}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className={`text-sm font-medium font-inter italic ${course.isPublished ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="p-2 text-white/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                title="Edit Course"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="p-2 text-white/40 hover:text-rose-500 hover:bg-rose-50/10 rounded-lg transition-all"
                                                title="Delete Course"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Create/Edit Course Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                        // Only close if clicking directly on the backdrop
                        if (e.target === e.currentTarget) {
                            setShowCreateModal(false);
                        }
                    }}
                >
                    <GlassCard
                        className="w-full max-w-2xl relative z-[100000] my-8 bg-black/95 border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-white mb-6 font-inter">
                            {editingCourse ? 'Edit Course' : 'Create New Course'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                    placeholder="Enter course title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                    Description
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter resize-none"
                                    placeholder="Enter course description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="e.g., Programming"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const parsed = parseFloat(val);
                                            setFormData({ ...formData, price: isNaN(parsed) ? 0 : parsed });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                        Provider University
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter appearance-none"
                                        value={formData.instructor}
                                        onChange={(e) => {
                                            const univId = e.target.value;
                                            const univ = universities.find(u => u._id === univId);
                                            setFormData({
                                                ...formData,
                                                instructor: univId,
                                                universityName: univ ? univ.name : ''
                                            });
                                        }}
                                    >
                                        <option value="" className="bg-black text-white">Select University</option>
                                        {universities.map(u => (
                                            <option key={u._id} value={u._id} className="bg-black text-white">{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                        Instructor Name (Custom)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="Override instructor name"
                                        value={formData.instructorName}
                                        onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                        University Name (Custom)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="Override university name"
                                        value={formData.universityName}
                                        onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center space-x-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-all group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.isPublished ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-primary/50'}`}>
                                        {formData.isPublished && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none">Publish Course</p>
                                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-medium">Make this course visible in the library</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium font-inter"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-medium font-inter shadow-lg shadow-primary/30"
                                >
                                    {editingCourse ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default CourseManager;
