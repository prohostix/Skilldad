import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Search, 
    Eye, 
    Download, 
    ExternalLink,
    User,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/media';

const UniversityDocumentReview = () => {
    const { showToast } = useToast();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isReviewing, setIsReviewing] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [statusFilter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: { status: statusFilter !== 'all' ? statusFilter : undefined }
            };
            const { data } = await axios.get('/api/documents/university/all', config);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            showToast('Failed to load student documents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status) => {
        if (status === 'rejected' && !rejectionReason) {
            showToast('Please provide a rejection reason', 'warning');
            return;
        }

        try {
            setIsReviewing(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            await axios.put(`/api/documents/${id}/review`, {
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : null
            }, config);

            showToast(`Document ${status} successfully`, 'success');
            setSelectedDoc(null);
            setRejectionReason('');
            fetchDocuments();
        } catch (error) {
            console.error('Error reviewing document:', error);
            showToast(error.response?.data?.message || 'Review failed', 'error');
        } finally {
            setIsReviewing(false);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'submitted': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-white/10 text-white/60 border-white/10';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Student Documents" />
                    <p className="text-white/40 text-sm font-inter">Review and verify documents submitted by your registered students</p>
                </div>
                <div className="flex items-center gap-3">
                    <ModernButton 
                        variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setStatusFilter('all')}
                        className="!px-4 !py-2 text-xs"
                    >
                        All
                    </ModernButton>
                    <ModernButton 
                        variant={statusFilter === 'submitted' ? 'primary' : 'secondary'}
                        onClick={() => setStatusFilter('submitted')}
                        className="!px-4 !py-2 text-xs"
                    >
                        Pending Review
                    </ModernButton>
                </div>
            </div>

            <GlassCard className="!p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by student name or document title..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </GlassCard>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-white/40 text-sm animate-pulse">Loading institution records...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDocs.map((doc) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={doc._id}
                        >
                            <GlassCard className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/30 transition-all group">
                                {/* Document Info */}
                                <div className="flex items-center gap-3.5 min-w-[240px]">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-white font-bold text-sm tracking-tight">{doc.title}</h3>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mt-0.5">{doc.type}</p>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div className="flex items-center gap-3 text-white/70 min-w-[200px]">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary/70 shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{doc.student_name || 'Student'}</p>
                                        <p className="text-[10px] text-white/40 truncate">{doc.student_email}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="hidden lg:flex flex-col text-[11px] text-white/50 min-w-[140px]">
                                    <div className="flex items-center gap-1.5 font-mono">
                                        <Calendar size={12} className="text-emerald-400/70" />
                                        <span>Submitted {new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Status Badge & Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${getStatusStyle(doc.status)}`}>
                                        {doc.status}
                                    </span>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <ModernButton 
                                            variant="secondary" 
                                            className="!py-2 !px-3 text-[11px] font-bold"
                                            onClick={() => setSelectedDoc(doc)}
                                        >
                                            <Eye size={14} className="mr-1.5" /> Review
                                        </ModernButton>
                                        {doc.file_url && (
                                            <a 
                                                href={getMediaUrl(doc.file_url)} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                download
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                                title="Download Document"
                                            >
                                                <Download size={15} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}

                    {filteredDocs.length === 0 && (
                        <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                                <FileText size={28} className="text-white/20" />
                            </div>
                            <h3 className="text-white/60 font-bold">No documents pending review</h3>
                            <p className="text-white/20 text-xs mt-1">All student submissions are up to date</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedDoc && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDoc(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="flex flex-col lg:flex-row h-[85vh]">
                                <div className="flex-1 bg-black/40 relative group">
                                    <iframe 
                                        src={getMediaUrl(selectedDoc.file_url)} 
                                        className="w-full h-full border-none"
                                        title="Document Preview"
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={getMediaUrl(selectedDoc.file_url)} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center shadow-xl shadow-primary/20"
                                        >
                                            <ExternalLink size={14} className="mr-2" /> Open In New Tab
                                        </a>
                                    </div>
                                </div>

                                <div className="w-full lg:w-80 p-8 flex flex-col bg-slate-900 border-l border-white/10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">{selectedDoc.type}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedDoc(null)}
                                            className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                                        >
                                            <XCircle size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Student Details</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                                                    {selectedDoc.student_name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{selectedDoc.student_name}</p>
                                                    <p className="text-[10px] text-white/40 truncate">{selectedDoc.student_email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Rejection Reason</label>
                                            <textarea 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-rose-500 transition-all resize-none h-32"
                                                placeholder="Please explain why the document is being rejected..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 mt-6 border-t border-white/5 space-y-3">
                                        <ModernButton 
                                            onClick={() => handleReview(selectedDoc._id, 'approved')}
                                            disabled={isReviewing}
                                            className="w-full !bg-emerald-600 hover:!bg-emerald-500 !py-3"
                                        >
                                            <CheckCircle size={18} className="mr-2" /> APPROVE
                                        </ModernButton>
                                        <ModernButton 
                                            variant="danger"
                                            onClick={() => handleReview(selectedDoc._id, 'rejected')}
                                            disabled={isReviewing}
                                            className="w-full !py-3"
                                        >
                                            <XCircle size={18} className="mr-2" /> REJECT
                                        </ModernButton>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UniversityDocumentReview;
