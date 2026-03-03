import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, Video, FileText, ArrowLeft, Save, X, ClipboardList, Settings } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const CourseContentManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingModule, setEditingModule] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showAddModule, setShowAddModule] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(null);
    const [showEditCourse, setShowEditCourse] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get(`/api/courses/${courseId}`, config);
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async (moduleData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post(`/api/courses/${courseId}/modules`, moduleData, config);
            fetchCourse();
            setShowAddModule(false);
        } catch (error) {
            console.error('Error adding module:', error);
        }
    };

    const handleAddVideo = async (moduleId, videoData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post(`/api/courses/${courseId}/modules/${moduleId}/videos`, videoData, config);
            fetchCourse();
            setShowAddVideo(null);
        } catch (error) {
            console.error('Error adding video:', error);
        }
    };

    const handleUpdateCourse = async (courseData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`/api/courses/${courseId}`, courseData, config);
            fetchCourse();
            setShowEditCourse(false);
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    const handleUpdateModule = async (moduleId, moduleData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`/api/courses/${courseId}/modules/${moduleId}`, moduleData, config);
            fetchCourse();
            setEditingModule(null);
        } catch (error) {
            console.error('Error updating module:', error);
        }
    };

    const handleUpdateVideo = async (moduleId, videoId, videoData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`/api/courses/${courseId}/modules/${moduleId}/videos/${videoId}`, videoData, config);
            fetchCourse();
            setEditingVideo(null);
        } catch (error) {
            console.error('Error updating video:', error);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return;
        }
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}`, config);
            fetchCourse();
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    };

    const handleDeleteVideo = async (moduleId, videoId) => {
        if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            return;
        }
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/videos/${videoId}`, config);
            fetchCourse();
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Course not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                            <p className="text-white/60">{course.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-primary font-bold">₹{course.price}</span>
                                <span className="text-white/40">•</span>
                                <span className="text-white/60">{course.category || 'Uncategorized'}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <ModernButton
                                onClick={() => setShowEditCourse(true)}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <Edit2 size={18} />
                                Edit Course
                            </ModernButton>
                            <ModernButton
                                onClick={() => setShowAddModule(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Module
                            </ModernButton>
                        </div>
                    </div>
                </div>

                {/* Modules List */}
                <div className="space-y-6">
                    {course.modules && course.modules.length > 0 ? (
                        course.modules.map((module, moduleIndex) => (
                            <GlassCard key={module._id || moduleIndex} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Module {moduleIndex + 1}: {module.title}
                                        </h3>
                                        {module.description && (
                                            <p className="text-white/60 text-sm">{module.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/university/courses/${courseId}/modules/${module._id}/content/manage`)}
                                            className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
                                            title="Manage Interactive Content"
                                        >
                                            <ClipboardList size={18} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/university/courses/${courseId}/modules/${module._id}/content/create`)}
                                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                                            title="Add Interactive Content"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            onClick={() => setShowAddVideo(module._id)}
                                            className="p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors"
                                            title="Add Video"
                                        >
                                            <Video size={18} />
                                        </button>
                                        <button
                                            onClick={() => setEditingModule(module)}
                                            className="p-2 bg-white/5 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Edit Module"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModule(module._id)}
                                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                            title="Delete Module"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Videos List */}
                                <div className="space-y-3 mt-4">
                                    {module.videos && module.videos.length > 0 ? (
                                        module.videos.map((video, videoIndex) => (
                                            <div
                                                key={video._id || videoIndex}
                                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                                        <Video size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">{video.title}</h4>
                                                        {video.duration && (
                                                            <p className="text-white/40 text-sm">{video.duration}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingVideo({ ...video, moduleId: module._id })}
                                                        className="p-2 bg-white/5 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVideo(module._id, video._id)}
                                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-white/40">
                                            No videos added yet. Click the + button to add videos.
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <GlassCard className="p-12 text-center">
                            <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                            <h3 className="text-lg font-bold text-white/70 mb-2">No Modules Yet</h3>
                            <p className="text-white/40 text-sm mb-6">
                                Start building your course by adding modules and content.
                            </p>
                            <ModernButton onClick={() => setShowAddModule(true)}>
                                Add First Module
                            </ModernButton>
                        </GlassCard>
                    )}
                </div>
            </div>

            {/* Add Module Modal */}
            {showAddModule && (
                <AddModuleModal
                    onClose={() => setShowAddModule(false)}
                    onSave={handleAddModule}
                />
            )}

            {/* Add Video Modal */}
            {showAddVideo && (
                <AddVideoModal
                    moduleId={showAddVideo}
                    onClose={() => setShowAddVideo(null)}
                    onSave={(videoData) => handleAddVideo(showAddVideo, videoData)}
                />
            )}

            {/* Edit Module Modal */}
            {editingModule && (
                <EditModuleModal
                    module={editingModule}
                    onClose={() => setEditingModule(null)}
                    onSave={(moduleData) => handleUpdateModule(editingModule._id, moduleData)}
                />
            )}

            {/* Edit Video Modal */}
            {editingVideo && (
                <EditVideoModal
                    video={editingVideo}
                    onClose={() => setEditingVideo(null)}
                    onSave={(videoData) => handleUpdateVideo(editingVideo.moduleId, editingVideo._id, videoData)}
                />
            )}

            {/* Edit Course Modal */}
            {showEditCourse && (
                <EditCourseModal
                    course={course}
                    onClose={() => setShowEditCourse(false)}
                    onSave={handleUpdateCourse}
                />
            )}
        </div>
    );
};

// Add Module Modal Component
const AddModuleModal = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Add New Module</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Module Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Introduction to React"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            rows="3"
                            placeholder="Brief description of this module"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <ModernButton type="submit" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Save Module
                        </ModernButton>
                        <ModernButton type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

// Add Video Modal Component
const AddVideoModal = ({ moduleId, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [duration, setDuration] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, url, duration });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Add New Video</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Video Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Introduction to Components"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Video URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="https://youtube.com/embed/..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Duration (Optional)</label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., 15:30"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <ModernButton type="submit" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Save Video
                        </ModernButton>
                        <ModernButton type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

// Edit Module Modal Component
const EditModuleModal = ({ module, onClose, onSave }) => {
    const [title, setTitle] = useState(module.title || '');
    const [description, setDescription] = useState(module.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Module</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Module Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Introduction to React"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            rows="3"
                            placeholder="Brief description of this module"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <ModernButton type="submit" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Update Module
                        </ModernButton>
                        <ModernButton type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

// Edit Video Modal Component
const EditVideoModal = ({ video, onClose, onSave }) => {
    const [title, setTitle] = useState(video.title || '');
    const [url, setUrl] = useState(video.url || '');
    const [duration, setDuration] = useState(video.duration || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, url, duration });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Video</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Video Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Introduction to Components"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Video URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="https://youtube.com/embed/..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Duration (Optional)</label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., 15:30"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <ModernButton type="submit" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Update Video
                        </ModernButton>
                        <ModernButton type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

// Edit Course Modal Component
const EditCourseModal = ({ course, onClose, onSave }) => {
    const [title, setTitle] = useState(course.title || '');
    const [description, setDescription] = useState(course.description || '');
    const [price, setPrice] = useState(course.price || '');
    const [category, setCategory] = useState(course.category || '');
    const [level, setLevel] = useState(course.level || 'Beginner');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description, price: Number(price), category, level });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Course Details</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Course Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Complete React Course"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            rows="4"
                            placeholder="Describe what students will learn in this course"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">Price (₹) *</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                placeholder="e.g., 2999"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-2">Level *</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Category *</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Web Development, Data Science"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <ModernButton type="submit" className="flex-1">
                            <Save size={18} className="mr-2" />
                            Update Course
                        </ModernButton>
                        <ModernButton type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default CourseContentManagement;
