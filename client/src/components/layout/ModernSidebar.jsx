import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, BookOpen, Users, Building2,
    BarChart3, LifeBuoy, Settings, X, LogOut, FileText,
    Trophy, DollarSign, GraduationCap, Image, Bell, Ticket,
    Wallet, MessageCircle, ChevronDown, ChevronRight, Home, Video, Inbox, MapPin, ChevronLeft, Globe
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { useUser } from '../../context/UserContext';

const NavItem = ({ icon: Icon, label, isActive, onClick, isCollapsed }) => {
    return (
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-xl text-sm font-bold font-inter whitespace-nowrap transition-all duration-200 group
                ${isActive
                    ? 'bg-[#4C1D95]/10 dark:bg-[#C026FF]/20 text-[#4C1D95] dark:text-[#C026FF]'
                    : 'text-purple-800 dark:text-white/50 bg-transparent hover:bg-[#4C1D95]/5 dark:hover:bg-[#C026FF]/10 hover:text-[#4C1D95] dark:hover:text-[#C026FF]'
                }`}
        >
            <Icon
                size={20}
                className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#4C1D95] dark:text-[#C026FF]' : 'text-purple-800 dark:text-white/50 group-hover:text-[#4C1D95] dark:group-hover:text-[#C026FF]'}`}
            />
            {!isCollapsed && <span>{label}</span>}
            {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm" />
            )}
            {isActive && isCollapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
            )}
        </button>
    );
};

