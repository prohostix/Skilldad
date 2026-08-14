import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    Layers,
    Sparkles,
    SearchX,
    ShieldCheck,
    ChevronDown
} from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import CourseCard from '../components/CourseCard';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import { toast } from 'react-hot-toast';

const CustomSelect = ({ value, onChange, options, className, align = "right" }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative group/univ" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} cursor-pointer flex items-center justify-between`}
            >
                <span className="truncate pr-4 select-none">{value === 'All' ? 'All Providers' : value}</span>
                <div className={`pointer-events-none transition-colors ${isOpen ? 'text-primary' : 'text-white/30 group-hover/univ:text-primary'}`}>
                    <Filter size={14} />
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-[260px] bg-[#0A0714]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden z-50`}
                    >
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar py-1">
                            <div 
                                onClick={() => { onChange('All'); setIsOpen(false); }}
                                className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-3 ${value === 'All' ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${value === 'All' ? 'bg-primary' : 'bg-transparent'}`} />
                                <span className="font-medium select-none">All Providers</span>
                            </div>
                            {options.filter(u => u !== 'All').map(uni => (
                                <div 
                                    key={uni}
                                    onClick={() => { onChange(uni); setIsOpen(false); }}
                                    className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-3 ${value === uni ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${value === uni ? 'bg-primary' : 'bg-transparent'}`} />
                                    <span className="truncate font-medium select-none">{uni}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormSelect = ({ value, onChange, options, className }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative group/select" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} cursor-pointer flex items-center justify-between transition-all`}
            >
                <span className="truncate select-none text-white/80">{value}</span>
                <div className={`pointer-events-none transition-colors ${isOpen ? 'text-primary' : 'text-white/20 group-hover/select:text-primary'}`}>
                    <Layers size={16} />
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-[#0A0714]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                    >
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar py-2">
                            {options.map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={`px-6 py-3.5 text-sm cursor-pointer transition-colors flex items-center gap-3 ${value === opt ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${value === opt ? 'bg-primary' : 'bg-transparent'}`} />
                                    <span className="truncate font-medium select-none">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CourseCatalog = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [programType, setProgramType] = useState('course');
    const [selectedUniversity, setSelectedUniversity] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [universityName, setUniversityName] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [enquiryType, setEnquiryType] = useState('General Course Enquiry');

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => window.scrollTo(0, 0), 100);
        // Server health check (same-origin)
        axios.get('/health').catch(() => { });

        const fetchCourses = async () => {
            try {
                // Check if logged-in user is a university - if so, show only their courses
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
                let url = '/api/courses';

                if (userInfo && userInfo.role === 'university' && userInfo._id) {
                    // Filter courses by this university's instructor ID
                    url = `/api/courses?university=${userInfo._id}`;
                    setUniversityName(userInfo.profile?.universityName || userInfo.name || 'Your University');
                }

                const { data } = await axios.get(url);
                if (data && Array.isArray(data) && data.length > 0) {
                    setCourses(data);
                } else {
                    setCourses([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setCourses([]);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const isSkillDadCourse = (course) => {
            const univ = (course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || '').toLowerCase();
            const instRole = (course.instructor_role || course.instructor?.role || course.submitted_by_role || '').toLowerCase();
            return !univ || univ.includes('skilldad') || instRole === 'admin' || instRole === 'superadmin' || course.is_skilldad_official || course.isFeatured;
        };

        const filtered = courses.filter(course => {
            const searchText = filter.toLowerCase();

            const matchesSearch =
                course.title?.toLowerCase().includes(searchText) ||
                (course.instructorName || course.instructor?.name || '').toLowerCase().includes(searchText) ||
                (course.universityName || course.instructor?.profile?.universityName || '').toLowerCase().includes(searchText);

            const courseUniversity = course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad';
            const matchesUniversity = selectedUniversity === 'All' || courseUniversity === selectedUniversity;

            const effectiveProgramType = programType === 'wbl_domestic' ? 'degree_programme' : programType;
            const matchesProgramType = (course.programType || course.program_type || 'course') === effectiveProgramType;

            return matchesSearch && matchesUniversity && matchesProgramType;
        });

        // Sort admin-featured courses first, then SkillDad provided courses to the top!
        return filtered.sort((a, b) => {
            const aFeatured = Boolean(a.isFeatured || a.is_featured) ? 1 : 0;
            const bFeatured = Boolean(b.isFeatured || b.is_featured) ? 1 : 0;
            if (bFeatured !== aFeatured) return bFeatured - aFeatured;

            const aVal = isSkillDadCourse(a) ? 1 : 0;
            const bVal = isSkillDadCourse(b) ? 1 : 0;
            return bVal - aVal;
        });
    }, [courses, filter, selectedUniversity, programType]);

    // Check if the user is already filtering uniquely by backend so we hide the filter
    const isFixedUniversity = !!universityName;

    const universities = useMemo(() => {
        if (isFixedUniversity) return []; // No need to show filter if pinned
        const allUnis = courses.map(course => course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad');
        return ['All', ...new Set(allUnis.filter(Boolean))];
    }, [courses, isFixedUniversity]);

    return (
        <div className="min-h-screen course-catalog-page bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] relative overflow-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none gpu-accelerated" />
            <div className="absolute top-1/2 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary-dark/2 blur-[150px] rounded-full pointer-events-none gpu-accelerated" />

            {/* Main Content Sections */}
            <main className="pt-20 md:pt-24 pb-20 px-4 md:px-6 lg:px-12 relative z-10">
                {/* Hero Header - Conditionally hidden when searching */}
                <AnimatePresence>
                    {!(isSearchFocused || filter) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="max-w-[1300px] mx-auto text-center px-4 overflow-hidden"
                        >
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-space tracking-[-0.04em] leading-none"
                            >
                                {universityName ? (
                                    <><span className="opacity-40">Courses by</span> <span className="premium-gradient-text">{universityName}</span></>
                                ) : (
                                    <span className="premium-gradient-text">Expand Your Horizon</span>
                                )}
                            </motion.h1>
                            {universityName && (
                                <p className="text-white/40 text-sm mt-2">Showing all courses provided by your university</p>
                            )}

                            {/* Program Type Toggle */}
                            <div className="flex justify-center mt-4">
                                <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl flex-wrap justify-center">
                                    <button
                                        onClick={() => setProgramType('course')}
                                        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black font-inter text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${programType === 'course'
                                            ? 'bg-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        Skill Courses
                                    </button>
                                    <button
                                        onClick={() => setProgramType('degree_programme')}
                                        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black font-inter text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${programType === 'degree_programme'
                                            ? 'bg-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        Skill Integrated Degree Programmes
                                    </button>
                                    <button
                                        onClick={() => setProgramType('wbl')}
                                        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black font-inter text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${programType.startsWith('wbl')
                                            ? 'bg-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        Work-Based Learning
                                    </button>
                                </div>
                            </div>

                            {/* WBL Sub-options */}
                            <AnimatePresence>
                                {programType.startsWith('wbl') && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="flex justify-center mt-3 overflow-hidden"
                                    >
                                        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl flex-wrap justify-center">
                                            <button
                                                onClick={() => setProgramType('wbl_abroad')}
                                                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-bold font-inter text-[8px] md:text-[10px] uppercase tracking-wider transition-all duration-300 ${programType === 'wbl_abroad'
                                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(110,40,255,0.3)]'
                                                    : 'text-white/50 hover:text-white'
                                                    }`}
                                            >
                                                International Programmes
                                            </button>
                                            <button
                                                onClick={() => setProgramType('wbl_domestic')}
                                                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-bold font-inter text-[8px] md:text-[10px] uppercase tracking-wider transition-all duration-300 ${programType === 'wbl_domestic' || programType === 'degree_programme'
                                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(110,40,255,0.3)]'
                                                    : 'text-white/50 hover:text-white'
                                                    }`}
                                            >
                                                Domestic Programmes
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* Controls Section */}
                <div className="max-w-[1300px] mx-auto mb-6 px-4">
                    <div className="flex flex-col gap-4 items-stretch">
                        {/* Search & Mobile Filter Toggle */}
                        <div className="flex items-center gap-3 w-full">
                            <div
                                className={`relative group transition-all duration-500 ${isSearchFocused ? 'scale-[1.01]' : 'scale-100'} flex-1 cursor-text`}
                                onClick={() => document.getElementById('catalog-search')?.focus()}
                            >
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary transition-colors">
                                    <Search size={16} />
                                </div>
                                <input
                                    id="catalog-search"
                                    type="text"
                                    placeholder="Search by tech, track, or instructor..."
                                    className="w-full pl-10 pr-4 py-2.5 md:py-3.5 bg-white/[0.04] backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-inter text-white placeholder:text-white/20 font-medium text-xs md:text-sm"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => {
                                        // Delay blurring to allow Clear Search button to be clicked
                                        setTimeout(() => {
                                            if (!filter) setIsSearchFocused(false);
                                        }, 200);
                                    }}
                                />
                            </div>
                            {/* University Filter - same row as search on desktop */}
                            {!isFixedUniversity && universities.length > 2 && (
                                <div className="hidden md:block shrink-0">
                                    <CustomSelect
                                        value={selectedUniversity}
                                        onChange={setSelectedUniversity}
                                        options={universities}
                                        align="right"
                                        className="bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl pl-4 pr-3 py-2.5 md:py-3.5 text-white/80 focus:border-primary/50 focus:outline-none transition-all font-inter text-xs md:text-sm shadow-xl min-w-[160px] max-w-[220px]"
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="md:hidden p-3.5 bg-white/[0.03] backdrop-blur-xl shadow-xl rounded-2xl border border-white/10 text-white/70 hover:text-white transition-colors flex shrink-0 items-center justify-center relative"
                            >
                                <Filter size={20} />
                                {selectedUniversity !== 'All' && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary border border-[#0A0714]"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="max-w-[1180px] mx-auto px-4">
                    {programType === 'wbl' ? (
                        <div className="py-20 text-center">
                            <p className="text-white/60 text-lg">Please select International or Domestic programmes above.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-20 md:py-40 space-y-8">
                            <div className="relative">
                                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[8px] md:text-[10px]">Syncing Knowledge Base</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center space-y-8 bg-white/[0.02] rounded-[40px] border border-white/5"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/10">
                                <SearchX size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white font-space">No matches found</h3>
                                <p className="text-text-muted font-inter max-w-sm mx-auto text-lg leading-relaxed">Try adjusting your search or filters to find what you're looking for.</p>
                            </div>
                            <ModernButton variant="secondary" onClick={() => setFilter('')} className="!px-10 !py-5 uppercase tracking-widest font-black text-xs">
                                Reset Filters
                            </ModernButton>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 gpu-accelerated">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Enquiry & FAQ Section */}
                <div className="max-w-[1400px] mx-auto mt-40 grid lg:grid-cols-2 gap-24">
                    <div className="space-y-16">
                        <div className="text-left space-y-6">
                            <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent mb-8"></div>
                            <h2 className="text-5xl font-black text-white font-space leading-tight">Course Intelligence</h2>
                            <p className="text-text-muted text-xl leading-relaxed font-inter max-w-xl">
                                Have questions about our certification protocols or curriculum architecture? Our expert advisors are ready to sync with your learning goals.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/5 hover:border-primary/40 transition-all duration-500 group shadow-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(110,40,255,0.4)] transition-all">
                                    <Sparkles size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-space">Academic Sync</h3>
                                <p className="text-sm text-text-muted leading-relaxed font-inter">Direct connection with our curriculum design team for custom track enquiries.</p>
                            </div>
                            <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/5 hover:border-primary/40 transition-all duration-500 group shadow-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(109,40,255,0.4)] transition-all">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-space">Institutional Core</h3>
                                <p className="text-sm text-text-muted leading-relaxed font-inter">Enterprise-grade solutions for universities and corporate learning clusters.</p>
                            </div>
                        </div>
                    </div>

                    <GlassCard className="!p-6 md:!p-8 border-white/10 shadow-glow-purple relative overflow-hidden group">
                        {/* Interior Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/15 transition-colors" />

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white font-inter uppercase tracking-widest">Initialise Enquiry</h3>
                                <p className="text-text-muted text-sm font-inter">Average response time: &lt; 24 hours</p>
                            </div>

                            <form className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Identity Name</label>
                                        <input type="text" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Auth Email</label>
                                        <input type="email" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="email@nexus.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Selection Matrix</label>
                                    <FormSelect 
                                        value={enquiryType}
                                        onChange={setEnquiryType}
                                        options={[
                                            'General Course Enquiry',
                                            'Technical Support',
                                            'Corporate Training',
                                            'University Integration'
                                        ]}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 hover:border-primary/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 font-inter text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Message Detail</label>
                                    <textarea rows="3" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="Structure your requirements here..."></textarea>
                                </div>
                                <ModernButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast.success('Ticket Raised Successfully. Our advisors will contact you shortly.');
                                    }}
                                    className="w-full !py-4 shadow-glow-gradient font-black uppercase tracking-[0.3em] text-[10px]"
                                >
                                    Raise a Ticket
                                </ModernButton>
                            </form>
                        </div>
                    </GlassCard>
                </div>

                {/* Mobile Filter Drawer Container */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#0A0714] border-t border-white/10 rounded-t-[32px] p-6 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-white font-jakarta mb-6">Filters</h3>

                                <div className="space-y-6">
                                    {/* Mobile University Select */}
                                    {!isFixedUniversity && universities.length > 2 && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-white/40 uppercase tracking-widest">Provider</label>
                                            <CustomSelect
                                                value={selectedUniversity}
                                                onChange={setSelectedUniversity}
                                                options={universities}
                                                align="left"
                                                className="w-full bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl pl-4 pr-3 py-3.5 text-white/80 focus:border-primary/50 focus:outline-none transition-all font-inter text-sm shadow-xl"
                                            />
                                        </div>
                                    )}
                                </div>

                                <ModernButton
                                    className="w-full mt-8 !py-4 justify-center shadow-glow-purple"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                >
                                    Apply Filters
                                </ModernButton>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default CourseCatalog;
