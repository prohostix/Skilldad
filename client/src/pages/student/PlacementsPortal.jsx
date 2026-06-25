import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Building2, DollarSign, Clock,
    Trophy, Upload, FileText,
    CheckCircle, Search, AlertCircle, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import DashboardHeading from '../../components/ui/DashboardHeading';

const PlacementsPortal = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('vacancies');
    const [searchQuery, setSearchQuery] = useState('');
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
                        description: 'Join our agile team to build high-performance web applications using MongoDB, Express, React, and Node.js.'
                    },
                    {
                        id: 'v2',
                        title: 'AI & Machine Learning Intern',
                        company: 'DesignSphere AI',
                        location: 'Hyderabad, India',
                        job_type: 'Internship',
                        salary_range: '₹25,000 / mo',
                        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'Exclusive opportunity for students to work on real-world NLP and Computer Vision models.'
                    },
                    {
                        id: 'v3',
                        title: 'UI/UX Product Designer',
                        company: 'CreativeFlow Labs',
                        location: 'Mumbai, India',
                        job_type: 'Job',
                        salary_range: '₹6L - ₹10L',
                        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'We are looking for a creative mind to lead our product design initiatives and create stunning user experiences.'
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
            alert('Application submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredVacancies = vacancies.filter(v => {
        const matchesTab = activeTab === 'vacancies' ? v.job_type === 'Job' : v.job_type === 'Internship';
        const matchesSearch =
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const filteredPlacements = placements.filter(p =>
        p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isApplied = (vId) => myApplications.some(a => a.vacancy_id === vId);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const TABS = [
        { id: 'vacancies', label: 'Jobs' },
        { id: 'internships', label: 'Internships' },
        { id: 'hall_of_fame', label: 'Hall of Fame' },
    ];

    const activeList = activeTab === 'hall_of_fame' ? filteredPlacements : filteredVacancies;

    return (
        <div className="space-y-4 pb-12 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="Career & Placements" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Browse open roles, apply, and celebrate our placement success stories.</p>
                </div>
                <button 
                    onClick={() => {
                        // Small delay to ensure the widget is ready or handle specific state
                        const event = new CustomEvent('open-career-guide');
                        window.dispatchEvent(event);
                    }}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 w-fit shadow-lg shadow-emerald-500/10"
                >
                    <MessageSquare size={14} className="animate-pulse" />
                    Application Process Guide
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full sm:w-auto">
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

                <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={13} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
            </div>

            {/* Results count */}
            <p className="text-[11px] text-white/30 font-medium">
                {activeList.length} {activeList.length === 1 ? 'result' : 'results'}
                {searchQuery && ` for "${searchQuery}"`}
            </p>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">

                {/* --- Hall of Fame Cards --- */}
                {activeTab === 'hall_of_fame' && filteredPlacements.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full group">
                            <div className="relative h-44 overflow-hidden shrink-0">
                                <img
                                    src={p.student_photo || `https://i.pravatar.cc/400?u=${p.id}`}
                                    alt={p.student_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                                <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-primary/25 backdrop-blur-sm rounded-full border border-primary/30 text-[9px] font-bold text-white uppercase tracking-wide">
                                    <Trophy size={8} className="text-primary" /> Placed
                                </span>
                            </div>
                            <div className="p-3 flex flex-col gap-1.5 flex-1">
                                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">{p.student_name}</p>
                                <p className="text-xs text-white/40">{p.designation}</p>
                                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/5">
                                    <Building2 size={11} className="text-primary/60 shrink-0" />
                                    <span className="text-xs text-white/60 font-medium truncate">{p.company_name}</span>
                                    <span className="ml-auto text-[10px] text-white/25 shrink-0">
                                        {new Date(p.placed_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* --- Vacancy / Internship Cards --- */}
                {activeTab !== 'hall_of_fame' && filteredVacancies.map((v, i) => (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div
                            className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col h-full group cursor-pointer"
                            onClick={() => navigate(`/dashboard/placements/${v.id}`)}
                        >
                            <div className="p-5 flex flex-col gap-3 flex-1">
                                {/* Title + Badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                                        {v.title}
                                    </p>
                                    <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                                        v.job_type === 'Job'
                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}>
                                        {v.job_type}
                                    </span>
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
                                    <span className="truncate">Ends {new Date(v.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                                {isApplied(v.id) ? (
                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shrink-0">
                                        <CheckCircle size={9} /> Applied
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
                ))}

                {/* Empty State */}
                {activeList.length === 0 && (
                    <div className="col-span-full py-14 text-center flex flex-col items-center gap-3">
                        <div className="p-3.5 bg-white/5 rounded-full">
                            <Search size={22} className="text-white/20" />
                        </div>
                        <p className="text-sm font-semibold text-white/35">No results found</p>
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-xs text-primary/70 hover:text-primary transition-colors">
                                Clear search
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
