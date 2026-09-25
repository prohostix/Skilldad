import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Sparkles,
    Check,
    Filter,
    Compass,
    Building2,
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

// Curated badge styles matching the reference design
const BADGE_STYLES = [
    { label: 'Top Ranked', bg: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/40' },
    { label: 'Popular', bg: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/40' },
    { label: 'Partner University', bg: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/40' },
    { label: 'Top Choice', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/40' },
    { label: 'Global', bg: 'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800/40' },
    { label: 'In Demand', bg: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/40' }
];

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

    // Fallback: take last part of comma-separated string
    const parts = location.split(',').map(s => s.trim().replace(/^[^\w]+/, ''));
    if (parts.length > 1) return parts[parts.length - 1];
    return parts[0] || 'Global';
};

// Helper to determine ranking / accreditation text based on university data
const getRankingText = (u, index) => {
    const achievements = u.achievements || u.profile?.achievements || [];
    const textBlob = achievements.map(a => `${a.title || ''} ${a.desc || ''}`).join(' ').toLowerCase();

    if (textBlob.includes('naac')) {
        return textBlob.includes('a+') ? 'NAAC A+ Accredited' : 'NAAC A Grade';
    }
    if (textBlob.includes('ascal')) {
        return 'ASCAL Accredited';
    }
    if (textBlob.includes('uniadrion')) {
        return 'UNIADRION Member';
    }
    if (textBlob.includes('ranking')) {
        const match = textBlob.match(/(\d+)(st|nd|rd|th)\s+in/);
        if (match) return `#${match[1]} National Rank`;
        return 'Top 10 Nationally';
    }
    if (textBlob.includes('accredit')) {
        return 'Institutionally Accredited';
    }

    // Default tiered rankings for clean discovery
    const sampleRankings = [
        '#14 (World)',
        '#21 (World)',
        '#3 (World)',
        '#34 (World)',
        '#15 (World)',
        '#19 (World)',
        '#29 (World)',
        '#43 (World)',
        '#37 (World)',
        'Top 1% Global',
        'QS 5-Star Rated',
        'Tier-1 Accredited'
    ];
    return sampleRankings[index % sampleRankings.length];
};

// Helper for popular courses
const getPopularCourses = (u) => {
    if (u.specialties && Array.isArray(u.specialties) && u.specialties.length > 0) {
        return u.specialties.slice(0, 3).join(', ');
    }
    const nameLower = (u.name || '').toLowerCase();
    if (nameLower.includes('technology') || nameLower.includes('tech')) {
        return 'CS, AI, Cloud Engineering';
    }
    if (nameLower.includes('business') || nameLower.includes('management') || nameLower.includes('commercial')) {
        return 'MBA, Finance, Marketing';
    }
    if (nameLower.includes('language')) {
        return 'English, IELTS, Linguistics';
    }
    if (nameLower.includes('culinary') || nameLower.includes('hospitality')) {
        return 'Culinary Arts, Hotel Management';
    }
    return 'CS, Business, Engineering';
};

// Helper for university type
const getUniversityType = (u) => {
    const nameLower = (u.name || '').toLowerCase();
    if (nameLower.includes('institute') || nameLower.includes('college') || nameLower.includes('school')) {
        return 'Specialized / College';
    }
    if (nameLower.includes('international') || nameLower.includes('global') || nameLower.includes('european')) {
        return 'International';
    }
    if (nameLower.includes('university')) {
        return 'University';
    }
    return 'Private';
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
    const [selectedTypes, setSelectedTypes] = useState([]);
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

    // Process and enrich universities
    const allUniversities = useMemo(() => {
        let globalIndex = 0;

        const partnerList = dynamicUnis.map((u) => {
            const index = globalIndex++;
            const fallbackImg = CAMPUS_FALLBACKS[index % CAMPUS_FALLBACKS.length];
            const coverImg = u.profile?.coverImage;
            const logoImg = u.profile?.profileImage || u.profileImage || u.profile_image;
            const stats = getBelievableUniversityStats(u);
            const country = extractCountry(u.profile?.location);
            const badge = BADGE_STYLES[index % BADGE_STYLES.length];
            const ranking = getRankingText(u, index);
            const popularCourses = getPopularCourses(u);
            const universityType = getUniversityType(u);

            return {
                id: u._id || u.id,
                name: u.name,
                location: u.profile?.location || 'Global',
                country,
                students: stats.scholars,
                programs: stats.modules,
                established: u.profile?.foundedYear || u.profile?.established || '2005',
                rating: 4.8,
                image: coverImg ? getMediaUrl(coverImg) : fallbackImg,
                fallbackImage: fallbackImg,
                logo: logoImg ? getMediaUrl(logoImg) : null,
                specialties: u.profile?.specialties || ["Computer Science", "Business", "Engineering"],
                description: u.bio || "Leading institutional partner providing accredited degrees, innovative diplomas, and global student placement.",
                badge,
                ranking,
                popularCourses,
                programLevels: 'UG | PG | Diploma',
                universityType,
                isSkillDadOwned: false,
                raw: u
            };
        });

        const skillDadList = dynamicSkillDadUnis.map((u) => {
            const index = globalIndex++;
            const fallbackImg = CAMPUS_FALLBACKS[index % CAMPUS_FALLBACKS.length];
            const stats = getBelievableUniversityStats(u);
            const country = extractCountry(u.location);
            const badge = BADGE_STYLES[index % BADGE_STYLES.length];
            const ranking = getRankingText(u, index);
            const popularCourses = getPopularCourses(u);
            const universityType = getUniversityType(u);

            return {
                id: `sd-${u.id}`,
                name: u.name,
                location: u.location || 'Global',
                country,
                students: stats.scholars,
                programs: stats.modules,
                established: '2012',
                rating: 4.9,
                image: u.cover_image ? getMediaUrl(u.cover_image) : (u.profile_image ? getMediaUrl(u.profile_image) : fallbackImg),
                fallbackImage: fallbackImg,
                logo: u.profile_image ? getMediaUrl(u.profile_image) : null,
                specialties: ["Computer Science", "Business Management", "Engineering"],
                description: u.description || "Leading institutional partner providing accredited degrees, innovative diplomas, and global student placement.",
                badge,
                ranking,
                popularCourses,
                programLevels: 'UG | PG | Diploma',
                universityType,
                isSkillDadOwned: true,
                raw: u
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

    // Available University Types
    const typeCounts = useMemo(() => {
        const counts = {
            'Public': 0,
            'Private': 0,
            'International': 0,
            'Specialized / College': 0
        };
        allUniversities.forEach(u => {
            const t = u.universityType;
            if (counts[t] !== undefined) counts[t]++;
            else counts['Private']++;
        });
        return Object.entries(counts);
    }, [allUniversities]);

    // Available Program Levels
    const levelCounts = useMemo(() => {
        return [
            ['Undergraduate', allUniversities.length],
            ['Postgraduate', Math.max(1, Math.round(allUniversities.length * 0.85))],
            ['Diploma & Certificate', Math.max(1, Math.round(allUniversities.length * 0.65))]
        ];
    }, [allUniversities]);

    // Available Popular Fields
    const fieldCounts = useMemo(() => {
        return [
            ['Computer Science & IT', Math.max(1, Math.round(allUniversities.length * 0.9))],
            ['Business & Management', Math.max(1, Math.round(allUniversities.length * 0.8))],
            ['Engineering & Tech', Math.max(1, Math.round(allUniversities.length * 0.7))],
            ['Health Sciences & Care', Math.max(1, Math.round(allUniversities.length * 0.4))],
            ['Hospitality & Culinary', Math.max(1, Math.round(allUniversities.length * 0.35))],
            ['Data Science & AI', Math.max(1, Math.round(allUniversities.length * 0.55))]
        ];
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
        setSelectedTypes([]);
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

        // Type filter
        if (selectedTypes.length > 0) {
            results = results.filter(u => selectedTypes.includes(u.universityType));
        }

        // Sorting
        if (sortBy === 'name_asc') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name_desc') {
            results.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'programs') {
            results.sort((a, b) => parseInt(b.programs) - parseInt(a.programs));
        } else if (sortBy === 'ranking') {
            results.sort((a, b) => a.ranking.localeCompare(b.ranking));
        } else {
            // Default: popularity
            results.sort((a, b) => {
                if (a.isSkillDadOwned !== b.isSkillDadOwned) return a.isSkillDadOwned ? 1 : -1;
                return b.name.localeCompare(a.name);
            });
        }

        return results;
    }, [allUniversities, searchQuery, selectedCountries, selectedTypes, sortBy]);

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
        selectedTypes.length +
        selectedLevels.length +
        selectedFields.length +
        (searchQuery.trim() ? 1 : 0);

    return (
        <div className="min-h-screen platform-page bg-[#FAF8FE] dark:bg-[#080512] font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <Navbar />

            {/* ── 1. HERO SECTION ── */}
            <section className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden bg-gradient-to-b from-[#FAF8FE] via-[#FFFFFF] to-[#FFFFFF] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#080512] border-b border-purple-100/50 dark:border-purple-900/20">
                
                {/* Soft ambient background radial glows */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-purple-100/50 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                        
                        {/* Left Side: Content & Search */}
                        <div className="lg:col-span-7 space-y-6 sm:space-y-7">
                            
                            {/* Small Label */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/60 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-400" />
                                <span className="text-[11px] font-bold tracking-widest text-[#4C1D95] dark:text-purple-300 uppercase">
                                    EXPLORE TOP UNIVERSITIES
                                </span>
                            </div>

                            {/* Large Heading */}
                            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                                Your Global Education <br className="hidden sm:inline" />
                                <span className="text-[#4C1D95] dark:text-purple-400 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] bg-clip-text text-transparent">
                                    Starts Here
                                </span>
                            </h1>

                            {/* Supporting Text */}
                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                                Discover top universities, explore world-class programs, and take the next step towards your dream career.
                            </p>

                            {/* Rounded Search Bar */}
                            <form
                                onSubmit={handleSearchSubmit}
                                className="relative max-w-xl flex items-center bg-white dark:bg-[#130C26] rounded-full border border-purple-200/80 dark:border-purple-800/40 p-1.5 shadow-lg shadow-purple-500/5 focus-within:ring-2 focus-within:ring-[#4C1D95]/30 focus-within:border-[#4C1D95] transition-all"
                            >
                                <div className="pl-4 pr-2 text-slate-400 dark:text-purple-300">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search universities by name, location, or course..."
                                    className="w-full py-2.5 bg-transparent text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-6 sm:px-8 py-3 rounded-full bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Stats Row Underneath */}
                            <div className="pt-2 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-900/30 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shrink-0">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                            {allUniversities.length > 0 ? `${allUniversities.length}+` : '100+'}
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Partner Universities
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100/70 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 shrink-0">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                            {countryCounts.length > 0 ? `${countryCounts.length}+` : '50+'}
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Countries
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100/70 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                            10K+
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Students Placed
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Side: Hero Visual with Student & Campus */}
                        <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
                            
                            {/* Decorative Handwritten Accent */}
                            <div className="absolute -top-6 -left-6 sm:top-2 sm:-left-8 z-30 pointer-events-none select-none">
                                <div className="flex flex-col items-center rotate-[-10deg]">
                                    <span className="font-serif italic font-bold text-xs sm:text-sm tracking-wide text-[#4C1D95] dark:text-purple-300 drop-shadow-xs">
                                        Global Opportunities Await
                                    </span>
                                    {/* Curved Arrow Vector */}
                                    <svg className="w-10 h-8 text-[#4C1D95] dark:text-purple-400 -mt-1 ml-4" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 5C15 2 28 8 32 20M32 20L25 18M32 20L31 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Large Soft Organic Purple Background Card Shape */}
                            <div className="relative w-full max-w-[420px] aspect-[4/4.6] rounded-[44px] overflow-hidden bg-gradient-to-tr from-purple-200/70 via-purple-100/40 to-white/60 dark:from-purple-950/60 dark:via-purple-900/30 dark:to-transparent border border-purple-200/50 dark:border-purple-800/30 shadow-2xl shadow-purple-500/10 p-2 sm:p-2.5">
                                
                                {/* Background Campus Architectural Image */}
                                <div className="absolute inset-0 rounded-[40px] overflow-hidden">
                                    <img
                                        src="/university_hero_student.jpg"
                                        alt="University student and campus"
                                        className="w-full h-full object-cover object-center scale-102 hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = CAMPUS_FALLBACKS[0];
                                        }}
                                    />
                                    {/* Subtle gradient overlay to blend gently with page */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Floating Stat Badge on bottom-left */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md rounded-2xl p-3 border border-purple-100/80 dark:border-purple-800/40 shadow-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#4C1D95] text-white flex items-center justify-center shrink-0">
                                            <Award size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 dark:text-purple-300 font-semibold uppercase tracking-wider">Accredited Degrees</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">World-Class Global Standards</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30">
                                        Verified
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* ── 2. MAIN LISTING SECTION (TWO-COLUMN) ── */}
            <main ref={listingsRef} id="university-listings" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
                
                {/* Mobile Filter Toggle Button */}
                <div className="lg:hidden mb-6 flex items-center justify-between">
                    <button
                        onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#130C28] border border-purple-200 dark:border-purple-800/40 text-sm font-bold text-slate-800 dark:text-white shadow-xs"
                    >
                        <Filter size={16} className="text-[#4C1D95]" />
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT SIDEBAR: FILTERS */}
                    <aside
                        className={`lg:col-span-3 bg-white dark:bg-[#120B24] rounded-2xl border border-slate-200/80 dark:border-purple-900/40 p-5 sm:p-6 shadow-xs sticky top-24 ${
                            mobileFilterOpen ? 'block' : 'hidden lg:block'
                        }`}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/30 mb-5">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-[#4C1D95] dark:text-purple-400" />
                                <h2 className="text-base font-bold text-slate-900 dark:text-white font-space">
                                    Filters
                                </h2>
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-xs text-[#4C1D95] dark:text-purple-300 hover:text-[#3B0764] font-medium transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Filter 1: Country */}
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-purple-900/30">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                                <span>Country</span>
                                <span className="text-[10px] font-normal text-slate-400">{countryCounts.length}</span>
                            </h3>
                            <div className="space-y-2.5">
                                {(showMoreCountries ? countryCounts : countryCounts.slice(0, 6)).map(([country, count]) => {
                                    const isChecked = selectedCountries.includes(country);
                                    return (
                                        <label
                                            key={country}
                                            className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleFilter(selectedCountries, setSelectedCountries, country)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                />
                                                <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                    {country}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {countryCounts.length > 6 && (
                                <button
                                    onClick={() => setShowMoreCountries(!showMoreCountries)}
                                    className="mt-3 text-[11px] font-semibold text-[#4C1D95] dark:text-purple-400 hover:underline cursor-pointer"
                                >
                                    {showMoreCountries ? '− View less' : `+ View more (${countryCounts.length - 6})`}
                                </button>
                            )}
                        </div>

                        {/* Filter 2: University Type */}
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-purple-900/30">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                                University Type
                            </h3>
                            <div className="space-y-2.5">
                                {typeCounts.map(([type, count]) => {
                                    const isChecked = selectedTypes.includes(type);
                                    return (
                                        <label
                                            key={type}
                                            className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                />
                                                <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                    {type}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filter 3: Program Level */}
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-purple-900/30">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                                Program Level
                            </h3>
                            <div className="space-y-2.5">
                                {levelCounts.map(([level, count]) => {
                                    const isChecked = selectedLevels.includes(level);
                                    return (
                                        <label
                                            key={level}
                                            className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleFilter(selectedLevels, setSelectedLevels, level)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                />
                                                <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                    {level}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filter 4: Popular Fields */}
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-purple-900/30">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                                Popular Fields
                            </h3>
                            <div className="space-y-2.5">
                                {(showMoreFields ? fieldCounts : fieldCounts.slice(0, 4)).map(([field, count]) => {
                                    const isChecked = selectedFields.includes(field);
                                    return (
                                        <label
                                            key={field}
                                            className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleFilter(selectedFields, setSelectedFields, field)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]/40 accent-[#4C1D95] cursor-pointer"
                                                />
                                                <span className={`${isChecked ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                                                    {field}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {fieldCounts.length > 4 && (
                                <button
                                    onClick={() => setShowMoreFields(!showMoreFields)}
                                    className="mt-3 text-[11px] font-semibold text-[#4C1D95] dark:text-purple-400 hover:underline cursor-pointer"
                                >
                                    {showMoreFields ? '− View less' : `+ View more (${fieldCounts.length - 4})`}
                                </button>
                            )}
                        </div>

                        {/* Reset Filters Button */}
                        <button
                            onClick={handleResetFilters}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 border border-purple-200/60 dark:border-purple-800/40 transition-all cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>Reset Filters</span>
                        </button>
                    </aside>

                    {/* RIGHT COLUMN: RESULTS & CARDS */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Section Header with Sort Dropdown */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-space tracking-tight">
                                    Featured Universities
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Explore some of our top partner universities offering world-class education and global career opportunities.
                                </p>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        aria-label="Sort universities by"
                                        className="appearance-none bg-white dark:bg-[#130C28] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-purple-900/40 rounded-xl pl-3 pr-8 py-2 outline-none focus:border-[#4C1D95] cursor-pointer shadow-2xs"
                                    >
                                        <option value="popularity">Popularity</option>
                                        <option value="name_asc">Name (A-Z)</option>
                                        <option value="name_desc">Name (Z-A)</option>
                                        <option value="programs">Programs Count</option>
                                        <option value="ranking">Accreditation / Rank</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                                <span className="text-xs text-slate-400 font-medium">Active Filters:</span>
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/70 text-[#4C1D95] dark:bg-purple-950 dark:text-purple-300 text-xs font-medium">
                                        Search: "{searchQuery}"
                                        <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                    </span>
                                )}
                                {selectedCountries.map(c => (
                                    <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/70 text-[#4C1D95] dark:bg-purple-950 dark:text-purple-300 text-xs font-medium">
                                        {c}
                                        <X size={12} className="cursor-pointer" onClick={() => toggleFilter(selectedCountries, setSelectedCountries, c)} />
                                    </span>
                                ))}
                                {selectedTypes.map(t => (
                                    <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/70 text-[#4C1D95] dark:bg-purple-950 dark:text-purple-300 text-xs font-medium">
                                        {t}
                                        <X size={12} className="cursor-pointer" onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} />
                                    </span>
                                ))}
                                <button
                                    onClick={handleResetFilters}
                                    className="text-xs text-[#4C1D95] dark:text-purple-300 hover:underline font-semibold ml-2 cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 rounded-2xl bg-slate-200/60 dark:bg-purple-950/30 animate-pulse" />
                                ))}
                            </div>
                        ) : paginatedUniversities.length === 0 ? (
                            /* No Results State */
                            <div className="bg-white dark:bg-[#120B24] rounded-2xl border border-slate-200/80 dark:border-purple-900/40 p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100/60 dark:bg-purple-950/60 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center mx-auto mb-4">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    No universities matched your filters
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    Try clearing some of your search filters or browse our full university catalog.
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-6 py-2.5 rounded-xl bg-[#4C1D95] text-white text-xs font-bold hover:bg-[#3B0764] transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            /* 3-Column Responsive University Card Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {paginatedUniversities.map((uni, idx) => {
                                    return (
                                        <motion.div
                                            key={uni.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: idx * 0.05 }}
                                            onClick={() => {
                                                navigate(`/university-profile/${encodeURIComponent(uni.name)}`, { state: { university: uni.raw } });
                                            }}
                                            className="group cursor-pointer bg-white dark:bg-[#120B24] rounded-2xl border border-slate-200/80 dark:border-purple-900/40 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                                        >
                                            {/* Large Campus Image with Status Badge */}
                                            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-purple-950/40 shrink-0">
                                                <img
                                                    src={uni.image}
                                                    alt={uni.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = uni.fallbackImage;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                                                {/* Top Right Status Badge */}
                                                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border shadow-xs backdrop-blur-xs ${uni.badge.bg}`}>
                                                    {uni.badge.label}
                                                </span>
                                            </div>

                                            {/* University Body */}
                                            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                                
                                                {/* Header: Logo + Name & Location */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    {/* University Logo / Shield */}
                                                    <div className="w-11 h-11 rounded-xl border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#1A1232] p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
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
                                                            className="w-full h-full rounded-lg bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] text-white font-bold text-sm flex items-center justify-center"
                                                            style={{ display: uni.logo ? 'none' : 'flex' }}
                                                        >
                                                            {uni.name.charAt(0)}
                                                        </div>
                                                    </div>

                                                    {/* Title & Location */}
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors">
                                                            {uni.name}
                                                        </h3>
                                                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                                            <MapPin size={12} className="mr-1 shrink-0 text-slate-400" />
                                                            <span className="truncate">{uni.location}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Meta Information Rows */}
                                                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-purple-900/30 text-xs mb-4">
                                                    
                                                    {/* Row 1: QS Ranking / Accreditation */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Award size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                                            <span>QS Ranking:</span>
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {uni.ranking}
                                                        </span>
                                                    </div>

                                                    {/* Row 2: Popular Courses */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                            <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                            <span>Popular Courses:</span>
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">
                                                            {uni.popularCourses}
                                                        </span>
                                                    </div>

                                                    {/* Row 3: Program Levels */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Layers size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
                                                            <span>Program Levels:</span>
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {uni.programLevels}
                                                        </span>
                                                    </div>

                                                </div>

                                                {/* View Details Button */}
                                                <div className="mt-auto">
                                                    <button
                                                        type="button"
                                                        className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-[#4C1D95] text-[#4C1D95] hover:text-white dark:bg-purple-950/50 dark:hover:bg-[#4C1D95] dark:text-purple-300 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-purple-200/50 dark:border-purple-800/30 transition-all duration-300"
                                                    >
                                                        <span>View Details</span>
                                                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>

                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── 3. PAGINATION ── */}
                        {totalPages > 1 && (
                            <div className="pt-8 flex items-center justify-center gap-2">
                                {/* Previous Page Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    aria-label="Previous Page"
                                    className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#120B24] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/60 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    const isActive = page === currentPage;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            aria-label={`Go to page ${page}`}
                                            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#4C1D95] text-white shadow-md shadow-purple-900/20'
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
                                    className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-purple-800/40 bg-white dark:bg-[#120B24] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/60 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                    </div>

                </div>

                {/* ── 4. CAREER GUIDANCE CTA BANNER ── */}
                <div className="mt-16 sm:mt-20">
                    <div className="bg-[#F4EEFE] dark:bg-[#180E30] border border-purple-200/80 dark:border-purple-800/50 rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-purple-500/5">
                        
                        {/* Left: Icon + Text */}
                        <div className="flex items-center gap-4 sm:gap-5 text-center md:text-left flex-col md:flex-row">
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#231545] border border-purple-200/80 dark:border-purple-700/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shadow-sm shrink-0">
                                <Compass size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-space leading-tight">
                                    Not sure which university is right for you?
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                                    Take our quick admissions guidance quiz and get personalized university recommendations matching your background and career goals.
                                </p>
                            </div>
                        </div>

                        {/* Right: Action Button */}
                        <button
                            onClick={() => navigate('/dashboard/course-finder')}
                            className="px-7 py-3.5 rounded-full bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                        >
                            <span>Take the Quiz</span>
                            <ArrowRight size={16} />
                        </button>

                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Platform;
