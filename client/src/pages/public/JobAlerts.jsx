import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Search, MapPin, Briefcase, Clock, ArrowUpRight, BellRing, SearchX, Building2
} from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import ModernButton from '../../components/ui/ModernButton';

import learningJourneyBanner from '../../assets/learning_journey_banner.jpg';
const learningJourneyVideo = '/assets/learning_journey_animated.mp4';

const DEFAULT_HERO = {
    title: 'Job Alerts',
    subtitle: 'Curated job openings and internships from our hiring partners - updated regularly, open to everyone.'
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
};

const isClosingSoon = (deadline) => {
    if (!deadline) return false;
    const diffDays = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
};

const JobCard = ({ job, index }) => {
    const closingSoon = isClosingSoon(job.deadline);
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
            className="group relative bg-white/[0.03] dark:bg-white/[0.03] [.light-mode_&]:!bg-white border border-white/10 [.light-mode_&]:!border-slate-200 rounded-2xl p-6 flex flex-col hover:border-primary/40 hover:bg-white/[0.05] [.light-mode_&]:hover:!bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
        >
            {job.featured && (
                <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary-purple text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Featured
                </span>
            )}

            <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                        (job.company || '?').slice(0, 2).toUpperCase()
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="text-white [.light-mode_&]:!text-slate-900 font-bold text-base leading-snug line-clamp-2">
                        {job.title}
                    </h3>
                    <p className="text-white/50 [.light-mode_&]:!text-slate-500 text-xs font-medium flex items-center gap-1 mt-0.5">
                        <Building2 size={12} /> {job.company}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                {job.type && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                        <Briefcase size={11} /> {job.type}
                    </span>
                )}
                {job.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 [.light-mode_&]:!bg-slate-100 text-white/70 [.light-mode_&]:!text-slate-600 text-[11px] font-semibold">
                        <MapPin size={11} /> {job.location}
                    </span>
                )}
                {closingSoon && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">
                        <Clock size={11} /> Closing soon
                    </span>
                )}
            </div>

            {job.description && (
                <p className="text-white/60 [.light-mode_&]:!text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {job.description}
                </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10 [.light-mode_&]:!border-slate-100 mt-auto">
                <span className="text-white/35 [.light-mode_&]:!text-slate-400 text-[11px] font-medium">
                    Posted {timeAgo(job.postedDate)}
                </span>
                {job.applyLink ? (
                    <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-white text-xs font-bold transition-all"
                    >
                        Apply Now <ArrowUpRight size={13} />
                    </a>
                ) : (
                    <span className="text-white/30 [.light-mode_&]:!text-slate-400 text-xs font-semibold">Details coming soon</span>
                )}
            </div>
        </motion.div>
    );
};

