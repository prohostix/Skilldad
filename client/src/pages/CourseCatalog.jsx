import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Layers,
    Zap,
    ScrollText,
    Handshake,
    Plane,
    Sparkles,
    Compass,
    SearchX,
    ShieldCheck,
    ChevronDown,
    ArrowRight,
    Layers3,
    UserRoundCheck,
    GraduationCap,
    Briefcase,
    Lightbulb,
    TrendingUp,
    Star,
    Clock,
    ChevronRight
} from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import CourseCard from '../components/CourseCard';
import Footer from '../components/ui/Footer';
import StudyAbroad from './StudyAbroad';
import { toast } from 'react-hot-toast';
import { getMediaUrl } from '../utils/media';

const DEFAULT_CATEGORY_CARD_IMAGES = {
    skill_courses: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
    skill_integrated_diploma: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    wbl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces,top&w=600&h=375&q=80',
    study_abroad: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600'
};

const CustomSelect = ({ value, onChange, options, className, align = "right" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} cursor-pointer flex items-center justify-between gap-2 select-none`}
            >
                <span className="truncate pr-1">{value === 'All' ? 'All Providers' : value}</span>
                <ChevronDown size={14} className={`shrink-0 transition-transform text-white/40 [.light-mode_&]:!text-slate-400 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-[240px] bg-[#0E091D] border border-white/10 text-white [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-700 rounded-xl shadow-xl overflow-hidden z-50`}
                    >
                        <div className="max-h-[260px] overflow-y-auto custom-scrollbar py-1">
                            <div 
                                onClick={() => { onChange('All'); setIsOpen(false); }}
                                className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center gap-2.5 ${
                                    value === 'All' 
                                        ? 'bg-purple-900/40 text-[#C026FF] font-bold border-l-2 border-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-purple-700 [.light-mode_&]:!border-[#6E28FF]' 
                                        : 'text-white/80 hover:bg-white/5 [.light-mode_&]:!text-slate-700 [.light-mode_&]:!hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${value === 'All' ? 'bg-[#C026FF] [.light-mode_&]:!bg-[#6E28FF]' : 'bg-transparent'}`} />
                                <span className="truncate">All Providers</span>
                            </div>
                            {options.filter(u => u !== 'All').map(uni => (
                                <div 
                                    key={uni}
                                    onClick={() => { onChange(uni); setIsOpen(false); }}
                                    className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center gap-2.5 ${
                                        value === uni 
                                            ? 'bg-purple-900/40 text-[#C026FF] font-bold border-l-2 border-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-purple-700 [.light-mode_&]:!border-[#6E28FF]' 
                                            : 'text-white/80 hover:bg-white/5 [.light-mode_&]:!text-slate-700 [.light-mode_&]:!hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${value === uni ? 'bg-[#C026FF] [.light-mode_&]:!bg-[#6E28FF]' : 'bg-transparent'}`} />
                                    <span className="truncate">{uni}</span>
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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
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
                className={`${className} cursor-pointer flex items-center justify-between transition-all select-none`}
            >
                <span className="truncate text-white/80 [.light-mode_&]:!text-slate-700">{value}</span>
                <ChevronDown size={14} className={`text-white/40 [.light-mode_&]:!text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-[#0E091D] border border-white/10 text-white [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar py-1">
                            {options.map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center gap-2.5 ${
                                        value === opt 
                                            ? 'bg-purple-900/40 text-[#C026FF] font-bold border-l-2 border-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-purple-700 [.light-mode_&]:!border-[#6E28FF]' 
                                            : 'text-white/80 hover:bg-white/5 [.light-mode_&]:!text-slate-700 [.light-mode_&]:!hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${value === opt ? 'bg-[#C026FF] [.light-mode_&]:!bg-[#6E28FF]' : 'bg-transparent'}`} />
                                    <span className="truncate font-medium">{opt}</span>
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
    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryCardImages, setCategoryCardImages] = useState({});
    const getCategoryCardImage = (id) => {
        const custom = categoryCardImages[id];
        return custom ? getMediaUrl(custom) : DEFAULT_CATEGORY_CARD_IMAGES[id];
    };
    const [filter, setFilter] = useState(searchParams.get('search') || '');
    const [programType, setProgramType] = useState(() => {
        const saved = sessionStorage.getItem('catalogProgramType');
        if (saved === 'wbl') return 'wbl_abroad';
        return saved || 'course';
    });
    const [selectedUniversity, setSelectedUniversity] = useState(sessionStorage.getItem('catalogUniversity') || 'All');
    const [viewMode] = useState('grid'); // 'grid' | 'list'
    const [sortBy] = useState('popular'); // 'popular' | 'newest' | 'price_asc' | 'price_desc'
    const resultsSectionRef = useRef(null);
    const scrollToResults = () => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        sessionStorage.setItem('catalogProgramType', programType);
    }, [programType]);

    const isFirstProgramTypeRender = useRef(true);
    useEffect(() => {
        if (isFirstProgramTypeRender.current) {
            isFirstProgramTypeRender.current = false;
            return;
        }
        setSelectedUniversity('All');
    }, [programType]);

    useEffect(() => {
        sessionStorage.setItem('catalogUniversity', selectedUniversity);
    }, [selectedUniversity]);

    const [universityName, setUniversityName] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [showAllMobile, setShowAllMobile] = useState(false);
    const [enquiryType, setEnquiryType] = useState('General Course Enquiry');

    useEffect(() => {
        if (searchParams.get('search')) {
            setFilter(searchParams.get('search'));
        }
    }, [searchParams]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => window.scrollTo(0, 0), 100);
        axios.get('/health').catch(() => { });

        const fetchCourses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
                let url = '/api/courses';

                if (userInfo && userInfo.role === 'university' && userInfo._id) {
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

        axios.get('/api/catalog-cards')
            .then(({ data }) => setCategoryCardImages(data || {}))
            .catch(() => { });
    }, []);

    const filteredCourses = useMemo(() => {
        const isSkillDadCourse = (course) => {
            const univ = (course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || '').toLowerCase();
            const instRole = (course.instructor_role || course.instructor?.role || course.submitted_by_role || '').toLowerCase();
            return !univ || univ.includes('skilldad') || instRole === 'admin' || instRole === 'superadmin' || course.is_skilldad_official || course.isFeatured;
        };

        let filtered = courses.filter(course => {
            const searchText = filter.toLowerCase();

            const matchesSearch =
                course.title?.toLowerCase().includes(searchText) ||
                (course.instructorName || course.instructor?.name || '').toLowerCase().includes(searchText) ||
                (course.universityName || course.instructor?.profile?.universityName || '').toLowerCase().includes(searchText);

            const courseUniversity = course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad';
            const matchesUniversity = selectedUniversity === 'All' || courseUniversity === selectedUniversity;

            const courseType = course.programType || course.program_type || 'course';
            const matchesProgramType = (filter || programType === 'all') ? true : courseType === programType;

            return matchesSearch && matchesUniversity && matchesProgramType;
        });

        // Sorting by user preference
        if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
        } else if (sortBy === 'price_asc') {
            filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        } else {
            // Default: Most Popular (featured first, then display_order / date, SkillDad official priority)
            filtered.sort((a, b) => {
                if (!programType.startsWith('wbl')) {
                    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
                    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
                    return dateB - dateA;
                } else {
                    const orderA = a.displayOrder !== undefined ? a.displayOrder : (a.display_order !== undefined ? a.display_order : 999);
                    const orderB = b.displayOrder !== undefined ? b.displayOrder : (b.display_order !== undefined ? b.display_order : 999);
                    if (orderA !== orderB) return orderA - orderB;
                    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
                    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
                    return dateB - dateA;
                }
            });

            filtered.sort((a, b) => {
                const aFeatured = Boolean(a.isFeatured || a.is_featured) ? 1 : 0;
                const bFeatured = Boolean(b.isFeatured || b.is_featured) ? 1 : 0;
                if (bFeatured !== aFeatured) return bFeatured - aFeatured;

                const aVal = isSkillDadCourse(a) ? 1 : 0;
                const bVal = isSkillDadCourse(b) ? 1 : 0;
                return bVal - aVal;
            });
        }

        return filtered;
    }, [courses, filter, selectedUniversity, programType, sortBy]);

    const isFixedUniversity = !!universityName;

    const universities = useMemo(() => {
        if (isFixedUniversity) return [];
        const coursesInTab = courses.filter(course => {
            if (programType === 'all') return true;
            return (course.programType || course.program_type || 'course') === programType;
        });
        const allUnis = coursesInTab.map(course => course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad');
        return ['All', ...new Set(allUnis.filter(Boolean))];
    }, [courses, isFixedUniversity, programType]);

    // Program Counts
    const skillCount = useMemo(() => courses.filter(c => (c.programType || c.program_type || 'course') === 'course').length, [courses]);
    const diplomaCount = useMemo(() => courses.filter(c => (c.programType || c.program_type || '') === 'degree_programme').length, [courses]);
    const wblCount = useMemo(() => courses.filter(c => (c.programType || c.program_type || '').startsWith('wbl')).length, [courses]);

    return (
        <div className="min-h-screen course-catalog-page bg-[#090514] [.light-mode_&]:!bg-[#FAF8FE] text-white [.light-mode_&]:!text-slate-800 relative font-sans transition-colors duration-300">
            <Navbar />

            <main className="pt-16 pb-20">
                {/* Hero Banner Container */}
                <div className="w-full mb-8">
                    <div className="bg-gradient-to-r from-[#170C30] via-[#1F1040] to-[#2B1454] border-y border-purple-900/40 [.light-mode_&]:!bg-gradient-to-r [.light-mode_&]:!from-[#F4EEFE] [.light-mode_&]:!via-[#EDE4FD] [.light-mode_&]:!to-[#E5D7FA] [.light-mode_&]:!border-[#E2D4F7] py-4 sm:py-5 md:py-6 px-4 sm:px-6 lg:px-10 relative overflow-hidden shadow-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10">
                            {/* Left Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="lg:col-span-7 space-y-2 md:space-y-3"
                            >

                                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white [.light-mode_&]:!text-[#1E0E4E] tracking-tight leading-[1.15]">
                                    {universityName ? (
                                        <>Courses by <span className="text-[#C026FF] [.light-mode_&]:!text-[#5E0289]">{universityName}</span></>
                                    ) : (
                                        <>
                                            Build Skills for a <br className="hidden sm:inline" />
                                            <span className="text-[#C026FF] [.light-mode_&]:!text-[#5E0289]">Brighter Future</span>
                                        </>
                                    )}
                                </h1>

                                <p className="text-purple-200/70 [.light-mode_&]:!text-slate-600 text-sm md:text-[15px] max-w-xl leading-relaxed">
                                    Choose from a wide range of industry-focused courses, certified programs and flexible learning options — designed to help you get job ready.
                                </p>

                                {/* 3 Feature Badges */}
                                <div className="pt-1 flex flex-wrap gap-2.5 sm:gap-3">
                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-150 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-xs">
                                        <div className="w-8 h-8 rounded-lg bg-purple-900/50 text-[#4C1D95] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <Layers3 size={16} />
                                        </div>
                                        <div className="text-[11px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500">Industry-Relevant</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">Curriculum</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-150 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-xs">
                                        <div className="w-8 h-8 rounded-lg bg-purple-900/50 text-[#4C1D95] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <UserRoundCheck size={16} />
                                        </div>
                                        <div className="text-[11px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500">Expert Mentors</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">& Guidance</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur border border-white/10 [.light-mode_&]:!bg-white/90 [.light-mode_&]:!border-purple-150 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-xs">
                                        <div className="w-8 h-8 rounded-lg bg-purple-900/50 text-[#4C1D95] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#4C1D95] flex items-center justify-center shrink-0">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div className="text-[11px] leading-tight text-white/70 [.light-mode_&]:!text-slate-700">
                                            <span className="text-white/40 [.light-mode_&]:!text-slate-500">Placement Support</span>
                                            <div className="font-bold text-white [.light-mode_&]:!text-slate-900">& Career Services</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Hero Visual with Student & Callouts */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                                className="lg:col-span-5 relative flex items-center justify-center lg:justify-end"
                            >
                                <div className="relative w-[200px] sm:w-[230px] md:w-[250px] aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border-2 border-white/20 [.light-mode_&]:!border-white/80 bg-purple-950/40 [.light-mode_&]:!bg-purple-100">
                                    <img
                                        src="/course_hero_student.jpg"
                                        alt="SkillDad Student"
                                        className="w-full h-full object-cover object-center"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/career_hero_student.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Catalog Section */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-stretch">

                        {/* LEFT SIDEBAR */}
                        <aside className="w-full lg:w-[260px] shrink-0 space-y-5 flex flex-col">
                            {/* Card 1: Explore by Program Type */}
                            <div className="bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200/90 rounded-2xl p-3 shadow-xs h-full">
                                {/* All Courses Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProgramType('all');
                                        setFilter('');
                                        scrollToResults();
                                    }}
                                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                                        programType === 'all'
                                            ? 'bg-purple-900/30 text-[#C026FF] font-bold border border-purple-800/40 [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289] [.light-mode_&]:!border-purple-200'
                                            : 'text-white/70 hover:bg-white/5 [.light-mode_&]:!text-slate-700 [.light-mode_&]:!hover:bg-slate-50 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            programType === 'all' 
                                                ? 'bg-[#C026FF] text-white [.light-mode_&]:!bg-[#5E0289] [.light-mode_&]:!text-white' 
                                                : 'bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289]'
                                        }`}>
                                            <Layers 
                                                size={16} 
                                                color={programType === 'all' ? '#ffffff' : undefined}
                                                className={programType === 'all' ? '!text-white text-white [.light-mode_&]:!text-white' : ''}
                                            />
                                        </div>
                                        <span className="text-sm">All Courses</span>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 [.light-mode_&]:!bg-purple-100 [.light-mode_&]:!text-[#5E0289]">
                                        {courses.length || 120}
                                    </span>
                                </button>

                                <div className="mt-4 mb-2 px-2">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40 [.light-mode_&]:!text-slate-400">
                                        Explore by Program Type
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
                                    {/* 1: Skill Courses */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('course');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                            programType === 'course'
                                                ? 'bg-purple-950/60 border-l-4 border-[#C026FF] text-white [.light-mode_&]:!bg-purple-50/80 [.light-mode_&]:!border-[#5E0289] [.light-mode_&]:!text-slate-900 shadow-xs'
                                                : 'text-white/60 hover:bg-white/5 border-l-4 border-transparent [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289] flex items-center justify-center shrink-0">
                                                <Zap size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-xs font-bold text-white [.light-mode_&]:!text-slate-800 truncate">Skill Courses</div>
                                                <div className="text-[10px] text-white/40 [.light-mode_&]:!text-slate-400 truncate">Short-term, focused skill building</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 [.light-mode_&]:!text-slate-400 pl-2">
                                            {skillCount || 64}
                                        </span>
                                    </button>

                                    {/* 2: Skill Integrated Diploma */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('degree_programme');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                            programType === 'degree_programme'
                                                ? 'bg-purple-950/60 border-l-4 border-[#C026FF] text-white [.light-mode_&]:!bg-purple-50/80 [.light-mode_&]:!border-[#5E0289] [.light-mode_&]:!text-slate-900 shadow-xs'
                                                : 'text-white/60 hover:bg-white/5 border-l-4 border-transparent [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289] flex items-center justify-center shrink-0">
                                                <ScrollText size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-xs font-bold text-white [.light-mode_&]:!text-slate-800 truncate">Skill Integrated Diploma</div>
                                                <div className="text-[10px] text-white/40 [.light-mode_&]:!text-slate-400 truncate">In-depth learning + practical exposure</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 [.light-mode_&]:!text-slate-400 pl-2">
                                            {diplomaCount || 18}
                                        </span>
                                    </button>

                                    {/* 3: WBL (Work Based Learning) */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('wbl_abroad');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                            programType.startsWith('wbl')
                                                ? 'bg-purple-950/60 border-l-4 border-[#C026FF] text-white [.light-mode_&]:!bg-purple-50/80 [.light-mode_&]:!border-[#5E0289] [.light-mode_&]:!text-slate-900 shadow-xs'
                                                : 'text-white/60 hover:bg-white/5 border-l-4 border-transparent [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289] flex items-center justify-center shrink-0">
                                                <Handshake size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-xs font-bold text-white [.light-mode_&]:!text-slate-800 truncate">WBL (Work Based Learning)</div>
                                                <div className="text-[10px] text-white/40 [.light-mode_&]:!text-slate-400 truncate">Learn + Work + Get Hired</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 [.light-mode_&]:!text-slate-400 pl-2">
                                            {wblCount || 12}
                                        </span>
                                    </button>

                                    {/* 4: Study Abroad */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('study_abroad');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                            programType === 'study_abroad'
                                                ? 'bg-purple-950/60 border-l-4 border-[#C026FF] text-white [.light-mode_&]:!bg-purple-50/80 [.light-mode_&]:!border-[#5E0289] [.light-mode_&]:!text-slate-900 shadow-xs'
                                                : 'text-white/60 hover:bg-white/5 border-l-4 border-transparent [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#5E0289] flex items-center justify-center shrink-0">
                                                <Plane size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-xs font-bold text-white [.light-mode_&]:!text-slate-800 truncate">Study Abroad</div>
                                                <div className="text-[10px] text-white/40 [.light-mode_&]:!text-slate-400 truncate">Global exposure & international degrees</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 [.light-mode_&]:!text-slate-400 pl-2">
                                            26
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT MAIN CONTENT */}
                        <div className="flex-1 min-w-0 flex flex-col space-y-8">

                            {/* SECTION 1: Courses for Every Career Path */}
                            <div className="flex flex-col lg:flex-1">
                                <div className="mb-4">
                                    <h2 className="text-xl md:text-2xl font-extrabold text-white [.light-mode_&]:!text-[#1E0E4E] tracking-tight">
                                        Courses for Every Career Path
                                    </h2>
                                    <p className="text-xs md:text-sm text-white/60 [.light-mode_&]:!text-slate-500 mt-0.5">
                                        Explore our most popular course categories and find the right program for your goals.
                                    </p>
                                </div>

                                {/* 4 Career Path Category Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:flex-1 content-stretch items-stretch">
                                    {/* Card 1: Skill Courses */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.4, delay: 0 }}
                                        onClick={() => { setProgramType('course'); scrollToResults(); }}
                                        className={`bg-[#0E091D] border rounded-2xl transition-all duration-300 p-3 flex flex-col group cursor-pointer ${
                                            programType === 'course'
                                                ? 'border-[#C026FF] ring-2 ring-purple-500/30 [.light-mode_&]:!border-[#6E28FF] [.light-mode_&]:!ring-purple-100 shadow-md'
                                                : 'border-white/10 hover:border-purple-500/40 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!bg-white [.light-mode_&]:!hover:border-purple-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900 [.light-mode_&]:!bg-slate-100">
                                            <img
                                                src={getCategoryCardImage('skill_courses')}
                                                alt="Skill Courses"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-white group-hover:text-[#C026FF] [.light-mode_&]:!text-slate-900 [.light-mode_&]:!group-hover:text-[#6E28FF] text-sm transition-colors mb-1">
                                            Skill Courses
                                        </h3>
                                        <p className="text-[11px] text-white/50 [.light-mode_&]:!text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            Build in-demand skills with flexible, short-term courses.
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/10 [.light-mode_&]:!border-slate-100 mt-auto">
                                            <span className="text-[11px] font-semibold text-white/70 [.light-mode_&]:!text-slate-600 flex items-center gap-1">
                                                <Zap size={12} className="text-[#C026FF] [.light-mode_&]:!text-[#6E28FF]" />
                                                {skillCount || 64} Courses
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-purple-900/40 group-hover:bg-[#C026FF] text-purple-300 group-hover:text-white [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!group-hover:bg-[#6E28FF] [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center transition-colors">
                                                <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Card 2: Skill Integrated Diploma */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.4, delay: 0.06 }}
                                        onClick={() => { setProgramType('degree_programme'); scrollToResults(); }}
                                        className={`bg-[#0E091D] border rounded-2xl transition-all duration-300 p-3 flex flex-col group cursor-pointer ${
                                            programType === 'degree_programme'
                                                ? 'border-[#C026FF] ring-2 ring-purple-500/30 [.light-mode_&]:!border-[#6E28FF] [.light-mode_&]:!ring-purple-100 shadow-md'
                                                : 'border-white/10 hover:border-purple-500/40 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!bg-white [.light-mode_&]:!hover:border-purple-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900 [.light-mode_&]:!bg-slate-100">
                                            <img
                                                src={getCategoryCardImage('skill_integrated_diploma')}
                                                alt="Skill Integrated Diploma"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-white group-hover:text-[#C026FF] [.light-mode_&]:!text-slate-900 [.light-mode_&]:!group-hover:text-[#6E28FF] text-sm transition-colors mb-1">
                                            Skill Integrated Diploma Programmes
                                        </h3>
                                        <p className="text-[11px] text-white/50 [.light-mode_&]:!text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            Get industry-aligned diploma programs with hands-on training and career support.
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/10 [.light-mode_&]:!border-slate-100 mt-auto">
                                            <span className="text-[11px] font-semibold text-white/70 [.light-mode_&]:!text-slate-600 flex items-center gap-1">
                                                <ScrollText size={12} className="text-[#C026FF] [.light-mode_&]:!text-[#6E28FF]" />
                                                {diplomaCount || 18} Programmes
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-purple-900/40 group-hover:bg-[#C026FF] text-purple-300 group-hover:text-white [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!group-hover:bg-[#6E28FF] [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center transition-colors">
                                                <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Card 3: WBL (Work Based Learning) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.4, delay: 0.12 }}
                                        onClick={() => { setProgramType('wbl_abroad'); scrollToResults(); }}
                                        className={`bg-[#0E091D] border rounded-2xl transition-all duration-300 p-3 flex flex-col group cursor-pointer ${
                                            programType.startsWith('wbl')
                                                ? 'border-[#C026FF] ring-2 ring-purple-500/30 [.light-mode_&]:!border-[#6E28FF] [.light-mode_&]:!ring-purple-100 shadow-md'
                                                : 'border-white/10 hover:border-purple-500/40 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!bg-white [.light-mode_&]:!hover:border-purple-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900 [.light-mode_&]:!bg-slate-100">
                                            <img
                                                src={getCategoryCardImage('wbl')}
                                                alt="WBL"
                                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-white group-hover:text-[#C026FF] [.light-mode_&]:!text-slate-900 [.light-mode_&]:!group-hover:text-[#6E28FF] text-sm transition-colors mb-1">
                                            WBL (Work Based Learning)
                                        </h3>
                                        <p className="text-[11px] text-white/50 [.light-mode_&]:!text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            Gain real-world experience while you learn. Work with top companies and build your career.
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/10 [.light-mode_&]:!border-slate-100 mt-auto">
                                            <span className="text-[11px] font-semibold text-white/70 [.light-mode_&]:!text-slate-600 flex items-center gap-1">
                                                <Handshake size={12} className="text-[#C026FF] [.light-mode_&]:!text-[#6E28FF]" />
                                                {wblCount || 12} Programmes
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-purple-900/40 group-hover:bg-[#C026FF] text-purple-300 group-hover:text-white [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!group-hover:bg-[#6E28FF] [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center transition-colors">
                                                <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Card 4: Study Abroad */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.4, delay: 0.18 }}
                                        onClick={() => { setProgramType('study_abroad'); scrollToResults(); }}
                                        className={`bg-[#0E091D] border rounded-2xl transition-all duration-300 p-3 flex flex-col group cursor-pointer ${
                                            programType === 'study_abroad'
                                                ? 'border-[#C026FF] ring-2 ring-purple-500/30 [.light-mode_&]:!border-[#6E28FF] [.light-mode_&]:!ring-purple-100 shadow-md'
                                                : 'border-white/10 hover:border-purple-500/40 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!bg-white [.light-mode_&]:!hover:border-purple-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900 [.light-mode_&]:!bg-slate-100">
                                            <img
                                                src={getCategoryCardImage('study_abroad')}
                                                alt="Study Abroad"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-white group-hover:text-[#C026FF] [.light-mode_&]:!text-slate-900 [.light-mode_&]:!group-hover:text-[#6E28FF] text-sm transition-colors mb-1">
                                            Study Abroad
                                        </h3>
                                        <p className="text-[11px] text-white/50 [.light-mode_&]:!text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            Get global exposure with international university partnerships and programs.
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/10 [.light-mode_&]:!border-slate-100 mt-auto">
                                            <span className="text-[11px] font-semibold text-white/70 [.light-mode_&]:!text-slate-600 flex items-center gap-1">
                                                <Plane size={12} className="text-[#C026FF] [.light-mode_&]:!text-[#6E28FF]" />
                                                26 Programmes
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-purple-900/40 group-hover:bg-[#C026FF] text-purple-300 group-hover:text-white [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!group-hover:bg-[#6E28FF] [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center transition-colors">
                                                <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Search, filters and course results - full page width, not constrained by the sidebar column */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

                            {/* Search & Provider Filter Bar */}
                            <div className="bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200/90 rounded-2xl p-3 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 flex items-center">
                                        <div className="absolute left-3.5 pointer-events-none text-white/40 [.light-mode_&]:!text-slate-400">
                                            <Search size={16} />
                                        </div>
                                        <input
                                            id="catalog-search"
                                            type="text"
                                            placeholder="Search by tech, track, or instructor..."
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-[#130E26] border border-white/10 text-white placeholder:text-white/30 focus:border-[#C026FF] [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!hover:bg-slate-100/80 [.light-mode_&]:!focus:bg-white [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-800 [.light-mode_&]:!placeholder:text-slate-400 [.light-mode_&]:!focus:border-[#6E28FF] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-900/40 [.light-mode_&]:!focus:ring-purple-100 transition-all"
                                        />
                                        {filter && (
                                            <button
                                                type="button"
                                                onClick={() => setFilter('')}
                                                className="absolute right-3 text-xs text-white/40 hover:text-white [.light-mode_&]:!text-slate-400 [.light-mode_&]:!hover:text-slate-700 font-medium"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {!isFixedUniversity && universities.length > 2 && (
                                        <div className="hidden sm:block shrink-0">
                                            <CustomSelect
                                                value={selectedUniversity}
                                                onChange={setSelectedUniversity}
                                                options={universities}
                                                align="right"
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl pl-3.5 pr-3 py-2 text-white/80 [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!hover:bg-slate-100/80 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-700 text-xs font-medium shadow-xs min-w-[170px]"
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsMobileFilterOpen(true)}
                                        className="sm:hidden p-2 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-[#C026FF] [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:text-[#6E28FF] flex shrink-0 items-center justify-center relative"
                                    >
                                        <Filter size={16} />
                                        {selectedUniversity !== 'All' && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C026FF] [.light-mode_&]:!bg-[#6E28FF]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* WBL Sub-tabs (International vs Domestic) */}
                            {programType.startsWith('wbl') && (
                                <div className="flex items-center gap-2 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200/90 p-1.5 rounded-xl w-fit shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('wbl_abroad');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            programType === 'wbl_abroad'
                                                ? 'bg-[#C026FF] text-white shadow-xs'
                                                : 'text-white/60 hover:text-white [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:text-slate-900'
                                        }`}
                                    >
                                        International Programmes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgramType('wbl_domestic');
                                            setShowAllMobile(false);
                                            scrollToResults();
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            programType === 'wbl_domestic'
                                                ? 'bg-[#C026FF] text-white shadow-xs'
                                                : 'text-white/60 hover:text-white [.light-mode_&]:!text-slate-600 [.light-mode_&]:!hover:text-slate-900'
                                        }`}
                                    >
                                        Domestic Programmes
                                    </button>
                                </div>
                            )}

                            {/* SECTION 2: Popular Courses */}
                            <div ref={resultsSectionRef}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-white [.light-mode_&]:!text-[#1E0E4E] tracking-tight">
                                            Popular Courses
                                        </h2>
                                        <p className="text-xs md:text-sm text-white/60 [.light-mode_&]:!text-slate-500 mt-0.5">
                                            Start your learning journey with our most enrolled courses.
                                        </p>
                                    </div>
                                </div>

                                {/* Main Grid / List or Embeds */}
                                {programType === 'study_abroad' ? (
                                    <div className="bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl p-4 sm:p-6">
                                        <StudyAbroad isEmbedded={true} />
                                    </div>
                                ) : loading ? (
                                    <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl">
                                        <div className="w-10 h-10 border-3 border-purple-800/40 border-t-[#C026FF] rounded-full animate-spin" />
                                        <p className="text-white/40 [.light-mode_&]:!text-slate-400 font-bold tracking-wider text-xs uppercase">Loading Courses...</p>
                                    </div>
                                ) : filteredCourses.length === 0 ? (
                                    <div className="py-20 text-center space-y-4 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl p-8 shadow-xs">
                                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#6E28FF]">
                                            <SearchX size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white [.light-mode_&]:!text-slate-800">No matches found</h3>
                                        <p className="text-white/50 [.light-mode_&]:!text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
                                            Try adjusting your search query or clear filters to see more courses.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilter('');
                                                setSelectedUniversity('All');
                                                setProgramType('all');
                                            }}
                                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5" : "space-y-4"}>
                                            {filteredCourses.map((course, index) => {
                                                const isHiddenOnMobile = !showAllMobile && index >= 8;
                                                return (
                                                    <motion.div
                                                        key={course._id}
                                                        initial={{ opacity: 0, y: 16 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, margin: '-40px' }}
                                                        transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
                                                        className={`${isHiddenOnMobile ? 'hidden sm:block' : 'block'}`}
                                                    >
                                                        <CourseCard
                                                            variant="catalog"
                                                            course={course}
                                                            horizontal={viewMode === 'list'}
                                                            isWBLView={programType.startsWith('wbl')}
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {!showAllMobile && filteredCourses.length > 8 && (
                                            <div className="mt-6 flex justify-center sm:hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllMobile(true)}
                                                    className="px-4 py-2 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-xl text-xs font-semibold text-[#C026FF] [.light-mode_&]:!text-[#6E28FF] shadow-xs flex items-center gap-1.5"
                                                >
                                                    <span>View More Courses</span>
                                                    <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                </div>

                {/* SECTION 3: Bottom Course Finder Horizontal Banner (full page width, not constrained by the sidebar column) */}
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="relative overflow-hidden rounded-2xl border border-purple-200/80 bg-gradient-to-r from-[#F4F1FE] via-[#EDE7FD] to-[#EAE3FD] p-4 sm:p-5 shadow-sm transition-all duration-300 [.dark-mode_&]:!border-purple-500/25 [.dark-mode_&]:!bg-gradient-to-r [.dark-mode_&]:!from-[#160B2A] [.dark-mode_&]:!via-[#200F3E] [.dark-mode_&]:!to-[#180A2E]">
                        {/* Subtle background ambient shapes matching the reference */}
                        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl [.dark-mode_&]:!bg-purple-600/15" />
                        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-56 w-56 rounded-full bg-purple-200/30 blur-2xl [.dark-mode_&]:!bg-purple-900/20" />

                        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center gap-4 lg:gap-5">
                            {/* Left Text Block & Feature Icons */}
                            <div className="w-full lg:flex-1 min-w-0">
                                {/* Heading */}
                                <h3 className="text-sm sm:text-base lg:text-lg font-extrabold text-[#0F172A] tracking-tight leading-snug [.dark-mode_&]:!text-white">
                                    Not sure which course fits your career?{' '}
                                    <span className="text-[#5B21B6] [.dark-mode_&]:!text-[#C026FF]">
                                        Let's find it together.
                                    </span>
                                </h3>

                                {/* Description */}
                                <p className="text-[11px] text-[#475569] mt-1 leading-relaxed font-normal max-w-[420px] [.dark-mode_&]:!text-purple-200/80">
                                    Answer a few quick questions to get personalized recommendations from 500+ accredited university programs and placement tracks.
                                </p>

                                {/* Three Feature Icons in a Row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                                    {/* Feature 1: Personalized Recommendations */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center shrink-0 [.dark-mode_&]:!bg-white/10 [.dark-mode_&]:!text-purple-300">
                                            <svg className="w-3 h-3 text-[#5B21B6] [.dark-mode_&]:!text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <circle cx="12" cy="12" r="6" />
                                                <circle cx="12" cy="12" r="2" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] font-semibold text-[#334155] leading-tight whitespace-nowrap [.dark-mode_&]:!text-purple-100">
                                            Personalized Recommendations
                                        </span>
                                    </div>

                                    {/* Feature 2: Career-Focused Learning Path */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center shrink-0 [.dark-mode_&]:!bg-white/10 [.dark-mode_&]:!text-purple-300">
                                            <GraduationCap size={13} className="text-[#5B21B6] [.dark-mode_&]:!text-purple-300" />
                                        </div>
                                        <span className="text-[9px] font-semibold text-[#334155] leading-tight whitespace-nowrap [.dark-mode_&]:!text-purple-100">
                                            Career-Focused Learning Path
                                        </span>
                                    </div>

                                    {/* Feature 3: Job-Oriented Course Suggestions */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center shrink-0 [.dark-mode_&]:!bg-white/10 [.dark-mode_&]:!text-purple-300">
                                            <Briefcase size={13} className="text-[#5B21B6] [.dark-mode_&]:!text-purple-300" />
                                        </div>
                                        <span className="text-[9px] font-semibold text-[#334155] leading-tight whitespace-nowrap [.dark-mode_&]:!text-purple-100">
                                            Job-Oriented Course Suggestions
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Image - normal flow, so it can never overlap the text */}
                            <div className="hidden lg:flex items-end justify-center shrink-0 self-stretch">
                                <img
                                    src="/course_finder_student_blended.png"
                                    alt="Student Guidance"
                                    className="h-[110px] xl:h-[125px] w-auto object-contain select-none"
                                />
                            </div>

                            {/* Right White Card with CTA */}
                            <div className="shrink-0 w-full lg:w-auto">
                                <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-white/80 shadow-[0_4px_20px_rgba(91,33,182,0.06)] flex flex-col items-center justify-center text-center w-full lg:w-[150px] gap-2 [.dark-mode_&]:!bg-white/10 [.dark-mode_&]:!border-white/15 [.dark-mode_&]:!shadow-xl">
                                    {/* Takes just 2 minutes Pill */}
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF5FF] border border-[#F3E8FF] text-[9.5px] font-semibold text-[#5B21B6] whitespace-nowrap [.dark-mode_&]:!bg-purple-500/20 [.dark-mode_&]:!border-purple-400/30 [.dark-mode_&]:!text-purple-200">
                                        <Clock size={10} className="text-[#5B21B6] [.dark-mode_&]:!text-purple-300 shrink-0" />
                                        <span>Takes just 2 minutes</span>
                                    </div>

                                    {/* Small CTA Button */}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard/course-finder')}
                                        className="px-2.5 py-1 rounded-lg bg-[#5B21B6] hover:bg-[#4C1D95] active:scale-[0.98] text-white text-[10px] font-semibold flex items-center justify-center gap-1 shadow-sm shadow-purple-950/20 hover:shadow transition-all cursor-pointer whitespace-nowrap [.dark-mode_&]:!bg-[#8B5CF6] [.dark-mode_&]:hover:!bg-[#7C3AED]"
                                    >
                                        <span>Start Course Finder</span>
                                        <ArrowRight size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enquiry & FAQ Section */}
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div>
                            <div className="w-12 h-1 bg-[#C026FF] [.light-mode_&]:!bg-[#6E28FF] rounded-full mb-3" />
                            <h2 className="text-2xl font-bold text-white [.light-mode_&]:!text-slate-900">Course Intelligence</h2>
                            <p className="text-white/60 [.light-mode_&]:!text-slate-600 text-sm mt-1 max-w-lg leading-relaxed">
                                Have questions about our certification protocols or curriculum architecture? Our expert advisors are ready to sync with your learning goals.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-5 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl shadow-xs hover:border-purple-400 transition-all">
                                <div className="w-9 h-9 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center mb-3">
                                    <Sparkles size={18} />
                                </div>
                                <h3 className="text-sm font-bold text-white [.light-mode_&]:!text-slate-900 mb-1">Academic Sync</h3>
                                <p className="text-xs text-white/50 [.light-mode_&]:!text-slate-500 leading-relaxed">Direct connection with our curriculum design team for custom track enquiries.</p>
                            </div>

                            <div className="p-5 bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl shadow-xs hover:border-purple-400 transition-all">
                                <div className="w-9 h-9 rounded-lg bg-purple-900/40 text-[#C026FF] [.light-mode_&]:!bg-purple-50 [.light-mode_&]:!text-[#6E28FF] flex items-center justify-center mb-3">
                                    <ShieldCheck size={18} />
                                </div>
                                <h3 className="text-sm font-bold text-white [.light-mode_&]:!text-slate-900 mb-1">Institutional Core</h3>
                                <p className="text-xs text-white/50 [.light-mode_&]:!text-slate-500 leading-relaxed">Enterprise-grade solutions for universities and corporate learning clusters.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0E091D] border border-white/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-white [.light-mode_&]:!text-slate-900">Raise an Enquiry</h3>
                            <p className="text-white/40 [.light-mode_&]:!text-slate-500 text-xs">Average response time: &lt; 24 hours</p>
                        </div>

                        <form className="space-y-3.5">
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-white/70 [.light-mode_&]:!text-slate-600 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:bg-[#130E26] focus:border-[#C026FF] [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-800 [.light-mode_&]:!placeholder:text-slate-400 [.light-mode_&]:!focus:bg-white [.light-mode_&]:!focus:border-[#6E28FF] focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-white/70 [.light-mode_&]:!text-slate-600 mb-1 block">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@domain.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:bg-[#130E26] focus:border-[#C026FF] [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-800 [.light-mode_&]:!placeholder:text-slate-400 [.light-mode_&]:!focus:bg-white [.light-mode_&]:!focus:border-[#6E28FF] focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-white/70 [.light-mode_&]:!text-slate-600 mb-1 block">Enquiry Type</label>
                                <FormSelect
                                    value={enquiryType}
                                    onChange={setEnquiryType}
                                    options={[
                                        'General Course Enquiry',
                                        'Technical Support',
                                        'Corporate Training',
                                        'University Integration'
                                    ]}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white hover:border-purple-400 [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-800 [.light-mode_&]:!hover:border-purple-300 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-white/70 [.light-mode_&]:!text-slate-600 mb-1 block">Message</label>
                                <textarea
                                    rows="3"
                                    placeholder="Write your requirements here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:bg-[#130E26] focus:border-[#C026FF] [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-800 [.light-mode_&]:!placeholder:text-slate-400 [.light-mode_&]:!focus:bg-white [.light-mode_&]:!focus:border-[#6E28FF] focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toast.success('Ticket Raised Successfully. Our advisors will contact you shortly.');
                                }}
                                className="w-full py-2.5 bg-[#5E0289] hover:bg-[#4d0271] active:bg-[#3d0159] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm shadow-purple-950/20 transition-all cursor-pointer"
                            >
                                Raise a Ticket
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs sm:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#0E091D] border-t border-white/10 text-white [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200 [.light-mode_&]:!text-slate-900 rounded-t-3xl p-6 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-12 h-1 bg-white/20 [.light-mode_&]:!bg-slate-300 rounded-full mx-auto mb-5" />
                                <h3 className="text-lg font-bold text-white [.light-mode_&]:!text-slate-900 mb-4">Filter Courses</h3>

                                {!isFixedUniversity && universities.length > 2 && (
                                    <div className="space-y-2 mb-6">
                                        <label className="text-xs font-bold text-white/60 [.light-mode_&]:!text-slate-500 uppercase tracking-wider">Select Provider</label>
                                        <CustomSelect
                                            value={selectedUniversity}
                                            onChange={setSelectedUniversity}
                                            options={universities}
                                            align="left"
                                            className="w-full bg-white/5 border border-white/10 [.light-mode_&]:!bg-slate-50 [.light-mode_&]:!border-slate-200 rounded-xl px-4 py-3 text-white [.light-mode_&]:!text-slate-800 text-sm"
                                        />
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full py-3 bg-[#5E0289] hover:bg-[#4d0271] active:bg-[#3d0159] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm shadow-purple-950/20"
                                >
                                    Apply Filters
                                </button>
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
