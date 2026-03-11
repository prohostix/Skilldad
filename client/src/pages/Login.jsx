import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    ArrowRight,
    ChevronRight,
    Loader2,
    Shield,
    Home
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import { useUser } from '../context/UserContext';




const Login = () => {
    const { user, updateUser } = useUser();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    // Check if session expired
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get('session') === 'expired';

    useEffect(() => {
        if (user && user.token) {
            navigate('/');
        }
        
        // Show session expired message
        if (sessionExpired) {
            setError('Your session has expired. Please log in again.');
        }
    }, [user, navigate, sessionExpired]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/users/login', formData);
            updateUser(data); // updates context + localStorage so Navbar re-renders
            // Always go to home page after login — Dashboard button is in Navbar
            navigate(from || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Check your neural credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <Navbar compact />



            {/* Home Button - Left Side */}
            <button
                onClick={() => navigate('/')}
                className="fixed top-20 md:top-24 left-6 z-50 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                title="Go to Home"
            >
                <Home size={20} />
            </button>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary-dark/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-6 md:mb-8">
                    <h1 className="text-lg md:text-xl font-black text-primary uppercase tracking-[0.4em] font-inter">Sync Terminal</h1>
                </div>

                <GlassCard className="!p-5 md:!p-7 shadow-glow-purple border-white/20">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center space-x-3 text-red-400 backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                            <p className="text-sm font-bold font-inter">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1 font-inter">Email Architecture</label>
                            <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.02]' : ''}`}>
                                <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'email' ? 'text-primary' : 'text-text-muted'}`}>
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your registered email"
                                    onFocus={() => setIsFocused('email')}
                                    onBlur={() => setIsFocused('')}
                                    onChange={handleChange}
                                    value={formData.email}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-inter text-text-primary placeholder:text-text-muted text-sm font-medium backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-inter">Neural Passphrase</label>
                                <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">Reset Sync</Link>
                            </div>
                            <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                                <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'password' ? 'text-primary' : 'text-text-muted'}`}>
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••••••"
                                    onFocus={() => setIsFocused('password')}
                                    onBlur={() => setIsFocused('')}
                                    onChange={handleChange}
                                    value={formData.password}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-inter text-text-primary placeholder:text-text-muted text-sm font-medium backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <ModernButton
                            type="submit"
                            disabled={loading}
                            className="w-full !py-4 font-bold shadow-glow-gradient group mt-4 overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin mr-2" />
                                    <span>Syncing Session...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>Establish Connection</span>
                                    <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </ModernButton>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { role: 'Admin', email: 'admin@skilldad.com' },
                                { role: 'Finance', email: 'finance@skilldad.com' },
                                { role: 'Partner', email: 'partner@techcorp.com' },
                                { role: 'Student', email: 'john.smith@student.com' }
                            ].map((demo) => (
                                <button
                                    key={demo.role}
                                    type="button"
                                    onClick={() => setFormData({ email: demo.email, password: '123456' })}
                                    className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-white/5 border border-white/5 hover:border-primary/20 rounded-md transition-all"
                                >
                                    {demo.role} Access
                                </button>
                            ))}
                        </div>
                        <p className="text-xs font-inter text-text-secondary">
                            New to the platform?{' '}
                            <Link to="/register" className="text-primary font-bold hover:text-primary-dark transition-colors">
                                Request Access <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
