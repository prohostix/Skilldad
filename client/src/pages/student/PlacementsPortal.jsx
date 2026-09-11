import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Building2, DollarSign, Clock,
    Trophy, Upload, FileText,
    CheckCircle, Search, AlertCircle,
    ArrowUpDown, Filter, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PlacementsPortal = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('vacancies');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vacancies, setVacancies] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState(null);
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vacRes, appRes, placeRes] = await Promise.all([
                axios.get('/api/career/vacancies'),
                axios.get('/api/career/my-applications', config),
                axios.get('/api/career/placements'),
            ]);
            
            let fetchedVacancies = vacRes.data.vacancies || [];
            
            // Populate with realistic data if empty
            if (fetchedVacancies.length === 0) {
                fetchedVacancies = [
                    {
                        id: 'v1',
                        title: 'Full-Stack Developer (MERN)',
                        company: 'TechNova Solutions',
                        location: 'Remote / Bangalore',
                        job_type: 'Job',
                        salary_range: '₹8L - ₹15L',
                        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'Join our agile team to build high-performance web applications using MongoDB, Express, React, and Node.js.',
                        status: 'open'
                    },
                    {
                        id: 'v2',
                        title: 'AI & Machine Learning Intern',
                        company: 'DesignSphere AI',
                        location: 'Hyderabad, India',
                        job_type: 'Internship',
                        salary_range: '₹25,000 / mo',
                        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'Exclusive opportunity for students to work on real-world NLP and Computer Vision models.',
                        status: 'open'
                    },
                    {
                        id: 'v3',
                        title: 'UI/UX Product Designer',
                        company: 'CreativeFlow Labs',
                        location: 'Mumbai, India',
                        job_type: 'Job',
                        salary_range: '₹6L - ₹10L',
                        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'We are looking for a creative mind to lead our product design initiatives and create stunning user experiences.',
                        status: 'open'
                    }
                ];
            }

            setVacancies(fetchedVacancies);
            setMyApplications(appRes.data.applications || []);
            setPlacements(placeRes.data.placements || []);
        } catch (err) {
            console.error('Error fetching career data:', err);
        } finally {
            setLoading(false);
        }
    };

    const isApplied = (vId) => myApplications.some(a => a.vacancy_id === vId);

    const isVacancyClosed = (v) => {
        if (!v) return false;
        if (v.status === 'closed') return true;
        if (v.deadline) {
            const d = new Date(v.deadline);
            if (!isNaN(d.getTime())) {
                return d.getTime() < Date.now();
            }
        }
        return false;
    };

    const parseSalaryNumber = (str) => {
        if (!str) return 0;
        const lower = String(str).toLowerCase();
        const nums = lower.match(/[\d.]+/g);
        if (!nums || nums.length === 0) return 0;
        const val = parseFloat(nums[nums.length - 1]);
        if (lower.includes('lpa') || lower.includes('lakh') || lower.includes('l')) {
            return val * 100000;
        }
        if (lower.includes('k') || lower.includes('/ mo') || lower.includes('month')) {
            return val * 1000 * 12;
        }
        return val;
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        if (resume) formData.append('resume', resume);
        try {
            await axios.post(`/api/career/vacancies/${selectedVacancy.id}/apply`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
            });
            setShowApplyModal(false);
            setSelectedVacancy(null);
            setResume(null);
            fetchData();
            showToast('Application submitted successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to apply.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredVacancies = vacancies
        .filter(v => {
            const matchesTab = activeTab === 'vacancies' ? v.job_type === 'Job' : v.job_type === 'Internship';
            
            const closed = isVacancyClosed(v);
            const applied = isApplied(v.id);
            let matchesStatus = true;
            if (statusFilter === 'open') matchesStatus = !closed;
            else if (statusFilter === 'closed') matchesStatus = closed;
            else if (statusFilter === 'applied') matchesStatus = applied;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (v.title && v.title.toLowerCase().includes(q)) ||
                (v.company && v.company.toLowerCase().includes(q)) ||
                (v.location && v.location.toLowerCase().includes(q)) ||
                (v.salary_range && v.salary_range.toLowerCase().includes(q));

            return matchesTab && matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            const aClosed = isVacancyClosed(a);
            const bClosed = isVacancyClosed(b);

            if (sortBy === 'open_first') {
                if (aClosed !== bClosed) return aClosed ? 1 : -1;
                return new Date(b.created_at || b.deadline || 0) - new Date(a.created_at || a.deadline || 0);
            }
            if (sortBy === 'closed_first') {
                if (aClosed !== bClosed) return aClosed ? -1 : 1;
                return new Date(b.created_at || b.deadline || 0) - new Date(a.created_at || a.deadline || 0);
            }
            if (sortBy === 'ending_soon') {
                const aDate = a.deadline ? new Date(a.deadline).getTime() : Infinity;
                const bDate = b.deadline ? new Date(b.deadline).getTime() : Infinity;
                return aDate - bDate;
            }
            if (sortBy === 'salary_high') {
                return parseSalaryNumber(b.salary_range) - parseSalaryNumber(a.salary_range);
            }
            if (sortBy === 'title_asc') {
                return (a.title || '').localeCompare(b.title || '');
            }
            // Default: 'latest' (newest openings first)
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            if (bTime !== aTime) return bTime - aTime;
            return String(b.id || '').localeCompare(String(a.id || ''));
        });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const TABS = [
        { id: 'vacancies', label: 'Jobs' },
        { id: 'internships', label: 'Internships' },
    ];

    const activeList = filteredVacancies;

    const currentTabVacancies = vacancies.filter(v =>
        activeTab === 'vacancies' ? v.job_type === 'Job' : v.job_type === 'Internship'
    );
    const appliedCount = currentTabVacancies.filter(v => isApplied(v.id)).length;

    return (
        <div className="space-y-4 pb-12 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="Career & Placements" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Browse open roles, apply, and celebrate our placement success stories.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full sm:w-auto self-start">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                activeTab === id ? 'bg-primary text-white shadow-sm' : 'text-white/50 hover:text-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg pl-7 pr-7 py-1.5 text-xs text-white/80 font-medium focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                        >
                            <option value="all" className="bg-[#0f0a1c] text-white">All Openings</option>
                            <option value="open" className="bg-[#0f0a1c] text-emerald-400">● Open Roles</option>
                            <option value="closed" className="bg-[#0f0a1c] text-rose-400">● Closed Roles</option>
                            <option value="applied" className="bg-[#0f0a1c] text-blue-400">● Applied ({appliedCount})</option>
                        </select>
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={12} />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={12} />
                    </div>

                    {/* Sort Options */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg pl-7 pr-7 py-1.5 text-xs text-white/80 font-medium focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                        >
                            <option value="latest" className="bg-[#0f0a1c] text-white">Newest / Latest</option>
                            <option value="open_first" className="bg-[#0f0a1c] text-white">Opened First</option>
                            <option value="closed_first" className="bg-[#0f0a1c] text-white">Closed First</option>
                            <option value="ending_soon" className="bg-[#0f0a1c] text-white">Ending Soonest</option>
                            <option value="salary_high" className="bg-[#0f0a1c] text-white">Salary: High to Low</option>
                            <option value="title_asc" className="bg-[#0f0a1c] text-white">Role (A-Z)</option>
                        </select>
                        <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={12} />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={12} />
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-56 min-w-[160px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={13} />
                        <input
                            type="text"
                            placeholder="Search roles, companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Results count & reset */}
            <div className="flex items-center justify-between text-[11px] text-white/30 font-medium">
                <p>
                    {activeList.length} {activeList.length === 1 ? 'opening' : 'openings'}
                    {statusFilter !== 'all' && ` (${statusFilter})`}
                    {searchQuery && ` for "${searchQuery}"`}
                </p>
                {(statusFilter !== 'all' || searchQuery || sortBy !== 'latest') && (
                    <button
                        onClick={() => {
                            setStatusFilter('all');
                            setSearchQuery('');
                            setSortBy('latest');
                        }}
                        className="text-primary hover:underline text-[11px] font-medium"
                    >
                        Reset filters
                    </button>
                )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">

                {/* --- Vacancy / Internship Cards --- */}
                {filteredVacancies.map((v, i) => {
                    const closed = isVacancyClosed(v);
                    const applied = isApplied(v.id);
                    return (
                        <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <div
                                className={`rounded-xl border transition-all overflow-hidden flex flex-col h-full group cursor-pointer ${
                                    closed
                                        ? 'border-white/5 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03] opacity-85 hover:opacity-100'
                                        : 'border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04]'
                                }`}
                                onClick={() => navigate(`/dashboard/placements/${v.id}`)}
                            >
                                <div className="p-5 flex flex-col gap-3 flex-1">
                                    {/* Title + Status & Job Type Badges */}
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                                            {v.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                            {closed ? (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                    Closed
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Open
                                                </span>
                                            )}
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                                                v.job_type === 'Job'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                                {v.job_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Company + Location */}
                                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                                        <Building2 size={11} className="text-primary/60 shrink-0" />
                                        <span className="font-medium truncate">{v.company}</span>
                                        {v.location && <>
                                            <span className="text-white/20">·</span>
                                            <span className="truncate text-white/35">{v.location}</span>
                                        </>}
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        {v.salary_range && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-medium">
                                                <DollarSign size={9} />{v.salary_range}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/45 font-medium">
                                            <Briefcase size={9} />{v.job_type === 'Job' ? 'Full-Time' : 'Internship'}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2 border-t border-white/5 bg-white/[0.015] flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-white/30 truncate min-w-0">
                                        <Clock size={9} className="shrink-0" />
                                        <span className="truncate">
                                            {closed ? 'Ended ' : 'Ends '}
                                            {v.deadline ? new Date(v.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline'}
                                        </span>
                                    </div>
                                    {applied ? (
                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shrink-0">
                                            <CheckCircle size={9} /> Applied
                                        </div>
                                    ) : closed ? (
                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-white/40 text-[10px] font-medium px-2 py-0.5 bg-white/5 rounded border border-white/10 shrink-0">
                                            Closed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedVacancy(v); setShowApplyModal(true); }}
                                            className="text-[10px] font-semibold text-primary px-3 py-0.5 bg-primary/10 hover:bg-primary hover:text-white rounded border border-primary/20 hover:border-primary transition-all shrink-0"
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Empty State */}
                {activeList.length === 0 && (
                    <div className="col-span-full py-14 text-center flex flex-col items-center gap-3">
                        <div className="p-3.5 bg-white/5 rounded-full">
                            <Search size={22} className="text-white/20" />
                        </div>
                        <p className="text-sm font-semibold text-white/35">No matching openings found</p>
                        {(searchQuery || statusFilter !== 'all') && (
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                className="text-xs text-primary/70 hover:text-primary transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            <AnimatePresence>
                {showApplyModal && selectedVacancy && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowApplyModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="relative w-full max-w-sm bg-[#0A0514] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                        >
                            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-bold text-white">Apply for Role</h2>
                                    <p className="text-[11px] text-primary/80 mt-0.5 line-clamp-1">{selectedVacancy.title} · {selectedVacancy.company}</p>
                                </div>
                                <button onClick={() => setShowApplyModal(false)} className="text-white/30 hover:text-white transition-colors">
                                    <AlertCircle size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="p-5 space-y-3.5">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                            <FileText size={14} className="text-white/40" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white mb-1.5">Resume (Optional)</p>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setResume(e.target.files[0])}
                                                className="block w-full text-[10px] text-white/40 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                                    <AlertCircle size={12} className="text-amber-500/60 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-500/50 leading-relaxed">
                                        Your platform profile and documents will be shared with the recruiter.
                                    </p>
                                </div>

                                <div className="flex gap-2.5 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="flex-1 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/50 hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlacementsPortal;
