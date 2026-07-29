import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
    Smartphone,
    ChevronDown,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import { useUser } from '../context/UserContext';
import CountrySelector from '../components/ui/CountrySelector';



const countryCodes = [
    { code: '+91', name: 'India', flag: '🇮🇳', iso: 'in' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸', iso: 'us' },
    { code: '+44', name: 'UK', flag: '🇬🇧', iso: 'gb' },
    { code: '+971', name: 'UAE', flag: '🇦🇪', iso: 'ae' },
    { code: '+61', name: 'Australia', flag: '🇦🇺', iso: 'au' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬', iso: 'sg' },
    { code: '+49', name: 'Germany', flag: '🇩🇪', iso: 'de' },
    { code: '+33', name: 'France', flag: '🇫🇷', iso: 'fr' },
    { code: '+81', name: 'Japan', flag: '🇯🇵', iso: 'jp' },
    { code: '+86', name: 'China', flag: '🇨🇳', iso: 'cn' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', iso: 'sa' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦', iso: 'qa' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼', iso: 'kw' },
    { code: '+968', name: 'Oman', flag: '🇴🇲', iso: 'om' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭', iso: 'bh' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬', iso: 'eg' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦', iso: 'za' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬', iso: 'ng' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪', iso: 'ke' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾', iso: 'my' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭', iso: 'th' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩', iso: 'id' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭', iso: 'ph' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳', iso: 'vn' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷', iso: 'kr' },
    { code: '+7', name: 'Russia', flag: '🇷🇺', iso: 'ru' },
    { code: '+39', name: 'Italy', flag: '🇮🇹', iso: 'it' },
    { code: '+34', name: 'Spain', flag: '🇪🇸', iso: 'es' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱', iso: 'nl' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭', iso: 'ch' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪', iso: 'se' },
    { code: '+47', name: 'Norway', flag: '🇳🇴', iso: 'no' },
    { code: '+45', name: 'Denmark', flag: '🇩🇰', iso: 'dk' },
    { code: '+358', name: 'Finland', flag: '🇫🇮', iso: 'fi' },
    { code: '+353', name: 'Ireland', flag: '🇮🇪', iso: 'ie' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹', iso: 'pt' },
    { code: '+30', name: 'Greece', flag: '🇬🇷', iso: 'gr' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷', iso: 'tr' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷', iso: 'br' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽', iso: 'mx' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷', iso: 'ar' },
    { code: '+56', name: 'Chile', flag: '🇨🇱', iso: 'cl' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴', iso: 'co' },
    { code: '+51', name: 'Peru', flag: '🇵🇪', iso: 'pe' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰', iso: 'pk' },
    { code: '+880', name: 'Bangladesh', flag: '🇧🇩', iso: 'bd' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', iso: 'lk' },
    { code: '+977', name: 'Nepal', flag: '🇳🇵', iso: 'np' },
];

// Exact national mobile-number digit count (excluding country code) for the
// countries above where the length is fixed. Countries not listed here (or
// with genuinely variable-length numbers) fall back to a generic 7-14 digit
// range check.
const countryPhoneLengths = {
    '+91': 10,   // India
    '+1': 10,    // USA/Canada
    '+44': 10,   // UK
    '+971': 9,   // UAE
    '+61': 9,    // Australia
    '+65': 8,    // Singapore
    '+966': 9,   // Saudi Arabia
    '+974': 8,   // Qatar
    '+965': 8,   // Kuwait
    '+968': 8,   // Oman
    '+973': 8,   // Bahrain
    '+92': 10,   // Pakistan
    '+880': 10,  // Bangladesh
    '+94': 9,    // Sri Lanka
    '+977': 10,  // Nepal
};

const Register = () => {
    const { user, updateUser } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        countryCode: '+91',
    });
    const [error, setError] = useState('');
    const [alreadyExists, setAlreadyExists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [isFocused, setIsFocused] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get('ref');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '');
        const maxLength = countryPhoneLengths[formData.countryCode] || 14;
        setFormData({ ...formData, phone: digitsOnly.slice(0, maxLength) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setAlreadyExists(false);

        const requirements = [
            { regex: /.{8,}/, message: 'Minimum 8 characters' },
            { regex: /[A-Z]/, message: 'Include uppercase' },
            { regex: /[0-9]/, message: 'Include number' },
            { regex: /[^A-Za-z0-9]/, message: 'Include special character' }
        ];

        for (let req of requirements) {
            if (!req.regex.test(formData.password)) {
                setIsSubmitting(false);
                return setError(req.message);
            }
        }
        try {
            // Combine country code and phone number for backend
            const submissionData = {
                ...formData,
                phone: `${formData.countryCode}${formData.phone.replace(/\D/g, '')}`
            };
            const { data } = await axios.post('/api/users', submissionData);
            updateUser(data); // updates context + localStorage so Navbar re-renders
            
            // If referral code exists, apply it
            if (referralCode) {
                try {
                    const config = { headers: { Authorization: `Bearer ${data.token}` } };
                    await axios.post('/api/referrals/apply', { code: referralCode }, config);
                } catch (applyErr) {
                    console.error('Failed to apply referral:', applyErr.response?.data?.message || applyErr.message);
                }
            }

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
        const digitsOnly = formData.phone.replace(/\D/g, '');
        if (!digitsOnly) {
            setError('WhatsApp number is required.');
            return;
        }

        const expectedLength = countryPhoneLengths[formData.countryCode];
        if (expectedLength) {
            if (digitsOnly.length !== expectedLength) {
                setError(`Enter a valid ${expectedLength}-digit number for ${formData.countryCode}.`);
                return;
            }
        } else if (digitsOnly.length < 7 || digitsOnly.length > 14) {
            setError('Enter a valid phone number.');
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
                                            <div className={`flex items-center gap-2 transition-all duration-300 ${isFocused === 'phone' ? 'scale-[1.01]' : ''}`}>
                                                <CountrySelector
                                                    countryCodes={countryCodes}
                                                    selectedCode={formData.countryCode}
                                                    onSelect={(code) => setFormData({ ...formData, countryCode: code, phone: '' })}
                                                />
                                                <div className="relative flex-1">
                                                    <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'phone' ? 'text-primary' : 'text-slate-400'}`}>
                                                        <Smartphone size={16} />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        name="phone"
                                                        required
                                                        placeholder="98765 43210"
                                                        maxLength={countryPhoneLengths[formData.countryCode] || 14}
                                                        onFocus={() => setIsFocused('phone')}
                                                        onBlur={() => setIsFocused('')}
                                                        onChange={handlePhoneChange}
                                                        value={formData.phone}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-slate-500 text-sm font-medium"
                                                    />
                                                </div>
                                            </div>
                                            {countryPhoneLengths[formData.countryCode] && (
                                                <p className="text-[10px] text-slate-500 ml-1 font-inter">
                                                    {formData.phone.length}/{countryPhoneLengths[formData.countryCode]} digits
                                                </p>
                                            )}
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
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">Password</label>
                                        <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                                            <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${isFocused === 'password' ? 'text-primary' : 'text-slate-400'}`}>
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                placeholder="••••••••••••"
                                                onFocus={() => setIsFocused('password')}
                                                onBlur={() => setIsFocused('')}
                                                onChange={handleChange}
                                                value={formData.password}
                                                className="w-full pl-11 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white placeholder:text-text-muted/50 text-sm font-medium"
                                            />
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isFocused === 'password' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                                                    <div className="flex items-center space-x-2 text-primary">
                                                        <ShieldCheck size={16} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider font-inter">Security Protocol</span>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {[
                                                            'Minimum 8 characters',
                                                            'Include uppercase & lowercase',
                                                            'Include at least one number',
                                                            'Include a special character'
                                                        ].map((req, i) => (
                                                            <li key={i} className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                                                                <div className="w-1 h-1 rounded-full bg-primary/50" />
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

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
                                            {isSubmitting ? 'Creating account...' : 'Complete Registration'}
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
