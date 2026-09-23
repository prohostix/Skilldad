
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Sun, Moon, Bell, User as UserIcon, ChevronDown, LogOut, Settings, Video, Info } from 'lucide-react';
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
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
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
            if (scrollPos > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
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
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${!shouldBeTransparent ? (theme === 'light' ? 'border-b border-black/5 shadow-md text-gray-900' : 'border-b border-white/5 shadow-md text-white') : 'border-b border-transparent'}`}
                style={{
                    backgroundColor: shouldBeTransparent ? 'transparent' : (theme === 'light' ? '#FAF9F6' : 'rgba(0, 0, 0, 0.9)'),
                    backdropFilter: shouldBeTransparent ? 'none' : 'blur(20px)',
                }}
            >
                {/* Gradient Border Bottom Glow - Only visible on scroll */}
                <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-primary-light transition-opacity duration-500 ${!shouldBeTransparent ? 'opacity-30' : 'opacity-0'}`}></div>


                <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${compact ? 'h-12' : (scrolled ? 'h-14' : 'h-16')}`}>
                    {/* Logo - Image based */}
                    <div className="flex items-center group cursor-pointer" onClick={() => navigate('/')}>
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

                    {/* Desktop Menu - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center justify-center space-x-7">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={theme === 'light'
                                        ? `logo-color-text nav-underline relative font-bold transition-colors duration-300 py-1 ${compact || scrolled ? 'text-xs' : 'text-sm'}`
                                        : `nav-underline relative font-medium text-[#E9D5FF] hover:text-white transition-colors duration-300 py-1 ${compact || scrolled ? 'text-xs' : 'text-sm'}`
                                    }
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side Actions - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center space-x-5">
                            <button
                                onClick={toggleTheme}
                                className={`shrink-0 aspect-square rounded-full transition-all duration-300 flex items-center justify-center ${compact ? 'h-8 w-8' : (scrolled ? 'h-8.5 w-8.5' : 'h-9 w-9')} ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-[#1a1a2e] text-[#E9D5FF] hover:text-white border border-white/5 hover:border-primary/30'}`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={scrolled ? 15 : 17} /> : <Sun size={scrolled ? 15 : 17} />}
                            </button>
                            {user ? (
                                <div className="flex items-center gap-3">
                                    {/* Notification Bell */}
                                    <div className="relative" ref={notifRef}>
                                        <button
                                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                                            className={`relative p-2 rounded-full transition-all ${isNotifOpen ? 'bg-primary/10 text-primary' : 'bg-white border border-slate-200 text-slate-500 hover:text-primary shadow-xs'}`}
                                            aria-label="Notifications"
                                        >
                                            <Bell size={17} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white animate-pulse"></span>
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {isNotifOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 origin-top-right"
                                                >
                                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                                        <h3 className="text-slate-900 font-bold text-sm">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                                                        )}
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto">
                                                        {notifications.length > 0 ? (
                                                            notifications.map((notif, index) => (
                                                                <div key={index} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 border-b border-slate-50 last:border-0">
                                                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'live_session' ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary'}`}>
                                                                        {notif.type === 'live_session' ? <Video size={14} /> : <Info size={14} />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-slate-900 text-sm font-medium truncate">{notif.title}</p>
                                                                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                                                                    </div>
                                                                    {!notif.read && <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 my-auto"></div>}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-8 text-center">
                                                                <p className="text-slate-400 text-xs font-medium">No new notifications</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {notifications.length > 0 && (
                                                        <div
                                                            className="px-4 py-2 mt-1 flex justify-center border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                                            onClick={() => { markAllRead(); setIsNotifOpen(false); }}
                                                        >
                                                            <p className="text-primary text-xs font-semibold">Mark all as read</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

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
                                    <button
                                        onClick={() => navigate('/login')}
                                        className={`font-medium ${!shouldBeTransparent && theme === 'light' ? 'text-gray-800 hover:text-primary' : 'text-slate-100 hover:text-primary'} transition-colors ${compact || scrolled ? 'text-xs' : 'text-sm'}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className={`rounded-lg font-bold text-white relative overflow-hidden group transition-all duration-300 bg-[#4C1D95] hover:bg-[#3B0764] shadow-xs active:scale-95 leading-none ${compact ? 'px-3 py-1.5 text-[11px]' : (scrolled ? 'px-3.5 py-1.5 text-xs' : 'px-4 py-2 text-xs')}`}
                                    >
                                        <span className="relative z-10">Sign Up</span>
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

                    <div className="flex flex-col space-y-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-medium text-slate-100 hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
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
