import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Search, Filter, CheckCircle2, XCircle, 
    Upload, FileText, Download, Clock, AlertCircle, 
    MoreVertical, User, BookOpen, GraduationCap 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const CertificateRequestsTab = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/certificates/university/requests', config);
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching certificate requests:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, notes = '') => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/certificates/${id}/status`, { status, notes }, config);
            alert(`Certificate ${status.toLowerCase()} successfully!`);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedRequest) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('certificate', file);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { 
                headers: { 
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            await axios.post(`/api/certificates/${selectedRequest.id}/upload`, formData, config);
            alert('Certificate issued and uploaded successfully!');
            setShowUploadModal(false);
            setFile(null);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to upload certificate');
        } finally {
            setUploading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = 
            req.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-white/40 text-sm font-medium">Loading requests...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by student, course, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['all', 'PENDING', 'APPROVED', 'ISSUED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    statusFilter === status 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {status === 'all' ? 'All Requests' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="grid gap-4">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((req, idx) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard className="p-5 hover:border-primary/30 transition-all group overflow-hidden">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Student & Course Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                                            <GraduationCap className="text-primary" size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white text-base truncate">{req.student_name}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                    req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    req.status === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                    req.status === 'ISSUED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    'bg-white/5 text-white/40'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-primary/80 mb-2 truncate flex items-center gap-1.5">
                                                <BookOpen size={14} className="text-primary/40" /> {req.course_title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30 font-medium">
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> Applied: {new Date(req.apply_date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded leading-none">ID: {req.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={14} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                    className="p-2.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        
                                        {(req.status === 'APPROVED' || req.status === 'PENDING') && (
                                            <button 
                                                onClick={() => { setSelectedRequest(req); setShowUploadModal(true); }}
                                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <Upload size={14} /> Upload & Issue
                                            </button>
                                        )}

                                        {req.status === 'ISSUED' && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => window.open(req.file_url, '_blank')}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <FileText size={14} className="text-primary" /> View PDF
                                                </button>
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400" title="Issued Successfully">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {req.notes && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[11px] text-white/50 leading-relaxed italic">
                                            <span className="font-bold not-italic mr-1 text-white/30 uppercase tracking-tighter">Student Note:</span> 
                                            "{req.notes}"
                                        </p>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 border border-white/10">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white/60">No Certificate Requests</h4>
                            <p className="text-white/30 text-sm max-w-xs mx-auto mt-1">Requests from students who completed their courses will appear here.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUploadModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Upload className="text-primary" size={20} /> Issue Certificate
                                        </h3>
                                        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">STUDENT: {selectedRequest?.student_name}</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowUploadModal(false)}
                                        className="p-2 text-white/30 hover:text-white transition-colors"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleFileUpload} className="space-y-6">
                                    <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Applying for Course</p>
                                                <p className="text-sm font-bold text-white">{selectedRequest?.course_title}</p>
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                accept=".pdf"
                                                required
                                                onChange={(e) => setFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                                                file 
                                                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                                                    : 'border-white/10 bg-white/[0.02] group-hover:border-primary/50 group-hover:bg-primary/5'
                                            }`}>
                                                <div className={`p-4 rounded-full transition-colors ${
                                                    file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20 group-hover:bg-primary/20 group-hover:text-primary'
                                                }`}>
                                                    {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white">
                                                        {file ? file.name : 'Select Certificate PDF'}
                                                    </p>
                                                    <p className="text-xs text-white/30 mt-1">Only .pdf files are allowed (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={uploading || !file}
                                            className="flex-[2] py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {uploading ? (
                                                <><Clock className="animate-spin" size={16} /> Uploading...</>
                                            ) : (
                                                <><CheckCircle2 size={16} /> Confirm & Issue</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CertificateRequestsTab;
