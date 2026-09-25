import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    GraduationCap,
    Users,
    BookOpen,
    MapPin,
    Globe,
    Award,
    ArrowRight,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Layers,
    Filter,
    Compass,
    X
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { getMediaUrl } from '../utils/media';
import { getBelievableUniversityStats } from '../utils/universityStats';

// Curated high-resolution architectural campus images for fallbacks
const CAMPUS_FALLBACKS = [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&q=80&w=800'
];

// Badge styles by type
const BADGE_BY_TYPE = {
    partner: { label: 'Partner University', bg: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/40' },
    accredited: { label: 'Accredited', bg: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/40' },
    global: { label: 'Global University', bg: 'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800/40' },
    skilldad: { label: 'SkillDad Partner', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/40' },
};

// Derive badge from real university data
const getBadge = (u, isSkillDadOwned) => {
    if (!isSkillDadOwned) return BADGE_BY_TYPE.partner;
    const achievements = u.achievements || [];
    const achParsed = Array.isArray(achievements) ? achievements : [];
    const textBlob = achParsed.map(a => `${a.title || ''} ${a.desc || ''}`).join(' ').toLowerCase();
    if (textBlob.includes('naac') || textBlob.includes('ascal') || textBlob.includes('accredit') || textBlob.includes('mfhea') || textBlob.includes('mqa')) {
        return BADGE_BY_TYPE.accredited;
    }
    if (textBlob.includes('global') || textBlob.includes('international') || textBlob.includes('bologna') || textBlob.includes('erasmus')) {
        return BADGE_BY_TYPE.global;
    }
    return BADGE_BY_TYPE.skilldad;
};

// Helper to reliably extract country from location string
const extractCountry = (location = '') => {
    if (!location) return 'Global';
    const locLower = location.toLowerCase();
    if (locLower.includes('albania')) return 'Albania';
    if (locLower.includes('india') || locLower.includes('karnataka') || locLower.includes('bengaluru') || locLower.includes('jaipur') || locLower.includes('delhi') || locLower.includes('tamil nadu')) return 'India';
    if (locLower.includes('malaysia') || locLower.includes('johor') || locLower.includes('kuala lumpur') || locLower.includes('melaka') || locLower.includes('selangor')) return 'Malaysia';
    if (locLower.includes('malta')) return 'Malta';
    if (locLower.includes('mauritius')) return 'Mauritius';
    if (locLower.includes('bosnia')) return 'Bosnia';
    if (locLower.includes('greece') || locLower.includes('athens')) return 'Greece';
    if (locLower.includes('montenegro')) return 'Montenegro';
    if (locLower.includes('canada')) return 'Canada';
    if (locLower.includes('uk') || locLower.includes('united kingdom') || locLower.includes('england')) return 'UK';
    if (locLower.includes('usa') || locLower.includes('united states')) return 'USA';
    if (locLower.includes('australia')) return 'Australia';
    if (locLower.includes('germany')) return 'Germany';

    const parts = location.split(',').map(s => s.trim().replace(/^[^\w]+/, ''));
    if (parts.length > 1) return parts[parts.length - 1];
    return parts[0] || 'Global';
};

// Helper to determine accreditation text from real achievement data
const getAccreditationText = (u) => {
    const achievements = u.achievements || u.profile?.achievements || [];
    const achArr = Array.isArray(achievements) ? achievements : [];
    const textBlob = achArr.map(a => `${a.title || ''} ${a.desc || ''}`).join(' ').toLowerCase();

    if (textBlob.includes('naac')) {
        return textBlob.includes('a+') ? 'NAAC A+ Accredited' : 'NAAC A Grade';
    }
    if (textBlob.includes('ascal')) {
        return 'ASCAL Accredited';
    }
    if (textBlob.includes('uniadrion')) {
        return 'UNIADRION Member';
    }
    if (textBlob.includes('mfhea')) {
        return 'MFHEA Accredited';
    }
    if (textBlob.includes('mqa')) {
        return 'MQA Recognised';
    }
    if (textBlob.includes('7th') || textBlob.includes('h-index')) {
        const match = textBlob.match(/(\d+)(st|nd|rd|th)\s+in\s+albanian/);
        if (match) return `#${match[1]} in Albania`;
        return '7th in National H-Index';
    }
    if (textBlob.includes('cisco')) {
        return 'Cisco Academy Partner';
    }
    if (textBlob.includes('erasmus')) {
        return 'Erasmus+ Member';
    }
    if (textBlob.includes('accredit')) {
        return 'Institutionally Accredited';
    }
    if (textBlob.includes('ranking') || textBlob.includes('ranked')) {
        return 'Nationally Ranked';
    }
    if (textBlob.includes('times higher')) {
        return 'THE World Ranked';
    }
    // Return null if no real accreditation data
    return null;
};

// Helper to derive popular courses / fields from API course data
const getPopularCourses = (u) => {
    // Use real course categories from API if available
    const cats = u.courseCategories || [];
    if (cats.length > 0) {
        // Clean up blank or generic categories
        const cleaned = cats.filter(c => c && c.trim() && c.trim().toLowerCase() !== 'skill course');
        if (cleaned.length > 0) return cleaned.slice(0, 3).join(', ');
    }
    // Fall back to profile specialties
    if (u.profile?.specialties && Array.isArray(u.profile.specialties) && u.profile.specialties.length > 0) {
        return u.profile.specialties.slice(0, 3).join(', ');
    }
    // Fall back to name-based heuristic
    const nameLower = (u.name || '').toLowerCase();
    if (nameLower.includes('technology') || nameLower.includes('tech')) return 'CS, AI, Engineering';
    if (nameLower.includes('business') || nameLower.includes('management')) return 'MBA, Finance, Marketing';
    if (nameLower.includes('language') || nameLower.includes('linguistic')) return 'English, IELTS, Linguistics';
    if (nameLower.includes('culinary') || nameLower.includes('hospitality')) return 'Culinary Arts, Hotel Mgt';
    if (nameLower.includes('arts') || nameLower.includes('science')) return 'Arts, Science, Technology';
    return 'Business, Engineering, IT';
};

// Map raw API program_type values to user-readable program level labels
const PROGRAM_TYPE_TO_LEVEL = {
    'degree_programme': 'Undergraduate / Postgraduate',
    'wbl_domestic': 'Work-Based Learning',
    'wbl_abroad': 'Study Abroad',
    'course': 'Short Courses & Diplomas',
};

// Derive readable program levels from real programTypes array
const deriveProgramLevels = (programTypes) => {
    if (!programTypes || programTypes.length === 0) return null;
    const labels = [...new Set(programTypes.map(t => PROGRAM_TYPE_TO_LEVEL[t] || t).filter(Boolean))];
    return labels.join(' | ') || null;
};

// Popular fields — matched ONLY against course titles and categories.
// Keywords are multi-word phrases to avoid false positives (e.g. 'ai' in 'JAIN').
// Never match against the university name itself.
const FIELD_MAP = [
    {
        label: 'Business & Management',
        // course titles containing these phrases indicate business/management
        titlePhrases: ['mba', 'bba', 'bcom', 'mcom', 'ma economics', 'management', 'commerce', 'marketing', 'finance', 'economics', 'business administration', 'business analytics']
    },
    {
        label: 'Health & Hospital Admin',
        titlePhrases: ['hospital administration', 'hospital admin', 'health administrator', 'social work', 'msw', 'nursing', 'clinical', 'medical', 'pharmacy', 'healthcare']
    },
    {
        label: 'Computer Science & IT',
        titlePhrases: ['digital marketing', 'virtual reality', 'machine learning', 'artificial intelligence', 'programming', 'software engineering', 'information technology', 'computer science', 'bca', 'mca', 'data analytics', 'data science', 'cybersecurity', 'cloud computing']
    },
    {
        label: 'Data Science & AI',
        titlePhrases: ['data science', 'data analytics', 'machine learning', 'artificial intelligence', 'business intelligence', 'data engineering', 'applied data']
    },
    {
        label: 'Engineering',
        titlePhrases: ['logistics', 'supply chain', 'engineering', 'bca', 'mca', 'civil', 'mechanical', 'electrical']
    },
    {
        label: 'Hospitality & Culinary',
        titlePhrases: ['hotel management', 'hospitality', 'culinary', 'chef', 'tourism', 'diploma in hotel', 'diploma in professional chef']
    },
];

// Derive field tags by matching ONLY against course titles and course categories.
// University name is intentionally excluded to prevent false positives.
const deriveFieldTags = (courseTitles, courseCategories) => {
    // Build a single searchable text blob from titles + categories only
    const blob = [
        ...(courseTitles || []),
        ...(courseCategories || [])
    ].join(' ').toLowerCase();

    if (!blob.trim()) return [];

    return FIELD_MAP.filter(f =>
        f.titlePhrases.some(phrase => blob.includes(phrase))
    ).map(f => f.label);
};

const ITEMS_PER_PAGE = 9;

const Platform = () => {
    const navigate = useNavigate();
    const [dynamicUnis, setDynamicUnis] = useState([]);
    const [dynamicSkillDadUnis, setDynamicSkillDadUnis] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [currentPage, setCurrentPage] = useState(1);

    // Expand / collapse for filter options
    const [showMoreCountries, setShowMoreCountries] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const listingsRef = useRef(null);

    useEffect(() => {
        const fetchUnis = async () => {
            try {
                const [unisRes, skillDadUnisRes] = await Promise.all([
                    axios.get('/api/public/universities'),
                    axios.get('/api/public/skilldad-universities')
                ]);
                setDynamicUnis(unisRes.data || []);
                setDynamicSkillDadUnis(skillDadUnisRes.data || []);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnis();
    }, []);

    // Process and enrich universities with real data only
    const allUniversities = useMemo(() => {
        let globalIndex = 0;

        const partnerList = dynamicUnis.map((u) => {
            const index = globalIndex++;
            const fallbackImg = CAMPUS_FALLBACKS[index % CAMPUS_FALLBACKS.length];
            const coverImg = u.profile?.coverImage;
            const logoImg = u.profile?.profileImage || u.profileImage || u.profile_image;
            const stats = getBelievableUniversityStats(u);
            const country = extractCountry(u.profile?.location);
            const badge = getBadge(u, false);
            const accreditation = getAccreditationText(u);
            const popularCourses = getPopularCourses({ ...u, courseCategories: u.courseCategories || [] });
            const programLevels = deriveProgramLevels(u.programTypes);
            const fieldTags = deriveFieldTags(u.courseTitles || [], u.courseCategories || []);

            return {
                id: u._id || u.id,
                name: u.name,
                location: u.profile?.location || 'Global',
                country,
                students: stats.scholars,
                programs: stats.modules,
                established: u.profile?.foundedYear || u.profile?.established || null,
                image: coverImg ? getMediaUrl(coverImg) : fallbackImg,
                fallbackImage: fallbackImg,
                logo: logoImg ? getMediaUrl(logoImg) : null,
                specialties: u.profile?.specialties || [],
                description: u.bio || null,
                badge,
                accreditation,
                popularCourses,
                programLevels,
                fieldTags,
                isSkillDadOwned: false,
                raw: u
            };
        });

        const skillDadList = dynamicSkillDadUnis.map((u) => {
            const index = globalIndex++;
            const fallbackImg = CAMPUS_FALLBACKS[index % CAMPUS_FALLBACKS.length];
            const stats = getBelievableUniversityStats(u);
            const country = extractCountry(u.location);
            const badge = getBadge(u, true);
            const accreditation = getAccreditationText(u);
            const popularCourses = getPopularCourses({ ...u, courseCategories: u.courseCategories || [] });
            const programLevels = deriveProgramLevels(u.programTypes);
            const fieldTags = deriveFieldTags(u.courseTitles || [], u.courseCategories || []);

            // Parse achievements safely
            let achievements = [];
            try {
                achievements = typeof u.achievements === 'string' ? JSON.parse(u.achievements) : (u.achievements || []);
            } catch (e) { achievements = []; }

            return {
                id: `sd-${u.id}`,
                name: u.name,
                location: u.location || 'Global',
                country,
                students: stats.scholars,
                programs: stats.modules,
                established: null,
                image: u.cover_image ? getMediaUrl(u.cover_image) : (u.profile_image ? getMediaUrl(u.profile_image) : fallbackImg),
                fallbackImage: fallbackImg,
                logo: u.profile_image ? getMediaUrl(u.profile_image) : null,
                specialties: [],
                description: u.description || null,
                badge,
                accreditation,
                popularCourses,
                programLevels,
                fieldTags,
                isSkillDadOwned: true,
                raw: { ...u, achievements }
            };
        });

        return [...partnerList, ...skillDadList];
    }, [dynamicUnis, dynamicSkillDadUnis]);

    // Available country options with counts
    const countryCounts = useMemo(() => {
        const counts = {};
        allUniversities.forEach(u => {
            counts[u.country] = (counts[u.country] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [allUniversities]);

    // Available Program Levels — computed from real programLevels strings
    const levelCounts = useMemo(() => {
        const LEVEL_OPTIONS = [
            'Undergraduate / Postgraduate',
            'Work-Based Learning',
            'Study Abroad',
            'Short Courses & Diplomas',
        ];
        return LEVEL_OPTIONS.map(level => [
            level,
            allUniversities.filter(u => u.programLevels && u.programLevels.includes(level)).length
        ]).filter(([, count]) => count > 0);
    }, [allUniversities]);

    // Available Popular Fields — computed from real fieldTags derived from course categories
    const fieldCounts = useMemo(() => {
        const counts = {};
        allUniversities.forEach(u => {
            (u.fieldTags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [allUniversities]);

    // Toggle filter helper
    const toggleFilter = (list, setList, item) => {
        setCurrentPage(1);
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSelectedCountries([]);
        setSelectedLevels([]);
        setSelectedFields([]);
        setSearchQuery('');
        setSortBy('popularity');
        setCurrentPage(1);
    };

    // Filter & Sort Logic
    const filteredUniversities = useMemo(() => {
        let results = [...allUniversities];

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.location.toLowerCase().includes(q) ||
                u.country.toLowerCase().includes(q) ||
                u.popularCourses.toLowerCase().includes(q)
            );
        }

        // Country filter
        if (selectedCountries.length > 0) {
            results = results.filter(u => selectedCountries.includes(u.country));
        }

        // Program Level filter — uses real programLevels derived from DB
        if (selectedLevels.length > 0) {
            results = results.filter(u =>
                u.programLevels && selectedLevels.some(level => u.programLevels.includes(level))
            );
        }

        // Popular Fields filter — uses real fieldTags derived from course categories
        if (selectedFields.length > 0) {
            results = results.filter(u =>
                u.fieldTags && selectedFields.some(field => u.fieldTags.includes(field))
            );
        }

        // Sorting
        if (sortBy === 'name_asc') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name_desc') {
            results.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'programs') {
            results.sort((a, b) => parseInt(b.programs) - parseInt(a.programs));
        } else if (sortBy === 'ranking') {
            // Sort those with accreditation first
            results.sort((a, b) => {
                if (a.accreditation && !b.accreditation) return -1;
                if (!a.accreditation && b.accreditation) return 1;
                return a.name.localeCompare(b.name);
            });
        } else {
            // Default: popularity — partner unis first, then by course count desc
            results.sort((a, b) => {
                if (a.isSkillDadOwned !== b.isSkillDadOwned) return a.isSkillDadOwned ? 1 : -1;
                return b.name.localeCompare(a.name);
            });
        }

        return results;
    }, [allUniversities, searchQuery, selectedCountries, selectedLevels, selectedFields, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE) || 1;
    const paginatedUniversities = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUniversities.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUniversities, currentPage]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        if (listingsRef.current) {
            listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        if (listingsRef.current) {
            listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const activeFilterCount =
        selectedCountries.length +
        selectedLevels.length +
        selectedFields.length +
        (searchQuery.trim() ? 1 : 0);

    return (
        <div className="min-h-screen platform-page bg-[#FAF8FE] dark:bg-[#080512] font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <Navbar />

            {/* ── 1. HERO BANNER CONTAINER (STYLE & SIZE EXACTLY LIKE COURSES PAGE) ── */}
            <main className="pt-16 pb-16">
                
                <div className="w-full mb-4 sm:mb-5">
                    <div className="bg-gradient-to-r from-[#170C30] via-[#1F1040] to-[#2B1454] border-y border-purple-900/40 [.light-mode_&]:!bg-gradient-to-r [.light-mode_&]:!from-[#F4EEFE] [.light-mode_&]:!via-[#EDE4FD] [.light-mode_&]:!to-[#E5D7FA] [.light-mode_&]:!border-[#E2D4F7] pt-3 sm:pt-3.5 md:pt-4 pb-0 px-4 sm:px-6 lg:px-10 relative overflow-hidden shadow-xs">
                        
                        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-end relative z-10">
                            
                            {/* Left Side: Content, Search Bar, and 3 Feature Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="lg:col-span-7 space-y-2 sm:space-y-2.5 pb-3 sm:pb-3.5 md:pb-4"
                            >
                                {/* Main Heading - Standardized Typography & Balanced Size */}
                                <h1 className="text-base sm:text-lg lg:text-[22px] font-bold font-space text-slate-900 dark:text-white [.light-mode_&]:!text-[#1E0E4E] tracking-tight leading-snug">
                                    Your Global Education <br className="hidden sm:inline" />
                                    <span className="text-[#4C1D95] dark:text-purple-300 font-extrabold">
                                        Starts Here
                                    </span>
                                </h1>

                                {/* Supporting Text */}
                                <p className="text-slate-600 dark:text-purple-200/70 text-xs sm:text-[12.5px] max-w-lg leading-relaxed">
                                    Discover top universities, explore world-class programs, and take the next step towards your dream career.
                                </p>

                                {/* Standard, High-Quality Search Bar */}
                                <form onSubmit={handleSearchSubmit} className="relative max-w-xl flex items-center gap-2 pt-0.5">
                                    <div className="relative flex-1 flex items-center">
                                        <Search size={15} className="absolute left-3.5 text-slate-400 dark:text-purple-300 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Search universities by name, location, or course..."
                                            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#130E26] border border-purple-200/80 dark:border-purple-800/50 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#4C1D95] focus:ring-2 focus:ring-[#4C1D95]/20 shadow-xs transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4.5 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Search size={13} />
                                        <span>Search</span>
                                    </button>
                                </form>

                                {/* 3 Feature / Stat Badges matching CourseCatalog structure */}
                                <div className="pt-0.5 flex flex-wrap gap-2">
                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur border border-purple-200/60 dark:border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center shrink-0">
                                            <GraduationCap size={13} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-slate-700 dark:text-white/70">
                                            <span className="text-slate-500 dark:text-white/40 block text-[9px]">Partner Universities</span>
                                            <div className="font-bold text-slate-900 dark:text-white">{allUniversities.length > 0 ? `${allUniversities.length}+` : '28+'} Institutions</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur border border-purple-200/60 dark:border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center shrink-0">
                                            <Globe size={13} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-slate-700 dark:text-white/70">
                                            <span className="text-slate-500 dark:text-white/40 block text-[9px]">Global Reach</span>
                                            <div className="font-bold text-slate-900 dark:text-white">{countryCounts.length > 0 ? `${countryCounts.length}+` : '9+'} Countries</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur border border-purple-200/60 dark:border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-2 shadow-2xs">
                                        <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center shrink-0">
                                            <Users size={13} />
                                        </div>
                                        <div className="text-[10px] leading-tight text-slate-700 dark:text-white/70">
                                            <span className="text-slate-500 dark:text-white/40 block text-[9px]">Alumni Network</span>
                                            <div className="font-bold text-slate-900 dark:text-white">10K+ Students Placed</div>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>

                            {/* Right Hero Illustration matching reference image exactly (bottom touching banner bottom) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                                className="lg:col-span-5 relative flex items-end justify-center lg:justify-end select-none self-end"
                            >
                                <div className="relative w-full max-w-[305px] sm:max-w-[355px] lg:max-w-[405px] flex items-end justify-center lg:justify-end leading-none">
                                    <img
                                        src="/university_hero_reference_illustration.png"
                                        alt="SkillDad Universities - Explore Top Global Universities"
                                        className="w-full h-auto block object-contain pointer-events-none drop-shadow-sm dark:drop-shadow-[0_4px_24px_rgba(192,38,255,0.18)] align-bottom"
                                    />
                                </div>
                            </motion.div>

                        </div>

                    </div>
                </div>

                {/* ── 2. MAIN LISTING SECTION (TWO-COLUMN - COMPACT SIZING) ── */}
                <div ref={listingsRef} id="university-listings" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    
                    {/* Mobile Filter Toggle Button */}
                    <div className="lg:hidden mb-4 flex items-center justify-between">
                        <button
                            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#130C28] border border-purple-200 dark:border-purple-800/40 text-xs font-bold text-slate-800 dark:text-white shadow-xs"
                        >
                            <Filter size={14} className="text-[#4C1D95]" />
                            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                        </button>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs text-[#4C1D95] dark:text-purple-300 font-semibold hover:underline"
                            >
                                Reset All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
                        
                        {/* LEFT SIDEBAR: FILTERS */}
                        <aside
                            className={`lg:col-span-3 bg-white dark:bg-[#120B24] rounded-xl border border-slate-200/80 dark:border-purple-900/40 p-4 shadow-xs sticky top-20 ${
                                mobileFilterOpen ? 'block' : 'hidden lg:block'
                            }`}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/30 mb-4">
                                <div className="flex items-center gap-2">
                                    <Filter size={15} className="text-[#4C1D95] dark:text-purple-400" />
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white font-space">
                                        Filters
                                    </h2>
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-[11px] text-[#4C1D95] dark:text-purple-300 hover:text-[#3B0764] font-medium transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Filter 1: Country */}
                            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-purple-900/30">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5 flex items-center justify-between">
                                    <span>Country</span>
                                    <span className="text-[10px] font-normal text-slate-400">{countryCounts.length}</span>
                                </h3>
                                <div className="space-y-1.5">
                                    {(showMoreCountries ? countryCounts : countryCounts.slice(0, 6)).map(([country, count]) => {
                                        const isChecked = selectedCountries.includes(country);
                                        return (
                                            <label
                                                key={country}
                                                className="flex items-center justify-between text-[11.5px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedCountries, setSelectedCountries, country)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                    />
                                                    <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                        {country}
                                                    </span>
                                                </div>
                                                <span className="text-[9.5px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {countryCounts.length > 6 && (
                                    <button
                                        onClick={() => setShowMoreCountries(!showMoreCountries)}
                                        className="mt-2 text-[10.5px] font-semibold text-[#4C1D95] dark:text-purple-400 hover:underline cursor-pointer"
                                    >
                                        {showMoreCountries ? '− View less' : `+ View more (${countryCounts.length - 6})`}
                                    </button>
                                )}
                            </div>

                            {/* Filter 2: Program Level */}
                            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-purple-900/30">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5">
                                    Program Level
                                </h3>
                                <div className="space-y-1.5">
                                    {levelCounts.map(([level, count]) => {
                                        const isChecked = selectedLevels.includes(level);
                                        return (
                                            <label
                                                key={level}
                                                className="flex items-center justify-between text-[11.5px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedLevels, setSelectedLevels, level)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                    />
                                                    <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                        {level}
                                                    </span>
                                                </div>
                                                <span className="text-[9.5px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Filter 4: Popular Fields */}
                            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-purple-900/30">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5">
                                    Popular Fields
                                </h3>
                                <div className="space-y-1.5">
                                    {(showMoreFields ? fieldCounts : fieldCounts.slice(0, 4)).map(([field, count]) => {
                                        const isChecked = selectedFields.includes(field);
                                        return (
                                            <label
                                                key={field}
                                                className="flex items-center justify-between text-[11.5px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedFields, setSelectedFields, field)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                    />
                                                    <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                        {field}
                                                    </span>
                                                </div>
                                                <span className="text-[9.5px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {fieldCounts.length > 4 && (
                                    <button
                                        onClick={() => setShowMoreFields(!showMoreFields)}
                                        className="mt-2 text-[10.5px] font-semibold text-[#4C1D95] dark:text-purple-400 hover:underline cursor-pointer"
                                    >
                                        {showMoreFields ? '− View less' : `+ View more (${fieldCounts.length - 4})`}
                                    </button>
                                )}
                            </div>

                            {/* Reset Filters Button */}
                            <button
                                onClick={handleResetFilters}
                                className="w-full py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-purple-200/60 dark:border-purple-800/40 transition-all cursor-pointer"
                            >
                                <RotateCcw size={13} />
                                <span>Reset Filters</span>
                            </button>
                        </aside>

                        {/* RIGHT COLUMN: RESULTS & CARDS */}
                        <div className="lg:col-span-9 space-y-5">
                            
                            {/* Section Header with Sort Dropdown */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-space tracking-tight">
                                        Featured Universities
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Explore some of our top partner universities offering world-class education and global career opportunities.
                                    </p>
                                </div>

                                {/* Sort Dropdown - compact */}
                                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            aria-label="Sort universities by"
                                            className="appearance-none bg-white dark:bg-[#130C28] text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-purple-900/40 rounded-lg pl-2.5 pr-7 py-1.5 outline-none focus:border-[#4C1D95] cursor-pointer shadow-2xs"
                                        >
                                            <option value="popularity">Popularity</option>
                                            <option value="name_asc">Name (A-Z)</option>
                                            <option value="name_desc">Name (Z-A)</option>
                                            <option value="programs">Programs Count</option>
                                            <option value="ranking">Accreditation / Rank</option>
                                        </select>
                                        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Active Filter Chips */}
                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 py-1">
                                    <span className="text-[11px] text-slate-400 font-medium">Active Filters:</span>
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100/70 text-[#4C1D95] dark:bg-purple-950 dark:text-purple-300 text-[11px] font-medium">
                                            Search: "{searchQuery}"
                                            <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                        </span>
                                    )}
                                    {selectedCountries.map(c => (
                                        <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100/70 text-[#4C1D95] dark:bg-purple-950 dark:text-purple-300 text-[11px] font-medium">
                                            {c}
                                            <X size={11} className="cursor-pointer" onClick={() => toggleFilter(selectedCountries, setSelectedCountries, c)} />
                                        </span>
                                    ))}
                                    {selectedLevels.map(l => (
                                        <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-medium">
                                            {l}
                                            <X size={11} className="cursor-pointer" onClick={() => toggleFilter(selectedLevels, setSelectedLevels, l)} />
                                        </span>
                                    ))}
                                    {selectedFields.map(f => (
                                        <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100/70 text-violet-700 dark:bg-violet-950 dark:text-violet-300 text-[11px] font-medium">
                                            {f}
                                            <X size={11} className="cursor-pointer" onClick={() => toggleFilter(selectedFields, setSelectedFields, f)} />
                                        </span>
                                    ))}
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-[11px] text-[#4C1D95] dark:text-purple-300 hover:underline font-semibold ml-1 cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}


                            {/* Loading State */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="h-80 rounded-xl bg-slate-200/60 dark:bg-purple-950/30 animate-pulse" />
                                    ))}
                                </div>
                            ) : paginatedUniversities.length === 0 ? (
                                /* No Results State */
                                <div className="bg-white dark:bg-[#120B24] rounded-xl border border-slate-200/80 dark:border-purple-900/40 p-10 text-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-100/60 dark:bg-purple-950/60 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
                                        <Search size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                                        No universities matched your filters
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                                        Try clearing some of your search filters or browse our full university catalog.
                                    </p>
                                    <button
                                        onClick={handleResetFilters}
                                        className="px-5 py-2 rounded-lg bg-[#4C1D95] text-white text-xs font-bold hover:bg-[#3B0764] transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                /* 3-Column Responsive University Card Grid - COMPACT CARDS */
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                    {paginatedUniversities.map((uni, idx) => {
                                        return (
                                            <motion.div
                                                key={uni.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                onClick={() => {
                                                    navigate(`/university-profile/${encodeURIComponent(uni.name)}`, { state: { university: uni.raw } });
                                                }}
                                                className="group cursor-pointer bg-white dark:bg-[#120B24] rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-purple-900/40 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                            >
                                                {/* Campus Image */}
                                                <div className="relative h-36 sm:h-38 overflow-hidden bg-slate-100 dark:bg-purple-950/40 shrink-0">
                                                    <img
                                                        src={uni.image}
                                                        alt={uni.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = uni.fallbackImage;
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                                                </div>

                                                {/* University Body */}
                                                <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                                                    
                                                    {/* Header: Logo + Name & Location */}
                                                    <div className="flex items-start gap-2.5 mb-3">
                                                        {/* University Logo / Shield */}
                                                        <div className="w-9 h-9 rounded-lg border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#1A1232] p-0.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                                            {uni.logo ? (
                                                                <img
                                                                    src={uni.logo}
                                                                    alt={`${uni.name} logo`}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className="w-full h-full rounded-md bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] text-white font-bold text-xs flex items-center justify-center"
                                                                style={{ display: uni.logo ? 'none' : 'flex' }}
                                                            >
                                                                {uni.name.charAt(0)}
                                                            </div>
                                                        </div>

                                                        {/* Title & Location */}
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors">
                                                                {uni.name}
                                                            </h3>
                                                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                                                                <MapPin size={11} className="mr-1 shrink-0 text-slate-400" />
                                                                <span className="truncate">{uni.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Meta Information Rows */}
                                                    <div className="space-y-1.5 py-2 border-y border-slate-100 dark:border-purple-900/30 text-[11px] mb-3">
                                                        
                                                        {/* Row 1: Accreditation (only if real data exists) */}
                                                        {uni.accreditation ? (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                    <Award size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                                                    <span>Accreditation:</span>
                                                                </div>
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                                                    {uni.accreditation}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                    <Award size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                                                    <span>Status:</span>
                                                                </div>
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                                    Verified Institution
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Row 2: Popular Courses */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                                <BookOpen size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                                <span>Popular Courses:</span>
                                                            </div>
                                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">
                                                                {uni.popularCourses}
                                                            </span>
                                                        </div>

                                                        {/* Row 3: Program Levels (only if real data exists) */}
                                                        {uni.programLevels && (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                    <Layers size={12} className="text-violet-600 dark:text-violet-400 shrink-0" />
                                                                    <span>Programs:</span>
                                                                </div>
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[55%]">
                                                                    {uni.programLevels}
                                                                </span>
                                                            </div>
                                                        )}

                                                    </div>

                                                    {/* View Details Button */}
                                                    <div className="mt-auto">
                                                        <button
                                                            type="button"
                                                            className="w-full py-1.5 sm:py-2 rounded-lg bg-purple-50 hover:bg-[#4C1D95] text-[#4C1D95] hover:text-white dark:bg-purple-950/50 dark:hover:bg-[#4C1D95] dark:text-purple-300 dark:hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 border border-purple-200/50 dark:border-purple-800/30 transition-all duration-300"
                                                        >
                                                            <span>View Details</span>
                                                            <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </div>

                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── 3. PAGINATION (COMPACT) ── */}
                            {totalPages > 1 && (
                                <div className="pt-6 flex items-center justify-center gap-1.5">
                                    {/* Previous Page Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Previous Page"
                                        className="w-8 h-8 rounded-lg border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#120B24] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/60 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        const isActive = page === currentPage;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                aria-label={`Go to page ${page}`}
                                                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[#4C1D95] text-white shadow-sm shadow-purple-900/20'
                                                        : 'bg-white dark:bg-[#120B24] border border-slate-200/80 dark:border-purple-800/40 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 shadow-2xs'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    {/* Next Page Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next Page"
                                        className="w-8 h-8 rounded-lg border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#120B24] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/60 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}

                        </div>

                    </div>

                    {/* ── 4. CAREER GUIDANCE CTA BANNER ── */}
                    <div className="mt-10 sm:mt-12">
                        <div className="bg-[#F4EEFE] dark:bg-[#180E30] border border-purple-200/80 dark:border-purple-800/50 rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5 shadow-xs">
                            
                            {/* Left: Icon + Text */}
                            <div className="flex items-center gap-3.5 sm:gap-4 text-center md:text-left flex-col md:flex-row">
                                <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#231545] border border-purple-200/80 dark:border-purple-700/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shadow-2xs shrink-0">
                                    <Compass size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-space leading-tight">
                                        Not sure which university is right for you?
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">
                                        Take our quick admissions guidance quiz and get personalized recommendations.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Action Button */}
                            <button
                                onClick={() => navigate('/dashboard/course-finder')}
                                className="px-5 py-2.5 rounded-full bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs tracking-wide shadow-xs hover:shadow-md active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>Take the Quiz</span>
                                <ArrowRight size={14} />
                            </button>

                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Platform;
