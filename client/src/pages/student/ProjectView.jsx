import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Upload,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Eye,
    Trash2,
    Plus
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const ProjectView = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) {
                    setError('You must be logged in to view projects.');
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                const [courseRes, projectsRes] = await Promise.all([
                    axios.get(`/api/courses/${courseId}`, config),
                    axios.get(`/api/projects/course/${courseId}`, config)
                ]);
                
                setCourse(courseRes.data);
                setProjects(projectsRes.data || []);
                
                // Initialize submissions state from API data
                const initialSubmissions = {};
                (projectsRes.data || []).forEach(p => {
                    if (p.status === 'submitted' || p.status === 'graded') {
                        initialSubmissions[p.id] = {
                            submittedAt: p.submittedAt || p.submission_date ? new Date(p.submittedAt || p.submission_date) : new Date(),
                            status: p.status,
                            fileUrl: p.fileUrl,
                            githubUrl: p.githubUrl,
                            grade: p.grade,
                            feedback: p.feedback
                        };
                    }
                });
                setSubmissions(initialSubmissions);
                setLoading(false);
            } catch (error) {
                console.error('Error loading projects:', error);
                setError(error.response?.data?.message || 'Failed to load projects. Please try again later.');
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const handleFileSelect = (projectId, files) => {
        setSelectedFiles(prev => ({
            ...prev,
            [projectId]: Array.from(files)
        }));
    };

    const handleFileUpload = async (projectId) => {
        const files = selectedFiles[projectId];
        if (!files || files.length === 0) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            // The backend expects 'files' but only takes the first one [0]
            files.forEach(file => formData.append('files', file));
            if (formData.githubUrl) {
                formData.append('githubUrl', formData.githubUrl);
            }
            
            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [projectId]: progress }));
                }
            };

            await axios.post(`/api/projects/${projectId}/submit`, formData, config);
            
            setSubmissions(prevSub => ({
                ...prevSub,
                [projectId]: {
                    submittedAt: new Date(),
                    status: 'submitted',
                    // Note: We don't have the new fileUrl yet, but the UI will show 'submitted'
                }
            }));
            
            setUploadProgress(prev => ({ ...prev, [projectId]: 100 }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.message || 'Failed to upload project. Please try again.');
            setUploadProgress(prev => ({ ...prev, [projectId]: 0 }));
        }
    };

    const removeFile = (projectId, fileIndex) => {
        setSelectedFiles(prev => ({
            ...prev,
            [projectId]: prev[projectId].filter((_, index) => index !== fileIndex)
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'graded': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'submitted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'in_progress': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'overdue': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Intermediate': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-white/60 font-inter animate-pulse">Loading project details...</p>
        </div>
    );

    if (error) return (
        <GlassCard className="p-12 text-center max-w-2xl mx-auto">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Projects</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
                <ModernButton onClick={() => window.location.reload()}>Try Again</ModernButton>
                {error.includes('404') || error.toLowerCase().includes('not found') ? (
                    <ModernButton 
                        onClick={() => navigate('/dashboard')}
                        className="!bg-white/5 !border-white/10 !text-white/60 hover:!text-white"
                    >
                        Go to Dashboard
                    </ModernButton>
                ) : null}
            </div>
        </GlassCard>
    );

    if (!course) return (
        <GlassCard className="p-12 text-center max-w-2xl mx-auto">
            <Search size={64} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Course Not Found</h3>
            <p className="text-white/60">The course you are looking for does not exist or has been removed.</p>
        </GlassCard>
    );

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-lg font-semibold text-white/90 tracking-tight">Projects for {course.title}</h1>
                <p className="text-white/30 font-inter text-[13px] max-w-2xl leading-relaxed">Apply your theoretical knowledge by completing these industry-aligned hands-on projects.</p>
            </div>

            {projects.length > 0 ? (
                <div className="grid gap-8">
                    {projects.map((project, index) => {
                        const isSubmitted = submissions[project.id];
                        const files = selectedFiles[project.id] || [];
                        const progress = uploadProgress[project.id] || 0;
                        const isUploading = progress > 0 && progress < 100;

                        return (
                            <GlassCard key={project.id || `proj-${index}`} className="p-8 space-y-6">
                                {/* Project Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm font-bold text-white font-inter tracking-tight">{project.title}</h2>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(project.difficulty || 'Intermediate')}`}>
                                                {project.difficulty || 'Intermediate'}
                                            </span>
                                            {isSubmitted && (
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusColor(isSubmitted.status)}`}>
                                                    {isSubmitted.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/40 leading-relaxed text-[13px]">{project.description}</p>
                                    </div>

                                    <div className="flex flex-col lg:items-end gap-1.5 flex-shrink-0">
                                        <div className="flex items-center gap-2 text-[11px] text-white/40 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/10">
                                            <Calendar size={12} className="text-primary" />
                                            <span className="font-bold uppercase tracking-wider">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-primary/80 font-black uppercase tracking-[0.15em]">
                                            <CheckCircle size={12} />
                                            <span>{project.points} Points</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                {project.requirements && project.requirements.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">Requirements</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                                            {project.requirements.map((req, index) => (
                                                <li key={index} className="flex items-start gap-2 text-white/60">
                                                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                    <span className="text-[13px]">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Submission Guidelines */}
                                {project.submissionGuidelines && (
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">Submission Guidelines</h3>
                                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                                            <p className="text-white/50 text-[13px] leading-relaxed mb-3 italic">"{project.submissionGuidelines}"</p>
                                            <div className="flex flex-wrap gap-4 text-[11px] font-medium text-white/40">
                                                <span className="bg-white/5 px-2 py-1 rounded">Max Size: {project.maxFileSize || '50MB'}</span>
                                                <span className="bg-white/5 px-2 py-1 rounded">Formats: {(project.allowedFormats || ['.pdf', '.zip']).join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {project.rubric && (
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">Grading Rubric</h3>
                                        <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                                            <p className="text-white/60 text-[13px] whitespace-pre-wrap leading-relaxed">{project.rubric}</p>
                                        </div>
                                    </div>
                                )}

                                {/* File Upload Section */}
                                {!isSubmitted && (
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.15em]">Upload Submission</h3>

                                        {/* File Drop Zone */}
                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleFileSelect(project.id, e.target.files)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                id={`file-upload-${project.id}`}
                                                accept={(project.allowedFormats || []).join(',')}
                                            />
                                            <div className="relative z-0">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                                    <Upload size={24} className="text-primary" />
                                                </div>
                                                <p className="text-white/80 font-bold text-sm mb-0.5">Click to upload or drag and drop</p>
                                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">
                                                    Supports {(project.allowedFormats || []).join(', ')} • Max {project.maxFileSize || '50MB'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Selected Files */}
                                        {files.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Selected Files</h4>
                                                {files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                                <FileText size={20} className="text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">{file.name}</p>
                                                                <p className="text-[11px] text-white/40">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(project.id, index)}
                                                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Progress */}
                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-white/60 tracking-wider">UPLOADING...</span>
                                                    <span className="text-primary">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <ModernButton
                                            onClick={() => handleFileUpload(project.id)}
                                            disabled={files.length === 0 || isUploading}
                                            className="w-full lg:w-auto !py-4 !px-10"
                                        >
                                            {isUploading ? 'Sending...' : 'Submit Project'}
                                        </ModernButton>
                                    </div>
                                )}

                                {/* Submission Status */}
                                {isSubmitted && (
                                    <div className="space-y-6 pt-6 border-t border-white/10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                    <CheckCircle size={20} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white tracking-tight">Project Submitted</h3>
                                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-black">
                                                        {isSubmitted.submittedAt.toLocaleDateString()} • {isSubmitted.submittedAt.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {isSubmitted.status === 'graded' ? (
                                                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-primary/40 uppercase font-black tracking-[0.2em] mb-0.5">GRADE</p>
                                                        <p className="text-xl font-black text-primary leading-none">{isSubmitted.grade}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[10px] font-black text-primary px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 uppercase tracking-[0.15em]">
                                                    <Clock size={12} className="animate-pulse" />
                                                    <span>Awaiting Review</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Instructor Feedback */}
                                        {isSubmitted.feedback && (
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Instructor Feedback</h4>
                                                <p className="text-sm text-slate-300 leading-relaxed italic">"{isSubmitted.feedback}"</p>
                                            </div>
                                        )}

                                        {/* Submitted Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isSubmitted.fileUrl && (
                                                <a 
                                                    href={`${axios.defaults.baseURL || ''}${isSubmitted.fileUrl}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={20} className="text-white/40 group-hover:text-primary transition-colors" />
                                                        <span className="text-sm font-medium text-white/70">View Submitted File</span>
                                                    </div>
                                                    <Eye size={18} className="text-white/20 group-hover:text-white" />
                                                </a>
                                            )}
                                            {isSubmitted.githubUrl && (
                                                <a 
                                                    href={isSubmitted.githubUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Upload size={20} className="text-white/40 group-hover:text-primary transition-colors" />
                                                        <span className="text-sm font-medium text-white/70">GitHub Repository</span>
                                                    </div>
                                                    <Eye size={18} className="text-white/20 group-hover:text-white" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            ) : (
                <GlassCard className="p-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
                    <p className="text-white/40 text-sm max-w-sm mx-auto">Projects for this course haven't been assigned yet. Check back later!</p>
                </GlassCard>
            )}
        </div>
    );
};

export default ProjectView;
