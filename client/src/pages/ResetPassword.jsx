import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Lock,
    ArrowLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState('');

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Neural passphrases do not match.');
        }

        if (password.length < 6) {
            return setError('Passphrase must be at least 6 characters.');
        }

        setLoading(true);
        try {
            await axios.put(`/api/users/resetpassword/${token}`, { password });
            setSuccess(true);
            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Access token invalid or expired. Please request a new link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-alyra-gradient flex items-center justify-center p-4 relative overflow-hidden">
            <Navbar compact />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-primary mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-sm font-black text-primary uppercase tracking-[0.4em] font-inter">Encryption Update</h1>
                    <p className="text-2xl font-bold text-white font-jakarta tracking-tight">New Neural Passphrase</p>
                </div>

                <GlassCard className="!p-6 md:!p-8 shadow-glow-purple border-white/20">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="flex justify-center">
                                <CheckCircle2 size={64} className="text-emerald-400 animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Sync Updated!</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Your neural access has been restored successfully. Authenticating and redirecting to login...
                                </p>
                            </div>
                            <ModernButton
                                onClick={() => navigate('/login')}
                                className="w-full !py-3"
                            >
                                Login Now
                            </ModernButton>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center space-x-3 text-red-400"
                                >
                                    <ShieldAlert size={20} className="shrink-0" />
                                    <p className="text-xs font-bold font-inter">{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1 font-inter">New Passphrase</label>
                                    <div className={`relative transition-all duration-300 ${isFocused === 'pass' ? 'scale-[1.02]' : ''}`}>
                                        <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'pass' ? 'text-primary' : 'text-text-muted'}`}>
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            onFocus={() => setIsFocused('pass')}
                                            onBlur={() => setIsFocused('')}
                                            onChange={(e) => setPassword(e.target.value)}
                                            value={password}
                                            className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-inter text-text-primary placeholder:text-text-muted text-sm font-medium backdrop-blur-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1 font-inter">Confirm Passphrase</label>
                                    <div className={`relative transition-all duration-300 ${isFocused === 'confirm' ? 'scale-[1.02]' : ''}`}>
                                        <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'confirm' ? 'text-primary' : 'text-text-muted'}`}>
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            onFocus={() => setIsFocused('confirm')}
                                            onBlur={() => setIsFocused('')}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            value={confirmPassword}
                                            className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-inter text-text-primary placeholder:text-text-muted text-sm font-medium backdrop-blur-sm"
                                        />
                                    </div>
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
                                        <span>Updating Neural Sync...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <span>Confirm Reset</span>
                                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </ModernButton>

                            <div className="text-center pt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                                >
                                    Token expired? Request new link
                                </Link>
                            </div>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
