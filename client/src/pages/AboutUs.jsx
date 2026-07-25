import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Rocket, Globe, Award, Users, Book, Target, Linkedin, Loader2, 
    Activity, CheckCircle2, Briefcase, GraduationCap, Zap, ShieldCheck, 
    TrendingUp, Sparkles, ArrowRight, Laptop, Layers
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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

const TeamCard = ({ member }) => (
    <motion.div
        variants={fadeInUp}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        <GlassCard className="relative group overflow-hidden flex flex-col items-center text-center p-6 lg:p-8 !bg-[#0A0A10]/90 backdrop-blur-xl border-[#C026FF]/20 hover:border-[#C026FF]/60 transition-all duration-500 rounded-3xl shadow-2xl hover:shadow-[0_0_30px_rgba(192,38,255,0.15)] h-full">
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Image Section */}
            <div className="relative mb-6 w-full flex justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-white/10 group-hover:border-primary/50 transition-all duration-500 relative z-10 overflow-hidden bg-[#0A0A10]">
                    <img
                        src={
                            (member.imageUrl || member.image) 
                                ? ( (member.imageUrl || member.image).startsWith('http') 
                                    ? (member.imageUrl || member.image) 
                                    : `${axios.defaults.baseURL || ''}${member.imageUrl || member.image}` )
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=5B5CFF&color=fff&bold=true`
                        }
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-all duration-700"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=5B5CFF&color=fff&bold=true`;
                        }}
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="relative z-10 w-full mb-3 flex-grow flex flex-col items-center">
                <h3 className="text-lg md:text-xl font-black text-white mb-1.5 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary-light transition-all duration-500">{member.name}</h3>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-primary/90 mb-1.5">{member.role}</p>
                
                {member.university && (
                    <div className="mt-3 pt-3 border-t border-white/5 w-full">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-white/40 leading-relaxed italic">
                            {member.university}
                        </p>
                    </div>
                )}
                
                {member.bio && (
                    <p className="text-xs text-gray-400 font-inter leading-relaxed px-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-500 mt-3">
                        {member.bio}
                    </p>
                )}
            </div>

            {/* Social Link */}
            {member.linkedinUrl && (
                <div className="mt-auto pt-5 w-full flex justify-center border-t border-white/5 relative z-10">
                    <a 
                        href={member.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-[#0077B5] hover:shadow-[0_0_15px_rgba(0,119,181,0.5)] transition-all duration-300 transform hover:scale-110"
                    >
                        <Linkedin size={16} fill="currentColor" stroke="none" />
                    </a>
                </div>
            )}
        </GlassCard>
    </motion.div>
);

const AboutUs = () => {
    const [team, setTeam] = React.useState([]);
    const [cms, setCms] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [teamRes, cmsRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/cms/about_us')
                ]);
                setTeam(teamRes.data);
                setCms(cmsRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const directors = team.filter(m => m.display_target === 'ABOUT_DIRECTOR' || (!m.display_target && (m.category === 'DIRECTOR' || !m.category)));
    const advisory = team.filter(m => m.display_target === 'ABOUT_ADVISORY' || (!m.display_target && m.category === 'ADVISORY'));

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
                                {/* Left Info Column */}
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

                                {/* Right Cards Grid Column */}
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
                                {/* Right Info Column (Swapped layout for visual rhythm) */}
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

                                {/* Left Cards Grid Column */}
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
                                {/* Top Header */}
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

                                {/* 4 Pillars Grid */}
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

            {/* ── IMPACT & PLATFORM STATS ── */}
            <section className="py-16 md:py-24 px-4 md:px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { value: '1.2M+', label: 'Active Students & Alumni', icon: Users, color: '#5B5CFF' },
                            { value: '450+', label: 'University & Hiring Partners', icon: GraduationCap, color: '#C026FF' },
                            { value: '94%', label: 'Career Placement Rate', icon: Target, color: '#10B981' },
                            { value: '200+', label: 'Specialized Skill Programs', icon: Book, color: '#3B82F6' }
                        ].map((stat, idx) => (
                            <GlassCard key={idx} className="p-6 md:p-8 text-center flex flex-col items-center justify-center border-white/10 hover:border-primary/40 transition-all rounded-3xl">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border" style={{ backgroundColor: `${stat.color}15`, borderColor: `${stat.color}30`, color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white font-space mb-1">{stat.value}</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DIRECTORS & CEO SECTION ── */}
            {directors.length > 0 && (
                <section className="py-16 md:py-24 px-4 md:px-6 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12"
                        >
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Executive Leadership</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mt-2 mb-4 uppercase tracking-tighter">
                                {cms.directors_header?.title && cms.directors_header.title.includes(' ') ? (
                                    <>
                                        {cms.directors_header.title.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{cms.directors_header.title.split(' ').slice(-1)}</span>
                                    </>
                                ) : (
                                    <span className="text-primary">{cms.directors_header?.title || 'Directors & CEO'}</span>
                                )}
                            </h2>
                            {cms.directors_header?.subtitle && (
                                <p className="text-sm md:text-base text-gray-400 font-inter max-w-2xl mx-auto mb-6 italic leading-relaxed">
                                    "{cms.directors_header.subtitle}"
                                </p>
                            )}
                            <div className="h-1.5 w-16 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full mt-4"></div>
                        </motion.div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                        >
                            {directors.map((member) => (
                                <TeamCard key={member._id} member={member} />
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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                        >
                            {advisory.map((member) => (
                                <TeamCard key={member._id} member={member} />
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
