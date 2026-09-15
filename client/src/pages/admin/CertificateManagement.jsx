import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Search, Filter, CheckCircle2, AlertCircle, 
    Download, Clock, GraduationCap, Building2, BookOpen,
    ArrowUpRight, Users, ChevronRight, MoreHorizontal,
    FileText, ShieldCheck, Upload, X, XCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const CertificateManagement = () => {
    const { showToast } = useToast();
    const [certificates, setCertificates] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [universityFilter, setUniversityFilter] = useState('all');
    const [selectedCert, setSelectedCert] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    const handleStatusUpdate = async (id, status, notes = '') => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/certificates/${id}/status`, { status, notes }, config);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update certificate status', 'error');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedCert) return;

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
            await axios.post(`/api/certificates/${selectedCert.id}/upload`, formData, config);
            showToast('Certificate uploaded and ISSUED to student successfully!', 'success');
            setShowUploadModal(false);
            setFile(null);
            setSelectedCert(null);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to upload certificate PDF', 'error');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const [certRes, uniRes] = await Promise.all([
                axios.get('/api/certificates/admin/all', config),
                axios.get('/api/admin/universities', config).catch(() => ({ data: [] }))
            ]);
            
            setCertificates(certRes.data);
            setUniversities(uniRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin certificate data:', error);
            setLoading(false);
        }
    };

    const stats = {
        total: certificates.length,
        issued: certificates.filter(c => c.status === 'ISSUED').length,
        pending: certificates.filter(c => c.status === 'PENDING').length,
        approved: certificates.filter(c => c.status === 'APPROVED').length,
    };

    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = 
            cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.university_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
        const matchesUni = universityFilter === 'all' || cert.university_id === universityFilter;
        return matchesSearch && matchesStatus && matchesUni;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Initializing Registry...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <DashboardHeading title="Certificate Management" />
                    <p className="text-white/50 text-sm mt-1">Platform-wide overview of all graduation and certification activities.</p>
                </div>
                <div className="flex gap-3">
                    <ModernButton variant="secondary" onClick={fetchData}>
                        <ArrowUpRight size={18} className="mr-2" /> Refresh Data
                    </ModernButton>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Total Applications', val: stats.total, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    { label: 'Issued Success', val: stats.issued, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Pending Review', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Uni Approved', val: stats.approved, icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' }
                ].map((stat, i) => (
                    <GlassCard key={i} className={`p-5 transition-all hover:scale-[1.02] border-b-2 ${stat.border}`}>
                        <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                                <stat.icon size={22} />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.val}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Filters & Control Bar */}
            <div className="bg-white/90 dark:bg-[#0E0B1A]/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by student, course, or university..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-inter text-slate-700 dark:text-white/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                    >
                        <option value="all" className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">All Statuses</option>
                        <option value="PENDING" className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">Pending</option>
                        <option value="APPROVED" className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">Approved</option>
                        <option value="ISSUED" className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">Issued</option>
                    </select>
                    <select
                        value={universityFilter}
                        onChange={(e) => setUniversityFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-inter text-slate-700 dark:text-white/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer max-w-[160px] truncate"
                    >
                        <option value="all" className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">All Universities</option>
                        {universities.map(uni => (
                            <option key={uni._id} value={uni._id} className="bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">{uni.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <GlassCard className="overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm !p-0">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-white/50 uppercase tracking-wider">Student & ID</th>
                                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-white/50 uppercase tracking-wider">Affiliated University</th>
                                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-white/50 uppercase tracking-wider">Course Name</th>
                                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-white/50 uppercase tracking-wider">Current Status</th>
                                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-white/50 uppercase tracking-wider">Date</th>
                                <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-white/50 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                            <AnimatePresence mode="popLayout">
                                {filteredCertificates.map((cert) => (
                                    <motion.tr 
                                        key={cert.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                    {cert.student_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">{cert.student_name}</p>
                                                    <p className="text-[10px] font-mono text-white/30">ID: {cert.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center gap-1.5 text-xs text-white/70">
                                                <Building2 size={13} className="text-white/40 shrink-0" />
                                                <span className="truncate max-w-[150px]">{cert.university_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-white/80 font-medium truncate max-w-[160px]">{cert.course_title}</span>
                                                <span className="text-[9px] text-primary/70 font-semibold uppercase">SkillDad Certified</span>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                cert.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                                                cert.status === 'APPROVED' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' :
                                                cert.status === 'ISSUED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                                                'bg-white/10 text-white/40 border-white/10'
                                            }`}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex flex-col text-[11px] text-white/60">
                                                <span>{new Date(cert.apply_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Upload Certificate Button */}
                                                <button 
                                                    onClick={() => { setSelectedCert(cert); setShowUploadModal(true); }}
                                                    className="px-2 py-1 bg-primary/15 hover:bg-primary text-primary hover:text-white border border-primary/25 rounded text-[11px] font-semibold transition-all flex items-center gap-1"
                                                    title="Upload Official Certificate PDF"
                                                >
                                                    <Upload size={12} /> {cert.status === 'ISSUED' ? 'Re-upload' : 'Upload & Issue'}
                                                </button>

                                                {/* Download if Issued */}
                                                {cert.status === 'ISSUED' && cert.file_url && (
                                                    <button 
                                                        onClick={() => window.open(cert.file_url, '_blank')}
                                                        className="p-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded transition-all"
                                                        title="View Issued Certificate"
                                                    >
                                                        <Download size={13} />
                                                    </button>
                                                )}

                                                {/* Quick Status Toggle */}
                                                <select
                                                    value={cert.status}
                                                    onChange={(e) => handleStatusUpdate(cert.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white/80 focus:outline-none focus:border-primary/50"
                                                >
                                                    <option value="PENDING" className="bg-[#0B0F1A]">PENDING</option>
                                                    <option value="APPROVED" className="bg-[#0B0F1A]">APPROVED</option>
                                                    <option value="ISSUED" className="bg-[#0B0F1A]">ISSUED</option>
                                                    <option value="REJECTED" className="bg-[#0B0F1A]">REJECTED</option>
                                                </select>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredCertificates.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10 border border-white/10 mb-6">
                                <Trophy size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-white/60">No Certificates Found</h3>
                            <p className="text-white/30 text-sm max-w-sm mt-1">Adjust your filters or search terms to find specific records.</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Upload Certificate Modal */}
            {showUploadModal && selectedCert && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#141418] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
                            <div>
                                <h3 className="text-base font-bold text-white">Upload Certificate PDF</h3>
                                <p className="text-xs text-white/40 mt-0.5">For {selectedCert.student_name} • {selectedCert.course_title}</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="text-white/40 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-white/[0.01]">
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    required
                                    className="hidden"
                                    id="cert-file-input"
                                />
                                <label htmlFor="cert-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Upload size={22} />
                                    </div>
                                    {file ? (
                                        <div>
                                            <p className="text-xs font-bold text-white">{file.name}</p>
                                            <p className="text-[10px] text-white/40 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-bold text-white">Click to select Certificate PDF</p>
                                            <p className="text-[10px] text-white/40 mt-0.5">PDF, PNG or JPG (Max 20MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <ModernButton
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="flex-1 !py-2.5 text-xs font-bold"
                                >
                                    {uploading ? 'Issuing...' : 'Upload & Issue'}
                                </ModernButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CertificateManagement;
