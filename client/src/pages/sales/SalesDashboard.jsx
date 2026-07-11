import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Link2, 
    Copy, 
    Check, 
    Upload, 
    Plus, 
    GraduationCap, 
    DollarSign, 
    BookOpen, 
    FileText, 
    Users, 
    CheckCircle, 
    Clock, 
    ExternalLink 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const SalesDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Form states
    const [universityName, setUniversityName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [feeAmount, setFeeAmount] = useState('');
    const [universityLogo, setUniversityLogo] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const { showToast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [appRes, courseRes] = await Promise.all([
                axios.get('/api/sales/applications', config),
                axios.get('/api/courses', config)
            ]);
            setApplications(appRes.data);
            setCourses(courseRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            setUploadingLogo(true);
            const { data } = await axios.post('/api/sales/upload-logo', formData, {
                headers: {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUniversityLogo(data.imageUrl);
            showToast('Logo uploaded successfully!', 'success');
        } catch (error) {
            console.error('Logo upload error:', error);
            showToast('Failed to upload logo', 'error');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleCreateConfig = async (e) => {
        e.preventDefault();
        if (!universityName || !courseName || !feeAmount) {
            showToast('Please fill out all required fields', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                universityName,
                courseName,
                feeAmount: parseFloat(feeAmount),
                universityLogo
            };
            const { data } = await axios.post('/api/sales/applications', payload, config);
            setApplications([data, ...applications]);
            showToast('Application configuration generated successfully!', 'success');
            
            // Reset form
            setUniversityName('');
            setCourseName('');
            setFeeAmount('');
            setUniversityLogo('');
        } catch (error) {
            console.error('Error creating application config:', error);
            showToast(error.response?.data?.message || 'Failed to generate link', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (id) => {
        const url = `${window.location.origin}/apply/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            showToast('Application link copied to clipboard!', 'success');
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <DashboardHeading title="Sales Link Generator" />
                <p className="text-white/60 text-sm mt-1">Configure admission links and track student payment conversions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <GlassCard className="p-6 lg:col-span-1 h-fit">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="text-primary" size={20} />
                        Configure New Link
                    </h2>
                    <form onSubmit={handleCreateConfig} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-2">University Name *</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Stanford University"
                                    value={universityName}
                                    onChange={(e) => setUniversityName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-2">Course Preferred *</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Executive MBA / B.Tech CSE"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                    list="courses-list"
                                    required
                                />
                                <datalist id="courses-list">
                                    {courses.map(c => <option key={c.id} value={c.title} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-2">Fee Paying Amount (INR) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="number"
                                    placeholder="e.g. 50000"
                                    value={feeAmount}
                                    onChange={(e) => setFeeAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-2">University Logo</label>
                            <div className="flex gap-4 items-center">
                                {universityLogo ? (
                                    <div className="w-16 h-16 rounded-xl bg-white/10 p-1 border border-white/10 relative overflow-hidden flex items-center justify-center">
                                        <img src={universityLogo} alt="Preview" className="w-full h-full object-contain" />
                                        <button 
                                            type="button" 
                                            onClick={() => setUniversityLogo('')}
                                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-xs text-red-400 font-bold transition-opacity"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-16 h-16 rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                        <Upload className="text-white/40" size={20} />
                                        <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                    </label>
                                )}
                                <div className="flex-1 text-xs text-white/40">
                                    {uploadingLogo ? 'Uploading...' : 'Upload logo image to customize the student form header.'}
                                </div>
                            </div>
                        </div>

                        <ModernButton type="submit" disabled={submitting} className="w-full mt-4">
                            {submitting ? 'Generating...' : 'Generate Application Link'}
                        </ModernButton>
                    </form>
                </GlassCard>

                {/* Applications Monitoring List */}
                <GlassCard className="p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="text-primary" size={20} />
                            Generated Links & Submissions
                        </span>
                        <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full text-white/70">
                            Total: {applications.length}
                        </span>
                    </h2>

                    {applications.length === 0 ? (
                        <div className="text-center py-20 text-white/40">
                            <Link2 className="mx-auto mb-4 opacity-30" size={48} />
                            <p className="text-sm">No configurations generated yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                            {applications.map((app) => (
                                <div key={app.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/20 transition-all flex flex-col gap-3">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="flex gap-3 items-center">
                                            {app.university_logo ? (
                                                <div className="w-10 h-10 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                                                    <img src={app.university_logo} alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                    {app.university_name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{app.university_name}</h3>
                                                <p className="text-xs text-white/60">{app.course_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-sm font-bold text-primary">₹{parseFloat(app.fee_amount).toLocaleString()}</div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                app.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Student details if applied */}
                                    {app.student_name && (
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-white/70 grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                            <div>
                                                <span className="font-bold text-white/50">Student:</span> {app.student_name}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white/50">Father's Name:</span> {app.father_name}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white/50">DOB:</span> {app.student_dob || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white/50">Email:</span> {app.student_email}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white/50">Phone:</span> {app.student_phone}
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-bold text-white/50">Address:</span> {app.student_address}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Links */}
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-xs">
                                        <span className="text-white/40">Created: {new Date(app.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(app.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                            >
                                                {copiedId === app.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                {copiedId === app.id ? 'Copied' : 'Copy Link'}
                                            </button>
                                            <a 
                                                href={`/apply/${app.id}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                View Form
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default SalesDashboard;
