import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Search,
    BookOpen,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get user role from localStorage/context
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = (userInfo.role || 'student').toLowerCase();

    const getHomePath = () => {
        switch (userRole) {
            case 'admin': return '/admin/dashboard';
            case 'university': return '/university/dashboard';
            case 'partner': return '/partner/dashboard';
            case 'finance': return '/finance/dashboard';
            case 'sales': return '/sales/dashboard';
            default: return '/dashboard';
        }
    };

    const navItems = [
        { icon: Home, label: 'Home', path: getHomePath() },
        { icon: BookOpen, label: 'Courses', path: userRole === 'admin' ? '/admin/courses' : '/dashboard/my-courses' },
        { icon: Search, label: 'Discover', path: '/courses' },
        { icon: User, label: 'Profile', path: userRole === 'student' ? '/dashboard/settings' : `/${userRole}/settings` },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] w-[calc(100%-2rem)] max-w-sm">
            <div className="bg-[#04020a]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex items-center justify-around p-1.5 relative overflow-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center flex-1 py-1.5 rounded-3xl transition-all duration-500 relative z-10 ${
                                isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 rounded-[2rem] shadow-[0_0_15px_rgba(192,38,255,0.2)]"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            <item.icon 
                                size={18} 
                                strokeWidth={isActive ? 2.5 : 2} 
                                className={`relative transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(192,38,255,0.6)]' : ''}`} 
                            />
                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] mt-1 relative transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