const HomeNavItem = ({ onClick, isCollapsed }) => {
    return (
        <button
            onClick={onClick}
            title={isCollapsed ? 'Home' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-xl border border-gray-200 dark:border-[#C026FF]/20 text-purple-800 dark:text-white/60 hover:text-[#4C1D95] dark:hover:text-white hover:bg-[#4C1D95]/5 dark:hover:bg-[#C026FF]/10 hover:border-[#4C1D95]/30 text-sm font-bold font-inter transition-all duration-200 group`}
        >
            <Home size={20} className="flex-shrink-0 text-purple-800 dark:text-white/60 group-hover:text-[#4C1D95] dark:group-hover:text-[#C026FF] transition-colors" />
            {!isCollapsed && <span>Home</span>}
        </button>
    );
};

const LogoutItem = ({ onClick, isCollapsed }) => {
    return (
        <button
            onClick={onClick}
            title={isCollapsed ? 'Logout' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-xl text-red-500 dark:text-white/70 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-sm font-bold font-inter transition-all duration-200`}
        >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
        </button>
    );
};

const ModernSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Map the desktop collapse state directly to the isOpen prop
    // (When isOpen is false on desktop, the sidebar shrinks to icons)
    const isCollapsed = isDesktop && !isOpen;

    const [universitiesDropdownOpen, setUniversitiesDropdownOpen] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = (userInfo.role || 'student').toLowerCase();

    const getMenuItems = () => {
        if (userRole === 'admin') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
                { name: 'Course Enquiries', icon: Inbox, path: '/admin/course-enquiries' },
                { name: 'Projects', icon: FileText, path: '/admin/projects' },
                { name: 'Exams', icon: Trophy, path: '/admin/exams' },
                { name: 'Users', icon: Users, path: '/admin/users' },
                { name: 'Students', icon: GraduationCap, path: '/admin/students' },
                { name: 'Career Manager', icon: Briefcase, path: '/admin/career-manager' },
                { name: 'Certificates', icon: Trophy, path: '/admin/certificates' },
                { name: 'Document Review', icon: FileText, path: '/admin/document-review' },
                { name: 'B2B Partners', icon: Briefcase, path: '/admin/b2b' },
                { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
                { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
                { name: 'Payouts', icon: DollarSign, path: '/admin/payouts' },
                { name: 'Communications', icon: Bell, path: '/admin/communications' },
                { name: 'Services Management', icon: LayoutDashboard, path: '/admin/services' },
                { name: 'Study Abroad', icon: Globe, path: '/admin/study-abroad' },
                {
                    name: 'Universities', icon: Building2, type: 'dropdown',
                    subItems: [
                        { name: 'Partner Universities', path: '/admin/university' },
                        { name: 'SkillDad Universities', path: '/admin/skilldad-universities' }
                    ]
                },
                { name: 'WBL Management', icon: Briefcase, path: '/admin/wbl' },
                { name: 'Page Content & Assets', icon: Image, path: '/admin/partner-logos' },
                { name: 'Support Tickets', icon: LifeBuoy, path: '/admin/support' },
                { name: 'Settings', icon: Settings, path: '/admin/settings' },
            ];
        } else if (userRole === 'university') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/university/dashboard' },
                { name: 'Student Manage', icon: Users, path: '/university/groups' },
                { name: 'Live Sessions', icon: BookOpen, path: '/university/live-sessions' },
                { name: 'Exam Management', icon: FileText, path: '/university/exams' },
                { name: 'Analytics', icon: BarChart3, path: '/university/analytics' },
                { name: 'Support', icon: LifeBuoy, path: '/university/support' },
                { name: 'Settings', icon: Settings, path: '/university/settings' },
            ];
        } else if (userRole === 'partner') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/partner/dashboard' },
                { name: 'Students Manage', icon: Users, path: '/partner/students' },
                { name: 'Commission & Wallet', icon: Wallet, path: '/partner/commission' },
                { name: 'Support', icon: LifeBuoy, path: '/partner/support' },
                { name: 'Settings', icon: Settings, path: '/partner/settings' },
            ];
        } else if (userRole === 'finance') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/finance/dashboard' },
                { name: 'Payouts', icon: DollarSign, path: '/finance/payouts' },
                { name: 'Support', icon: LifeBuoy, path: '/finance/support' },
                { name: 'Settings', icon: Settings, path: '/finance/settings' },
            ];
        } else {
            // Student (default)
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { name: 'My Courses', icon: BookOpen, path: '/dashboard/my-courses' },
                { name: 'Live Classes', icon: Users, path: '/dashboard/live-classes' },
                { name: 'Exams', icon: Trophy, path: '/dashboard/exams' },
                { name: 'Documents', icon: FileText, path: '/dashboard/documents' },
                { name: 'Placements & Career', icon: Briefcase, path: '/dashboard/placements' },
                { name: 'Reward Wallet', icon: Wallet, path: '/dashboard/reward-wallet' },
                { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
                { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
            ];
        }
    };

    const menuItems = getMenuItems();

    const handleNav = (path) => {
        navigate(path);
        if (!isDesktop) setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (!isDesktop) setIsOpen(false);
    };

    // Calculate dynamic width
    const sidebarWidth = isCollapsed ? 88 : 280;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && !isDesktop && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ 
                    x: isDesktop ? 0 : (isOpen ? 0 : -300), 
                    width: isDesktop ? sidebarWidth : 280,
                    opacity: 1
                }}
                className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-[#020005]/95 dark:backdrop-blur-2xl border-r border-gray-100 dark:border-[#C026FF]/20 z-[100] flex flex-col shadow-sm overflow-hidden shrink-0 transition-all duration-300 ${!isDesktop && !isOpen ? 'pointer-events-none' : ''} modern-sidebar`}
            >
                {/* Logo Area */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} py-6 min-h-[80px]`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} cursor-pointer`} onClick={() => navigate('/')}>
                        <img src={logoImg} alt="SkillDad" className="w-10 h-10 object-contain shrink-0" />
                        {!isCollapsed && (
                            <span className="text-xl font-black text-[#4C1D95] dark:text-white font-space tracking-wider whitespace-nowrap">
                                SKILL DAD
                            </span>
                        )}
                    </div>
                    {!isDesktop && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:text-[#4C1D95] bg-gray-100 rounded-xl"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    
                    {/* Home Button */}
                    <div className="mb-4">
                        <HomeNavItem onClick={() => navigate('/')} isCollapsed={isCollapsed} />
                    </div>
                    
                    <div className="h-px bg-gray-100 dark:bg-white/10 mb-6 mx-2" />

                    {/* Nav Items */}
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            if (item.type === 'dropdown') {
                                const isAnySubActive = item.subItems.some(s => location.pathname.startsWith(s.path));
                                
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <button
                                            onClick={() => setUniversitiesDropdownOpen(o => !o)}
                                            title={isCollapsed ? item.name : ''}
                                            className={`w-full flex items-center justify-between ${isCollapsed ? 'p-3' : 'px-4 py-3'} rounded-xl text-sm font-bold font-inter transition-all duration-200 group
                                                ${isAnySubActive
                                                    ? 'bg-[#4C1D95]/10 dark:bg-[#C026FF]/20 text-[#4C1D95] dark:text-[#C026FF]'
                                                    : 'text-purple-800 dark:text-white/50 bg-transparent hover:bg-[#4C1D95]/5 dark:hover:bg-[#C026FF]/10 hover:text-[#4C1D95] dark:hover:text-[#C026FF]'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon size={20} className={`flex-shrink-0 transition-colors ${isAnySubActive ? 'text-[#4C1D95] dark:text-[#C026FF]' : 'text-purple-800 dark:text-white/50 group-hover:text-[#4C1D95] dark:group-hover:text-[#C026FF]'}`} />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                universitiesDropdownOpen ? <ChevronDown size={16} className="text-[#4C1D95]/50" /> : <ChevronRight size={16} className="text-[#4C1D95]/50" />
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {universitiesDropdownOpen && !isCollapsed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden ml-11 mt-1 space-y-1 pr-2"
                                                >
                                                    {item.subItems.map(sub => {
                                                        const isSubActive = location.pathname.startsWith(sub.path);
                                                        return (
                                                            <button
                                                                key={sub.name}
                                                                onClick={() => handleNav(sub.path)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium font-inter transition-all duration-200
                                                                    ${isSubActive
                                                                        ? 'text-[#4C1D95] dark:text-[#C026FF] bg-[#4C1D95]/5 dark:bg-[#C026FF]/10'
                                                                        : 'text-purple-800 dark:text-white/40 hover:text-[#4C1D95] dark:hover:text-[#C026FF] hover:bg-[#4C1D95]/5 dark:hover:bg-[#C026FF]/5'
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
                                    isCollapsed={isCollapsed}
                                />
                            );
                        })}

                        <div className="pt-6">
                            <LogoutItem onClick={handleLogout} isCollapsed={isCollapsed} />
                        </div>
                    </nav>
                </div>
            </motion.aside>
        </>
    );
};

export default ModernSidebar;
