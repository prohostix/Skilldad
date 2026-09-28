import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Edit2, Trash2, X, Briefcase, MapPin, Link as LinkIcon, Star, Save,
    Upload, Image as ImageIcon, Loader2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { getMediaUrl } from '../../utils/media';

const EMPTY_JOB = {
    id: '', title: '', company: '', logo: '', location: '', type: 'Full-time',
    description: '', applyLink: '', postedDate: '', deadline: '', featured: false
};

const getAuthConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
};

const JobAlertsManager = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [hero, setHero] = useState({ title: '', subtitle: '' });
    const [jobs, setJobs] = useState([]);
    const [savingHero, setSavingHero] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [form, setForm] = useState(EMPTY_JOB);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingLogo(true);
        try {
            const config = {
                ...getAuthConfig(),
                headers: {
                    ...getAuthConfig().headers,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const { data } = await axios.post('/api/upload/media', formData, config);
            const url = data?.url || data?.filePath;
            if (url) {
                setForm(prev => ({ ...prev, logo: url }));
                showToast('Company logo uploaded successfully!', 'success');
            } else {
                showToast('Upload returned invalid response', 'error');
            }
        } catch (err) {
            console.error('Failed to upload logo:', err);
            showToast(err.response?.data?.message || 'Failed to upload company logo', 'error');
        } finally {
            setUploadingLogo(false);
        }
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/public/cms/job_alerts');
            setHero(data?.hero || { title: 'Job Alerts', subtitle: '' });
            setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        } catch {
            showToast('Failed to load job alerts content', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const saveHero = async () => {
        setSavingHero(true);
        try {
            await axios.put('/api/admin/cms/job_alerts/hero', { content: hero }, getAuthConfig());
            showToast('Header updated', 'success');
        } catch {
            showToast('Failed to save header', 'error');
        } finally {
            setSavingHero(false);
        }
    };

    const saveJobs = async (updatedJobs) => {
        try {
            await axios.put('/api/admin/cms/job_alerts/jobs', { content: updatedJobs }, getAuthConfig());
            setJobs(updatedJobs);
            return true;
        } catch {
            showToast('Failed to save job alert', 'error');
            return false;
        }
    };

    const openAddModal = () => {
        setForm({ ...EMPTY_JOB, postedDate: new Date().toISOString().slice(0, 10) });
        setEditingIndex(null);
        setModalOpen(true);
    };

    const openEditModal = (job, index) => {
        setForm({ ...EMPTY_JOB, ...job });
        setEditingIndex(index);
        setModalOpen(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm('Delete this job alert?')) return;
        const updated = jobs.filter((_, i) => i !== index);
        const ok = await saveJobs(updated);
        if (ok) showToast('Job alert deleted', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.company.trim()) {
            showToast('Title and company are required', 'error');
            return;
        }
        setSaving(true);
        const entry = { ...form, id: form.id || `job_${Date.now()}` };
        const updated = editingIndex !== null
            ? jobs.map((j, i) => (i === editingIndex ? entry : j))
            : [...jobs, entry];
        const ok = await saveJobs(updated);
        setSaving(false);
        if (ok) {
            showToast(editingIndex !== null ? 'Job alert updated' : 'Job alert added', 'success');
            setModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <DashboardHeading title="Job Alerts" />
                <ModernButton onClick={openAddModal} className="!py-2.5 !px-5 flex items-center gap-2">
                    <Plus size={16} /> Add Job Alert
                </ModernButton>
            </div>

            {/* Header content editor */}
            <GlassCard className="p-5">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Page Header</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Title</label>
                        <input
                            value={hero.title}
                            onChange={e => setHero({ ...hero, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Subtitle</label>
                        <input
                            value={hero.subtitle}
                            onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                        />
                    </div>
                </div>
                <ModernButton onClick={saveHero} disabled={savingHero} className="!py-2 !px-4 mt-4 flex items-center gap-1.5 text-sm">
                    <Save size={14} /> {savingHero ? 'Saving...' : 'Save Header'}
                </ModernButton>
            </GlassCard>

            {/* Job list */}
            <div className="space-y-3">
                {jobs.length === 0 ? (
                    <GlassCard className="p-10 text-center text-white/40 text-sm">
                        No job alerts yet. Click "Add Job Alert" to publish the first one.
                    </GlassCard>
                ) : (
                    jobs.map((job, index) => (
                        <GlassCard key={job.id || index} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* Company Logo or Initials Avatar */}
                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white/80 overflow-hidden shrink-0 shadow-2xs">
                                    {job.logo ? (
                                        <img
                                            src={job.logo.startsWith('http') ? job.logo : getMediaUrl(job.logo)}
                                            alt={job.company}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <span className="text-white/40">
                                            {(job.company || '?').slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-white text-sm truncate">{job.title}</h4>
                                        {job.featured && <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-white/50">
                                        <span className="text-white/80 font-medium">{job.company}</span>
                                        {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                                        {job.type && <span className="flex items-center gap-1"><Briefcase size={11} />{job.type}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => openEditModal(job, index)}
                                    className="p-2 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-lg transition-all"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
                    <GlassCard className="w-full max-w-lg p-6 sm:p-8 border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h4 className="text-lg font-bold text-white">{editingIndex !== null ? 'Edit Job Alert' : 'Add Job Alert'}</h4>
                            <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Company Logo Upload & Preview Field */}
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                                        Company Logo (Image or URL)
                                    </label>
                                    {form.logo && (
                                        <button
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, logo: '' }))}
                                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <Trash2 size={11} /> Remove Logo
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Preview box */}
                                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm text-white/80 overflow-hidden shrink-0 shadow-2xs">
                                        {form.logo ? (
                                            <img
                                                src={form.logo.startsWith('http') ? form.logo : getMediaUrl(form.logo)}
                                                alt="Company logo preview"
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-white/30 text-[10px] font-semibold text-center p-1">
                                                <ImageIcon size={16} className="mb-0.5 opacity-60" />
                                                <span>No Logo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload and URL inputs */}
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary hover:text-white text-xs font-bold transition-all cursor-pointer border border-primary/30 shadow-2xs">
                                                {uploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                                                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleLogoUpload}
                                                    disabled={uploadingLogo}
                                                />
                                            </label>
                                            <span className="text-[10px] text-white/40">PNG, JPG, SVG, WebP</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={form.logo || ''}
                                            onChange={e => setForm(prev => ({ ...prev, logo: e.target.value }))}
                                            placeholder="Or paste image URL (e.g. /uploads/logo.png)"
                                            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-primary/50 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Job Title *</label>
                                    <input
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Company *</label>
                                    <input
                                        required
                                        value={form.company}
                                        onChange={e => setForm({ ...form, company: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Location</label>
                                    <input
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                        placeholder="e.g. Remote, Bengaluru"
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Job Type</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    >
                                        <option className="bg-slate-900" value="Full-time">Full-time</option>
                                        <option className="bg-slate-900" value="Internship">Internship</option>
                                        <option className="bg-slate-900" value="Remote">Remote</option>
                                        <option className="bg-slate-900" value="Contract">Contract</option>
                                        <option className="bg-slate-900" value="Part-time">Part-time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Posted Date</label>
                                    <input
                                        type="date"
                                        value={form.postedDate}
                                        onChange={e => setForm({ ...form, postedDate: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Application Deadline</label>
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={e => setForm({ ...form, deadline: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Apply Link</label>
                                <div className="relative">
                                    <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        value={form.applyLink}
                                        onChange={e => setForm({ ...form, applyLink: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50 font-mono"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer w-fit">
                                <input
                                    type="checkbox"
                                    checked={!!form.featured}
                                    onChange={e => setForm({ ...form, featured: e.target.checked })}
                                    className="accent-primary w-4 h-4"
                                />
                                <span className="text-sm text-white/70">Mark as Featured</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <ModernButton type="button" variant="secondary" className="flex-1 border border-white/10" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </ModernButton>
                                <ModernButton type="submit" className="flex-1" disabled={saving}>
                                    {saving ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Job Alert'}
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default JobAlertsManager;