const JobAlerts = () => {
    const [hero, setHero] = useState(DEFAULT_HERO);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState('All');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await axios.get('/api/public/cms/job_alerts');
                if (data?.hero) setHero({ ...DEFAULT_HERO, ...data.hero });
                if (Array.isArray(data?.jobs)) setJobs(data.jobs);
            } catch (error) {
                console.error('Failed to load job alerts:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const titleWords = (hero.title || '').trim().split(' ');
    const heroTitleAccent = titleWords.pop() || '';
    const heroTitleLead = titleWords.join(' ');

    const types = useMemo(() => {
        const unique = Array.from(new Set(jobs.map(j => j.type).filter(Boolean)));
        return ['All', ...unique];
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        const searchText = search.trim().toLowerCase();
        return jobs
            .filter(j => activeType === 'All' || j.type === activeType)
            .filter(j => !searchText ||
                j.title?.toLowerCase().includes(searchText) ||
                j.company?.toLowerCase().includes(searchText) ||
                j.location?.toLowerCase().includes(searchText)
            )
            .sort((a, b) => {
                if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
                return new Date(b.postedDate || 0) - new Date(a.postedDate || 0);
            });
    }, [jobs, search, activeType]);

    return (
        <div className="min-h-screen job-alerts-page bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-secondary-purple/10 rounded-full blur-[140px] pointer-events-none" />

            <Navbar />

            <div className="relative z-10 max-w-[1300px] mx-auto px-6 pt-28 pb-20 sm:pt-32">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-6">
                        <BellRing size={12} /> Fresh Opportunities
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white [.light-mode_&]:!text-slate-900 font-space tracking-tight leading-[1.1] mb-5">
                        {heroTitleLead && <span>{heroTitleLead} </span>}
                        <span className="premium-gradient-text">{heroTitleAccent}</span>
                    </h1>
                    <p className="text-white/60 [.light-mode_&]:!text-slate-500 text-base sm:text-lg leading-relaxed">
                        {hero.subtitle}
                    </p>
                </motion.div>

                {/* Search + Filters */}
                <div id="job-listings" className="scroll-mt-28 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-10">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 [.light-mode_&]:!text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title, company, or location..."
                            className="w-full pl-11 pr-4 py-3 bg-white/5 [.light-mode_&]:!bg-white border border-white/10 [.light-mode_&]:!border-slate-200 rounded-xl text-white [.light-mode_&]:!text-slate-900 placeholder:text-white/30 [.light-mode_&]:placeholder:!text-slate-400 text-sm outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                    {types.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {types.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveType(t)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        activeType === t
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                             : 'bg-white/5 [.light-mode_&]:!bg-slate-100 text-white/60 [.light-mode_&]:!text-slate-600 hover:bg-white/10'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Job Grid */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-56 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.map((job, i) => (
                            <JobCard key={job.id || i} job={job} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <SearchX size={28} className="text-white/30" />
                        </div>
                        <h3 className="text-white [.light-mode_&]:!text-slate-900 font-bold text-lg mb-1">
                            {jobs.length === 0 ? 'No job alerts right now' : 'No matching jobs found'}
                        </h3>
                        <p className="text-white/50 [.light-mode_&]:!text-slate-500 text-sm max-w-sm">
                            {jobs.length === 0
                                ? 'New opportunities from our hiring partners will show up here - check back soon.'
                                : 'Try a different search term or filter.'}
                        </p>
                    </div>
                )}

                {!loading && filteredJobs.length > 0 && (
                    <div className="text-center mt-14 mb-8">
                        <p className="text-white/40 [.light-mode_&]:!text-slate-500 text-sm mb-4">
                            Want tailored placement support alongside your course?
                        </p>
                        <ModernButton onClick={() => window.location.href = '/courses'}>
                            Explore Placement-Assured Courses
                        </ModernButton>
                    </div>
                )}
            </div>

            {/* Animated Learning Journey Section - 100% Full Page Width */}
            <div className="relative z-10 w-full px-0 pb-0 mb-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full max-w-none mx-0 group mb-0"
                >
                    <div className="relative w-full rounded-none overflow-hidden border-y border-slate-200/80 dark:border-white/10 shadow-md bg-white dark:bg-[#0B081A] h-[480px] sm:h-[560px] md:h-[660px] lg:h-[720px] flex items-center justify-center">
                        {/* 15s High-Fidelity Animated Journey Video */}
                        <video
                            src={learningJourneyVideo}
                            poster={learningJourneyBanner}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-fill block select-none"
                        />

                        {/* Interactive hotspots on destinations */}
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
                        <a
                            href="#job-listings"
                            className="absolute top-[82.2%] left-1/2 -translate-x-1/2 w-[42.4%] h-[10.1%] rounded-full cursor-pointer hover:ring-2 hover:ring-primary/60 transition-all focus:outline-none"
                            title="Jump to Job Openings"
                            aria-label="Jump to Job Openings"
                        />
                    </div>
                </motion.div>
            </div>

            <Footer className="!mt-0 !pt-4" />
        </div>
    );
};

export default JobAlerts;
