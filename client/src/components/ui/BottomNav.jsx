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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
            <div className="bg-[#0A0A1F]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl flex items-center justify-around p-3">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
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
