import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, GripVertical, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

const InteractiveContentManager = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();

    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchContents();
    }, [courseId, moduleId]);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            const { data } = await axios.get(
                `/api/courses/${courseId}/modules/${moduleId}/content`,
                config
            );

            // Ensure data is an array
            setContents(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching contents:', err);
            setError(err.response?.data?.message || 'Failed to load content');
            setContents([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contentId) => {
        navigate(`/university/courses/${courseId}/modules/${moduleId}/content/${contentId}/edit`);
    };

    const handleDelete = async (contentId) => {
        try {
            setDeleting(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.delete(
                `/api/courses/${courseId}/modules/${moduleId}/content/${contentId}`,
                config
            );

            setContents(contents.filter(c => c._id !== contentId));
            setDeleteConfirm(null);
            setError(null);
        } catch (err) {
            console.error('Error deleting content:', err);
            setError(err.response?.data?.message || 'Failed to delete content');
        } finally {
            setDeleting(false);
        }
    };

    const handleReorder = async (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        const newContents = [...contents];
        const [movedItem] = newContents.splice(fromIndex, 1);
        newContents.splice(toIndex, 0, movedItem);

        setContents(newContents);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.put(
                `/api/courses/${courseId}/modules/${moduleId}/content/reorder`,
                { contentIds: newContents.map(c => c._id) },
                config
            );

            setError(null);
        } catch (err) {
            console.error('Error reordering content:', err);
            setError(err.response?.data?.message || 'Failed to reorder content');
            fetchContents();
        }
    };

    const getContentTypeLabel = (type) => {
        const labels = {
            exercise: 'Exercise',
            practice: 'Practice',
            quiz: 'Quiz'
        };
        return labels[type] || type;
    };

    const getContentTypeBadgeColor = (type) => {
        const colors = {
            exercise: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            practice: 'bg-green-500/20 text-green-400 border-green-500/30',
            quiz: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        };
        return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Loading content...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <GlassCard className="bg-red-500/10 border-red-500/20 p-4">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={20} className="text-red-400" />
                        <p className="text-red-400 font-bold text-sm">{error}</p>
                    </div>
                </GlassCard>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white font-poppins">
                    Interactive Content ({contents.length})
                </h2>
                <ModernButton
                    onClick={() => navigate(`/university/courses/${courseId}/modules/${moduleId}/content/create`)}
                >
                    <Plus size={20} className="mr-2" />
                    Add Content
                </ModernButton>
            </div>

            {contents.length === 0 ? (
                <GlassCard className="text-center py-12">
                    <p className="text-slate-400 mb-4">No interactive content yet</p>
                    <ModernButton
                        onClick={() => navigate(`/university/courses/${courseId}/modules/${moduleId}/content/create`)}
                    >
                        <Plus size={20} className="mr-2" />
                        Create First Content
                    </ModernButton>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {contents.map((content, index) => (
                        <GlassCard key={content._id} className="p-6">
                            <div className="flex items-start space-x-4">
                                {/* Drag Handle */}
                                <div className="flex flex-col space-y-2 pt-2">
                                    <button
                                        onClick={() => handleReorder(index, index - 1)}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move up"
                                    >
                                        <GripVertical size={20} className="text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => handleReorder(index, index + 1)}
                                        disabled={index === contents.length - 1}
                                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move down"
                                    >
                                        <GripVertical size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Content Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">
                                                    {content.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getContentTypeBadgeColor(content.contentType)}`}>
                                                    {getContentTypeLabel(content.contentType)}
                                                </span>
                                            </div>
                                            {content.description && (
                                                <p className="text-slate-400 text-sm mb-3">
                                                    {content.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                                        <span>{content.questions?.length || 0} questions</span>
                                        {content.timeLimit > 0 && (
                                            <span>{content.timeLimit} min time limit</span>
                                        )}
                                        {content.attemptLimit !== -1 && (
                                            <span>{content.attemptLimit} attempts max</span>
                                        )}
                                        {content.contentType === 'quiz' && content.passingScore && (
                                            <span>{content.passingScore}% passing score</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(content._id)}
                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={18} className="text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(content._id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} className="text-red-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Delete Confirmation */}
                            {deleteConfirm === content._id && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-white font-bold mb-3">
                                        Are you sure you want to delete "{content.title}"?
                                    </p>
                                    <p className="text-slate-400 text-sm mb-4">
                                        This action cannot be undone. All student submissions will be preserved.
                                    </p>
                                    <div className="flex space-x-3">
                                        <ModernButton
                                            onClick={() => handleDelete(content._id)}
                                            disabled={deleting}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            {deleting ? 'Deleting...' : 'Yes, Delete'}
                                        </ModernButton>
                                        <ModernButton
                                            onClick={() => setDeleteConfirm(null)}
                                            variant="secondary"
                                            disabled={deleting}
                                        >
                                            Cancel
                                        </ModernButton>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InteractiveContentManager;
