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
            <GlassCard className="p-4 sm:p-6 border-white/5">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by student, course, or university..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 min-w-[140px]"
                        >
                            <option value="all" className="bg-[#0B0F1A]">All Statuses</option>
                            <option value="PENDING" className="bg-[#0B0F1A]">Pending</option>
                            <option value="APPROVED" className="bg-[#0B0F1A]">Approved</option>
                            <option value="ISSUED" className="bg-[#0B0F1A]">Issued</option>
                        </select>
                        <select
                            value={universityFilter}
                            onChange={(e) => setUniversityFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 min-w-[180px]"
                        >
                            <option value="all" className="bg-[#0B0F1A]">All Universities</option>
                            {universities.map(uni => (
                                <option key={uni._id} value={uni._id} className="bg-[#0B0F1A]">{uni.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </GlassCard>

            {/* Main Table */}
            <GlassCard className="overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Student & ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Affiliated University</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Course Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Current Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {cert.student_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{cert.student_name}</p>
                                                    <p className="text-[10px] font-mono text-white/20">UUID: {cert.id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-white/5 text-white/40">
                                                    <Building2 size={14} />
                                                </div>
                                                <span className="text-sm text-white/70 font-medium">{cert.university_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white/70 font-bold line-clamp-1">{cert.course_title}</span>
                                                <span className="text-[10px] text-primary/60 font-semibold uppercase tracking-tighter">SkillDad Certified</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                                                cert.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                cert.status === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                cert.status === 'ISSUED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-white/10 text-white/40 border-white/10'
                                            }`}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white/50">{new Date(cert.apply_date).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-white/20 uppercase tracking-tighter">Applied At</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Upload Certificate Button */}
                                                <button 
                                                    onClick={() => { setSelectedCert(cert); setShowUploadModal(true); }}
                                                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                                    title="Upload Official Certificate PDF"
                                                >
                                                    <Upload size={14} /> {cert.status === 'ISSUED' ? 'Re-upload PDF' : 'Upload PDF & Issue'}
                                                </button>

                                                {/* Download if Issued */}
                                                {cert.status === 'ISSUED' && cert.file_url && (
                                                    <button 
                                                        onClick={() => window.open(cert.file_url, '_blank')}
                                                        className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all"
                                                        title="View Issued Certificate"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                )}

                                                {/* Quick Status Toggle */}
                                                <select
                                                    value={cert.status}
                                                    onChange={(e) => handleStatusUpdate(cert.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-primary/50"
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
