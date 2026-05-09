import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, BookOpen, Users, Building2,
    BarChart3, LifeBuoy, Settings, X, LogOut, FileText,
    Trophy, DollarSign, GraduationCap, Image, Bell, Ticket,
    Wallet, MessageCircle, ChevronDown, ChevronRight, Globe, Home, Video
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { useUser } from '../../context/UserContext';

/* ── Glow colours ── */
const GLOW_PURPLE = '0 0 18px rgba(138,43,226,0.7)';
const GLOW_PURPLE_SM = '0 0 12px rgba(138,43,226,0.4)';
const GLOW_RED = '0 0 14px rgba(239,68,68,0.45)';

const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}
            onTouchEnd={() => setHovered(false)}
            style={{
                boxShadow: isActive ? GLOW_PURPLE : hovered ? GLOW_PURPLE_SM : 'none',
                transform: isActive ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'scale(1)',
                transition: 'box-shadow 0.2s ease, transform 0.15s ease, background 0.15s ease',
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium font-inter whitespace-nowrap
                ${isActive
                    ? 'bg-primary text-white border-primary'
                    : 'text-white/50 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                }`}
        >
            <Icon
                size={14}
                className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : hovered ? 'text-primary' : 'text-current'}`}
            />
            <span>{label}</span>
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white"
                    style={{ boxShadow: '0 0 6px #fff' }}
                />
            )}
        </button>
    );
};

const HomeNavItem = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}
            onTouchEnd={() => setHovered(false)}
            style={{
                boxShadow: hovered ? GLOW_PURPLE_SM : 'none',
                transition: 'box-shadow 0.2s ease',
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium font-inter"
        >
            <Home size={14} className={`flex-shrink-0 transition-colors ${hovered ? 'text-primary' : ''}`} />
            <span>Home</span>
        </button>
    );
};

const LogoutItem = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                boxShadow: hovered ? GLOW_RED : 'none',
                transition: 'box-shadow 0.2s ease',
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-primary/30 text-white/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-xs font-medium font-inter"
        >
            <LogOut size={14} className="flex-shrink-0" />
            <span>Logout</span>
        </button>
    );
};

const ModernSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const [universitiesDropdownOpen, setUniversitiesDropdownOpen] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = (userInfo.role || 'student').toLowerCase();

    const getMenuItems = () => {
        if (userRole === 'admin') return [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
            { name: 'Projects', icon: FileText, path: '/admin/projects' },
            { name: 'Exams', icon: Trophy, path: '/admin/exams' },
            { name: 'Users', icon: Users, path: '/admin/users' },
            { name: 'Students', icon: GraduationCap, path: '/admin/students' },
            { name: 'Career Manager', icon: Briefcase, path: '/admin/career-manager' },
            { name: 'Certificates', icon: Trophy, path: '/admin/certificates' },
            {
                name: 'Universities', icon: Building2, hasDropdown: true,
                subItems: [
                    { name: 'Universities', path: '/admin/university' },
                    { name: 'SkillDad Universities', path: '/admin/skilldad-universities' }
                ]
            },
            { name: 'B2B Partners', icon: Briefcase, path: '/admin/b2b' },
            { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
            { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
            { name: 'Payouts', icon: DollarSign, path: '/admin/payouts' },
            { name: 'Communications', icon: Bell, path: '/admin/communications' },
            { name: 'Services Management', icon: LayoutDashboard, path: '/admin/services' },
            { name: 'Study Abroad', icon: Globe, path: '/admin/study-abroad' },
            { name: 'Page Content & Assets', icon: Image, path: '/admin/partner-logos' },
            { name: 'Support Tickets', icon: LifeBuoy, path: '/admin/support' },
            { name: 'FAQ Manager', icon: MessageCircle, path: '/admin/faqs' },
            { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ];

        if (userRole === 'university') return [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/university/dashboard' },
            { name: 'Student Manage', icon: Users, path: '/university/groups' },
            { name: 'Our Courses', icon: BookOpen, path: '/university/courses' },
            { name: 'Live Sessions', icon: Video, path: '/university/live-sessions' },
            { name: 'Exam Management', icon: FileText, path: '/university/exams' },
            { name: 'Certificates', icon: Trophy, path: '/university/certificates' },
            { name: 'Analytics', icon: BarChart3, path: '/university/analytics' },
            { name: 'Support', icon: LifeBuoy, path: '/university/support' },
            { name: 'Settings', icon: Settings, path: '/university/settings' },
        ];

        if (userRole === 'partner') return [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/partner/dashboard' },
            { name: 'Course Management', icon: BookOpen, path: '/partner/courses' },
            { name: 'Students Manage', icon: Users, path: '/partner/students' },
            { name: 'Live Sessions', icon: Video, path: '/partner/live-sessions' },
            { name: 'Exam Management', icon: FileText, path: '/partner/exams' },
            { name: 'Commission & Wallet', icon: Wallet, path: '/partner/commission' },
            { name: 'Support', icon: LifeBuoy, path: '/partner/support' },
            { name: 'Settings', icon: Settings, path: '/partner/settings' },
        ];

        if (userRole === 'finance') return [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/finance/dashboard' },
            { name: 'Payouts', icon: DollarSign, path: '/finance/payouts' },
            { name: 'Reports', icon: FileText, path: '/finance/reports' },
            { name: 'Support', icon: LifeBuoy, path: '/finance/support' },
            { name: 'Settings', icon: Settings, path: '/finance/settings' },
        ];

        // Student (default)
        return [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { name: 'My Courses', icon: BookOpen, path: '/dashboard/my-courses' },
            { name: 'Live Classes', icon: Users, path: '/dashboard/live-classes' },
            { name: 'Documents', icon: FileText, path: '/dashboard/documents' },
            { name: 'Exams', icon: Trophy, path: '/dashboard/exams' },
            { name: 'Placements & Career', icon: Briefcase, path: '/dashboard/placements' },
            { name: 'Reward Wallet', icon: Wallet, path: '/dashboard/reward-wallet' },
            { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ];
    };

    const menuItems = getMenuItems();

    const handleNav = (path) => {
        navigate(path);
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -220, width: isOpen ? 220 : 0, opacity: isOpen ? 1 : 0 }}
                className="fixed lg:sticky top-0 left-0 h-screen bg-black/95 backdrop-blur-2xl border-r border-white/5 z-[100] p-3 flex flex-col shadow-2xl overflow-y-auto overflow-x-hidden scrollbar-hide shrink-0 lg:w-[220px]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Logo */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logoImg} alt="SkillDad" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-space uppercase tracking-wider">
                            Skill Dad
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 text-white/50 hover:text-white bg-white/5 rounded-xl border border-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Home Button */}
                <div className="mb-2">
                    <HomeNavItem onClick={() => navigate('/')} />
                </div>
                <div className="h-px bg-white/10 mb-3" />

                {/* Nav Items */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        if (item.hasDropdown) {
                            const isAnySubActive = item.subItems.some(s => location.pathname === s.path);
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => setUniversitiesDropdownOpen(o => !o)}
                                        style={{
                                            boxShadow: isAnySubActive ? GLOW_PURPLE : 'none',
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium font-inter transition-all
                                            ${isAnySubActive
                                                ? 'bg-primary/20 text-white border-primary/40'
                                                : 'text-white/50 border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Icon size={14} className={`flex-shrink-0 ${isAnySubActive ? 'text-primary' : ''}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        {universitiesDropdownOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </button>

                                    <AnimatePresence>
                                        {universitiesDropdownOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden ml-4 mt-1 space-y-1"
                                            >
                                                {item.subItems.map((sub) => {
                                                    const isSubActive = location.pathname === sub.path;
                                                    return (
                                                        <button
                                                            key={sub.name}
                                                            onClick={() => handleNav(sub.path)}
                                                            style={{ boxShadow: isSubActive ? GLOW_PURPLE : 'none' }}
                                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium font-inter transition-all
                                                                ${isSubActive
                                                                    ? 'bg-primary text-white border-primary'
                                                                    : 'text-white/50 border-transparent hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }

                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));

                        return (
                            <NavItem
                                key={item.name}
                                icon={Icon}
                                label={item.name}
                                isActive={isActive}
                                onClick={() => handleNav(item.path)}
                            />
                        );
                    })}

                    <div className="pt-3">
                        <LogoutItem onClick={handleLogout} />
                    </div>
                </nav>
            </motion.aside>
        </>
    );
};

export default ModernSidebar;
