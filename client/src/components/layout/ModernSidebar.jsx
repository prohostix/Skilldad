import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    BookOpen,
    Users,
    Building2,
    BarChart3,
    LifeBuoy,
    Settings,
    Menu,
    X,
    LogOut,
    FileText,
    Trophy,
    DollarSign,
    GraduationCap,
    Image,
    Bell,
    Ticket,
    Wallet,
    MessageCircle,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { useUser } from '../../context/UserContext';

const ModernSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const [universitiesDropdownOpen, setUniversitiesDropdownOpen] = useState(false);

    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = (userInfo.role || 'student').toLowerCase();

    // Define menu items based on user role
    const getMenuItems = () => {
        if (userRole === 'admin') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
                { name: 'Projects', icon: FileText, path: '/admin/projects' },
                { name: 'Exams', icon: Trophy, path: '/admin/exams' },
                { name: 'Users', icon: Users, path: '/admin/users' },
                { name: 'Students', icon: GraduationCap, path: '/admin/students' },
                { 
                    name: 'Universities', 
                    icon: Building2, 
                    hasDropdown: true,
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
                { name: 'Landing Assets', icon: Image, path: '/admin/partner-logos' },
                { name: 'Support Tickets', icon: LifeBuoy, path: '/admin/support' },
                { name: 'FAQ Manager', icon: MessageCircle, path: '/admin/faqs' },
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
            // Student role
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { name: 'My Courses', icon: BookOpen, path: '/dashboard/my-courses' },
                { name: 'Live Classes', icon: Users, path: '/dashboard/live-classes' },
                { name: 'Documents', icon: FileText, path: '/dashboard/documents' },
                { name: 'Exams', icon: Trophy, path: '/dashboard/exams' },
                { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
                { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
            ];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        // Clear user data properly using Context to prevent state lags
        logout();
        // Navigate to login page
        navigate('/login');
        // Close sidebar on mobile
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    x: isOpen ? 0 : -280,
                    width: isOpen ? 280 : 0,
                    opacity: isOpen ? 1 : 0
                }}
                className="fixed lg:sticky top-0 left-0 h-screen bg-black/95 backdrop-blur-2xl border-r border-white/5 z-[100] p-4 flex flex-col shadow-2xl overflow-y-auto scrollbar-hide shrink-0 lg:w-[280px]"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <div className="flex items-center space-x-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
                    <img src={logoImg} alt="SkillDad" className="w-10 h-10 object-contain" />

                    <span className="text-xl font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-space uppercase tracking-wider">
                        Skill Dad
                    </span>
                </div>


                <nav className="flex-1 space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        // Handle dropdown items
                        if (item.hasDropdown) {
                            const isAnySubItemActive = item.subItems.some(sub => location.pathname === sub.path);
                            const isDropdownOpen = universitiesDropdownOpen;

                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => setUniversitiesDropdownOpen(!universitiesDropdownOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${isAnySubItemActive
                                            ? 'bg-primary/20 text-white'
                                            : 'text-white/50 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <Icon size={16} className={`flex-shrink-0 ${isAnySubItemActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                                            <span className="font-medium font-inter text-xs whitespace-nowrap">{item.name}</span>
                                        </div>
                                        {isDropdownOpen ? (
                                            <ChevronDown size={14} className="flex-shrink-0" />
                                        ) : (
                                            <ChevronRight size={14} className="flex-shrink-0" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden ml-4 mt-1 space-y-1"
                                            >
                                                {item.subItems.map((subItem) => {
                                                    const isSubActive = location.pathname === subItem.path;
                                                    return (
                                                        <button
                                                            key={subItem.name}
                                                            onClick={() => {
                                                                navigate(subItem.path);
                                                                if (window.innerWidth < 1024) setIsOpen(false);
                                                            }}
                                                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${isSubActive
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                                : 'text-white/50 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            <span className="font-medium font-inter whitespace-nowrap">{subItem.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }

                        // Handle regular items
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    navigate(item.path);
                                    // Only close on mobile
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : item.name === 'Dashboard'
                                        ? 'text-white hover:bg-white/10 hover:text-white'
                                        : 'text-white/50 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
                                <span className="font-medium font-inter text-xs whitespace-nowrap">{item.name}</span>
                            </button>
                        );
                    })}

                    {/* Logout button - placed after menu items */}
                    <div className="pt-3">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-white/70 hover:bg-primary/10 hover:text-white transition-all duration-200 border border-primary"
                        >
                            <LogOut size={16} className="flex-shrink-0" />
                            <span className="font-medium font-inter text-xs whitespace-nowrap">Logout</span>
                        </button>
                    </div>
                </nav>

            </motion.aside>
        </>
    );
};

export default ModernSidebar;
