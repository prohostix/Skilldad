import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Briefcase, Clock, BellRing, SearchX, Building2,
    Calendar, Bookmark, BookmarkCheck, SlidersHorizontal, RotateCcw,
    Zap, Target, ShieldCheck, ArrowRight, Eye, X, CheckCircle2,
    Sparkles, Filter, ChevronRight, Check
} from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { useToast } from '../../context/ToastContext';

import learningJourneyBanner from '../../assets/learning_journey_banner.jpg';
const learningJourneyVideo = '/assets/learning_journey_animated.mp4';

const DEFAULT_HERO = {
    title: 'Your Dream Job Is Closer Than You Think',
    subtitle: "Get personalized job alerts based on your skills, preferred location, industry and career goals. Don't just search — let opportunities come to you!"
};

// Calculate human-friendly time elapsed
const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
};

// Extract factual keywords from title and description
const extractSkills = (job) => {
    if (job.skills && Array.isArray(job.skills) && job.skills.length > 0) {
        return job.skills;
    }
    const text = `${job.title || ''} ${job.description || ''}`;
    const skillCatalog = [
        'SEO', 'Social Media', 'Google Ads', 'Meta Ads', 'AI Tools',
        'Digital Marketing', 'Hospital Management', 'Healthcare', 'Patient Care',
        'Administration', 'Documentation', 'Office Operations', 'Team Coordination',
        'Record Keeping', 'Communication', 'Analytics', 'Reporting', 'Management'
    ];
    const matched = skillCatalog.filter(skill =>
        new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
    );
    if (matched.length > 0) return matched.slice(0, 4);
    return [job.type, job.location].filter(Boolean);
};

