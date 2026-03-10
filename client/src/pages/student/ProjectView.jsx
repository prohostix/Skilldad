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
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [submissions, setSubmissions] = useState({});

    // Mock project data with comprehensive details
    const mockProjects = [
        {
            id: 1,
            title: "E-commerce Website Development",
            description: "Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
            deadline: "2024-03-15",
            status: "in_progress",
            maxFileSize: "50MB",
            allowedFormats: [".zip", ".rar", ".pdf", ".docx"],
            requirements: [
                "Responsive design for mobile and desktop",
                "User registration and login system",
                "Product search and filtering",
                "Shopping cart functionality",
                "Payment gateway integration",
                "Admin panel for product management"
            ],
            submissionGuidelines: "Submit your complete project as a ZIP file including source code, documentation, and deployment instructions.",
            points: 100,
            difficulty: "Advanced"
        },
        {
            id: 2,
            title: "Data Analysis Dashboard",
            description: "Create an interactive dashboard using Python and visualization libraries to analyze sales data.",
            deadline: "2024-03-20",
            status: "pending",
            maxFileSize: "25MB",
            allowedFormats: [".py", ".ipynb", ".pdf", ".zip"],
            requirements: [
                "Data cleaning and preprocessing",
                "Statistical analysis of sales trends",
                "Interactive visualizations",
                "Executive summary report",
                "Code documentation"
            ],
            submissionGuidelines: "Include Jupyter notebook, Python scripts, and a PDF report with your findings.",
            points: 80,
            difficulty: "Intermediate"
        }
    ];

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`/api/courses/${courseId}`);
                setCourse(data);
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        };
        fetchCourse();
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

        setUploadProgress(prev => ({ ...prev, [projectId]: 0 }));

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const currentProgress = prev[projectId] || 0;
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    setSubmissions(prevSub => ({
                        ...prevSub,
                        [projectId]: {
                            files: files,
                            submittedAt: new Date(),
                            status: 'submitted'
                        }
                    }));
                    return prev;
                }
                return { ...prev, [projectId]: currentProgress + 10 };
            });
        }, 200);
    };

    const removeFile = (projectId, fileIndex) => {
        setSelectedFiles(prev => ({
            ...prev,
            [projectId]: prev[projectId].filter((_, index) => index !== fileIndex)
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'text-emerald-600 bg-emerald-50';
            case 'in_progress': return 'text-purple-600 bg-purple-50';
            case 'overdue': return 'text-red-600 bg-red-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Advanced': return 'text-red-600 bg-red-50';
            case 'Intermediate': return 'text-orange-600 bg-orange-50';
            case 'Beginner': return 'text-green-600 bg-green-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    if (!course) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <DashboardHeading title={`Projects for ${course.title}`} />
                <p className="text-white/40 font-inter text-sm max-w-2xl">Apply your theoretical knowledge by completing these industry-aligned hands-on projects.</p>
            </div>

            {mockProjects.length > 0 ? (
                <div className="grid gap-8">
                    {mockProjects.map((project) => {
                        const isSubmitted = submissions[project.id];
                        const files = selectedFiles[project.id] || [];
                        const progress = uploadProgress[project.id] || 0;
                        const isUploading = progress > 0 && progress < 100;

                        return (
                            <GlassCard key={project.id} className="p-8 space-y-6">
                                {/* Project Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-base font-semibold text-white font-inter">{project.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                                                {project.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed">{project.description}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Calendar size={16} />
                                            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-primary">
                                            <span className="font-medium">{project.points} points</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-white">Requirements</h3>
                                    <ul className="space-y-2">
                                        {project.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2 text-slate-300">
                                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Submission Guidelines */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-white">Submission Guidelines</h3>
                                    <div className="bg-purple-50/10 border border-purple-200/20 rounded-lg p-4">
                                        <p className="text-slate-300 text-sm leading-relaxed">{project.submissionGuidelines}</p>
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                            <span>Max file size: {project.maxFileSize}</span>
                                            <span>Allowed formats: {project.allowedFormats.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                {!isSubmitted && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-white">Upload Your Submission</h3>

                                        {/* File Drop Zone */}
                                        <div className="border-2 border-dashed border-slate-300/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleFileSelect(project.id, e.target.files)}
                                                className="hidden"
                                                id={`file-upload-${project.id}`}
                                                accept={project.allowedFormats.join(',')}
                                            />
                                            <label htmlFor={`file-upload-${project.id}`} className="cursor-pointer">
                                                <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                                                <p className="text-slate-300 mb-2">Click to upload or drag and drop</p>
                                                <p className="text-sm text-slate-400">
                                                    {project.allowedFormats.join(', ')} up to {project.maxFileSize}
                                                </p>
                                            </label>
                                        </div>

                                        {/* Selected Files */}
                                        {files.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-white">Selected Files:</h4>
                                                {files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={20} className="text-slate-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{file.name}</p>
                                                                <p className="text-xs text-slate-400">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(project.id, index)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Progress */}
                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300">Uploading...</span>
                                                    <span className="text-primary">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <ModernButton
                                            onClick={() => handleFileUpload(project.id)}
                                            disabled={files.length === 0 || isUploading}
                                            className="w-full lg:w-auto"
                                        >
                                            {isUploading ? 'Uploading...' : 'Submit Project'}
                                        </ModernButton>
                                    </div>
                                )}

                                {/* Submission Status */}
                                {isSubmitted && (
                                    <div className="bg-emerald-50/10 border border-emerald-200/20 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CheckCircle size={24} className="text-emerald-500" />
                                            <div>
                                                <h3 className="font-semibold text-emerald-400">Project Submitted Successfully</h3>
                                                <p className="text-sm text-slate-300">
                                                    Submitted on {isSubmitted.submittedAt.toLocaleDateString()} at {isSubmitted.submittedAt.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-white">Submitted Files:</h4>
                                            {isSubmitted.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-slate-400" />
                                                        <span className="text-sm text-slate-300">{file.name}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="text-slate-400 hover:text-white transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="text-slate-400 hover:text-white transition-colors">
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 p-3 bg-yellow-50/10 border border-yellow-200/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-yellow-500" />
                                                <span className="text-sm text-yellow-400">Awaiting instructor review</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            ) : (
                <GlassCard className="p-12 text-center">
                    <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white font-inter mb-2">No Projects Available</h3>
                    <p className="text-white/70 text-sm">No projects have been assigned to this course yet.</p>
                </GlassCard>
            )}
        </div>
    );
};

export default ProjectView;
