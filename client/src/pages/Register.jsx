import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Building2,
    Users,
    Sparkles,
    AlertCircle,
    Home,
    Smartphone
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import { useUser } from '../context/UserContext';


const Register = () => {
    const { user, updateUser } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
    });
    const [error, setError] = useState('');
    const [alreadyExists, setAlreadyExists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [isFocused, setIsFocused] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setAlreadyExists(false);
        try {
            const { data } = await axios.post('/api/users', formData);
            updateUser(data); // updates context + localStorage so Navbar re-renders
            // Navigate to home page — Dashboard button is in Navbar
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
                setAlreadyExists(true);
                setError('');
            } else {
                setError(msg);
                setStep(1);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (!formData.phone || formData.phone.trim() === '') {
            setError('WhatsApp number is required.');
            return;
        }
        setError('');
        setStep(step + 1);
    };
    const prevStep = () => { setError(''); setStep(step - 1); };

    return (
        <div className="min-h-screen bg-alyra-gradient flex items-start justify-center pt-24 pb-12 px-6 relative overflow-hidden">
            <Navbar compact />

            {/* Home Button - Left Side */}
            <button
                onClick={() => navigate('/')}
                className="fixed top-24 left-6 z-50 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                title="Go to Home"
            >
                <Home size={20} />
            </button>

            {/* Background Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/3 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-purple/3 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-lg md:text-xl font-black text-primary uppercase tracking-[0.5em] font-inter">Identity Registry</h1>
                    <div className="h-1 w-20 bg-primary/30 mx-auto mt-4 rounded-full"></div>
                </div>

                <GlassCard className="!p-6 md:!p-8 shadow-2xl shadow-indigo-500/10 border-white/40 overflow-hidden">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${step >= i ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400'}`}>
                                    {i}
                                </div>
                                {i === 1 && <div className={`w-20 h-1 mx-2 rounded-full transition-all duration-500 ${step > 1 ? 'bg-primary' : 'bg-slate-100'}`}></div>}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">Full Name</label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'name' ? 'scale-[1.01]' : ''}`}>
                                                <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'name' ? 'text-primary' : 'text-slate-400'}`}>
                                                    <User size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    autoFocus
                                                    placeholder="Alex Matrix"
                                                    onFocus={() => setIsFocused('name')}
                                                    onBlur={() => setIsFocused('')}
                                                    onChange={handleChange}
                                                    value={formData.name}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-slate-500 text-sm font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">Email Matrix</label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                                                <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'email' ? 'text-primary' : 'text-slate-400'}`}>
                                                    <Mail size={16} />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="alex@skilldad.ai"
                                                    onFocus={() => setIsFocused('email')}
                                                    onBlur={() => setIsFocused('')}
                                                    onChange={handleChange}
                                                    value={formData.email}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-slate-500 text-sm font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">WhatsApp Number</label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'phone' ? 'scale-[1.01]' : ''}`}>
                                                <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'phone' ? 'text-primary' : 'text-slate-400'}`}>
                                                    <Smartphone size={16} />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    placeholder="+91 98765 43210"
                                                    onFocus={() => setIsFocused('phone')}
                                                    onBlur={() => setIsFocused('')}
                                                    onChange={handleChange}
                                                    value={formData.phone}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-slate-500 text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Account Tier selection removed as per requirements */}

                                    {error && <p className="text-xs font-bold text-red-400 text-left bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

                                    <ModernButton onClick={nextStep} className="w-full !py-4 font-bold group">
                                        Continue Integration <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </ModernButton>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">Neural Password</label>
                                        <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                                            <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'password' ? 'text-primary' : 'text-slate-400'}`}>
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
                                                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-text-muted/50 text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Institutional review alert removed */}

                                    {error && <p className="text-xs font-bold text-red-500 text-left">{error}</p>}

                                    {alreadyExists && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left">
                                            <p className="text-xs font-bold text-amber-400 mb-1">Account already exists</p>
                                            <p className="text-xs text-white/60">An account with this email already exists. <Link to="/login" className="text-primary font-bold underline">Sign in instead →</Link></p>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={isSubmitting}
                                            className="px-5 py-2.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold flex items-center hover:bg-slate-100 transition-all disabled:opacity-50"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                        <ModernButton
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 !py-3.5 font-bold shadow-xl shadow-primary/30"
                                        >
                                            {isSubmitting ? 'Creating account...' : 'Complete Initialization'}
                                        </ModernButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-sm font-inter text-text-secondary">
                            Already part of the network?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Sign In <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

// Internal utility component for link style matching
const ArrowRight = ({ size, className }) => <ChevronRight size={size} className={className} />;

export default Register;
