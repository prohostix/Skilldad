import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Search,
    BookOpen,
    User,
    Settings
} from 'lucide-react';

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
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-[45] max-w-sm mx-auto">
            <div className="bg-[#04020a]/85 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-3xl flex items-center justify-around p-2 gap-1 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center flex-1 py-1.5 rounded-2xl transition-all duration-300 relative ${
                                isActive ? 'bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(192,38,255,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'scale-110 transition-all duration-300 drop-shadow-[0_0_6px_rgba(192,38,255,0.5)]' : 'transition-colors'} />
                            <span className={`text-[9px] font-black uppercase tracking-[0.1em] mt-1 transition-all duration-300 ${isActive ? 'opacity-100 drop-shadow-[0_0_6px_rgba(192,38,255,0.4)]' : 'opacity-50'}`}>
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