// Company color mapping for branded initials avatars
const getCompanyBadgeStyle = (company = '') => {
    const clean = company.toLowerCase();
    if (clean.includes('prohostix')) {
        return { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700/60' };
    }
    if (clean.includes('aster') || clean.includes('medcity') || clean.includes('hospital')) {
        return { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/60' };
    }
    if (clean.includes('ey') || clean.includes('ernst')) {
        return { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700/60' };
    }
    return { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700/60' };
};

const JobAlerts = () => {
    const { showToast } = useToast();
    const [hero, setHero] = useState(DEFAULT_HERO);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter state
    const [search, setSearch] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'az' | 'deadline'
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;

    // Interactive Modals state
    const [selectedJobForModal, setSelectedJobForModal] = useState(null);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [subscriberEmail, setSubscriberEmail] = useState('');
    const [subscriberCategory, setSubscriberCategory] = useState('All');
    const [alertSubscribed, setAlertSubscribed] = useState(false);

    // Prevent body scrolling when mobile filter drawer is open
    useEffect(() => {
        if (mobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileFilterOpen]);

    // Bookmarked jobs persisted in localStorage
    const [bookmarkedJobs, setBookmarkedJobs] = useState(() => {
        try {
            const saved = localStorage.getItem('skilldad_bookmarked_jobs');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await axios.get('/api/public/cms/job_alerts');
                if (data?.hero?.title) {
                    setHero(data.hero);
                }
                if (Array.isArray(data?.jobs)) {
                    setJobs(data.jobs);
                }
            } catch (error) {
                console.error('Failed to load job alerts from endpoint:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const toggleBookmark = (jobId, jobTitle) => {
        setBookmarkedJobs(prev => {
            const exists = prev.includes(jobId);
            const updated = exists ? prev.filter(id => id !== jobId) : [...prev, jobId];
            try {
                localStorage.setItem('skilldad_bookmarked_jobs', JSON.stringify(updated));
            } catch {
                // ignore storage error
            }
            if (showToast) {
                showToast(
                    exists ? `Removed "${jobTitle}" from bookmarks` : `Saved "${jobTitle}" to bookmarks!`,
                    'info'
                );
            }
            return updated;
        });
    };

    // Calculate dynamic facets strictly from real jobs data
    const typeFacets = useMemo(() => {
        const counts = {};
        jobs.forEach(j => {
            const t = j.type || 'Full-time';
            counts[t] = (counts[t] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [jobs]);

    const locationFacets = useMemo(() => {
        const counts = {};
        jobs.forEach(j => {
            if (j.location) {
                const loc = j.location.trim();
                counts[loc] = (counts[loc] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [jobs]);

    // Handle filter toggles
    const handleTypeToggle = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
        setCurrentPage(1);
    };

    const handleLocationToggle = (loc) => {
        setSelectedLocations(prev =>
            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
        );
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearch('');
        setSelectedTypes([]);
        setSelectedLocations([]);
        setCurrentPage(1);
    };

    const hasActiveFilters = search.trim() !== '' || selectedTypes.length > 0 || selectedLocations.length > 0;
    const activeFilterCount = (search.trim() !== '' ? 1 : 0) + selectedTypes.length + selectedLocations.length;

    // Filter and sort jobs strictly from real data
    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();
        let list = jobs.filter(job => {
            if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) {
                return false;
            }
            if (selectedLocations.length > 0 && !selectedLocations.includes(job.location?.trim())) {
                return false;
            }
            if (query) {
                const matchTitle = job.title?.toLowerCase().includes(query);
                const matchCompany = job.company?.toLowerCase().includes(query);
                const matchLocation = job.location?.toLowerCase().includes(query);
                const matchDesc = job.description?.toLowerCase().includes(query);
                if (!matchTitle && !matchCompany && !matchLocation && !matchDesc) return false;
            }
            return true;
        });

        // Sorting
        list.sort((a, b) => {
            if (sortBy === 'az') {
                return (a.title || '').localeCompare(b.title || '');
            }
            if (sortBy === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            }
            // default: recent
            if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
            return new Date(b.postedDate || 0) - new Date(a.postedDate || 0);
        });

        return list;
    }, [jobs, search, selectedTypes, selectedLocations, sortBy]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * jobsPerPage;
        return filteredJobs.slice(start, start + jobsPerPage);
    }, [filteredJobs, currentPage]);

    const handleCreateAlertSubmit = (e) => {
        e.preventDefault();
        if (!subscriberEmail.trim() || !subscriberEmail.includes('@')) {
            if (showToast) showToast('Please enter a valid email address', 'error');
            return;
        }
        setAlertSubscribed(true);
        try {
            const subscribers = JSON.parse(localStorage.getItem('skilldad_alert_subscribers') || '[]');
            subscribers.push({ email: subscriberEmail, category: subscriberCategory, date: new Date().toISOString() });
            localStorage.setItem('skilldad_alert_subscribers', JSON.stringify(subscribers));
        } catch {
            // ignore
        }
        if (showToast) showToast(`Job alert preferences registered for ${subscriberEmail}!`, 'success');
        setTimeout(() => {
            setAlertModalOpen(false);
            setAlertSubscribed(false);
            setSubscriberEmail('');
        }, 1800);
    };

    return (
        <div className="min-h-screen job-alerts-page bg-[#FAF8FE] dark:bg-[#070414] text-slate-800 dark:text-slate-100 relative overflow-hidden font-sans">
            {/* Subtle background ambient glows */}
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-purple-200/35 dark:bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-[400px] left-[-100px] w-[500px] h-[500px] bg-indigo-200/25 dark:bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />

            <Navbar />

            <main className="pt-16 pb-3 sm:pb-4">

                {/* ── 1. HERO BANNER: MATCHING COURSES & UNIVERSITIES STYLE ── */}
                <div className="w-full mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-[#170C30] via-[#1F1040] to-[#2B1454] border-y border-purple-900/40 [.light-mode_&]:!bg-gradient-to-r [.light-mode_&]:!from-[#F4EEFE] [.light-mode_&]:!via-[#EDE4FD] [.light-mode_&]:!to-[#E5D7FA] [.light-mode_&]:!border-[#E2D4F7] pt-4 sm:pt-5 md:pt-5 lg:pt-6 pb-0 px-4 sm:px-6 lg:px-10 relative overflow-hidden shadow-xs">
                        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end relative z-10">
                            
                            {/* Left Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="lg:col-span-7 space-y-2.5 sm:space-y-3 pb-4 sm:pb-5 md:pb-6"
                            >
                                {/* Small Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-purple-950/60 border border-white/20 dark:border-purple-800/60 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-200 text-[#C026FF] [.light-mode_&]:!text-[#4C1D95] dark:text-purple-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
                                    <BellRing size={13} className="text-[#C026FF] [.light-mode_&]:!text-[#4C1D95] dark:text-purple-300" />
                                    <span>Job Alerts</span>
                                </div>

                                {/* Main Headline */}
                                <h1 className="text-xl sm:text-2xl lg:text-[29px] font-extrabold text-white [.light-mode_&]:!text-[#1E0E4E] tracking-tight leading-[1.16]">
                                    Find Your Dream Job <br className="hidden sm:inline" />
                                    <span className="text-[#C026FF] [.light-mode_&]:!text-[#5E0289]">
                                        Is Closer Than You Think
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-purple-200/70 [.light-mode_&]:!text-slate-600 text-xs sm:text-[13px] max-w-xl leading-relaxed">
                                    {hero.subtitle || DEFAULT_HERO.subtitle}
                                </p>

                                {/* 3 Feature Badges matching Courses and Universities */}
                                <div className="pt-1 flex flex-wrap gap-2 sm:gap-2.5">
                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6.5 h-6.5 rounded-lg bg-purple-900/50 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <Briefcase size={14} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500 block text-[9px]">Verified Roles</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">Top Hiring Partners</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6.5 h-6.5 rounded-lg bg-purple-900/50 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <BellRing size={14} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500 block text-[9px]">Instant Alerts</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">Real-time Updates</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6.5 h-6.5 rounded-lg bg-purple-900/50 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500 block text-[9px]">Career Support</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">Direct Placement</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Hero Illustration matching Courses & Universities (sitting cleanly at bottom) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                                className="lg:col-span-5 relative flex items-end justify-center lg:justify-end select-none self-end pb-0 -mr-2 sm:-mr-4 lg:-mr-6"
                            >
                                <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] flex items-end justify-center lg:justify-end leading-none">
                                    <img
                                        src="/job_alerts_hero_transparent.png"
                                        alt="SkillDad Job Alerts - Find Your Dream Career"
                                        className="w-full h-auto max-h-[220px] sm:max-h-[255px] lg:max-h-[285px] block object-contain pointer-events-none drop-shadow-sm dark:drop-shadow-[0_4px_24px_rgba(192,38,255,0.18)] align-bottom"
                                    />
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>

                {/* ── 2. TWO-COLUMN MAIN WORKSPACE ── */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ── LEFT SIDEBAR: REFINE YOUR SEARCH (Desktop Only) ── */}
                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24 self-start">
                        <div className="bg-white dark:bg-[#120A27] border border-slate-200/90 dark:border-purple-900/40 rounded-2xl p-5 sm:p-6 shadow-xs">
                            
                            {/* Filter Title + Clear action */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/30 mb-5">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                    <SlidersHorizontal size={15} className="text-[#4C1D95] dark:text-purple-400" />
                                    <span>Refine Your Search</span>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-[#4C1D95] dark:text-purple-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                    >
                                        <RotateCcw size={11} /> Reset
                                    </button>
                                )}
                            </div>

                            {/* Search Keyword Filter */}
                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider">
                                    Keyword
                                </label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Title, company, skill..."
                                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#4C1D95] dark:focus:border-purple-500 transition-colors"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Job Type Section */}
                            <div className="space-y-2.5 mb-6">
                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider">
                                    Job Type
                                </label>
                                {typeFacets.length === 0 ? (
                                    <p className="text-xs text-slate-400">Loading types...</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {typeFacets.map(facet => {
                                            const isChecked = selectedTypes.includes(facet.name);
                                            return (
                                                <button
                                                    key={facet.name}
                                                    onClick={() => handleTypeToggle(facet.name)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                                                        isChecked
                                                            ? 'bg-[#4C1D95]/10 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-200 font-bold border border-[#4C1D95]/30'
                                                            : 'hover:bg-slate-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-purple-200/80 border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                            isChecked
                                                                ? 'bg-[#4C1D95] border-[#4C1D95] text-white'
                                                                : 'border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950'
                                                        }`}>
                                                            {isChecked && <Check size={11} strokeWidth={3} />}
                                                        </div>
                                                        <span>{facet.name}</span>
                                                    </div>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/60 text-slate-500 dark:text-purple-300 font-semibold">
                                                        {facet.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Location Section */}
                            <div className="space-y-2.5 mb-6">
                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider">
                                    Location
                                </label>
                                {locationFacets.length === 0 ? (
                                    <p className="text-xs text-slate-400">Loading locations...</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {locationFacets.map(facet => {
                                            const isChecked = selectedLocations.includes(facet.name);
                                            return (
                                                <button
                                                    key={facet.name}
                                                    onClick={() => handleLocationToggle(facet.name)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                                                        isChecked
                                                            ? 'bg-[#4C1D95]/10 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-200 font-bold border border-[#4C1D95]/30'
                                                            : 'hover:bg-slate-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-purple-200/80 border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                            isChecked
                                                                ? 'bg-[#4C1D95] border-[#4C1D95] text-white'
                                                                : 'border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950'
                                                        }`}>
                                                            {isChecked && <Check size={11} strokeWidth={3} />}
                                                        </div>
                                                        <span className="capitalize">{facet.name}</span>
                                                    </div>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/60 text-slate-500 dark:text-purple-300 font-semibold">
                                                        {facet.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Clear All Filters Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-purple-800 text-xs font-bold text-slate-600 dark:text-purple-300 hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <RotateCcw size={12} /> Clear Filters
                                </button>
                            )}

                        </div>
                    </aside>

                    {/* ── RIGHT MAIN COLUMN: JOB ALERTS ── */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-5">

                        {/* ── SMART MOBILE FILTER CONTROLS (Mobile Only) ── */}
                        <div className="lg:hidden space-y-3">
                            
                            {/* Search Bar + Filter Trigger Button */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search title, company, skill..."
                                        className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#120A27] border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#4C1D95] dark:focus:border-purple-500 shadow-2xs transition-colors"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setMobileFilterOpen(true)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                                        activeFilterCount > 0
                                            ? 'bg-[#4C1D95] border-[#4C1D95] text-white shadow-purple-900/20'
                                            : 'bg-white dark:bg-[#120A27] border-slate-200 dark:border-purple-800/40 text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-purple-900/30'
                                    }`}
                                >
                                    <SlidersHorizontal size={14} />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-white text-[#4C1D95] text-[10px] font-black flex items-center justify-center ml-0.5">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Horizontal Quick Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none text-xs">
                                <button
                                    onClick={() => setSelectedTypes([])}
                                    className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        selectedTypes.length === 0
                                            ? 'bg-[#4C1D95] text-white shadow-xs'
                                            : 'bg-white dark:bg-[#120A27] text-slate-600 dark:text-purple-200 border border-slate-200 dark:border-purple-800/40 hover:bg-slate-50 dark:hover:bg-purple-900/30'
                                    }`}
                                >
                                    All Types ({jobs.length})
                                </button>
                                {typeFacets.map(facet => {
                                    const isSelected = selectedTypes.includes(facet.name);
                                    return (
                                        <button
                                            key={facet.name}
                                            onClick={() => handleTypeToggle(facet.name)}
                                            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#4C1D95] text-white shadow-xs'
                                                    : 'bg-white dark:bg-[#120A27] text-slate-600 dark:text-purple-200 border border-slate-200 dark:border-purple-800/40 hover:bg-slate-50 dark:hover:bg-purple-900/30'
                                            }`}
                                        >
                                            {isSelected && <Check size={11} strokeWidth={3} />}
                                            <span>{facet.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                isSelected
                                                    ? 'bg-purple-800/70 text-purple-100'
                                                    : 'bg-slate-100 dark:bg-purple-950 text-slate-500 dark:text-purple-300'
                                            }`}>
                                                {facet.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Filters Bar */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-purple-300/70 mr-1">Active:</span>
                                    {search && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-[#4C1D95] dark:text-purple-200 text-[11px] font-medium">
                                            "{search}"
                                            <button onClick={() => setSearch('')} className="hover:text-red-500 cursor-pointer ml-0.5"><X size={10} /></button>
                                        </span>
                                    )}
                                    {selectedTypes.map(t => (
                                        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-[#4C1D95] dark:text-purple-200 text-[11px] font-medium">
                                            {t}
                                            <button onClick={() => handleTypeToggle(t)} className="hover:text-red-500 cursor-pointer ml-0.5"><X size={10} /></button>
                                        </span>
                                    ))}
                                    {selectedLocations.map(l => (
                                        <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-[#4C1D95] dark:text-purple-200 text-[11px] font-medium">
                                            {l}
                                            <button onClick={() => handleLocationToggle(l)} className="hover:text-red-500 cursor-pointer ml-0.5"><X size={10} /></button>
                                        </span>
                                    ))}
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-[11px] font-bold text-[#4C1D95] dark:text-purple-400 hover:underline ml-1 cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* Section Header with Sort Selector */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Briefcase size={18} className="text-[#4C1D95] dark:text-purple-400" />
                                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        Latest Job Alerts
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                                    {filteredJobs.length} {filteredJobs.length === 1 ? 'opening' : 'openings'} verified by hiring partners
                                </p>
                            </div>

                            {/* Sort selector */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-purple-200">
                                <span className="font-medium text-slate-500 dark:text-purple-400 hidden sm:inline">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    aria-label="Sort job alerts"
                                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#120A27] border border-slate-200 dark:border-purple-800/40 text-slate-800 dark:text-purple-200 font-semibold text-xs outline-none focus:border-[#4C1D95] cursor-pointer shadow-2xs"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="az">Alphabetical (A-Z)</option>
                                    <option value="deadline">Deadline</option>
                                </select>
                            </div>
                        </div>

                        {/* ── SLIDE-UP MOBILE FILTER BOTTOM SHEET / DRAWER ── */}
                        <AnimatePresence>
                            {mobileFilterOpen && (
                                <>
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setMobileFilterOpen(false)}
                                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
                                    />

                                    {/* Bottom Sheet Modal */}
                                    <motion.div
                                        initial={{ y: '100%' }}
                                        animate={{ y: 0 }}
                                        exit={{ y: '100%' }}
                                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                        className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-[#120A27] rounded-t-3xl border-t border-slate-200 dark:border-purple-800 shadow-2xl max-h-[85vh] flex flex-col lg:hidden"
                                    >
                                        {/* Drag handle */}
                                        <div className="pt-3 pb-1 flex justify-center">
                                            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-purple-800/80" />
                                        </div>

                                        {/* Drawer Header */}
                                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-purple-900/30">
                                            <div className="flex items-center gap-2">
                                                <SlidersHorizontal size={16} className="text-[#4C1D95] dark:text-purple-400" />
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                    Filter Job Alerts
                                                </h3>
                                                {activeFilterCount > 0 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4C1D95] text-white">
                                                        {activeFilterCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={clearAllFilters}
                                                        className="text-xs font-semibold text-[#4C1D95] dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <RotateCcw size={11} /> Reset
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setMobileFilterOpen(false)}
                                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Scrollable Filters Body */}
                                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                            {/* Keyword Search */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider mb-2">
                                                    Keyword
                                                </label>
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={search}
                                                        onChange={(e) => {
                                                            setSearch(e.target.value);
                                                            setCurrentPage(1);
                                                        }}
                                                        placeholder="Title, company, skill..."
                                                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#4C1D95]"
                                                    />
                                                    {search && (
                                                        <button
                                                            onClick={() => setSearch('')}
                                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Job Type Section */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider mb-2.5">
                                                    Job Type
                                                </label>
                                                <div className="space-y-2">
                                                    {typeFacets.map(facet => {
                                                        const isChecked = selectedTypes.includes(facet.name);
                                                        return (
                                                            <button
                                                                key={facet.name}
                                                                onClick={() => handleTypeToggle(facet.name)}
                                                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left cursor-pointer transition-colors ${
                                                                    isChecked
                                                                        ? 'bg-[#4C1D95]/10 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-200 font-bold border border-[#4C1D95]/30'
                                                                        : 'bg-slate-50 dark:bg-purple-950/20 text-slate-700 dark:text-purple-200/80 border border-slate-200/50 dark:border-purple-900/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                                        isChecked ? 'bg-[#4C1D95] border-[#4C1D95] text-white' : 'border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950'
                                                                    }`}>
                                                                        {isChecked && <Check size={11} strokeWidth={3} />}
                                                                    </div>
                                                                    <span>{facet.name}</span>
                                                                </div>
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-purple-900/60 font-semibold">
                                                                    {facet.count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Location Section */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block uppercase tracking-wider mb-2.5">
                                                    Location
                                                </label>
                                                <div className="space-y-2">
                                                    {locationFacets.map(facet => {
                                                        const isChecked = selectedLocations.includes(facet.name);
                                                        return (
                                                            <button
                                                                key={facet.name}
                                                                onClick={() => handleLocationToggle(facet.name)}
                                                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left cursor-pointer transition-colors ${
                                                                    isChecked
                                                                        ? 'bg-[#4C1D95]/10 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-200 font-bold border border-[#4C1D95]/30'
                                                                        : 'bg-slate-50 dark:bg-purple-950/20 text-slate-700 dark:text-purple-200/80 border border-slate-200/50 dark:border-purple-900/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                                        isChecked ? 'bg-[#4C1D95] border-[#4C1D95] text-white' : 'border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950'
                                                                    }`}>
                                                                        {isChecked && <Check size={11} strokeWidth={3} />}
                                                                    </div>
                                                                    <span className="capitalize">{facet.name}</span>
                                                                </div>
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-purple-900/60 font-semibold">
                                                                    {facet.count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="p-4 border-t border-slate-100 dark:border-purple-900/30 bg-slate-50/50 dark:bg-[#120A27]">
                                            <button
                                                onClick={() => setMobileFilterOpen(false)}
                                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4C1D95] to-[#7C3AED] hover:from-[#3B1675] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span>Show {filteredJobs.length} {filteredJobs.length === 1 ? 'Job Alert' : 'Job Alerts'}</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* ── JOB CARDS LIST ── */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-36 rounded-2xl bg-white dark:bg-[#120A27] border border-slate-200 dark:border-purple-900/40 animate-pulse p-6" />
                                ))}
                            </div>
                        ) : paginatedJobs.length > 0 ? (
                            <div className="space-y-4">
                                {paginatedJobs.map((job, idx) => {
                                    const badgeStyle = getCompanyBadgeStyle(job.company);
                                    const skills = extractSkills(job);
                                    const isBookmarked = bookmarkedJobs.includes(job.id);

                                    return (
                                        <motion.div
                                            key={job.id || idx}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: idx * 0.04 }}
                                            className="group relative bg-white dark:bg-[#120A27] border border-slate-200/90 dark:border-purple-900/40 hover:border-[#4C1D95]/40 dark:hover:border-purple-600/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md hover:shadow-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                                        >
                                            {/* Left Column: Avatar + Title + Company + Meta + Skill Pills */}
                                            <div className="flex items-start gap-4 min-w-0 flex-1">
                                                
                                                {/* Company Logo or Initials Avatar */}
                                                <div className={`w-12 h-12 rounded-xl ${badgeStyle.bg} ${badgeStyle.border} border flex items-center justify-center font-extrabold text-sm ${badgeStyle.text} shrink-0 overflow-hidden shadow-2xs`}>
                                                    {job.logo ? (
                                                        <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (job.company || '?').slice(0, 2).toUpperCase()
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-xs font-semibold text-slate-500 dark:text-purple-300/80 flex items-center gap-1.5 mt-0.5">
                                                            <Building2 size={12} className="text-[#4C1D95] dark:text-purple-400" />
                                                            <span>{job.company}</span>
                                                        </p>
                                                    </div>

                                                    {/* Meta Info Row */}
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-purple-300/70 font-medium">
                                                        {job.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={12} className="text-slate-400 dark:text-purple-400" />
                                                                <span className="capitalize">{job.location}</span>
                                                            </span>
                                                        )}
                                                        {job.type && (
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase size={12} className="text-slate-400 dark:text-purple-400" />
                                                                <span>{job.type}</span>
                                                            </span>
                                                        )}
                                                        {job.postedDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={12} className="text-slate-400 dark:text-purple-400" />
                                                                <span>Posted {timeAgo(job.postedDate)}</span>
                                                            </span>
                                                        )}
                                                        {job.deadline && (
                                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                                                <Calendar size={12} />
                                                                <span>Deadline: {job.deadline}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Dynamic Skill / Tag Chips derived from facts */}
                                                    {skills.length > 0 && (
                                                        <div className="pt-1 flex flex-wrap gap-1.5">
                                                            {skills.map((skill, sIdx) => (
                                                                <span
                                                                    key={sIdx}
                                                                    className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 text-[11px] font-semibold"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column: Bookmark + View Details (NO APPLY NOW BUTTON) */}
                                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-purple-900/30 shrink-0">
                                                
                                                <div className="flex items-center gap-2">
                                                    {/* "New" or "Verified" Badge */}
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100/90 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 font-bold text-[10px] uppercase tracking-wide">
                                                        New
                                                    </span>

                                                    {/* Bookmark Button */}
                                                    <button
                                                        onClick={() => toggleBookmark(job.id, job.title)}
                                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                                            isBookmarked
                                                                ? 'bg-[#4C1D95]/10 border-[#4C1D95]/40 text-[#4C1D95] dark:text-purple-300'
                                                                : 'bg-white dark:bg-purple-950/40 border-slate-200 dark:border-purple-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-purple-200'
                                                        }`}
                                                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                                                    >
                                                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                                    </button>
                                                </div>

                                                {/* View Details Action with Details coming soon note */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedJobForModal(job)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-purple-950/80 hover:bg-[#4C1D95] dark:hover:bg-[#4C1D95] text-[#4C1D95] dark:text-purple-200 hover:text-white dark:hover:text-white border border-[#4C1D95]/30 hover:border-transparent text-xs font-bold transition-all shadow-2xs hover:shadow-sm cursor-pointer"
                                                    >
                                                        <Eye size={13} /> View Details
                                                    </button>
                                                </div>

                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white dark:bg-[#120A27] border border-slate-200 dark:border-purple-900/40 rounded-2xl p-10 text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center mx-auto">
                                    <SearchX size={26} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {jobs.length === 0 ? 'No job alerts posted yet' : 'No matching jobs found'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-purple-300/70 max-w-sm mx-auto">
                                    {jobs.length === 0
                                        ? 'New opportunities verified by our hiring partners will appear here.'
                                        : 'Try clearing your filters or changing your search terms to see available opportunities.'}
                                </p>
                                {hasActiveFilters && (
                                    <div className="pt-2">
                                        <button
                                            onClick={clearAllFilters}
                                            className="px-4 py-2 rounded-xl bg-[#4C1D95] text-white text-xs font-bold hover:bg-[#3B1578] transition-colors cursor-pointer"
                                        >
                                            Reset All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-purple-800 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-purple-900/40 cursor-pointer"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            currentPage === i + 1
                                                ? 'bg-[#4C1D95] text-white shadow-xs'
                                                : 'border border-slate-200 dark:border-purple-800 hover:bg-slate-50 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-purple-800 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-purple-900/40 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── STANDARDIZED "GET JOB ALERTS" BANNER (JUST ABOVE ANIMATION SECTION) ── */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
                <div className="rounded-2xl bg-gradient-to-r from-[#F6F0FE] via-[#FAF6FE] to-[#F1E9FD] dark:from-[#150D2E] dark:via-[#110A26] dark:to-[#170E30] border border-purple-200/80 dark:border-purple-800/40 py-3.5 px-4 sm:py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 shadow-2xs">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-purple-900/60 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-700/60 shadow-2xs">
                            <BellRing size={16} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                Get Real-Time Job Alerts
                            </h2>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-purple-300/80 leading-normal truncate sm:whitespace-normal">
                                Set your career preferences and receive verified partner opportunities directly to your email.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setAlertModalOpen(true)}
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B1578] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                        <BellRing size={13} />
                        <span>Create Alert</span>
                    </button>
                </div>
            </div>
            </main>

            {/* ── MODAL 1: JOB DETAILS MODAL (USES STRICT FACTUAL DETAILS, NO APPLY NOW BUTTON) ── */}
            <AnimatePresence>
                {selectedJobForModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-xl bg-white dark:bg-[#120A27] border border-purple-200 dark:border-purple-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedJobForModal(null)}
                                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>

                            {/* Modal Header */}
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`w-14 h-14 rounded-2xl ${getCompanyBadgeStyle(selectedJobForModal.company).bg} ${getCompanyBadgeStyle(selectedJobForModal.company).border} border flex items-center justify-center font-extrabold text-base ${getCompanyBadgeStyle(selectedJobForModal.company).text} shrink-0`}>
                                    {selectedJobForModal.logo ? (
                                        <img src={selectedJobForModal.logo} alt={selectedJobForModal.company} className="w-full h-full object-cover" />
                                    ) : (
                                        (selectedJobForModal.company || '?').slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0 pr-6">
                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                        {selectedJobForModal.title}
                                    </h2>
                                    <p className="text-sm font-semibold text-[#4C1D95] dark:text-purple-300 mt-1 flex items-center gap-1.5">
                                        <Building2 size={13} /> {selectedJobForModal.company}
                                    </p>
                                </div>
                            </div>

                            {/* Key Badges */}
                            <div className="flex flex-wrap gap-2 pb-5 border-b border-slate-100 dark:border-purple-900/40">
                                {selectedJobForModal.type && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#4C1D95] dark:text-purple-300 text-xs font-bold">
                                        <Briefcase size={12} /> {selectedJobForModal.type}
                                    </span>
                                )}
                                {selectedJobForModal.location && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-purple-900/40 text-slate-700 dark:text-purple-200 text-xs font-medium capitalize">
                                        <MapPin size={12} /> {selectedJobForModal.location}
                                    </span>
                                )}
                                {selectedJobForModal.deadline && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                        <Calendar size={12} /> Deadline: {selectedJobForModal.deadline}
                                    </span>
                                )}
                            </div>

                            {/* Job Description (VERBATIM FROM DATABASE) */}
                            <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-purple-100/90 leading-relaxed">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-purple-400">
                                    Opportunity Overview
                                </h3>
                                <p className="whitespace-pre-line bg-slate-50 dark:bg-purple-950/30 p-4 rounded-2xl border border-slate-100 dark:border-purple-900/30 font-normal">
                                    {selectedJobForModal.description || 'No detailed description provided by hiring partner.'}
                                </p>
                            </div>

                            {/* Application Status (NO APPLY NOW BUTTON) */}
                            <div className="bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/50 rounded-2xl p-4 space-y-1 mb-6">
                                <div className="flex items-center gap-2 text-[#4C1D95] dark:text-purple-300 font-bold text-xs">
                                    <Clock size={14} />
                                    <span>Applications & Hiring Process</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-purple-200/80 leading-normal">
                                    Details coming soon. This position is verified directly by SkillDad and our partner network. Registered learners and alert subscribers receive priority application notifications.
                                </p>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    onClick={() => toggleBookmark(selectedJobForModal.id, selectedJobForModal.title)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800 text-xs font-bold text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-purple-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    {bookmarkedJobs.includes(selectedJobForModal.id) ? (
                                        <>
                                            <BookmarkCheck size={14} className="text-[#4C1D95] dark:text-purple-300" />
                                            <span>Saved to Bookmarks</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark size={14} />
                                            <span>Bookmark Job</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setSelectedJobForModal(null)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-purple-900/60 hover:bg-slate-200 dark:hover:bg-purple-900 text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL 2: CREATE JOB ALERT SUBSCRIPTION MODAL ── */}
            <AnimatePresence>
                {alertModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md bg-white dark:bg-[#120A27] border border-purple-200 dark:border-purple-800 rounded-3xl p-6 sm:p-7 shadow-2xl"
                        >
                            <button
                                onClick={() => setAlertModalOpen(false)}
                                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                                aria-label="Close alert dialog"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center">
                                    <BellRing size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        Create Job Alert
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-purple-300/70">
                                        Receive real-time notifications for verified openings
                                    </p>
                                </div>
                            </div>

                            {alertSubscribed ? (
                                <div className="py-8 text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Job Alert Created!
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-purple-300/80">
                                        You will receive notifications whenever a matching opening is posted.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateAlertSubmit} className="space-y-4 mt-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block mb-1">
                                            Your Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={subscriberEmail}
                                            onChange={(e) => setSubscriberEmail(e.target.value)}
                                            placeholder="you@domain.com"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#4C1D95]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-purple-200 block mb-1">
                                            Preferred Category
                                        </label>
                                        <select
                                            value={subscriberCategory}
                                            onChange={(e) => setSubscriberCategory(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#4C1D95] cursor-pointer"
                                        >
                                            <option value="All">All Categories</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                            <option value="Healthcare & Hospital">Healthcare & Hospital</option>
                                            <option value="Administration & Management">Administration & Management</option>
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 rounded-xl bg-[#4C1D95] hover:bg-[#3B1578] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                        >
                                            Subscribe to Alerts
                                        </button>
                                    </div>
                                </form>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── ANIMATED LEARNING JOURNEY FULL WIDTH BANNER ── */}
            <div className="relative z-10 w-full px-0 pb-0 mb-0 mt-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full max-w-none mx-0 group mb-0"
                >
                    <div className="relative w-full rounded-none overflow-hidden border-y border-slate-200/80 dark:border-white/10 shadow-md bg-white dark:bg-[#0B081A] h-[480px] sm:h-[560px] md:h-[660px] lg:h-[720px] flex items-center justify-center">
                        <video
                            src={learningJourneyVideo}
                            poster={learningJourneyBanner}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-fill block select-none"
                        />
                        <a
                            href="/courses"
                            className="absolute top-[40%] left-[20%] w-[10.5%] h-[28%] rounded-3xl cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
                            title="Explore In-Demand Courses"
                            aria-label="Explore In-Demand Courses"
                        />
                        <a
                            href="/platform"
                            className="absolute top-[37%] left-[58%] w-[10.5%] h-[26%] rounded-3xl cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
                            title="Explore University Programs"
                            aria-label="Explore University Programs"
                        />
                    </div>
                </motion.div>
            </div>

            <Footer className="!mt-0 !pt-4" />
        </div>
    );
};

export default JobAlerts;
