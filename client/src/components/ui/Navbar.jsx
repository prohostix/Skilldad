
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Sun, Moon, Bell, Search, User as UserIcon, ChevronDown, LogOut, Settings, Video, Info, ArrowRight, BookOpen } from 'lucide-react';
import SkillDadLogo from './SkillDadLogo';
import { useUser } from '../../context/UserContext';
import { useSocket } from '../../context/SocketContext';
import { getMediaUrl } from '../../utils/media';

const Navbar = ({ compact = false }) => {
    const { user, logout } = useUser();
    const { notifications, unreadCount, markAllRead } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allCourses, setAllCourses] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const searchContainerRef = useRef(null);

    // Fetch public courses for live search lookup
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get('/api/courses');
                if (Array.isArray(data)) {
                    setAllCourses(data);
                }
            } catch (err) {
                // Ignore silent fetch failures
            }
        };
        fetchCourses();
    }, []);

    // Filter courses live as user types
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            setSearchResults([]);
            return;
        }
        if (allCourses.length > 0) {
            const matches = allCourses.filter(c => {
                const title = (c.title || '').toLowerCase();
                const category = (c.category || '').toLowerCase();
                const desc = (c.description || '').replace(/<[^>]*>?/gm, '').toLowerCase();
                const programType = (c.programType || c.program_type || '').toLowerCase();
                return title.includes(q) || category.includes(q) || desc.includes(q) || programType.includes(q);
            });
            setSearchResults(matches.slice(0, 6));
        }
    }, [searchQuery, allCourses]);

    // Enhanced Search Handler: Direct to Course Details or Course Cards Catalog
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;

        setIsSearchFocused(false);

        // 1. Check for exact title match (case insensitive)
        const exactMatch = allCourses.find(c => (c.title || '').trim().toLowerCase() === q.toLowerCase());
        if (exactMatch) {
            navigate(`/course/${exactMatch._id}`);
            setSearchQuery('');
            return;
        }

        // 2. If exactly one matching course found, go directly to that course details page!
        if (searchResults.length === 1) {
            navigate(`/course/${searchResults[0]._id}`);
            setSearchQuery('');
            return;
        }

        // 3. Otherwise, go to course catalog filtered cards
        navigate(`/courses?search=${encodeURIComponent(q)}`);
        setSearchQuery('');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.documentElement.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Check if we're on auth pages (login/register)
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY || document.documentElement.scrollTop;
            if (scrollPos > 30) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);
    const [studyAbroadEnabled, setStudyAbroadEnabled] = useState(true);

    useEffect(() => {
        // Check global visibility of Study Abroad feature
        const fetchSettings = async () => {
            try {
                // Ensure axios is available or import it dynamically if not at top level
                const axios = (await import('axios')).default;
                const { data } = await axios.get('/api/public/cms/global_settings');
                if (data.study_abroad_feature) {
                    setStudyAbroadEnabled(data.study_abroad_feature.enabled !== false);
                }
            } catch (err) {
                // ignore
            }
        };
        fetchSettings();
    }, []);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
        { name: 'Universities', href: '/platform' },
        { name: 'Services', href: '/services' },
        { name: 'About Us', href: '/about' },
        { name: 'Job Alerts', href: '/job-alerts' },
    ];

    // Helper to get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'university': return '/university/dashboard';
            case 'partner': return '/partner/dashboard';
            case 'finance': return '/finance/dashboard';
            case 'sales': return '/sales/dashboard';
            default: return '/dashboard';
        }
    };

    const getSettingsLink = () => {
        if (!user) return '/login';
        return user.role === 'student' ? '/dashboard/settings' : `/${user.role}/settings`;
    };

    const userName = user?.name || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

    const handleLogout = () => {
        setIsProfileOpen(false);
        if (logout) logout();
        navigate('/login');
    };

    // Determine if navbar should be transparent
    const shouldBeTransparent = !scrolled;

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${!shouldBeTransparent ? (theme === 'light' ? 'border-b border-purple-200/50 shadow-xs' : 'border-b border-purple-900/30 shadow-md') : (theme === 'light' ? 'border-b border-purple-100/40' : 'border-b border-purple-950/40')}`}
                style={{
                    backgroundColor: shouldBeTransparent
                        ? (theme === 'light' ? '#FAF8FE' : '#090514')
                        : (theme === 'light' ? 'rgba(250, 248, 254, 0.95)' : 'rgba(9, 5, 20, 0.95)'),
                    backdropFilter: 'blur(16px)',
                }}
            >
                {/* Gradient Border Bottom Glow - Only visible on scroll */}
                <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-primary-light transition-opacity duration-500 ${!shouldBeTransparent ? 'opacity-30' : 'opacity-0'}`}></div>


                <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${compact ? 'h-12' : (scrolled ? 'h-14' : 'h-16')}`}>
                    {/* Logo - Image based */}
                    <div className="flex items-center group cursor-pointer mr-6 xl:mr-10 shrink-0" onClick={() => navigate('/')}>
                        <div className="relative flex items-center justify-center mr-2.5">
                            <SkillDadLogo
                                className={`transition-all duration-500 ${compact ? 'w-7 h-7' : (scrolled ? 'w-8 h-8' : 'w-9 h-9')} relative z-20`}
                            />
                        </div>
                        {/* Text - 'SkillDad' in deep purple */}
                        <span className={`brand-text font-bold font-space !text-[#4C1D95] dark:!text-purple-300 uppercase tracking-[0.2em] group-hover:opacity-90 transition-all duration-300 ${compact ? 'text-sm' : (scrolled ? 'text-base' : 'text-lg')}`}>
                            SkillDad
                        </span>
                    </div>

                    {/* Desktop Menu - Deep purple text and underline on select, hover, or click */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center justify-center space-x-3 xl:space-x-4.5 shrink-0">
                            {navItems.map((item) => {
                                const isSelected = item.href === '/' 
                                    ? location.pathname === '/' 
                                    : location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`relative group py-1.5 text-[13.5px] tracking-tight whitespace-nowrap transition-colors duration-200 ${
                                            isSelected
                                                ? '!text-[#6D28D9] [.light-mode_&]:!text-[#6D28D9] font-bold dark:!text-purple-300'
                                                : 'text-slate-600 [.light-mode_&]:text-slate-600 font-semibold hover:!text-[#6D28D9] [.light-mode_&]:hover:!text-[#6D28D9] active:!text-[#6D28D9] [.light-mode_&]:active:!text-[#6D28D9] dark:text-[#E9D5FF] dark:hover:text-purple-200'
                                        }`}
                                    >
                                        <span className={`transition-colors duration-200 ${isSelected ? '!text-[#6D28D9] [.light-mode_&]:!text-[#6D28D9] dark:!text-purple-300' : 'group-hover:!text-[#6D28D9] [.light-mode_&]:group-hover:!text-[#6D28D9] group-active:!text-[#6D28D9] [.light-mode_&]:group-active:!text-[#6D28D9]'}`}>
                                            {item.name}
                                        </span>
                                        {/* Deep purple underline on select OR hover */}
                                        <span
                                            className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#6D28D9] dark:bg-purple-400 transition-all duration-200 origin-center ${
                                                isSelected
                                                    ? 'opacity-100 scale-x-100'
                                                    : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Right Side Actions - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center space-x-3.5 xl:space-x-4 ml-8 xl:ml-14 shrink-0">
                            {/* Interactive Search Bar with Live Course Preview Dropdown */}
                            <div ref={searchContainerRef} className="relative hidden xl:flex items-center">
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="relative flex items-center"
                                >
                                    <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-purple-400/70 flex items-center">
                                        <Search size={13} strokeWidth={2.2} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsSearchFocused(true);
                                        }}
                                        placeholder="Search courses, universities, skills..."
                                        className="w-56 2xl:w-68 pl-8 pr-7 py-1.5 rounded-full bg-[#F3F4F8] dark:bg-[#1E1435] text-xs text-slate-700 dark:text-purple-200 placeholder-slate-400 dark:placeholder-purple-400/60 border border-slate-200/80 dark:border-purple-800/40 focus:border-[#4C1D95] dark:focus:border-purple-400 focus:bg-white dark:focus:bg-[#150D28] focus:outline-none transition-all shadow-2xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                            className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-purple-200 rounded-full transition-colors cursor-pointer"
                                            aria-label="Clear search"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </form>

                                {/* Live Instant Results Floating Dropdown (Goes to Course Details or Catalog Cards) */}
                                <AnimatePresence>
                                    {isSearchFocused && searchQuery.trim() && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full right-0 mt-2.5 w-[340px] 2xl:w-[380px] bg-white/98 dark:bg-[#120B24]/98 backdrop-blur-xl border border-purple-100 dark:border-purple-900/60 rounded-2xl shadow-[0_20px_45px_-12px_rgba(76,29,149,0.25)] overflow-hidden z-50 py-1.5"
                                        >
                                            {/* Header */}
                                            <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-purple-900/30 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-purple-300 uppercase tracking-wider">
                                                <span>Matching Courses</span>
                                                <span className="text-[10px] font-semibold text-[#4C1D95] dark:text-purple-400">
                                                    {searchResults.length} found
                                                </span>
                                            </div>

                                            {/* Results List with Course Card / Details Navigation */}
                                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/80 dark:divide-purple-950/50">
                                                {searchResults.length > 0 ? (
                                                    searchResults.map((course) => (
                                                        <div
                                                            key={course._id}
                                                            onClick={() => {
                                                                navigate(`/course/${course._id}`);
                                                                setIsSearchFocused(false);
                                                                setSearchQuery('');
                                                            }}
                                                            className="px-3.5 py-2.5 hover:bg-purple-50/80 dark:hover:bg-purple-950/60 flex items-center gap-3 cursor-pointer transition-colors group"
                                                        >
                                                            <img
                                                                src={course.thumbnail ? getMediaUrl(course.thumbnail) : "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200"}
                                                                alt={course.title}
                                                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-purple-900/40"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200";
                                                                }}
                                                            />
                                                            <div className="flex-1 min-w-0 text-left">
                                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors">
                                                                    {course.title}
                                                                </h4>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] font-medium text-slate-500 dark:text-purple-300/80 capitalize truncate">
                                                                        {course.category || 'Skill Course'}
                                                                    </span>
                                                                    {course.level && (
                                                                        <>
                                                                            <span className="text-[10px] text-slate-300 dark:text-purple-700">•</span>
                                                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                                                                {course.level}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-[#4C1D95] dark:text-purple-300 flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                                                Details <ArrowRight size={10} />
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-5 text-center text-xs text-slate-500 dark:text-purple-300/70">
                                                        No courses directly match "{searchQuery}"
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Action: View All Matching Cards in Catalog */}
                                            <div className="p-2 border-t border-slate-100 dark:border-purple-900/30 bg-slate-50/60 dark:bg-purple-950/30">
                                                <button
                                                    type="button"
                                                    onClick={handleSearchSubmit}
                                                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-center text-[#4C1D95] dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <span>View all matching cards in Catalog</span>
                                                    <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dark / Light mode toggle placed right after Search Bar */}
                            <button
                                onClick={toggleTheme}
                                className={`shrink-0 aspect-square rounded-full transition-all duration-300 flex items-center justify-center ${compact ? 'h-7 w-7' : 'h-8.5 w-8.5'} ${theme === 'light' ? 'bg-[#F3F4F8] text-slate-700 hover:bg-purple-100 hover:text-[#5B21B6]' : 'bg-[#1a1a2e] text-[#E9D5FF] hover:text-white border border-white/10'}`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>

                            {/* If user logged in, show profile chip */}
                            {user ? (
                                <div className="flex items-center gap-3">
                                    {/* Profile Chip */}
                                    <div className="relative" ref={profileRef}>
                                        <div
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className={`flex items-center gap-2 cursor-pointer px-1.5 py-1 rounded-xl transition-all ${isProfileOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                        >
                                            {user.profileImage ? (
                                                <img
                                                    src={getMediaUrl(user.profileImage)}
                                                    alt={userName}
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                                                    {userInitial}
                                                </div>
                                            )}
                                            <div className="hidden xl:flex flex-col leading-tight">
                                                <span className="text-xs font-bold text-slate-900">{userName}</span>
                                                <span className="text-[10px] text-slate-400">{displayRole}</span>
                                            </div>
                                            <ChevronDown size={13} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 origin-top-right"
                                                >
                                                    <div className="px-4 py-3 border-b border-slate-100">
                                                        <p className="text-slate-900 font-bold text-sm truncate">{userName}</p>
                                                        <p className="text-slate-400 text-xs font-medium mt-0.5">{displayRole}</p>
                                                    </div>
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => { setIsProfileOpen(false); navigate(getDashboardLink()); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3"
                                                        >
                                                            <LayoutDashboard size={16} className="text-slate-400" />
                                                            <span>Go to Dashboard</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { setIsProfileOpen(false); navigate(getSettingsLink()); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3"
                                                        >
                                                            <Settings size={16} className="text-slate-400" />
                                                            <span>Account Settings</span>
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-slate-100 py-1">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                                                        >
                                                            <LogOut size={16} />
                                                            <span>Sign Out</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Login & Sign Up buttons */}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="font-medium text-slate-700 dark:text-purple-200 hover:text-[#4C1D95] dark:hover:text-white transition-colors text-xs px-2 py-1.5 cursor-pointer"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="rounded-lg font-semibold text-white px-3.5 py-1.5 text-xs bg-[#4C1D95] hover:bg-[#3B0764] shadow-xs active:scale-95 transition-all cursor-pointer"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="lg:hidden flex items-center space-x-1">
                            <button
                                onClick={toggleTheme}
                                className={`shrink-0 aspect-square h-8.5 w-8.5 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-[#1a1a2e] text-[#E9D5FF] hover:text-white border border-white/5 hover:border-primary/30'}`}
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>
                            <button onClick={() => setMobileMenuOpen(true)} className="text-slate-100 p-1">
                                <Menu size={compact ? 18 : 22} />
                            </button>
                        </div>
                    )}
                </div>
            </nav>


            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] flex flex-col p-6 lg:hidden"
                    style={{
                        background: theme === 'light' ? 'rgba(250, 249, 246, 0.95)' : 'rgba(5, 5, 20, 0.95)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="flex justify-between items-center mb-10">
                        <span className="brand-text text-xl font-bold font-inter text-white">SkillDad</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-slate-100">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col space-y-5">
                        {/* Mobile Search Bar */}
                        <form
                            onSubmit={(e) => {
                                handleSearchSubmit(e);
                                setMobileMenuOpen(false);
                            }}
                            className="relative flex items-center w-full"
                        >
                            <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-purple-400/70 flex items-center">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses, universities..."
                                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-[#1E1435] text-xs text-slate-800 dark:text-purple-200 border border-slate-200 dark:border-purple-800/50 focus:outline-none focus:border-[#4C1D95] shadow-xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>
                        {navItems.map((item) => {
                            const isSelected = item.href === '/' 
                                ? location.pathname === '/' 
                                : location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-lg font-medium transition-colors ${
                                        isSelected
                                            ? '!text-[#6D28D9] dark:!text-purple-300 font-bold'
                                            : 'text-slate-800 dark:text-slate-100 hover:!text-[#6D28D9] active:!text-[#6D28D9] dark:hover:text-purple-200'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className={`h-[1px] w-full my-4 ${theme === 'light' ? 'bg-black/10' : 'bg-white/10'}`}></div>
                        {user ? (
                            <button
                                onClick={() => { navigate(getDashboardLink()); setMobileMenuOpen(false); }}
                                className="py-4 rounded-xl text-lg font-bold text-slate-100 text-center border border-primary/50 bg-gradient-to-r from-primary/30 via-blue-500/30 to-primary/30 backdrop-blur-sm hover:from-primary/60 hover:via-blue-500/60 hover:to-primary/60 hover:border-primary/80 shadow-[0_0_20px_rgba(110,40,255,0.5)] transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <LayoutDashboard size={20} />
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                    className="text-lg font-medium text-[#B8C0FF] hover:text-white text-left"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                    className="py-4 rounded-xl text-lg font-bold text-slate-100 text-center border border-primary/30 bg-gradient-to-r from-primary-dark/20 via-primary/20 to-primary-light/20 backdrop-blur-sm hover:from-primary/40 hover:via-primary-light/40 hover:to-primary/40 hover:border-primary/50 shadow-glow-purple transition-all duration-300"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
