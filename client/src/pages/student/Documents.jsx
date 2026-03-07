import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Upload,
    Eye,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    Search,
    Trash2
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});

    // Mock document data
    const mockDocuments = [
        {
            id: 1,
            title: "Course Completion Certificate",
            type: "certificate",
            format: "PDF",
            maxSize: "5MB",
            status: "pending",
            description: "Upload your course completion certificate for verification",
            deadline: "2024-03-30",
            required: true,
            uploadedFile: null
        },
        {
            id: 2,
            title: "Identity Verification",
            type: "identity",
            format: "PDF, JPG, PNG",
            maxSize: "10MB",
            status: "submitted",
            description: "Government-issued ID for identity verification",
            deadline: "2024-03-15",
            required: true,
            uploadedFile: {
                name: "passport_scan.pdf",
                uploadedAt: "2024-02-15",
                size: "2.3MB"
            }
        },
        {
            id: 3,
            title: "Academic Transcript",
            type: "academic",
            format: "PDF",
            maxSize: "15MB",
            status: "approved",
            description: "Official academic transcript from previous institution",
            deadline: "2024-04-01",
            required: false,
            uploadedFile: {
                name: "transcript_official.pdf",
                uploadedAt: "2024-02-10",
                size: "5.7MB"
            }
        },
        {
            id: 4,
            title: "Portfolio Submission",
            type: "portfolio",
            format: "ZIP, PDF",
            maxSize: "50MB",
            status: "rejected",
            description: "Portfolio showcasing your previous work and projects",
            deadline: "2024-03-25",
            required: false,
            uploadedFile: {
                name: "portfolio_v1.zip",
                uploadedAt: "2024-02-20",
                size: "23.4MB"
            },
            rejectionReason: "Portfolio must include at least 3 completed projects with detailed descriptions"
        }
    ];

    useEffect(() => {
        setDocuments(mockDocuments);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-emerald-600 bg-emerald-50';
            case 'submitted': return 'text-purple-600 bg-purple-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-orange-600 bg-orange-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'submitted': return <Clock size={16} className="text-purple-500" />;
            case 'rejected': return <AlertCircle size={16} className="text-red-500" />;
            case 'pending': return <Upload size={16} className="text-orange-500" />;
            default: return <FileText size={16} className="text-slate-500" />;
        }
    };

    const handleFileSelect = (docId, files) => {
        setSelectedFiles(prev => ({
            ...prev,
            [docId]: Array.from(files)
        }));
    };

    const handleFileUpload = async (docId) => {
        const files = selectedFiles[docId];
        if (!files || files.length === 0) return;

        setUploadProgress(prev => ({ ...prev, [docId]: 0 }));

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const currentProgress = prev[docId] || 0;
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    // Update document status
                    setDocuments(prevDocs =>
                        prevDocs.map(doc =>
                            doc.id === docId
                                ? {
                                    ...doc,
                                    status: 'submitted',
                                    uploadedFile: {
                                        name: files[0].name,
                                        uploadedAt: new Date().toISOString().split('T')[0],
                                        size: `${(files[0].size / 1024 / 1024).toFixed(1)}MB`
                                    }
                                }
                                : doc
                        )
                    );
                    setSelectedFiles(prev => ({ ...prev, [docId]: [] }));
                    return prev;
                }
                return { ...prev, [docId]: currentProgress + 10 };
            });
        }, 200);
    };

    const handleDownload = (fileName) => {
        // Create a mock download - in production, this would fetch from server
        const link = document.createElement('a');
        link.href = '#'; // In production, this would be the actual file URL
        link.download = fileName;
        link.click();

        // Show a message since we're using mock data
        alert(`Download started: ${fileName}\n\nNote: This is a demo. In production, the actual file would be downloaded from the server.`);
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesFilter = filter === 'all' || doc.status === filter;
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filterOptions = [
        { value: 'all', label: 'All Documents', count: documents.length },
        { value: 'pending', label: 'Pending', count: documents.filter(d => d.status === 'pending').length },
        { value: 'submitted', label: 'Submitted', count: documents.filter(d => d.status === 'submitted').length },
        { value: 'approved', label: 'Approved', count: documents.filter(d => d.status === 'approved').length },
        { value: 'rejected', label: 'Rejected', count: documents.filter(d => d.status === 'rejected').length }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <DashboardHeading title="Document Management" />
                <p className="text-white/40 font-inter text-sm max-w-2xl">Securely manage and track your academic credentials and verification files.</p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === option.value
                                ? 'bg-primary text-white'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                }`}
                        >
                            {option.label} ({option.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid gap-6">
                {filteredDocuments.map((doc) => {
                    const files = selectedFiles[doc.id] || [];
                    const progress = uploadProgress[doc.id] || 0;
                    const isUploading = progress > 0 && progress < 100;

                    return (
                        <GlassCard key={doc.id} className="p-6 space-y-6">
                            {/* Document Header */}
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-semibold text-white">{doc.title}</h3>
                                        {doc.required && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                Required
                                            </span>
                                        )}
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                            {getStatusIcon(doc.status)}
                                            <span className="capitalize">{doc.status}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300">{doc.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        <span>Format: {doc.format}</span>
                                        <span>Max size: {doc.maxSize}</span>
                                        <span>Deadline: {new Date(doc.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {doc.status === 'rejected' && doc.rejectionReason && (
                                <div className="bg-red-50/10 border border-red-200/20 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-red-400 mb-1 text-sm">Document Rejected</h4>
                                            <p className="text-sm text-red-300">{doc.rejectionReason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Current File */}
                            {doc.uploadedFile && (
                                <div className="bg-slate-800/30 rounded-lg p-4">
                                    <h4 className="font-medium text-white mb-3 text-sm">Current Submission</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className="text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{doc.uploadedFile.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    Uploaded on {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()} • {doc.uploadedFile.size}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="text-slate-400 hover:text-white transition-colors"
                                                onClick={() => alert(`Viewing: ${doc.uploadedFile.name}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="text-slate-400 hover:text-white transition-colors"
                                                onClick={() => handleDownload(doc.uploadedFile.name)}
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Section */}
                            {(doc.status === 'pending' || doc.status === 'rejected') && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-white text-sm">
                                        {doc.uploadedFile ? 'Replace Document' : 'Upload Document'}
                                    </h4>

                                    {/* File Drop Zone */}
                                    <div className="border-2 border-dashed border-slate-300/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                                            className="hidden"
                                            id={`file-upload-${doc.id}`}
                                            accept={doc.format.toLowerCase().split(', ').map(f => `.${f}`).join(',')}
                                        />
                                        <label htmlFor={`file-upload-${doc.id}`} className="cursor-pointer">
                                            <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                                            <p className="text-slate-300 mb-1">Click to upload or drag and drop</p>
                                            <p className="text-sm text-slate-400">
                                                {doc.format} up to {doc.maxSize}
                                            </p>
                                        </label>
                                    </div>

                                    {/* Selected Files */}
                                    {files.length > 0 && (
                                        <div className="space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{file.name}</p>
                                                            <p className="text-xs text-slate-400">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedFiles(prev => ({
                                                            ...prev,
                                                            [doc.id]: prev[doc.id].filter((_, i) => i !== index)
                                                        }))}
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

                                    {/* Upload Button */}
                                    <ModernButton
                                        onClick={() => handleFileUpload(doc.id)}
                                        disabled={files.length === 0 || isUploading}
                                        className="w-full lg:w-auto"
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload Document'}
                                    </ModernButton>
                                </div>
                            )}
                        </GlassCard>
                    );
                })}
            </div>

            {filteredDocuments.length === 0 && (
                <GlassCard className="p-12 text-center">
                    <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white font-inter mb-2">No Documents Found</h3>
                    <p className="text-white/70 text-sm">No documents match your current filter criteria.</p>
                </GlassCard>
            )}
        </div>
    );
};

export default Documents;
