import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WBLManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('domestic');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category: 'domestic',
        title: '',
        university_name: '',
        location: '',
        duration: '',
        fees: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`/api/wbl/courses`);
            setCourses(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch courses');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setFormData(course);
            setEditingId(course.id);
        } else {
            setFormData({
                category: activeTab,
                title: '',
                university_name: '',
                location: '',
                duration: '',
                fees: '',
                description: '',
                is_active: true
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingId ? 'Updating...' : 'Adding...');
        try {
            if (editingId) {
                await axios.put(`/api/wbl/courses/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Course updated successfully', { id: toastId });
            } else {
                await axios.post(`/api/wbl/courses`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Course added successfully', { id: toastId });
            }
            fetchCourses();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed', { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/wbl/courses/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Course deleted successfully');
                fetchCourses();
            } catch (error) {
                toast.error('Failed to delete course');
            }
        }
    };

    const filteredCourses = courses.filter(c => c.category === activeTab);

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading WBL Management...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 font-space">WBL Management</h1>
                    <p className="text-gray-400">Manage Work-Based Learning courses for Domestic and Abroad</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium"
                >
                    <Plus size={18} />
                    Add New Course
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-800 pb-2">
                <button
                    onClick={() => setActiveTab('domestic')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'domestic' ? 'text-primary border-b-2 border-primary bg-gray-900' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Domestic
                </button>
                <button
                    onClick={() => setActiveTab('abroad')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'abroad' ? 'text-primary border-b-2 border-primary bg-gray-900' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Abroad
                </button>
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-gray-400 text-sm border-b border-gray-700">
                            <th className="p-4 font-medium">Title & University</th>
                            <th className="p-4 font-medium">Details</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No {activeTab} courses found.
                                </td>
                            </tr>
                        ) : (
                            filteredCourses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4">
                                        <p className="text-white font-medium">{course.title}</p>
                                        <p className="text-gray-400 text-sm">{course.university_name}</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        <p>Loc: {course.location || 'N/A'}</p>
                                        <p>Dur: {course.duration || 'N/A'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${course.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {course.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(course)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit WBL Course' : 'Add WBL Course'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                        required
                                    >
                                        <option value="domestic">Domestic</option>
                                        <option value="abroad">Abroad</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Course Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">University Name *</label>
                                    <input
                                        type="text"
                                        name="university_name"
                                        value={formData.university_name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Fees</label>
                                    <input
                                        type="text"
                                        name="fees"
                                        value={formData.fees}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                                    Active (Visible to users)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingId ? 'Update Course' : 'Add Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WBLManagement;
