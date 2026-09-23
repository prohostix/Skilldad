import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Smartphone,
    Eye,
    EyeOff,
    Tag,
    MonitorPlay,
    Award,
    BriefcaseBusiness,
    Users
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import SkillDadLogo from '../components/ui/SkillDadLogo';
import loginStudentImg from '../assets/login-student.png';
import { useUser } from '../context/UserContext';
import CountrySelector from '../components/ui/CountrySelector';

const features = [
    { icon: MonitorPlay, label: 'Industry-relevant courses' },
    { icon: Award, label: 'Verified certifications' },
    { icon: BriefcaseBusiness, label: 'Placement assistance' },
    { icon: Users, label: 'Trusted by top universities & companies' },
];

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

// Catches obviously-fake placeholder numbers that pass a plain length check
// (e.g. 1234567890, 0000000000, 9876543210) - a real number is never a
// simple run of identical or consecutive digits.
const isSequentialOrRepeated = (digits) => {
    if (/^(\d)\1+$/.test(digits)) return true; // all the same digit
    let ascending = true, descending = true;
    for (let i = 1; i < digits.length; i++) {
        const prev = Number(digits[i - 1]);
        const curr = Number(digits[i]);
        if (curr !== (prev + 1) % 10) ascending = false;
        if (curr !== (prev + 9) % 10) descending = false;
    }
    return ascending || descending;
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
        couponCode: '',
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

            // If a coupon code was entered, validate it now (can't be checked
            // pre-signup - /api/discount/validate requires an auth token,
            // which only exists once the account is created) and stash it for
            // the enrollment/checkout flow to redeem.
            if (formData.couponCode.trim()) {
                try {
                    const config = { headers: { Authorization: `Bearer ${data.token}` } };
                    const { data: discount } = await axios.post('/api/discount/validate', { code: formData.couponCode.trim() }, config);
                    if (discount.valid) {
                        localStorage.setItem('pendingDiscountCode', formData.couponCode.trim().toUpperCase());
                    }
                } catch (couponErr) {
                    console.error('Failed to validate coupon code:', couponErr.response?.data?.message || couponErr.message);
                }
            }

            // Navigate to home page - Dashboard button is in Navbar
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

        // Indian mobile numbers always start with 6, 7, 8, or 9
        if (formData.countryCode === '+91' && !/^[6-9]/.test(digitsOnly)) {
            setError('Enter a valid Indian mobile number (must start with 6, 7, 8, or 9).');
            return;
        }

        if (isSequentialOrRepeated(digitsOnly)) {
            setError('Enter a real phone number - that looks like a placeholder.');
            return;
        }

        setError('');
        setStep(step + 1);
    };
    const prevStep = () => { setError(''); setStep(step - 1); };

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

                <div className="relative z-10 max-w-[320px] mt-4">
                    <h1 className="!text-2xl xl:!text-[1.75rem] !font-black !text-slate-900 !leading-[1.15] !tracking-tight font-jakarta">
                        Welcome to SkillDad
                    </h1>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Create your account and start your journey toward a job-assured career.
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
                        <p className="text-lg font-semibold text-primary/50 leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>
                            Your Career<br />Our Mission
                        </p>
                        <svg width="90" height="10" viewBox="0 0 90 10" fill="none" className="mt-0.5 text-primary/50">
                            <path d="M2 6C20 2 60 2 88 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Illustration - absolutely positioned so it can sit large without clipping the panel edges.
                    Uses inline styles (not Tailwind classes) to match the same, confirmed-working pattern used
                    on the Login page's identical branding panel. */}
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

            {/* Right: Registration form */}
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Full Name<span className="text-red-500">*</span></label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'name' ? 'scale-[1.01]' : ''}`}>
                                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                                    <User size={14} />
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
                                                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Email Address<span className="text-red-500">*</span></label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                                    <Mail size={14} />
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
                                                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">WhatsApp Number<span className="text-red-500">*</span></label>
                                            <div className={`flex items-center gap-2 transition-all duration-300 ${isFocused === 'phone' ? 'scale-[1.01]' : ''}`}>
                                                <CountrySelector
                                                    countryCodes={countryCodes}
                                                    selectedCode={formData.countryCode}
                                                    onSelect={(code) => setFormData({ ...formData, countryCode: code, phone: '' })}
                                                />
                                                <div className="relative flex-1">
                                                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                                        <Smartphone size={14} />
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
                                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                                                    />
                                                </div>
                                            </div>
                                            {countryPhoneLengths[formData.countryCode] && (
                                                <p className="text-[10px] text-slate-400 ml-0.5">
                                                    {formData.phone.length}/{countryPhoneLengths[formData.countryCode]} digits
                                                </p>
                                            )}
                                        </div>

                                        {error && <p className="text-[11px] font-bold text-red-600 text-left bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

                                        <ModernButton
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full !py-2.5 text-xs font-bold group mt-2 overflow-hidden rounded-xl !bg-[#4C1D95] hover:!bg-[#3b1675]"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Continue</span>
                                                <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </ModernButton>

                                        <div className="flex items-center gap-3 my-1">
                                            <div className="flex-1 h-px bg-slate-200" />
                                            <span className="text-[11px] text-slate-400 font-medium">or continue with</span>
                                            <div className="flex-1 h-px bg-slate-200" />
                                        </div>

                                        {/* Google sign-up - visual only for now, no OAuth wired up yet */}
                                        <button
                                            type="button"
                                            title="Coming soon"
                                            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
                                        >
                                            <GoogleIcon size={14} />
                                            Sign up with Google
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Password<span className="text-red-500">*</span></label>
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
                                        </div>

                                        <AnimatePresence>
                                            {isFocused === 'password' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3.5 bg-[#4C1D95]/5 border border-[#4C1D95]/10 rounded-xl space-y-2">
                                                        <div className="flex items-center space-x-2 !text-[#4C1D95]">
                                                            <ShieldCheck size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Security Protocol</span>
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {[
                                                                'Minimum 8 characters',
                                                                'Include uppercase & lowercase',
                                                                'Include at least one number',
                                                                'Include a special character'
                                                            ].map((req, i) => (
                                                                <li key={i} className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                                                                    <div className="w-1 h-1 rounded-full bg-[#4C1D95]/50" />
                                                                    <span>{req}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Coupon Code (Optional)</label>
                                            <div className={`relative transition-all duration-300 ${isFocused === 'coupon' ? 'scale-[1.01]' : ''}`}>
                                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                                                    <Tag size={14} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="couponCode"
                                                    placeholder="Have a discount code?"
                                                    onFocus={() => setIsFocused('coupon')}
                                                    onBlur={() => setIsFocused('')}
                                                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                                                    value={formData.couponCode}
                                                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium uppercase placeholder:normal-case"
                                                />
                                            </div>
                                        </div>

                                        {error && <p className="text-[11px] font-bold text-red-600 text-left bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

                                        {alreadyExists && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                                                <p className="text-[11px] font-bold text-amber-700 mb-1">Account already exists</p>
                                                <p className="text-[11px] text-amber-700/80">An account with this email already exists. <Link to="/login" className="!text-[#4C1D95] font-bold underline">Sign in instead →</Link></p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                disabled={isSubmitting}
                                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold flex items-center justify-center hover:bg-slate-100 transition-all disabled:opacity-50"
                                            >
                                                <ArrowLeft size={16} />
                                            </button>
                                            <ModernButton
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 !py-2.5 text-xs font-bold rounded-xl !bg-[#4C1D95] hover:!bg-[#3b1675]"
                                            >
                                                {isSubmitting ? 'Creating account...' : 'Complete Registration'}
                                            </ModernButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[11px] text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="!text-[#4C1D95] font-bold hover:text-primary-light transition-colors inline-flex items-center gap-1">
                                    Sign in <ArrowRight size={11} />
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
// sign-up button - lucide-react has no brand logos of its own.
const GoogleIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.9 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.9 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14-4.9l-6.5-5.3c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.7l6.5 5.3C41.8 35.6 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
);

export default Register;
