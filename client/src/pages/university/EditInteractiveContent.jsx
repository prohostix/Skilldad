import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InteractiveContentBuilder from '../../components/InteractiveContentBuilder';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import { AlertCircle } from 'lucide-react';

const EditInteractiveContent = () => {
    const { courseId, moduleId, contentId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialContent, setInitialContent] = useState(null);

    useEffect(() => {
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
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

            const content = data.find(c => c._id === contentId);
            if (!content) {
                setError('Content not found');
                return;
            }

            setInitialContent(content);
            setError(null);
        } catch (err) {
            console.error('Error fetching content:', err);
            setError(err.response?.data?.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedContent) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.put(
                `/api/courses/${courseId}/modules/${moduleId}/content/${contentId}`,
                updatedContent,
                config
            );

            navigate(`/university/courses/${courseId}/modules/${moduleId}/content/manage`);
        } catch (err) {
            console.error('Error updating content:', err);
            setError(err.response?.data?.message || 'Failed to update content');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-slate-400">Loading content...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !initialContent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
                <div className="container mx-auto px-4 py-8">
                    <GlassCard className="bg-red-500/10 border-red-500/20 p-4">
                        <div className="flex items-center space-x-3">
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-red-400 font-bold text-sm">{error}</p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeading
                    title="Edit Interactive Content"
                    subtitle="Update exercises, practices, or quizzes in your course module"
                />
                
                <div className="mt-8">
                    <InteractiveContentBuilder
                        moduleId={moduleId}
                        initialContent={initialContent}
                        onSave={handleSave}
                        isEditing={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditInteractiveContent;
