import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, X, LogOut, Settings, ChevronDown, CheckCircle2, MessageSquare, Info, Wallet, Video, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { useSocket } from '../../context/SocketContext';
import { getMediaUrl } from '../../utils/media';

const Navbar = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
    
    // Get user info and logout method from context
    const { user, logout, rewardPoints } = useUser();
    const { notifications, unreadCount, setUnreadCount, markAllRead } = useSocket();
    const userInfo = user || JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userName = userInfo.name || 'User';
    const userRole = userInfo.role || 'student';
    
    // Capitalize first letter of role
    const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    // Refs for click outside to close dropdowns
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

    const handleLogout = () => {
        setIsProfileOpen(false);
        if (logout) logout();
        navigate('/login');
    };

    // Generic Mock Notifications - Removed in favor of real socket notifications

    return (
        <header className="sticky top-0 z-50 w-full h-14 sm:h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 px-3 sm:px-6 flex items-center justify-between will-change-transform font-inter">
            <div className="flex items-center space-x-4 flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-100 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
                </button>

                <div className="relative max-w-md w-full hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources, topics..."
                        className="w-full pl-12 pr-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white placeholder:text-white/20 text-sm"
                    />
                </div>

                {/* Mobile Search Toggle */}
                <button 
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className="sm:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-all"
                >
                    <Search size={20} />
                </button>
            </div>

            {/* Expandable Mobile Search Bar */}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 sm:hidden z-[60] overflow-hidden shadow-2xl"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-11 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white text-sm"
                            />
                            <button 
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center space-x-3 sm:space-x-4">
                
                {/* Reward Points Persistent Display */}
                {userRole === 'student' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                        onClick={() => navigate('/dashboard/reward-wallet')}
                    >
                        <div className="p-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Wallet size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white leading-none">
                                {rewardPoints?.total?.toLocaleString() || 0}
                            </span>
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
                                Points
                            </span>
                        </div>
                    </motion.div>
                )}
                
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-400 hover:bg-white/5 hover:text-primary rounded-xl transition-all"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={18} className="sm:w-5 sm:h-5" /> : <Sun size={18} className="sm:w-5 sm:h-5" />}
                </button>

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-primary'}`}
                    >
                        <Bell size={18} className="sm:w-5 sm:h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-black animate-pulse shadow-[0_0_8px_rgba(192,38,255,0.8)]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-3 w-80 bg-[#0A0514] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden py-2 z-50 origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-white font-semibold text-sm">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => (
                                            <div key={index} className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-3 border-b border-white/5 last:border-0">
                                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'live_session' ? 'bg-purple-500/10 text-purple-400' : 'bg-primary/10 text-primary'}`}>
                                                    {notif.type === 'live_session' ? <Video size={14} /> : <Info size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{notif.title}</p>
                                                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-slate-500 text-[10px] mt-1">
                                                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 my-auto shadow-[0_0_8px_rgba(192,38,255,0.6)]"></div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <p className="text-slate-500 text-xs font-medium">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div 
                                    className="px-4 py-2 mt-1 flex justify-center border-t border-white/5 bg-white/[0.02] hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => { markAllRead(); setIsNotifOpen(false); }}
                                >
                                    <p className="text-primary text-xs font-semibold">Mark all as read</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-px bg-white/5 hidden sm:block"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center space-x-3 cursor-pointer group p-1 sm:p-1.5 rounded-xl transition-all ${isProfileOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                        {userInfo.profileImage ? (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all shadow-lg shrink-0">
                                <img
                                    src={getMediaUrl(userInfo.profileImage)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'; }}
                                />
                            </div>
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:border-primary/50 transition-all shadow-[0_0_15px_rgba(192,38,255,0.15)] shrink-0">
                                <UserIcon size={16} className="sm:w-5 sm:h-5" />
                            </div>
                        )}
                        <div className="hidden md:flex flex-col justify-center items-start">
                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-tight">{userName}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold leading-tight mt-0.5">{displayRole}</p>
                        </div>
                        <ChevronDown size={14} className={`hidden md:block text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-primary' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-3 w-56 bg-[#0A0514] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden py-2 z-50 origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-white/5 md:hidden">
                                    <p className="text-white font-bold text-sm truncate">{userName}</p>
                                    <p className="text-slate-400 text-xs font-medium uppercase mt-0.5">{displayRole}</p>
                                </div>
                                <div className="py-1">
                                    <button 
                                        onClick={() => { setIsProfileOpen(false); navigate(userRole === 'student' ? '/dashboard/settings' : `/${userRole}/settings`); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                                    >
                                        <Settings size={16} className="text-slate-400" />
                                        <span>Account Settings</span>
                                    </button>
                                </div>
                                <div className="border-t border-white/5 py-1">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors flex items-center gap-3"
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
        </header>
    );
};

export default Navbar;
