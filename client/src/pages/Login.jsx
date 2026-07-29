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
    Home,
    Eye,
    EyeOff
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
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    // Check if session expired
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get('session') === 'expired';

    useEffect(() => {
        if (user && user.token) {
            const redirectToDashboard = (role) => {
                switch (role) {
                    case 'admin': return '/admin/dashboard';
                    case 'university': return '/university/dashboard';
                    case 'partner': return '/partner/dashboard';
                    case 'finance': return '/finance/dashboard';
                    case 'sales': return '/sales/dashboard';
                    case 'student': return '/dashboard';
                    default: return '/';
                }
            };
            navigate(redirectToDashboard(user.role));
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
            
            // Redirect based on role
            const redirectToDashboard = (role) => {
                switch (role) {
                    case 'admin': return '/admin/dashboard';
                    case 'university': return '/university/dashboard';
                    case 'partner': return '/partner/dashboard';
                    case 'finance': return '/finance/dashboard';
                    case 'sales': return '/sales/dashboard';
                    case 'student': return '/dashboard';
                    default: return '/';
                }
            };

            navigate(from || redirectToDashboard(data.role));
        } catch (err) {
            setError(err.response?.data?.message || 'Check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-16 md:pt-20 pb-8 relative overflow-hidden">
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
                className="w-full max-w-sm relative z-10 mx-auto"
            >
                <div className="text-center mb-5">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-inter">
                        Sign In
                    </h1>
                </div>

                <GlassCard className="!p-5 md:!p-6 shadow-2xl border-white/15 bg-black/70 backdrop-blur-xl rounded-2xl">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2.5 text-red-400 backdrop-blur-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping"></span>
                            <p className="text-[11px] font-bold font-inter leading-tight">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* Email Address Field */}
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.15em] ml-0.5 font-inter">
                                Email Address
                            </label>
                            <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                                <div className={`absolute inset-y-0 left-3.5 flex items-center pointer-events-none transition-colors ${isFocused === 'email' ? 'text-primary' : 'text-white/40'}`}>
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
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/80 transition-all font-inter text-white placeholder:text-white/30 text-xs font-medium backdrop-blur-md"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-white/70 uppercase tracking-[0.15em] ml-0.5 font-inter">
                                Password
                            </label>
                            <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                                <div className={`absolute inset-y-0 left-3.5 flex items-center pointer-events-none transition-colors ${isFocused === 'password' ? 'text-primary' : 'text-white/40'}`}>
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    placeholder="••••••••••••"
                                    onFocus={() => setIsFocused('password')}
                                    onBlur={() => setIsFocused('')}
                                    onChange={handleChange}
                                    value={formData.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/80 transition-all font-inter text-white placeholder:text-white/30 text-xs font-medium backdrop-blur-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-primary transition-colors focus:outline-none z-10"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <Link
                                to="/forgot-password"
                                title="Recover Access"
                                className="self-end text-[10px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-wider"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <ModernButton
                            type="submit"
                            disabled={loading}
                            className="w-full !py-2.5 text-xs font-bold shadow-glow-gradient group mt-4 overflow-hidden rounded-xl"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    <span>Syncing Session...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>Sign In</span>
                                    <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </ModernButton>
                    </form>

                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-[11px] font-inter text-white/50">
                            New to the platform?{' '}
                            <Link to="/register" className="text-primary font-bold hover:text-primary-light transition-colors inline-flex items-center gap-1">
                                Request Access <ArrowRight size={12} />
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
