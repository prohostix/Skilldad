import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    MonitorPlay,
    Award,
    BriefcaseBusiness,
    Users
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import SkillDadLogo from '../components/ui/SkillDadLogo';
import loginStudentImg from '../assets/login-student.png';
import { useUser } from '../context/UserContext';

const features = [
    { icon: MonitorPlay, label: 'Industry-relevant courses' },
    { icon: Award, label: 'Verified certifications' },
    { icon: BriefcaseBusiness, label: 'Placement assistance' },
    { icon: Users, label: 'Trusted by top universities & companies' },
];

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
        <div className="h-screen max-h-screen w-full flex bg-white overflow-hidden">
            {/* Left: Branding panel - extends the full height of the page */}
            <div className="hidden lg:flex lg:w-1/2 h-full relative bg-gradient-to-br from-[#F5F3FF] via-[#F8F7FF] to-white flex-col pl-12 pr-6 py-6 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 -right-16 w-72 h-72 bg-primary-light/10 rounded-full blur-[100px]" />

                <Link to="/" className="relative z-10 flex items-center w-fit group">
                    <SkillDadLogo className="w-8 h-8 mr-3" />
                    <span className="brand-text font-bold font-space !text-[#4C1D95] uppercase tracking-[0.2em] group-hover:text-primary transition-all duration-300 text-base">
                        SkillDad
                    </span>
                </Link>

                <div className="relative z-10 max-w-[420px] mt-4">
                    <h1 className="!text-2xl xl:!text-[1.75rem] !font-black !text-slate-900 !leading-[1.15] !tracking-tight font-jakarta whitespace-nowrap">
                        Build Skill, <span className="!text-[#4C1D95]">Get a Job</span>
                    </h1>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Learn from top courses, earn certifications and get placement support — all in one place.
                    </p>

                    <div className="mt-5 space-y-2.5">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#4C1D95]/10 !text-[#4C1D95] flex items-center justify-center shrink-0">
                                    <f.icon size={14} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16" style={{ transform: 'rotate(-10deg)', transformOrigin: 'left center' }}>
                        <p className="text-lg font-semibold leading-tight !text-[#4C1D95]/50" style={{ fontFamily: "'Caveat', cursive" }}>
                            Your Career<br />Our Mission
                        </p>
                        <svg width="90" height="10" viewBox="0 0 90 10" fill="none" className="mt-0.5 !text-[#4C1D95]/50">
                            <path d="M2 6C20 2 60 2 88 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Illustration - absolutely positioned so it can sit large and bleed off the bottom edge like the reference.
                    Uses inline styles (not Tailwind classes) because class-based position/size edits here were not
                    taking visual effect despite being correctly saved and served. */}
                <img
                    src={loginStudentImg}
                    alt=""
                    style={{
                        position: 'absolute',
                        right: '16px',
                        bottom: '40px',
                        width: 'clamp(180px, 26vw, 320px)',
                        height: 'auto',
                        maxHeight: '60%',
                        objectFit: 'contain',
                        objectPosition: 'bottom',
                        pointerEvents: 'none'
                    }}
                />
            </div>

            {/* Right: Sign-in form */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-6 py-8 relative overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8 group">
                        <SkillDadLogo className="w-8 h-8" />
                        <span className="brand-text font-bold font-space !text-[#4C1D95] uppercase tracking-[0.2em] group-hover:text-primary transition-all duration-300 text-base">
                            SkillDad
                        </span>
                    </Link>

                    <div className="border border-slate-200 rounded-2xl p-6 shadow-sm bg-white">

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2.5 text-red-600"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                            <p className="text-[10px] font-bold leading-tight">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Address Field */}
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">
                                Email Address
                            </label>
                            <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                    <Mail size={14} />
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
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">
                                Password
                            </label>
                            <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                    <Lock size={14} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    placeholder="Enter your password"
                                    onFocus={() => setIsFocused('password')}
                                    onBlur={() => setIsFocused('')}
                                    onChange={handleChange}
                                    value={formData.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none z-10"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <Link
                                to="/forgot-password"
                                title="Recover Access"
                                className="self-end text-[11px] font-bold text-primary hover:text-primary-light transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <ModernButton
                            type="submit"
                            disabled={loading}
                            className="w-full !py-2.5 text-xs font-bold group mt-2 overflow-hidden rounded-xl !bg-[#4C1D95] hover:!bg-[#3b1675]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>Sign In</span>
                                    <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </ModernButton>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[11px] text-slate-400 font-medium">or continue with</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google sign-in - visual only for now, no OAuth wired up yet */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
                    >
                        <GoogleIcon size={14} />
                        Continue with Google
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-[11px] text-slate-500">
                            New to SkillDad?{' '}
                            <Link to="/register" className="!text-[#4C1D95] font-bold hover:text-primary-light transition-colors inline-flex items-center gap-1">
                                Create an account <ArrowRight size={11} />
                            </Link>
                        </p>
                    </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Standard 4-color Google "G" mark, for the (currently visual-only) Google
// sign-in button - lucide-react has no brand logos of its own.
const GoogleIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.9 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.9 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14-4.9l-6.5-5.3c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.7l6.5 5.3C41.8 35.6 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
);

export default Login;
