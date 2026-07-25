import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Rocket, Globe, Award, Users, Book, Target, Linkedin, Loader2, 
    Activity, CheckCircle2, Briefcase, GraduationCap, Zap, ShieldCheck, 
    TrendingUp, Sparkles, ArrowRight, Laptop, Layers, Building2
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const floatAnimation = {
    y: ["-3%", "3%"],
    transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
    }
};

// ── ELABORATED EXECUTIVE LEADERSHIP CARD (BIG IMAGE & DETAILED NARRATIVE) ──
const ExecutiveLeadershipCard = ({ member }) => {
    const memberName = member.name || member.title || 'Executive Leader';
    const memberRole = member.role || member.title || 'Leadership';
    const memberImg = member.imageUrl || member.image || member.logo;
    const linkedinUrl = member.linkedinUrl || member.linkedin_url;

    // Default bios if not provided in database
    const getExecutiveBio = () => {
        if (member.bio && member.bio.trim().length > 10) return member.bio;
        if (memberName.toLowerCase().includes('basil')) {
            return "Visionary global educational leader orchestrating SkillDad's strategic university alliances, international expansion, and enterprise placement ecosystem. Championing outcome-driven higher education across global academic & industry markets.";
        }
        if (memberName.toLowerCase().includes('dilshad')) {
            return "Driving SkillDad's core platform innovation, curriculum engineering, and corporate hiring partnerships. Dedicated to transforming student potential into high-growth tech and business careers through practical hands-on mastery.";
        }
        return "Guiding the strategic alignment of SkillDad's academic matrix, industry partnership networks, and student career placement initiatives.";
    };

    // Additional quote / statement per executive
    const getExecutiveQuote = () => {
        if (memberName.toLowerCase().includes('basil')) {
            return "Building global educational bridges between accredited universities, ambitious learners, and international hiring leaders.";
        }
        if (memberName.toLowerCase().includes('dilshad')) {
            return "Dedicated to creating outcome-driven skill tracks that convert student potential directly into high-paying corporate roles.";
        }
        return "Pioneering transparent, skill-first education to empower next-generation talent and bridge corporate placement gaps globally.";
    };

    const getPillars = () => {
        if (memberName.toLowerCase().includes('basil')) {
            return [
                'University Alliances',
                'Global Expansion',
                'Degree Integration',
                'Enterprise Hiring Matrix'
            ];
        }
        if (memberName.toLowerCase().includes('dilshad')) {
            return [
                'Skill-First Architecture',
                'Corporate Hiring Networks',
                'Curriculum Engineering',
                'Direct Placement Mentorship'
            ];
        }
        return [
            'Academic Governance',
            'Skill Training',
            'Industry Alignment',
            'Career Acceleration'
        ];
    };

    const pillars = getPillars();

    return (
        <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.008 }}
            className="w-full"
        >
            <GlassCard className="relative group overflow-hidden p-6 sm:p-7 md:p-8 !bg-[#0A0A12]/95 backdrop-blur-2xl border-[#C026FF]/20 hover:border-[#C026FF]/60 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-[0_0_50px_rgba(192,38,255,0.22)]">
                {/* Animated Ambient Glow */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8">
                    
                    {/* LEFT SIDE: Animated Image Container */}
                    <motion.div 
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative w-full sm:w-64 md:w-72 lg:w-[310px] h-72 sm:h-80 md:h-[340px] rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all duration-500 bg-[#06040B] flex items-center justify-center shrink-0"
                    >
                        {memberImg ? (
                            <img
                                src={memberImg.startsWith('http') ? memberImg : `${axios.defaults.baseURL || ''}${memberImg}`}
                                alt={memberName}
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}

                        {/* Diagonal Hover Shine Sweep */}
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '200%' }}
                            transition={{ duration: 0.9, ease: "easeInOut" }}
                        />

                        {/* Initial Fallback Avatar */}
                        <div 
                            className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-[#C026FF]/20 to-[#0A0A12] border border-primary/20 ${memberImg ? 'hidden' : 'flex'}`}
                        >
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 3 }}
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-4xl sm:text-5xl font-space shadow-xl shadow-primary/20 mb-2"
                            >
                                {memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </motion.div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
                                Leadership
                            </span>
                        </div>

                        {/* Gradient Bottom Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A12] via-[#0A0A12]/40 to-transparent pointer-events-none" />
                        
                        {/* Organization Tag */}
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="absolute top-3.5 left-3.5 px-3.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-md"
                        >
                            <Building2 size={12} className="text-primary animate-pulse" />
                            <span>{member.university || 'SKILLDAD GLOBAL'}</span>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT SIDE: Animated Content & Details */}
                    <div className="flex-1 space-y-4 flex flex-col justify-between py-1">
                        <div>
                            {/* Role & Department Badges */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="flex flex-wrap items-center gap-2 mb-2.5"
                            >
                                <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-primary/15 rounded-full border border-primary/30 text-primary text-[11px] font-black uppercase tracking-wider shadow-sm">
                                    <ShieldCheck size={13} className="text-primary" />
                                    <span>{memberRole}</span>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-white/[0.03] px-2.5 py-0.5 rounded border border-white/10">
                                    {memberName.toLowerCase().includes('basil') ? 'Global Strategy' : 'Platform & Hiring'}
                                </span>
                            </motion.div>

                            {/* Executive Name */}
                            <motion.h3 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-space leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-primary-light group-hover:to-primary transition-all duration-500"
                            >
                                {memberName}
                            </motion.h3>

                            {/* Bio */}
                            <motion.p 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                                className="text-xs sm:text-sm text-gray-300 font-inter leading-relaxed mt-2.5 font-normal"
                            >
                                {getExecutiveBio()}
                            </motion.p>
                        </div>

                        {/* Executive Quote Box */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.28 }}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 italic text-xs text-gray-300 font-inter leading-relaxed flex items-start gap-2.5"
                        >
                            <span className="text-primary font-serif text-xl leading-none">“</span>
                            <span>{getExecutiveQuote()}</span>
                        </motion.div>

                        {/* Strategic Focus Badges with Hover Pop */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="space-y-2 pt-3 border-t border-white/10"
                        >
                            <div className="flex flex-wrap gap-2">
                                {pillars.map((pillar, idx) => (
                                    <motion.span 
                                        key={idx}
                                        whileHover={{ scale: 1.06, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="px-3 py-1 bg-white/[0.04] border border-white/10 hover:border-primary/40 rounded-xl text-[11px] font-medium text-gray-200 flex items-center gap-1.5 cursor-default transition-colors"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        {pillar}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>

                        {/* LinkedIn / Action Button */}
                        {linkedinUrl ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="pt-3 border-t border-white/5 flex items-center justify-between gap-3"
                            >
                                <motion.a
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-white/5 hover:bg-[#0077B5] hover:text-white text-gray-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-white/10 hover:border-[#0077B5] transition-all shadow-sm"
                                >
                                    <Linkedin size={15} fill="currentColor" stroke="none" />
                                    <span>Connect on LinkedIn</span>
                                </motion.a>
                            </motion.div>
                        ) : (
                            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                                <span>SKILLDAD EXECUTIVE BOARD</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-emerald-400 font-black">ACTIVE DIRECTOR</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </GlassCard>
        </motion.div>
    );
};

const AboutUs = () => {
    const [team, setTeam] = React.useState([]);
    const [cms, setCms] = React.useState({});
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamRes, cmsRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/cms/about_us')
                ]);
                setTeam(teamRes.data || []);
                setCms(cmsRes.data || {});
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    // Fallback static leaders if server list is empty
    const staticDirectors = [
        {
            _id: 'dir_1',
            name: 'Dr. Basil Thomas',
            role: 'GROUP CEO & DIRECTOR',
            university: 'SKILLDAD GLOBAL',
            bio: "Visionary global educational leader orchestrating SkillDad's strategic university alliances, international expansion, and enterprise placement ecosystem. Championing outcome-driven higher education across global academic & industry markets."
        },
        {
            _id: 'dir_2',
            name: 'Dilshad Ashraf',
            role: 'CEO',
            university: 'SKILLDAD',
            bio: "Driving SkillDad's core platform innovation, curriculum engineering, and corporate hiring partnerships. Dedicated to transforming student potential into high-growth tech and business careers through practical hands-on mastery."
        }
    ];

    const fetchedDirectors = team.filter(m => m.display_target === 'ABOUT_DIRECTOR' || (!m.display_target && (m.category === 'DIRECTOR' || !m.category)));
    const directors = fetchedDirectors.length > 0 ? fetchedDirectors : staticDirectors;
    const advisory = team.filter(m => m.display_target === 'ABOUT_ADVISORY' || (!m.display_target && m.category === 'ADVISORY'));

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05030B] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] overflow-hidden text-white">
            <Navbar />

            {/* Floating Background Elements */}
            <motion.div animate={floatAnimation} className="absolute top-[8%] left-[5%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />
            <motion.div animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1.5 } }} className="absolute top-[35%] right-[0%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[#C026FF]/10 blur-[160px] rounded-full pointer-events-none -z-10" />

            {/* ── HERO SECTION ── */}
            <section className="relative pt-24 md:pt-32 pb-16 px-4 md:px-6 flex flex-col items-center justify-center">
                <div className="max-w-5xl mx-auto text-center z-10 w-full space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                    >
                        {/* Top Badge */}
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/15 rounded-full border border-primary/30 text-primary text-xs font-black uppercase tracking-widest mb-6 shadow-lg shadow-primary/10">
                            <Sparkles size={14} className="animate-pulse" />
                            <span>Official Skill-to-Career Launchpad</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white font-space tracking-tight leading-[1.1] mb-6">
                            Empowering Students to <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-light">
                                Learn High-Demand Skills & Get Hired
                            </span>
                        </h1>

                        <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto font-inter leading-relaxed font-normal px-2">
                            {cms.hero?.story || 'SkillDad is an outcome-driven skill learning and career enablement platform. We bridge the gap between academic education and real-world corporate expectations by equipping students with job-ready technical skills, practical project experience, and direct placement access to top-tier employers.'}
                        </p>

                        {/* Pillar Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-8 pt-4">
                            {[
                                { label: 'Skill-First Curriculum', icon: Laptop },
                                { label: 'Real-World Projects', icon: Layers },
                                { label: 'Recognized Certifications', icon: Award },
                                { label: 'Direct Placement Network', icon: Briefcase }
                            ].map((pill, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-bold text-gray-200 backdrop-blur-md">
                                    <pill.icon size={14} className="text-primary" />
                                    <span>{pill.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 3 DEDICATED SECTIONS: MISSION, VISION, VALUES ── */}
            <section className="py-12 md:py-20 px-4 md:px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">

                    {/* SECTION 1: OUR MISSION */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <GlassCard className="p-8 md:p-12 lg:p-14 !bg-[#0A0718]/90 border-primary/30 hover:border-primary/50 transition-all duration-500 rounded-3xl relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                                <div className="lg:col-span-5 space-y-5">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                                        <Rocket size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Core Pillar 01</span>
                                        <h2 className="text-3xl md:text-4xl font-black text-white font-space">
                                            {cms.mission?.title || 'Our Mission'}
                                        </h2>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-300 font-inter leading-relaxed">
                                        {cms.mission?.description || 'Our mission is to democratize high-value industry education and build a direct pipeline for students to transform theoretical knowledge into high-paying corporate roles.'}
                                    </p>
                                    <div className="pt-2">
                                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-primary shrink-0" />
                                            <span className="text-xs font-bold text-white">Focused on measurable career outcomes & student placements.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        {
                                            title: 'Industry-Driven Curriculum',
                                            desc: 'Courses co-designed with corporate tech leaders to ensure every topic matches live industry hiring demand.',
                                            icon: Book,
                                            color: '#5B5CFF'
                                        },
                                        {
                                            title: 'Hands-On Project Portfolio',
                                            desc: 'Students build real-world applications and enterprise codebases that prove competency to hiring managers.',
                                            icon: Laptop,
                                            color: '#C026FF'
                                        },
                                        {
                                            title: 'Direct Corporate Placements',
                                            desc: 'Seamless connections with 450+ partner companies, startup hubs, and multinational recruiters.',
                                            icon: Briefcase,
                                            color: '#5B5CFF'
                                        },
                                        {
                                            title: 'Equal Learning Access',
                                            desc: 'Affordable, scalable digital learning that unlocks high-tech opportunities for students across all regions.',
                                            icon: GraduationCap,
                                            color: '#C026FF'
                                        }
                                    ].map((pillar, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-300 group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ color: pillar.color }}>
                                                <pillar.icon size={20} />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-1 font-space">{pillar.title}</h4>
                                            <p className="text-xs text-gray-400 font-inter leading-relaxed">{pillar.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* SECTION 2: OUR VISION */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <GlassCard className="p-8 md:p-12 lg:p-14 !bg-[#0E061A]/90 border-[#C026FF]/30 hover:border-[#C026FF]/50 transition-all duration-500 rounded-3xl relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#C026FF]/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                                <div className="lg:col-span-5 space-y-5 lg:order-2">
                                    <div className="w-14 h-14 rounded-2xl bg-[#C026FF]/20 border border-[#C026FF]/40 flex items-center justify-center text-[#C026FF] shadow-lg shadow-[#C026FF]/20">
                                        <Globe size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C026FF]">Core Pillar 02</span>
                                        <h2 className="text-3xl md:text-4xl font-black text-white font-space">
                                            {cms.vision?.title || 'Our Vision'}
                                        </h2>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-300 font-inter leading-relaxed">
                                        {cms.vision?.description || 'We envision a global education ecosystem where degree qualifications are unified with actual practical mastery—allowing learners to seamlessly transition into high-growth global careers.'}
                                    </p>
                                    <div className="pt-2">
                                        <div className="p-4 rounded-2xl bg-[#C026FF]/10 border border-[#C026FF]/20 flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-[#C026FF] shrink-0" />
                                            <span className="text-xs font-bold text-white">Unifying universities, students, and employers into one matrix.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:order-1">
                                    {[
                                        {
                                            title: 'Global Career Mobility',
                                            desc: 'Connecting ambitious students directly to international employers and remote high-salary job roles.',
                                            icon: Globe,
                                            color: '#C026FF'
                                        },
                                        {
                                            title: 'Academic Partnerships',
                                            desc: 'Collaborating with accredited universities to enrich degree programs with accredited practical skill tracks.',
                                            icon: GraduationCap,
                                            color: '#5B5CFF'
                                        },
                                        {
                                            title: 'AI-Powered Learning Paths',
                                            desc: 'Adaptive neural recommendations that guide students step-by-step toward their exact career targets.',
                                            icon: Zap,
                                            color: '#C026FF'
                                        },
                                        {
                                            title: 'Continuous Upskilling',
                                            desc: 'Lifetime access to updated modules, advanced tech tracks, and alumni career mentorship networks.',
                                            icon: TrendingUp,
                                            color: '#5B5CFF'
                                        }
                                    ].map((pillar, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#C026FF]/40 hover:bg-white/[0.04] transition-all duration-300 group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ color: pillar.color }}>
                                                <pillar.icon size={20} />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-1 font-space">{pillar.title}</h4>
                                            <p className="text-xs text-gray-400 font-inter leading-relaxed">{pillar.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* SECTION 3: OUR CORE VALUES */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <GlassCard className="p-8 md:p-12 lg:p-14 !bg-[#060D1A]/90 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-500 rounded-3xl relative overflow-hidden shadow-2xl">
                            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                                                <Award size={24} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Core Pillar 03</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-white font-space">
                                            {cms.values?.title || 'Our Core Values'}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-gray-300 font-inter max-w-xl leading-relaxed">
                                        {cms.values?.description || 'The fundamental principles that guide every curriculum decision, placement initiative, and student interaction at SkillDad.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        {
                                            title: 'Student Success First',
                                            desc: 'Every program is evaluated strictly by how effectively it accelerates student career outcomes and job placement.',
                                            icon: Users,
                                            tag: 'Primary Directive'
                                        },
                                        {
                                            title: 'Practical Mastery',
                                            desc: 'We prioritize real building, project execution, and practical problem-solving over passive rote learning.',
                                            icon: Laptop,
                                            tag: 'Skill Focused'
                                        },
                                        {
                                            title: 'Outcome Transparency',
                                            desc: 'Honest guidance, clear skill benchmark evaluation, and genuine corporate placement assistance.',
                                            icon: ShieldCheck,
                                            tag: 'Trust & Ethics'
                                        },
                                        {
                                            title: 'Continuous Innovation',
                                            desc: 'Constantly updating our platform with modern technologies like AI, Cloud Computing, and Data Science.',
                                            icon: Zap,
                                            tag: 'Future Ready'
                                        }
                                    ].map((val, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between group">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                        <val.icon size={20} />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                        {val.tag}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-bold text-white mb-2 font-space">{val.title}</h4>
                                                <p className="text-xs text-gray-400 font-inter leading-relaxed">{val.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                </div>
            </section>

            {/* ── HOW SKILLDAD WORKS (LEARN SKILLS & GET JOB) ── */}
            <section className="py-16 md:py-24 px-4 md:px-6 relative bg-white/[0.01] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Student Career Engine</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white font-space tracking-tight">
                            How Students <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-light">Learn Skills & Get Hired</span>
                        </h2>
                        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-inter">
                            A structured 4-step framework designed to take students from foundational learning to landing high-paying corporate roles.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                step: '01',
                                title: 'Learn In-Demand Skills',
                                desc: 'Access industry-curated courses taught by tech leads and subject matter experts.',
                                icon: Book
                            },
                            {
                                step: '02',
                                title: 'Build Live Projects',
                                desc: 'Develop real-world software applications and case studies for your professional portfolio.',
                                icon: Laptop
                            },
                            {
                                step: '03',
                                title: 'Earn Certifications',
                                desc: 'Gain accredited skill certifications recognized by partner universities and corporate recruiters.',
                                icon: Award
                            },
                            {
                                step: '04',
                                title: 'Land Corporate Jobs',
                                desc: 'Get direct referral access to exclusive hiring drives, interview prep, and corporate placements.',
                                icon: Briefcase
                            }
                        ].map((item, idx) => (
                            <GlassCard key={idx} className="p-6 relative group hover:border-primary/50 transition-all duration-300 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black font-mono">
                                            <item.icon size={22} />
                                        </div>
                                        <span className="text-2xl font-black text-white/20 font-mono group-hover:text-primary transition-colors">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 font-space">{item.title}</h3>
                                    <p className="text-xs text-gray-400 font-inter leading-relaxed">{item.desc}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-primary text-xs font-bold">
                                    <span>Career Stage {idx + 1}</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── EXECUTIVE LEADERSHIP SECTION (ELABORATED WITH BIG IMAGES) ── */}
            {directors.length > 0 && (
                <section className="py-20 md:py-32 px-4 md:px-6 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16 space-y-3"
                        >
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-primary/15 rounded-full border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                                <ShieldCheck size={14} />
                                <span>Executive Leadership</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space tracking-tight leading-tight uppercase">
                                SkillDad <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-light">Coordinates With</span>
                            </h2>
                            <p className="text-sm md:text-base text-gray-300 font-inter max-w-2xl mx-auto leading-relaxed">
                                Visionary executive leadership guiding the nexus of global institutional excellence, corporate partnerships, and student placement success.
                            </p>
                            <div className="h-1.5 w-20 bg-gradient-to-r from-primary via-[#C026FF] to-transparent mx-auto rounded-full mt-4"></div>
                        </motion.div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="flex flex-col gap-8 lg:gap-12 max-w-5xl mx-auto"
                        >
                            {directors.map((member) => (
                                <ExecutiveLeadershipCard key={member._id || member.name} member={member} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ── ADVISORY BOARD SECTION ── */}
            {advisory.length > 0 && (
                <section className="py-16 md:py-24 px-4 md:px-6 relative border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12"
                        >
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C026FF]">Academic & Industry Council</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mt-2 mb-4 uppercase tracking-tighter">
                                {cms.advisory_header?.title && cms.advisory_header.title.includes(' ') ? (
                                    <>
                                        {cms.advisory_header.title.split(' ').slice(0, -1).join(' ')} <span className="text-[#C026FF]">{cms.advisory_header.title.split(' ').slice(-1)}</span>
                                    </>
                                ) : (
                                    <span className="text-[#C026FF]">{cms.advisory_header?.title || 'Advisory Board'}</span>
                                )}
                            </h2>
                            {cms.advisory_header?.description && (
                                <p className="text-sm md:text-base text-gray-400 font-inter max-w-2xl mx-auto mb-6 italic leading-relaxed">
                                    "{cms.advisory_header.description}"
                                </p>
                            )}
                            <div className="h-1.5 w-16 bg-gradient-to-r from-[#C026FF] to-transparent mx-auto rounded-full mt-4"></div>
                        </motion.div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="flex flex-col gap-8 lg:gap-12 max-w-5xl mx-auto"
                        >
                            {advisory.map((member) => (
                                <ExecutiveLeadershipCard key={member._id || member.name} member={member} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ── CALL TO ACTION SECTION ── */}
            <section className="py-24 md:py-32 px-4 md:px-6 border-t border-white/5 relative overflow-hidden">
                <motion.div animate={floatAnimation} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10"></motion.div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-jakarta leading-tight mb-4">
                            Ready to Turn Your Skills into a <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-light">
                                High-Paying Career?
                            </span>
                        </h2>
                        <p className="text-sm md:text-base text-gray-300 font-inter max-w-xl mx-auto mb-8">
                            Join over 1.2M+ students learning in-demand skills and landing corporate placements with SkillDad.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <ModernButton onClick={() => window.location.href = '/courses'} className="px-10 py-4 w-full sm:w-auto !text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(91,92,255,0.3)] hover:shadow-[0_0_50px_rgba(91,92,255,0.5)]">
                                Explore Skill Programs
                            </ModernButton>
                            <button onClick={() => window.location.href = '/register'} className="text-white font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all w-full sm:w-auto">
                                Register Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;
