import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Briefcase, Building2, MapPin, DollarSign, Clock,
    CheckCircle, Upload, Loader2, ListChecks, Info, AlertCircle,
    Calendar, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const VacancyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vacancy, setVacancy] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vacRes, appRes] = await Promise.all([
                    axios.get(`/api/career/vacancies/${id}`),
                    axios.get('/api/career/my-applications', config),
                ]);
                setVacancy(vacRes.data.vacancy);
                setMyApplications(appRes.data.applications || []);
            } catch (error) {
                console.error('Error fetching vacancy details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const isApplied = myApplications.some(a => a.vacancy_id === id);

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        if (resume) formData.append('resume', resume);
        try {
            await axios.post(`/api/career/vacancies/${id}/apply`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
            });
            setShowApplyModal(false);
            setResume(null);
            setMyApplications(prev => [...prev, { vacancy_id: id }]);
            alert('Application submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!vacancy) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertCircle size={48} className="text-white/20" />
            <p className="text-white/40 text-lg font-semibold">Vacancy not found.</p>
            <ModernButton onClick={() => navigate('/dashboard/placements')}>
                <ArrowLeft size={16} className="mr-2" /> Back to Portal
            </ModernButton>
        </div>
    );

    const typeColor = vacancy.job_type === 'Job'
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

    const requirements = vacancy.requirements
        ? vacancy.requirements.split('\n').filter(r => r.trim())
        : [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/placements')}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Career Portal
            </button>

            {/* Hero Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="!p-0 overflow-hidden border-white/10">
                    {/* Top gradient bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500" />

                    <div className="p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            {/* Company Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Building2 size={32} className="text-primary" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${typeColor}`}>
                                        {vacancy.job_type}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${vacancy.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                        {vacancy.status}
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{vacancy.title}</h1>
                                <p className="text-base text-white/60 font-semibold">{vacancy.company}</p>
                            </div>
                        </div>

                        {/* Apply CTA */}
                        <div className="sm:shrink-0">
                            {isApplied ? (
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold px-5 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <CheckCircle size={18} />
                                    Applied Successfully
                                </div>
                            ) : (
                                <ModernButton
                                    className="!px-8 !py-3 text-sm font-black"
                                    onClick={() => setShowApplyModal(true)}
                                    disabled={vacancy.status !== 'open'}
                                >
                                    Apply Now
                                </ModernButton>
                            )}
                        </div>
                    </div>

                    {/* Info Badges Row */}
                    <div className="px-8 pb-8 flex flex-wrap gap-4">
                        {[
                            { icon: MapPin, label: vacancy.location, color: 'text-primary' },
                            { icon: DollarSign, label: vacancy.salary_range, color: 'text-emerald-400' },
                            { icon: Briefcase, label: vacancy.job_type === 'Job' ? 'Full-Time' : 'Contract/Internship', color: 'text-white/60' },
                            { icon: Calendar, label: `Deadline: ${new Date(vacancy.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`, color: 'text-amber-400' },
                        ].map(({ icon: Icon, label, color }) => label && (
                            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                <Icon size={14} className={color} />
                                <span className="text-sm text-white/70 font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Content Grid */}
            {!vacancy.description && !vacancy.requirements && !vacancy.about_company ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GlassCard className="border-white/10 text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <Info size={24} className="text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm font-semibold mb-1">Full job details not added yet</p>
                        <p className="text-white/20 text-xs">The admin can add a full description, requirements, and company info.</p>
                    </GlassCard>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Main content - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About the Role */}
                        {vacancy.description && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <GlassCard className="border-white/10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                            <Info size={16} className="text-primary" />
                                        </div>
                                        <h2 className="text-base font-black text-white uppercase tracking-widest">About the Role</h2>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                                        {vacancy.description}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Requirements */}
                        {requirements.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <GlassCard className="border-white/10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                            <ListChecks size={16} className="text-purple-400" />
                                        </div>
                                        <h2 className="text-base font-black text-white uppercase tracking-widest">Requirements</h2>
                                    </div>
                                    <ul className="space-y-3">
                                        {requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                {req.replace(/^[-•*]\s*/, '')}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: About Company + Apply CTA - 1/3 */}
                    <div className="space-y-6">
                        {/* About Company */}
                        {vacancy.about_company && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <GlassCard className="border-white/10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                            <Building2 size={16} className="text-emerald-400" />
                                        </div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">About the Company</h2>
                                    </div>
                                    <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
                                        {vacancy.about_company}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Sticky Apply Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <GlassCard className="border-primary/20 bg-primary/5">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Ready to Apply?</h3>
                                <p className="text-xs text-white/40 mb-5 leading-relaxed">
                                    Submit your resume and let the hiring team know you're interested.
                                </p>
                                {isApplied ? (
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold px-4 py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 justify-center">
                                        <CheckCircle size={14} /> Application Submitted
                                    </div>
                                ) : (
                                    <ModernButton
                                        className="w-full !py-3 text-sm font-black"
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={vacancy.status !== 'open'}
                                    >
                                        Apply Now
                                    </ModernButton>
                                )}
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
                                    <Clock size={11} />
                                    Deadline: {new Date(vacancy.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowApplyModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-8 z-10"
                    >
                        <h3 className="text-xl font-black text-white mb-1">Apply for Role</h3>
                        <p className="text-sm text-white/40 mb-6">
                            Applying to <span className="text-primary font-semibold">{vacancy.title}</span> at <span className="text-white/60 font-semibold">{vacancy.company}</span>
                        </p>

                        <form onSubmit={handleApply} className="space-y-5">
                            <div
                                onClick={() => document.getElementById('resume-upload-detail').click()}
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${resume ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'}`}
                            >
                                <input
                                    id="resume-upload-detail"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => setResume(e.target.files[0])}
                                />
                                <Upload size={28} className={`mx-auto mb-3 ${resume ? 'text-primary' : 'text-white/30'}`} />
                                {resume ? (
                                    <>
                                        <p className="text-sm font-bold text-primary">{resume.name}</p>
                                        <p className="text-xs text-white/40 mt-1">{(resume.size / 1024).toFixed(1)} KB - Click to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-white/60">Upload Resume</p>
                                        <p className="text-xs text-white/30 mt-1">PDF, DOC, DOCX - Max 5MB</p>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1 !py-3 font-black" disabled={submitting}>
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" /> Submitting...
                                        </span>
                                    ) : 'Submit Application'}
                                </ModernButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VacancyDetails;
