import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Download, Upload, Eye,
    AlertCircle, CheckCircle, Clock,
    Search, Trash2, Calendar, Trophy
} from 'lucide-react';
import DashboardHeading from '../../components/ui/DashboardHeading';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [docsRes, certsRes, enrollRes] = await Promise.all([
                axios.get('/api/documents/my-documents', config).catch(() => ({ data: [] })),
                axios.get('/api/certificates/my', config).catch(() => ({ data: [] })),
                axios.get('/api/enrollment/my-courses', config).catch(() => ({ data: [] }))
            ]);
            
            setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
            setCertificates(Array.isArray(certsRes.data) ? certsRes.data : []);
            setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const handleApplyCertificate = async (courseId) => {
        try {
            setRequesting(courseId);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            await axios.post('/api/certificates/apply', { courseId }, config);
            alert('Graduation request submitted successfully to the University!');
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to submit request';
            alert(`Application Error: ${msg}`);
        } finally {
            setRequesting(null);
        }
    };

    const handleFileSelect = (docId, files) => {
        setSelectedFiles(prev => ({
            ...prev,
            [docId]: Array.from(files)
        }));
    };

    const handleFileUpload = async (docId) => {
        console.log('Starting file upload for docId:', docId);
        // Debug alert to confirm function call
        window.alert('Upload triggered for requirement ID: ' + docId); 
        
        const files = selectedFiles[docId];
        if (!files || files.length === 0) {
            console.warn('No files selected for docId:', docId);
            alert('Please select a file first.');
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || !userInfo.token) {
                console.error('No user info or token found');
                alert('Session expired. Please login again.');
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('document', files[0]);
            
            // Add metadata from the document requirement if it exists
            // Use String comparison to avoid type mismatch issues
            const docReq = documents.find(d => String(d.id) === String(docId) || String(d._id) === String(docId));
            
            if (docReq) {
                console.log('Found document requirement:', docReq.title);
                formData.append('title', docReq.title || '');
                formData.append('type', docReq.type || '');
                if (docReq.course_id) formData.append('course', docReq.course_id);
                if (docReq.university_id) formData.append('university_id', docReq.university_id);
            } else {
                console.warn('Could not find document requirement for ID:', docId);
                // Fallback: if we can't find the req, at least try to send the ID
                formData.append('docId', docId);
            }

            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress for ${docId}: ${progress}%`);
                    setUploadProgress(prev => ({ ...prev, [docId]: progress }));
                }
            };

            console.log('Sending POST request to /api/documents/upload');
            const response = await axios.post('/api/documents/upload', formData, config);
            console.log('Upload response:', response.data);
            
            alert('Document uploaded successfully!');
            fetchData();
            
            // Reset state
            setSelectedFiles(prev => ({ ...prev, [docId]: [] }));
            setUploadProgress(prev => ({ ...prev, [docId]: 0 }));
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to upload document';
            alert(`Upload Error: ${msg}`);
            setUploadProgress(prev => ({ ...prev, [docId]: 0 }));
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to remove this document?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/documents/${docId}`, config);
            alert('Document removed successfully');
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to remove document';
            alert(`Remove Error: ${msg}`);
        }
    };

    const handleGenericUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('document', file);
            formData.append('title', file.name.split('.')[0]); // Use filename as title
            formData.append('type', 'other');

            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post('/api/documents/upload', formData, config);
            alert('Extra document uploaded successfully!');
            fetchData();
        } catch (error) {
            alert(`Upload Error: ${error.response?.data?.message || error.message}`);
        }
        // Reset input so the same file can be uploaded again if needed
        event.target.value = null;
    };

    const handleDownload = (fileName, url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            alert(`Download started: ${fileName}`);
        }
    };

    const eligibleCourses = enrollments.filter(e => {
        const progress = parseFloat(e.progress) || 0;
        const hasCert = certificates.some(c => c.course_id === e.course_id);
        return progress >= 100 && !hasCert;
    });

    const pendingRequests = certificates.filter(c => c.status === 'PENDING');

    const processedDocuments = documents.filter(doc => {
        if (doc.status === 'pending') {
            const isFulfilled = documents.some(d => 
                d.title === doc.title && 
                (d.status === 'submitted' || d.status === 'approved')
            );
            return !isFulfilled;
        }
        return true;
    });

    const displayItems = [
        ...processedDocuments.map(d => ({ ...d, isCertificate: false })),
        ...certificates.filter(c => c.status === 'ISSUED').map(c => ({
            id: `cert-${c.id}`,
            title: `${c.course_title} Certificate`,
            description: `Official completion certificate issued by ${c.university_id || 'SkillDad Partner'}.`,
            status: 'approved',
            format: 'PDF',
            maxSize: 'N/A',
            deadline: c.issue_date,
            isCertificate: true,
            file_url: c.file_url,
            fileName: `${c.course_title}_Certificate.pdf`
        }))
    ];

    const filteredItems = displayItems.filter(item => {
        const matchesFilter = filter === 'all' || 
            (filter === 'certificates' && item.isCertificate) || 
            (!item.isCertificate && item.status === filter);
        const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filterOptions = [
        { value: 'all', label: 'All', count: displayItems.length },
        { value: 'certificates', label: 'Certificates', count: certificates.filter(c => c.status === 'ISSUED').length },
        { value: 'pending', label: 'Requests', count: documents.filter(d => d.status === 'pending').length },
        { value: 'approved', label: 'Verified', count: documents.filter(d => d.status === 'approved').length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="pb-3 border-b border-white/5">
                <DashboardHeading title="Document Management" />
                <p className="text-xs text-white/40 mt-0.5 font-medium">Securely manage and track your academic credentials and verification files.</p>
            </div>

            {/* Graduation & Certification Section (Compact) */}
            {enrollments.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-4 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                             <Trophy size={10} className="text-white/10" />
                             <h2 style={{ fontSize: '7.5px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                                Requisition Tracking
                             </h2>
                        </div>
                        <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest">{eligibleCourses.length + pendingRequests.length} Tasks</div>
                    </div>
                    
                    <div className="p-1 space-y-1">
                        {/* Eligible for Certificate */}
                        {eligibleCourses.map(course => (
                            <motion.div 
                                key={course.course_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/[0.02] hover:bg-white/[0.04] p-3 rounded-lg border border-white/5 flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        <CheckCircle size={14} className="text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-white truncate">{course.title || 'Course Completed'}</h3>
                                        <p className="text-[9px] text-white/30 font-medium mt-0.5 truncate uppercase tracking-widest">Status: Ready • Awarded by {course.university_name || 'SkillDad Partner'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApplyCertificate(course.course_id)}
                                    disabled={requesting === course.course_id}
                                    className="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-[9px] font-black uppercase tracking-widest rounded-md transition-all border border-primary/20"
                                >
                                    {requesting === course.course_id ? 'WAITING...' : 'APPLY NOW'}
                                </button>
                            </motion.div>
                        ))}

                        {/* Pending Requests */}
                        {pendingRequests.map(request => (
                            <motion.div 
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/[0.01] p-3 rounded-lg border border-white/5 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-4">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                                        <Clock size={14} className="text-amber-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-white truncate">{request.course_title}</h3>
                                        <p className="text-[9px] text-amber-400/60 font-medium mt-0.5 uppercase tracking-widest italic">Application in review by {request.university_name || 'University Provider'}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-white/30 text-[9px] font-bold uppercase tracking-widest">
                                    PENDING
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty Graduation State (Minimal) */}
                        {eligibleCourses.length === 0 && pendingRequests.length === 0 && (
                            <div className="py-2 flex flex-col items-center justify-center gap-1 opacity-40">
                                <Trophy size={14} className="text-white/20" />
                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.1em]">Complete a course (100%) to unlock certification</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                filter === option.value
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            {option.label}
                            {option.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    filter === option.value ? 'bg-white/20' : 'bg-white/10'
                                }`}>
                                    {option.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                    <div className="relative flex-1 sm:w-56 shrink-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={13} />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 transition-colors"
                        />
                    </div>
                    <label className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                        <Upload size={14} />
                        <span>Add File</span>
                        <input type="file" onChange={handleGenericUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Results count */}
            <p className="text-[11px] text-white/30 font-medium tracking-wide">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </p>

            {/* Documents List */}
            <div className="flex flex-col gap-4">
                {filteredItems.map((doc, idx) => {
                    const statusStyles = {
                        approved: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={16} /> },
                        submitted: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: <Clock size={16} /> },
                        rejected: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: <AlertCircle size={16} /> },
                        pending: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Upload size={16} /> },
                    };
                    const sc = statusStyles[doc.status] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/40', icon: <FileText size={16} /> };

                    const files = selectedFiles[doc.id] || [];
                    const progress = uploadProgress[doc.id] || 0;
                    const isUploading = progress > 0 && progress < 100;

                    return (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all flex flex-col lg:flex-row items-stretch lg:items-center gap-6 p-5 sm:p-6 group">
                                
                                {/* Left Info Column */}
                                <div className="flex flex-col gap-3 flex-1 min-w-0">
                                    <div className="flex items-start gap-4">
                                        <div className={`shrink-0 mt-1 flex items-center justify-center w-10 h-10 rounded-lg border ${sc.bg} ${sc.border} ${sc.text}`}>
                                            {sc.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors truncate max-w-full">
                                                    {doc.title}
                                                </h3>
                                                {doc.required && (
                                                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500/10 text-red-500 border border-red-500/20">
                                                        Required
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${sc.text}`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/50 leading-relaxed mt-1.5 line-clamp-2 pr-4">
                                                {doc.description}
                                            </p>
                                            {doc.deadline && (
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 border-t border-white/5 pt-3">
                                                    <span className="flex items-center gap-1.5 text-xs text-white/60 font-medium font-inter">
                                                        <FileText size={14} className="text-white/40" /> {doc.format || 'PDF'}
                                                    </span>
                                                    <span className="hidden sm:inline text-white/10">|</span>
                                                    <span className="text-xs text-white/60 font-medium font-inter">
                                                        Max: {doc.maxSize || '10MB'}
                                                    </span>
                                                    <span className="hidden sm:inline text-white/10">|</span>
                                                    <span className="flex items-center gap-1.5 text-xs text-white/60 font-medium font-inter">
                                                        <Calendar size={14} className="text-white/40" />
                                                        Due: <span className={`${new Date(doc.deadline) < new Date() && doc.status === 'pending' ? 'text-red-400 font-semibold' : 'text-white'}`}>
                                                            {new Date(doc.deadline).toLocaleDateString(undefined, {month:'long', day:'numeric', year: 'numeric'})}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {doc.status === 'rejected' && doc.rejectionReason && (
                                        <div className="mt-2 lg:ml-14 p-3 bg-red-500/5 border border-red-500/10 rounded-lg border-l-2 border-l-red-500">
                                            <p className="text-xs text-red-400 leading-relaxed font-medium">
                                                <AlertCircle size={14} className="inline mr-1.5 -mt-0.5" />
                                                <strong className="font-bold text-red-300">Rejected:</strong> {doc.rejectionReason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Action Column */}
                                <div className="flex flex-col items-center justify-center w-full lg:w-[280px] shrink-0 pt-4 lg:pt-0 mt-4 lg:mt-0 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-6">
                                    {(doc.status === 'pending' || doc.status === 'rejected') ? (
                                        <div className="w-full">
                                            {files.length === 0 ? (
                                                <div className="relative h-[88px]">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        accept={doc.format?.toLowerCase().split(', ').map(f => `.${f}`).join(',')}
                                                    />
                                                    <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-primary/50 transition-all group/upload">
                                                        <div className="p-2 bg-white/5 rounded-full group-hover/upload:bg-primary/20 transition-colors">
                                                            <Upload size={16} className="text-white/30 group-hover/upload:text-primary transition-colors" />
                                                        </div>
                                                        <p className="text-[11px] font-semibold text-white/50 group-hover/upload:text-primary transition-colors">Click or drag to upload</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group/file">
                                                        <div className="min-w-0 pr-3 flex items-center gap-2">
                                                            <FileText size={16} className="text-primary/70 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-white truncate">{files[0].name}</p>
                                                                <p className="text-[10px] font-medium text-white/40 mt-0.5">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setSelectedFiles(prev => ({ ...prev, [doc.id]: [] }))}
                                                            className="p-1.5 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg shrink-0 transition-colors opacity-80 group-hover/file:opacity-100"
                                                            title="Remove file"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                                                                       {isUploading && (
                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    )}

                                                    <button
                                                         type="button"
                                                         onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('--- BUTTON CLICKED ---');
                                                            console.log('doc.id:', doc.id);
                                                            window.alert('Button Clicked for ID: ' + doc.id);
                                                            handleFileUpload(doc.id);
                                                         }}
                                                         disabled={isUploading}
                                                         className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold tracking-wide rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 relative z-50"
                                                     >
                                                         {isUploading ? <><Clock size={14} className="animate-pulse" /> UPLOADING {progress}%</> : <><Upload size={14} /> SUBMIT FILE ({doc.id || 'NO ID'})</>}
                                                     </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : doc.file_url ? (
                                        <div className="w-full flex flex-col gap-3">
                                            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                                        <FileText size={16} className="text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-white truncate" title={doc.fileName}>{doc.fileName || 'Document File'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => window.open(doc.file_url, '_blank')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                                    <Eye size={14} /> View
                                                </button>
                                                <button onClick={() => handleDownload(doc.fileName, doc.file_url)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                                    <Download size={14} /> Save
                                                </button>
                                                {doc.status !== 'approved' && !doc.isCertificate && (
                                                    <button onClick={() => handleDeleteDocument(doc.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors">
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-xs text-white/30 italic">No action required</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="py-14 text-center flex flex-col items-center gap-3">
                    <div className="p-3.5 bg-white/5 rounded-full">
                        <FileText size={22} className="text-white/20" />
                    </div>
                    <p className="text-sm font-semibold text-white/35">No items match criteria.</p>
                    {filter !== 'all' && (
                        <button onClick={() => setFilter('all')} className="text-xs text-primary/70 hover:text-primary transition-colors mt-1">
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Documents;
