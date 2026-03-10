import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail,
    ArrowLeft,
    ChevronRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/users/forgotpassword', { email });
            setMessage('Neural reset link dispatched to your inbox. Please check your mail within 10 minutes.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to dispatch reset link. Please check the email address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-alyra-gradient flex items-center justify-center p-4 relative overflow-hidden">
            <Navbar compact />

            {/* Back Button */}
            <button
                onClick={() => navigate('/login')}
                className="fixed top-24 left-6 z-50 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 font-inter text-sm"
            >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Login</span>
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-primary mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-sm font-black text-primary uppercase tracking-[0.4em] font-inter">Security Protocol</h1>
                    <p className="text-2xl font-bold text-white font-jakarta tracking-tight">Recover Neural Sync</p>
                </div>

                <GlassCard className="!p-6 md:!p-8 shadow-glow-purple border-white/20">
                    {message ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 font-inter text-sm font-medium leading-relaxed">
                                {message}
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors font-inter text-sm uppercase tracking-widest gap-2"
                            >
                                <ArrowLeft size={16} /> Return to Sync Terminal
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-sm text-text-secondary text-center font-inter leading-relaxed px-2">
                                Enter your registered email address and we will dispatch a secure link to reset your Neural Passphrase.
                            </p>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center space-x-3 text-red-400"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                    <p className="text-xs font-bold font-inter">{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1 font-inter">Registered Email</label>
                                <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                                    <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused ? 'text-primary' : 'text-text-muted'}`}>
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-inter text-text-primary placeholder:text-text-muted text-sm font-medium backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <ModernButton
                                type="submit"
                                disabled={loading}
                                className="w-full !py-4 font-bold shadow-glow-gradient group overflow-hidden"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2" />
                                        <span>Dispatching Link...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <span>Send Reset Link</span>
                                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </ModernButton>

                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="text-xs font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                                >
                                    Remembered your password?
                                </Link>
                            </div>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
