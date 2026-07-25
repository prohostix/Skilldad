
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import SkillDadLogo from './SkillDadLogo';
import { useUser } from '../../context/UserContext';

const Navbar = ({ compact = false }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
        { name: 'Universities', href: '/platform' },
        { name: 'Study Abroad', href: '/study-abroad' },
        { name: 'Services', href: '/services' },
        { name: 'About Us', href: '/about' },
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

    // Determine if navbar should be transparent
    const shouldBeTransparent = isHomePage && !scrolled;

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    !shouldBeTransparent 
                        ? 'bg-white/95 backdrop-blur-2xl border-b border-purple-200/80 shadow-md text-slate-900' 
                        : 'bg-white/70 backdrop-blur-xl border-b border-purple-100/50 shadow-sm text-slate-900'
                }`}
            >
                {/* Gradient Border Bottom Glow */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary-light/40"></div>

                <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${compact ? 'h-14' : 'h-20'}`}>
                    {/* Logo - Image based */}
                    <div className="flex items-center group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="relative flex items-center justify-center mr-3">
                            <SkillDadLogo
                                className={`transition-all duration-500 ${compact ? 'w-8 h-8' : 'w-12 h-12'} relative z-20`}
                            />
                        </div>
                        {/* Text - 'SkillDad' */}
                        <span className={`font-black font-space text-slate-900 uppercase tracking-[0.2em] group-hover:text-primary transition-all duration-300 ${compact ? 'text-base' : 'text-xl'}`}>
                            SkillDad
                        </span>
                    </div>

                    {/* Desktop Menu - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`relative font-extrabold text-slate-800 hover:text-primary transition-colors duration-300 group py-2 ${compact ? 'text-xs' : 'text-sm'}`}
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-primary-light group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side Actions - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="hidden lg:flex items-center space-x-6">
                            {user ? (
                                <button
                                    onClick={() => navigate(getDashboardLink())}
                                    className={`flex items-center gap-2 rounded-xl font-black text-white relative overflow-hidden group transition-all duration-300 border border-primary/50 bg-gradient-to-r from-primary via-[#C026FF] to-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)] hover:shadow-[0_0_30px_rgba(110,40,255,0.5)] hover:scale-105 active:scale-95 ${compact ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'}`}
                                >
                                    <LayoutDashboard size={compact ? 14 : 16} className="relative z-10" />
                                    <span className="relative z-10">Dashboard</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className={`font-black text-slate-900 hover:text-primary transition-colors ${compact ? 'text-xs' : 'text-sm'}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className={`rounded-xl font-black text-white relative overflow-hidden group transition-all duration-300 bg-gradient-to-r from-primary via-[#C026FF] to-primary shadow-md hover:scale-105 active:scale-95 ${compact ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'}`}
                                    >
                                        <span className="relative z-10">Sign Up</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button - Hide on auth pages */}
                    {!isAuthPage && (
                        <div className="lg:hidden">
                            <button onClick={() => setMobileMenuOpen(true)} className="text-slate-900">
                                <Menu size={compact ? 20 : 24} />
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
                        background: 'rgba(5, 5, 20, 0.95)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="flex justify-between items-center mb-10">
                        <span className="text-xl font-bold font-inter text-white">SkillDad</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col space-y-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-medium text-white hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="h-[1px] bg-white/10 w-full my-4"></div>
                        {user ? (
                            <button
                                onClick={() => { navigate(getDashboardLink()); setMobileMenuOpen(false); }}
                                className="py-4 rounded-xl text-lg font-bold text-white text-center border border-primary/50 bg-gradient-to-r from-primary/30 via-blue-500/30 to-primary/30 backdrop-blur-sm hover:from-primary/60 hover:via-blue-500/60 hover:to-primary/60 hover:border-primary/80 shadow-[0_0_20px_rgba(110,40,255,0.5)] transition-all duration-300 flex items-center justify-center gap-3"
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
                                    className="py-4 rounded-xl text-lg font-bold text-white text-center border border-primary/30 bg-gradient-to-r from-primary-dark/20 via-primary/20 to-primary-light/20 backdrop-blur-sm hover:from-primary/40 hover:via-primary-light/40 hover:to-primary/40 hover:border-primary/50 shadow-glow-purple transition-all duration-300"
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
