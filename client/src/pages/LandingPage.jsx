import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Rocket,
    ShieldCheck,
    BarChart,
    Globe,
    ChevronRight,
    Play,
    ArrowRight,
    Activity,
    Library,
    Briefcase,
    Sparkles,
    Cpu,
    Network,
    Shield,
    Users,
    Layers,
    TrendingUp,
    Zap,
    Book,
    Building2
} from 'lucide-react';
import axios from 'axios';
import ModernButton from '../components/ui/ModernButton';
import GlassCard from '../components/ui/GlassCard';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import FloatingHelpWidget from '../components/ui/FloatingHelpWidget';
import HeroSection from '../components/landing/HeroSection';
import AnimatedLogoSection from '../components/landing/AnimatedLogoSection';
import CapabilitiesSection from '../components/landing/CapabilitiesSection';
import CountingNumber from '../components/ui/CountingNumber';
import Animated3DShape from '../components/landing/Animated3DShape';
import Animated3DSphere from '../components/landing/Animated3DSphere';
import UniversityOrb3D from '../components/landing/UniversityOrb3D';

const LandingPage = () => {
    const navigate = useNavigate();
    const [dynamicDirectors, setDynamicDirectors] = useState([]);
    const [dynamicLogos, setDynamicLogos] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [dynamicUniversities, setDynamicUniversities] = useState([]);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [directorsRes, logosRes, coursesRes, universitiesRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/partner-logos'),
                    axios.get('/api/courses'),
                    axios.get('/api/public/universities')
                ]);

                if (directorsRes.data && directorsRes.data.length > 0) {
                    setDynamicDirectors(directorsRes.data);
                }

                if (logosRes.data && logosRes.data.length > 0) {
                    setDynamicLogos(logosRes.data);
                }

                if (coursesRes.data && coursesRes.data.length > 0) {
                    setFeaturedCourses(coursesRes.data.slice(0, 3));
                }

                if (universitiesRes.data && universitiesRes.data.length > 0) {
                    setDynamicUniversities(universitiesRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch public data:', error);
            }
        };

        fetchPublicData();

        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            }
        }
    }, []);

    const features = [
        {
            title: 'Intelligent Learning',
            desc: 'AI-driven paths tailored to individual student needs and neuro-learning pace.',
            icon: Rocket,
            color: '#5B5CFF',
            tag: 'Aura AI'
        },
        {
            title: 'Verified Governance',
            desc: 'Multi-layer institutional management with enterprise-grade cryptographic protection.',
            icon: ShieldCheck,
            color: '#7A5CFF',
            tag: 'Secure-Core'
        },
        {
            title: 'Impact Analytics',
            desc: 'Deep-learning visualization for revenue momentum and student synchronization.',
            icon: BarChart,
            color: '#B05CFF',
            tag: 'Data-Sync'
        },
        {
            title: 'Global Ecosystem',
            desc: 'Seamlessly connect with top-tier partners and Ivy-league universities.',
            icon: Globe,
            color: '#5B5CFF',
            tag: 'Matrix-Link'
        }
    ];

    const partners = [
        "Oxford Digital", "MIT Horizon", "Stanford Online", "ETH Zurich", "Berkeley Tech", "Cambridge AI", "Global Finance Core", "TechNexus B2B"
    ];

    const staticDirectors = [
        {
            name: "Prof. Dr. Anastas Angjeli",
            title: "Honorary President",
            image: "/assets/directors/anastas.png"
        },
        {
            name: "Prof. Dr. Adrian Civici",
            title: "Rector",
            image: "/assets/directors/adrian.png"
        },
        {
            name: "Prof. Dr. Ramiz Zekaj",
            title: "President",
            image: "/assets/directors/ramiz.png"
        },
        {
            name: "Prof. Dr. Ismail Kocayusufoglu",
            title: "Rector",
            image: "/assets/directors/ismail.png"
        }
    ];

    const directors = dynamicDirectors.length > 0 ? dynamicDirectors : staticDirectors;

    // Split dynamic logos into types
    const corporateLogos = dynamicLogos.filter(l => l.type === 'corporate');
    const universityPartners = dynamicLogos.filter(l => l.type === 'university');

    // Prepare partner rows - using final verified SVG URLs
    const row1Static = [
        { name: 'TCS', logo: 'https://cdn.worldvectorlogo.com/logos/tata-consultancy-services-1.svg' },
        { name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg' },
        { name: 'Wipro', logo: 'https://www.vectorlogo.zone/logos/wipro/wipro-ar21.svg' },
        { name: 'Accenture', logo: 'https://www.vectorlogo.zone/logos/accenture/accenture-ar21.svg' },
        { name: 'IBM', logo: 'https://www.vectorlogo.zone/logos/ibm/ibm-ar21.svg' },
        { name: 'HCL Technologies', logo: 'https://www.vectorlogo.zone/logos/hcl/hcl-ar21.svg' },
        { name: 'Capgemini', logo: 'https://www.vectorlogo.zone/logos/capgemini/capgemini-ar21.svg' },
        { name: 'Cognizant', logo: 'https://www.vectorlogo.zone/logos/cognizant/cognizant-ar21.svg' },
        { name: 'Tech Mahindra', logo: 'https://www.vectorlogo.zone/logos/techmahindra/techmahindra-ar21.svg' },
        { name: 'Deloitte', logo: 'https://www.vectorlogo.zone/logos/deloitte/deloitte-ar21.svg' }
    ];
    const row2Static = [
        { name: 'Google', logo: 'https://www.vectorlogo.zone/logos/google/google-ar21.svg' },
        { name: 'Microsoft', logo: 'https://www.vectorlogo.zone/logos/microsoft/microsoft-ar21.svg' },
        { name: 'Amazon', logo: 'https://www.vectorlogo.zone/logos/amazon/amazon-ar21.svg' },
        { name: 'Meta', logo: 'https://www.vectorlogo.zone/logos/facebook/facebook-ar21.svg' },
        { name: 'Oracle', logo: 'https://www.vectorlogo.zone/logos/oracle/oracle-ar21.svg' },
        { name: 'SAP', logo: 'https://www.vectorlogo.zone/logos/sap/sap-ar21.svg' },
        { name: 'Adobe', logo: 'https://www.vectorlogo.zone/logos/adobe/adobe-ar21.svg' },
        { name: 'Intel', logo: 'https://www.vectorlogo.zone/logos/intel/intel-ar21.svg' },
        { name: 'Goldman Sachs', logo: 'https://www.vectorlogo.zone/logos/goldmansachs/goldmansachs-ar21.svg' },
        { name: 'Salesforce', logo: 'https://www.vectorlogo.zone/logos/salesforce/salesforce-ar21.svg' }
    ];

    const staticUnis = [
        { name: 'Oxford Digital', location: 'United Kingdom', students: '12K+', programs: '45+' },
        { name: 'MIT Horizon', location: 'United States', students: '18K+', programs: '60+' },
        { name: 'Stanford Online', location: 'United States', students: '15K+', programs: '52+' },
        { name: 'ETH Zurich', location: 'Switzerland', students: '10K+', programs: '38+' }
    ];

    const universities = dynamicUniversities.length > 0
        ? dynamicUniversities.map(u => ({
            _id: u._id,
            name: u.name,
            location: u.profile?.location || 'Global',
            students: u.studentCount > 0 ? `${u.studentCount}+` : '1,200+',
            programs: u.courseCount > 0 ? `${u.courseCount}+` : '24+',
            logo: u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=128&background=5B5CFF&color=fff&bold=true`,
            image: u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=128&background=5B5CFF&color=fff&bold=true`,
            description: u.bio || 'World-class institution providing excellence in global education through SkillDad.',
            established: u.createdAt ? new Date(u.createdAt).getFullYear() : '2023',
            rating: (4.8 + (Math.random() * 0.15)).toFixed(1), // Dynamic-ish rating
            specialties: ['Innovation', 'Technology', 'Global Research', 'Leadership']
        }))
        : universityPartners.length > 0 ? universityPartners.map(p => ({
            ...p,
            image: p.logo, // Compatibility
            description: 'Strategic academic partner integrated within the SkillDad learning ecosystem.',
            established: '2020',
            rating: 4.9,
            specialties: ['Digital Transformation', 'Enterprise Learning']
        })) : staticUnis;


    let marqueeRow1 = [];
    let marqueeRow2 = [];

    if (corporateLogos.length > 0) {
        // Split dynamic logos into two rows
        const mid = Math.ceil(corporateLogos.length / 2);
        marqueeRow1 = corporateLogos.slice(0, mid);
        marqueeRow2 = corporateLogos.slice(mid);

        // Ensure minimum length for smooth scrolling
        while (marqueeRow1.length < 10) marqueeRow1 = [...marqueeRow1, ...marqueeRow1];
        while (marqueeRow2.length < 10) marqueeRow2 = [...marqueeRow2, ...marqueeRow2];
    } else {
        marqueeRow1 = row1Static;
        marqueeRow2 = row2Static;
    }

    // No need to enrich logos - they're already complete in the static arrays

    return (
        <div className="min-h-screen selection:bg-primary/30 relative overflow-x-hidden text-text-primary bg-black">
            <Navbar />

            <HeroSection />

            <CapabilitiesSection />
            <AnimatedLogoSection />

            {/* Hiring Partners Marquee Banner */}
            <section className="relative py-16 md:py-20 overflow-hidden bg-transparent z-10 section-optimize">
                {/* Label */}
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-lg md:text-xl font-black text-white font-jakarta tracking-tight uppercase"
                    >
                        Companies That <span className="text-primary">Trust SkillDad</span>
                    </motion.h2>
                    <div className="w-12 h-0.5 bg-primary/20 mx-auto mt-2 rounded-full" />
                </div>

                {/* Row 1 — Scrolls Left */}
                <div className="relative overflow-hidden whitespace-nowrap mb-6">
                    <div className="flex animate-scroll will-change-transform" style={{ animationDuration: '120s' }}>
                        {[...marqueeRow1, ...marqueeRow1].map((company, i) => (
                            <div key={i} className="mx-8 flex items-center space-x-3 group cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                                <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 group-hover:border-primary/50 transition-all duration-300 group-hover:bg-white/10 flex items-center justify-center min-w-[140px] h-14">
                                    {company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="h-7 w-auto object-contain brightness-0 invert opacity-60 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    ) : (
                                        <span className="text-white/70 font-bold text-sm tracking-wide whitespace-nowrap group-hover:text-white transition-colors">{company.name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Edge fades */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                </div>

                {/* Row 2 — Scrolls Right */}
                <div className="relative overflow-hidden whitespace-nowrap">
                    <div className="flex animate-scroll-reverse will-change-transform" style={{ animationDuration: '130s' }}>
                        {[...marqueeRow2, ...marqueeRow2].map((company, i) => (
                            <div key={i} className="mx-8 flex items-center space-x-3 group cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40 group-hover:bg-purple-400 transition-colors" />
                                <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 group-hover:border-purple-400/50 transition-all duration-300 group-hover:bg-white/10 flex items-center justify-center min-w-[140px] h-14">
                                    {company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="h-7 w-auto object-contain brightness-0 invert opacity-60 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    ) : (
                                        <span className="text-white/70 font-bold text-sm tracking-wide whitespace-nowrap group-hover:text-white transition-colors">{company.name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Edge fades */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                </div>
            </section>

            {/* Institutional Pulse - Real-time Stats Visualization */}
            <section className="relative pb-4 pt-4 px-6 section-optimize">
                <div className="max-w-7xl mx-auto px-0 md:px-6 relative z-10 w-full overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { label: 'Neural Scholars', value: '1.2M+', icon: Users },
                            { label: 'Global Intuition', value: '99.4%', icon: Globe },
                            { label: 'Sync Resilience', value: '24/7', icon: Zap },
                            { label: 'Institutional AP', value: '150+', icon: Activity }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-150px" }}
                                transition={{ delay: i * 0.03, duration: 0.25 }}
                            >
                                <GlassCard className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 h-full group flex flex-col items-start p-6 text-left hover:shadow-glow-purple">
                                    <div className="flex items-center space-x-2 sm:space-x-4 mb-4 w-full">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[20px] bg-primary/20 text-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl border border-primary/30 group-hover:border-primary/50">
                                            <stat.icon size={20} />
                                        </div>
                                        <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-primary/30 transition-all"></div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white font-inter-tight mb-1 tracking-tighter">
                                        <CountingNumber value={stat.value} />
                                    </h3>
                                    <p className="text-[8px] sm:text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-inter">{stat.label}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Synergy - Feature Grid */}
            <section id="features" className="py-8 md:py-12 bg-transparent relative overflow-hidden px-6 section-optimize">

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-12 sm:mb-24">
                        {/* Left Side - Text Content */}
                        <div className="text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/20 rounded-full mb-6 font-black text-[10px] text-primary uppercase tracking-[0.3em] border border-primary/30"
                            >
                                <Cpu size={14} /> <span>Neural Core Architecture</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-xl sm:text-2xl lg:text-3xl font-black text-text-primary mb-4 md:mb-6 font-jakarta tracking-tighter leading-[1.1] md:leading-[1.1]"
                            >
                                Master the <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary-dark">Institutional</span> Flow
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-base sm:text-lg text-text-secondary font-inter leading-relaxed max-w-xl mx-auto lg:mx-0"
                            >
                                Experience a platform where students, companies, and universities harmonize in a singular high-fidelity learning matrix.
                            </motion.p>
                        </div>

                        {/* Right Side - 3D Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="hidden lg:block h-[400px] gpu-accelerated"
                        >
                            <Animated3DShape />
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-150px" }}
                                transition={{ delay: index * 0.03, duration: 0.25 }}
                            >
                                <GlassCard className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 h-full group flex flex-col items-start p-6 text-left hover:shadow-glow-purple">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.2 }}
                                        className="w-12 h-12 rounded-[20px] flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105 shadow-2xl border"
                                        style={{
                                            backgroundColor: `${feature.color}20`,
                                            color: feature.color,
                                            borderColor: `${feature.color}30`
                                        }}
                                    >
                                        <feature.icon size={24} strokeWidth={2.5} />
                                    </motion.div>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                        className="text-[10px] font-black uppercase tracking-[0.4em] mb-3"
                                        style={{ color: feature.color }}
                                    >
                                        {feature.tag}
                                    </motion.span>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.4 }}
                                        className="text-lg font-bold text-text-primary mb-3 font-poppins"
                                    >
                                        {feature.title}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.5 }}
                                        className="text-text-secondary font-inter text-sm leading-relaxed mb-6 opacity-80 group-hover:opacity-100 transition-opacity"
                                    >
                                        {feature.desc}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.6 }}
                                        className="mt-auto pt-6 border-t border-white/10 w-full flex items-center justify-between group/link cursor-pointer"
                                    >
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest group-hover/link:text-primary transition-colors">Expand Logic</span>
                                        <ArrowRight size={16} className="text-text-muted group-hover/link:text-primary transition-all group-hover/link:translate-x-1" />
                                    </motion.div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section id="courses" className="relative pt-16 md:pt-24 pb-0 px-6 z-10 section-optimize">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-20 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
                        >
                            <Book size={14} />
                            <span>Institutional Tracks</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-lg sm:text-2xl font-black text-white font-jakarta tracking-tight"
                        >
                            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Future Matrix</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-text-secondary max-w-2xl mx-auto font-inter text-base md:text-lg"
                        >
                            Experience high-fidelity learning with our industry-leading certification tracks.
                        </motion.p>
                    </div>

                    {/* Featured Course Preview */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {(featuredCourses.length > 0 ? featuredCourses : [
                            { title: 'Neural Network Architecture', category: 'AI & Data', icon: Cpu, description: 'Experience the next generation of AI & Data education with high-fidelity modules.' },
                            { title: 'Cryptographic Governance', category: 'Security', icon: ShieldCheck, description: 'Experience the next generation of Security education with high-fidelity modules.' },
                            { title: 'Quantum Financial Systems', category: 'Finance', icon: BarChart, description: 'Experience the next generation of Finance education with high-fidelity modules.' }
                        ]).map((c, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-150px" }}
                                transition={{ delay: i * 0.03, duration: 0.25 }}
                                whileHover={{ y: -6 }}
                                className="h-full"
                            >
                                <GlassCard
                                    className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 h-full group flex flex-col items-start p-6 text-left hover:shadow-glow-purple cursor-pointer"
                                    onClick={() => c._id && navigate(`/course/${c._id}`)}
                                >
                                    <div className="w-12 h-12 rounded-[20px] bg-primary/20 text-primary flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105 shadow-2xl border border-primary/30 group-hover:border-primary/50">
                                        {c.icon ? <c.icon size={24} strokeWidth={2.5} /> : <Book size={24} strokeWidth={2.5} />}
                                    </div>
                                    <div className="flex flex-col mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 block">{c.category}</span>
                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none">
                                                {c.instructorName || c.instructor?.name || 'Academic Lead'}
                                            </p>
                                            {(c.universityName || c.instructor?.profile?.universityName || (c.instructor?.role === 'university' && c.instructor?.name)) && (
                                                <p className="text-[8px] font-bold text-primary/70 uppercase tracking-wider mt-0.5">
                                                    {c.universityName || c.instructor?.profile?.universityName || c.instructor?.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-4 group-hover:text-primary transition-colors font-poppins">{c.title}</h3>
                                    <p className="text-text-secondary font-inter text-sm leading-relaxed mb-6 opacity-80 group-hover:opacity-100 transition-opacity line-clamp-2">
                                        {c.description || `Experience high-fidelity education in ${c.category} with our institutional track.`}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-white/10 w-full flex items-center justify-between group/link">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Enrollment Fee</span>
                                            <span className="text-sm font-black text-white">${c.price || '199'}</span>
                                        </div>
                                        <ModernButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                if (userInfo) {
                                                    navigate(`/dashboard/payment/${c._id}`);
                                                } else {
                                                    navigate('/login', { state: { from: `/course/${c._id}` } });
                                                }
                                            }}
                                            className="!px-6 !py-2.5 !text-[9px] uppercase tracking-widest font-black"
                                        >
                                            Enroll Now
                                        </ModernButton>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                        <ModernButton
                            onClick={() => navigate('/courses')}
                            className="w-full sm:w-auto px-16 !py-6 !text-xs shadow-glow-gradient transform hover:scale-105 transition-all font-black uppercase tracking-widest"
                        >
                            Explore Full Catalog
                        </ModernButton>
                        <button
                            onClick={() => navigate('/support')}
                            className="font-black text-[10px] uppercase tracking-widest text-text-secondary hover:text-primary transition-colors flex items-center group"
                        >
                            Direct Neural Inquiry <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* University Partners Section */}
            <section className="relative pt-16 md:pt-24 pb-16 md:pb-24 px-6 z-10 bg-transparent section-optimize">
                <div className="max-w-7xl mx-auto">
                    {/* Heading row — text left, 3D orb right */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 md:mb-16">

                        {/* Left — text */}
                        <div className="text-center lg:text-left space-y-4 flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
                            >
                                <Users size={14} />
                                <span>Trusted Partners</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-jakarta tracking-tight leading-tight"
                            >
                                Partnered with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Leading Universities</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-text-secondary max-w-xl mx-auto lg:mx-0 font-inter text-base md:text-lg"
                            >
                                Collaborate with world-class institutions to deliver exceptional learning experiences.
                            </motion.p>
                        </div>

                        {/* Right — 3D University Orb */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 40 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            className="hidden lg:block w-[320px] h-[320px] shrink-0 -ml-48 mr-[8%] gpu-accelerated"
                        >
                            <UniversityOrb3D universities={universities} />
                        </motion.div>

                    </div>

                    {/* University Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {universities.map((uni, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-150px" }}
                                transition={{ delay: i * 0.03, duration: 0.25 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <GlassCard
                                    className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 h-full group flex flex-col items-start p-4 text-left hover:shadow-glow-purple cursor-pointer"
                                    onClick={() => navigate(`/university-profile/${encodeURIComponent(uni.name)}`, { state: { university: uni } })}
                                >
                                    {/* University Icon + Tag row */}
                                    <div className="flex items-center gap-3 mb-3 w-full">
                                        <div className="w-9 h-9 rounded-[14px] bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 border border-primary/30 group-hover:border-primary/50 overflow-hidden p-1.5">
                                            {uni.logo ? (
                                                <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Library size={18} strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Ivy-Alliance</span>
                                    </div>

                                    {/* University Name */}
                                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary transition-colors font-poppins">{uni.name}</h3>
                                    <p className="text-[11px] text-text-muted mb-3 flex items-center gap-1 font-inter">
                                        <Globe size={11} />
                                        {uni.location}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 w-full mb-3">
                                        <div>
                                            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5 font-black">Scholars</p>
                                            <p className="text-xs font-bold text-white">{uni.students}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5 font-black">Modules</p>
                                            <p className="text-xs font-bold text-white">{uni.programs}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-white/10 w-full flex items-center justify-between group/link">
                                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest group-hover/link:text-primary transition-colors">Expand Logic</span>
                                        <ArrowRight size={14} className="text-text-muted group-hover/link:text-primary transition-all group-hover/link:translate-x-1" />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SkillDad Directors Section */}
            <section className="relative py-16 md:py-24 px-6 z-10 bg-transparent section-optimize">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="text-lg sm:text-2xl font-black text-white font-jakarta tracking-tight mb-4"
                        >
                            SKILLDAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Cordinates With</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-text-secondary max-w-2xl mx-auto font-inter text-base"
                        >
                            Visionary leadership guiding the nexus of global institutional excellence.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {directors.map((director, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="h-full"
                            >
                                <GlassCard className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 h-full group flex flex-col items-center p-8 text-center hover:shadow-glow-purple">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-primary transition-all relative">
                                            <img
                                                src={director.image}
                                                alt={director.name}
                                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(director.name)}&size=128&background=5B5CFF&color=fff&bold=true&rounded=true`;
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 font-poppins group-hover:text-primary transition-colors">{director.name}</h3>
                                    <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">{director.title}</p>

                                    <div className="mt-8 pt-6 border-t border-white/5 w-full">
                                        <p className="text-[10px] text-text-muted leading-relaxed font-inter italic">
                                            Guiding the strategic synchronization of SkillDad's global academic matrix.
                                        </p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FloatingHelpWidget />
            <Footer />
        </div>
    );
};

export default LandingPage;
