import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';

const Navbar = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
    // Get user info from context
    const { user } = useUser();
    const userInfo = user || JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userName = userInfo.name || 'User';
    const userRole = userInfo.role || 'student';

    // Capitalize first letter of role
    const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 flex items-center justify-between will-change-transform font-inter">
            <div className="flex items-center space-x-4 flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
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
                        className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 sm:hidden z-50 overflow-hidden"
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

            <div className="flex items-center space-x-3 sm:space-x-5">
                <button className="relative p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-all hover:text-primary">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-black animate-pulse shadow-[0_0_8px_rgba(192,38,255,0.8)]"></span>
                </button>

                <div className="h-8 w-px bg-white/5 hidden sm:block"></div>

                <div
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-3 cursor-pointer group hover:bg-white/5 p-1 rounded-xl transition-all"
                >
                    {userInfo.profileImage ? (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
                            <img
                                src={`${userInfo.profileImage}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'; }}
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20 group-hover:border-primary/50 transition-all shadow-[0_0_10px_rgba(192,38,255,0.2)]">
                            <User size={16} />
                        </div>
                    )}
                    <div className="hidden md:block">
                        <p className="text-xs font-bold text-white group-hover:text-primary transition-colors leading-none mb-0.5">{userName}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-medium">{displayRole}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
