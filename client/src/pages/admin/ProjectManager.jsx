import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, FileText } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        deadline: '',
        points: 100
    });

    const fetchProjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/projects', config);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/courses/admin', config);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            if (editingProject) {
                await axios.put(`/api/projects/${editingProject._id}`, formData, config);
                showToast('Project updated successfully!', 'success');
            } else {
                await axios.post('/api/projects', formData, config);
                showToast('Project created successfully!', 'success');
            }
            setShowModal(false);
            setEditingProject(null);
            setFormData({ title: '', description: '', course: '', deadline: '', points: 100 });
            fetchProjects();
        } catch (error) {
            showToast(error.response?.data?.message || error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            await axios.delete(`/api/projects/${id}`, config);
            showToast('Project deleted successfully', 'success');
            fetchProjects();
        } catch (error) {
            showToast('Error deleting project', 'error');
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <DashboardHeading title="Project Management" />
                    </div>
                    <ModernButton onClick={() => { setShowModal(true); setEditingProject(null); }} className="!px-4 !py-2 text-sm">
                        <Plus size={16} className="mr-1.5" /> Create Project
                    </ModernButton>
                </div>

                <GlassCard className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-white/70 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">Project Title</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Deadline</th>
                                    <th className="px-6 py-4">Max Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {projects.map((project) => (
                                    <tr key={project._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-white font-bold">{project.title}</td>
                                        <td className="px-6 py-4 text-white/70">{project.course?.title || 'N/A'}</td>
                                        <td className="px-6 py-4 text-white/70">
                                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{project.points}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingProject(project);
                                                    setFormData({
                                                        title: project.title,
                                                        description: project.description,
                                                        course: project.course?._id || '',
                                                        deadline: project.deadline?.split('T')[0] || '',
                                                        points: project.points
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-primary hover:text-primary/80"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project._id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                        // Close modal only if clicking directly on backdrop
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                            setEditingProject(null);
                            setFormData({ title: '', description: '', course: '', deadline: '', points: 100 });
                        }
                    }}
                >
                    <GlassCard className="w-full max-w-2xl relative z-[100000] my-8 bg-black/95 border-white/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-6 font-inter">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Description</label>
                                <textarea
                                    rows="4"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Course</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id} className="bg-[#0B0F1A]">
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Deadline</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Max Score</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProject(null);
                                        setFormData({ title: '', description: '', course: '', deadline: '', points: 100 });
                                    }}
                                    className="flex-1 py-3 text-white/70 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1">
                                    {editingProject ? 'Update' : 'Create'} Project
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </>
    );
};

export default ProjectManager;
