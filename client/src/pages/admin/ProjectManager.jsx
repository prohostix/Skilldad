import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    FileText,
    Users,
    CheckCircle,
    Clock,
    ExternalLink,
    Download,
    Eye,
    MessageSquare,
    Trophy
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ProjectManager = () => {
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'submissions'
    const [projects, setProjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();
    const [editingProject, setEditingProject] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedProjectForSubmissions, setSelectedProjectForSubmissions] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        universityId: '',
        deadline: '',
        points: 100,
        difficulty: 'Intermediate',
        requirements: '',
        submissionGuidelines: '',
        batchIds: []
    });
    const [universities, setUniversities] = useState([]);
    const [projectBatches, setProjectBatches] = useState([]);

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

    const fetchSubmissions = async (projectId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/projects/${projectId}/submissions`, config);
            setSubmissions(data);
            setSelectedProjectForSubmissions(projectId);
            setActiveTab('submissions');
        } catch (error) {
            showToast('Error fetching submissions', 'error');
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchCourses();
        fetchUniversities();
    }, []);

    // Load available batches whenever the target course changes
    useEffect(() => {
        const fetchProjectBatches = async () => {
            if (!formData.course) {
                setProjectBatches([]);
                return;
            }
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`/api/batches/course/${formData.course}`, config);
                setProjectBatches(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching batches:', error);
                setProjectBatches([]);
            }
        };
        fetchProjectBatches();
    }, [formData.course]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const payload = {
            ...formData,
            courseId: formData.course // Map 'course' field from frontend to 'courseId' for backend
        };

        try {
            if (editingProject) {
                await axios.put(`/api/projects/${editingProject._id}`, payload, config);
                showToast('Project updated successfully!', 'success');
            } else {
                await axios.post('/api/projects', payload, config);
                showToast('Project created successfully!', 'success');
            }
            setShowModal(false);
            setEditingProject(null);
            setFormData({
                title: '',
                description: '',
                course: '',
                universityId: '',
                deadline: '',
                points: 100,
                difficulty: 'Intermediate',
                requirements: '',
                submissionGuidelines: '',
                batchIds: []
            });
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

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/projects/submissions/${selectedSubmission.id}/grade`, gradeData, config);
            showToast('Submission graded successfully', 'success');
            setShowGradeModal(false);
            fetchSubmissions(selectedProjectForSubmissions);
        } catch (error) {
            showToast('Failed to grade submission', 'error');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <DashboardHeading title="Project & Submission Manager" />
                    <p className="text-white/40 text-xs font-inter mt-1">Manage project definitions and review student submissions across courses.</p>
                </div>
                {activeTab === 'projects' && (
                    <button
                        onClick={() => { setShowModal(true); setEditingProject(null); setFormData({ title: '', description: '', course: '', universityId: '', deadline: '', points: 100, batchIds: [] }); }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-primary/25 self-start md:self-auto"
                    >
                        <Plus size={14} /> <span>Create Project</span>
                    </button>
                )}
                {activeTab === 'submissions' && (
                    <button
                        onClick={() => setActiveTab('projects')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all self-start md:self-auto"
                    >
                        Back to Projects
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10 pb-px">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-2 text-xs font-semibold transition-all relative ${activeTab === 'projects' ? 'text-primary' : 'text-white/40 hover:text-white/70'}`}
                >
                    Project Definitions
                    {activeTab === 'projects' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_-4px_12px_rgba(var(--color-primary-rgb),0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 text-xs font-semibold transition-all relative ${activeTab === 'submissions' ? 'text-primary' : 'text-white/40 hover:text-white/70'}`}
                >
                    Student Submissions
                    {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_-4px_12px_rgba(var(--color-primary-rgb),0.5)]" />}
                </button>
            </div>

            {activeTab === 'projects' ? (
                <div className="grid grid-cols-1 gap-6">
                    {projects.length > 0 ? (
                        <GlassCard className="!p-0 overflow-hidden border-white/10">
                            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                                        <tr>
                                            <th className="px-3.5 py-2.5">Project Details</th>
                                            <th className="px-3.5 py-2.5">Target Course</th>
                                            <th className="px-3.5 py-2.5">Timeline</th>
                                            <th className="px-3.5 py-2.5">Scoring</th>
                                            <th className="px-3.5 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs">
                                        {projects.map((project) => (
                                            <tr key={project._id} className="hover:bg-white/[0.03] transition-colors group">
                                                <td className="px-3.5 py-2">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-white font-semibold text-xs truncate max-w-xs">{project.title}</span>
                                                        <span className="text-[11px] text-white/40 line-clamp-1 max-w-xs">{project.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    <span className="px-2 py-0.5 bg-primary/15 text-primary border border-primary/25 rounded text-[11px] font-semibold">
                                                        {project.courseTitle || 'All Courses'}
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
                                                        <Clock size={12} className="text-primary" />
                                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Continuous'}
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                                                        <Trophy size={13} className="text-amber-400" />
                                                        {project.points} PTS
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => fetchSubmissions(project.id)}
                                                            className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
                                                            title="View Submissions"
                                                        >
                                                            <Users size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingProject(project);
                                                                setFormData({
                                                                    title: project.title,
                                                                    description: project.description,
                                                                    course: project.courseId || '',
                                                                    universityId: project.universityId || '',
                                                                    deadline: project.deadline?.split('T')[0] || '',
                                                                    points: project.points,
                                                                    difficulty: project.difficulty || 'Intermediate',
                                                                    requirements: Array.isArray(project.requirements) ? project.requirements.join('\n') : (project.requirements || ''),
                                                                    submissionGuidelines: project.submissionGuidelines || '',
                                                                    batchIds: Array.isArray(project.batchIds) ? project.batchIds.map(String) : []
                                                                });
                                                                setShowModal(true);
                                                            }}
                                                            className="p-1.5 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-all"
                                                            title="Edit Project"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(project._id)}
                                                            className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all"
                                                            title="Delete Project"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-20 text-center border-white/10">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={40} className="text-white/10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Projects Defined</h3>
                            <p className="text-white/40 text-sm max-w-sm mx-auto">Create your first project definition to allow students to start submitting their work.</p>
                        </GlassCard>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Submissions View */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Users size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Student Submissions</h3>
                                <p className="text-xs text-white/40">Review and grade student project work for selected projects.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs font-inter focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
                                value={selectedProjectForSubmissions || ''}
                                onChange={(e) => fetchSubmissions(e.target.value)}
                            >
                                <option value="" disabled className="bg-slate-900">Select Project to Filter</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id} className="bg-slate-900">{p.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {submissions.length > 0 ? (
                        <GlassCard className="!p-0 overflow-hidden border-white/10">
                            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                                        <tr>
                                            <th className="px-3.5 py-2.5">Student</th>
                                            <th className="px-3.5 py-2.5">Submission Date</th>
                                            <th className="px-3.5 py-2.5">Status</th>
                                            <th className="px-3.5 py-2.5">Grade</th>
                                            <th className="px-3.5 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs">
                                        {submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors group">
                                                <td className="px-3.5 py-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-semibold text-xs">{sub.studentName}</span>
                                                        <span className="text-[11px] text-white/40">{sub.studentEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                                                        <span>{new Date(sub.submission_date).toLocaleDateString()}</span>
                                                        <span className="text-white/30">• {new Date(sub.submission_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'graded'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                                            : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-2">
                                                    {sub.grade ? (
                                                        <span className="text-xs font-bold text-primary">{sub.grade}</span>
                                                    ) : (
                                                        <span className="text-[10px] text-white/30 uppercase font-semibold">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-3.5 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {sub.file_url && (
                                                            <a
                                                                href={`${axios.defaults.baseURL || ''}${sub.file_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-white/5 text-white/60 border border-white/10 rounded hover:bg-white/10 hover:text-white transition-all"
                                                                title="View File"
                                                            >
                                                                <Eye size={13} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubmission(sub);
                                                                setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                                                setShowGradeModal(true);
                                                            }}
                                                            className="p-1.5 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-all"
                                                            title="Grade Submission"
                                                        >
                                                            <CheckCircle size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-20 text-center border-white/10">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={40} className="text-white/10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Submissions Found</h3>
                            <p className="text-white/40 text-sm max-w-sm mx-auto">Select a project to view student work or wait for students to begin submitting.</p>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg my-auto animate-in fade-in zoom-in duration-300">
                        <GlassCard className="!p-6 relative bg-[#0B0F1A] border-white/10 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-2xl">
                                        <Plus size={20} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight">
                                        {editingProject ? 'Edit Project Definition' : 'Define New Project'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-white/20 hover:text-white transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Project Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter project name"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Target Course</label>
                                        <select
                                            required
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter appearance-none"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        >
                                            <option value="" disabled className="bg-slate-900">Select Course</option>
                                            {courses.map((course) => (
                                                <option key={course._id} value={course._id} className="bg-slate-900">
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formData.course && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                                            Target Batches <span className="normal-case font-normal text-white/25">(leave none selected to assign to all batches)</span>
                                        </label>
                                        {projectBatches.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                                {projectBatches.map((batch) => {
                                                    const isSelected = formData.batchIds.includes(String(batch.id));
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={batch.id}
                                                            onClick={() => {
                                                                const batchId = String(batch.id);
                                                                setFormData({
                                                                    ...formData,
                                                                    batchIds: isSelected
                                                                        ? formData.batchIds.filter(id => id !== batchId)
                                                                        : [...formData.batchIds, batchId]
                                                                });
                                                            }}
                                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                                                                    ? 'bg-primary text-white border-primary'
                                                                    : 'bg-white/5 text-white/50 border-white/10 hover:border-primary/40 hover:text-white'
                                                                }`}
                                                        >
                                                            {batch.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-white/25 italic px-1">No batches created yet for this course - the project will be open to all enrolled students.</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Project Objective</label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder="What should students achieve?"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Deadline Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Max Points</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Difficulty</label>
                                        <select
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter appearance-none"
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        >
                                            <option value="Beginner" className="bg-slate-900">Beginner</option>
                                            <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                                            <option value="Advanced" className="bg-slate-900">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Key Requirements (One per line)</label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter resize-none text-xs"
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            placeholder="Requirement 1&#10;Requirement 2..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Submission Guidelines</label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter resize-none text-xs"
                                            value={formData.submissionGuidelines}
                                            onChange={(e) => setFormData({ ...formData, submissionGuidelines: e.target.value })}
                                            placeholder="Upload .ZIP file with source code..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Discard
                                    </button>
                                    <ModernButton type="submit" className="flex-[2] !py-4 font-black uppercase tracking-widest text-xs">
                                        {editingProject ? 'Save Changes' : 'Launch Project'}
                                    </ModernButton>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {showGradeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
                    <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-10 duration-300">
                        <GlassCard className="!p-8 bg-[#0B0F1A] border-white/10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Grade Submission</h3>
                                    <p className="text-xs text-white/40">Student: {selectedSubmission?.studentName}</p>
                                </div>
                            </div>

                            <form onSubmit={handleGradeSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Final Grade / Score</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. A+, 95, 10/10"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-black text-center text-xl"
                                        value={gradeData.grade}
                                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Constructive Feedback</label>
                                    <textarea
                                        rows="5"
                                        required
                                        placeholder="Provide detailed feedback to the student..."
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary transition-all font-inter resize-none text-sm"
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowGradeModal(false)}
                                        className="flex-1 py-4 text-white font-bold hover:bg-white/5 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                    <ModernButton type="submit" className="flex-[2] !py-4 font-black uppercase tracking-widest text-[10px]">
                                        Submit Grade
                                    </ModernButton>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManager;
