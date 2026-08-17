import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Shield,
    Users,
    Layers,
    TrendingUp,
    Zap,
    Building2
} from 'lucide-react';
import axios from 'axios';
import ModernButton from '../components/ui/ModernButton';
import GlassCard from '../components/ui/GlassCard';
import CourseCard from '../components/CourseCard';
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
import { getMediaUrl } from '../utils/media';

const LandingPage = () => {
    const navigate = useNavigate();
    const [dynamicDirectors, setDynamicDirectors] = useState([]);
    const [dynamicLogos, setDynamicLogos] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [dynamicUniversities, setDynamicUniversities] = useState([]);
    const [dynamicSkillDadUniversities, setDynamicSkillDadUniversities] = useState([]);
    const [dynamicSuccessStories, setDynamicSuccessStories] = useState([]);
    const [cmsSettings, setCmsSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null); // { url, name }
    const [successIndex, setSuccessIndex] = useState(0);
    const [uniStartIndex, setUniStartIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSuccessIndex(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setUniStartIndex(prev => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                setLoading(true);
                const [directorsRes, logosRes, coursesRes, universitiesRes, skillDadUniversitiesRes, storiesRes, cmsRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/partner-logos'),
                    axios.get('/api/courses'),
                    axios.get('/api/public/universities'),
                    axios.get('/api/public/skilldad-universities'),
                    axios.get('/api/public/success-stories'),
                    axios.get('/api/public/cms/landing_page')
                ]);

                if (directorsRes.data) {
                    setDynamicDirectors(directorsRes.data);
                }

                if (logosRes.data) {
                    setDynamicLogos(logosRes.data);
                }

                if (coursesRes.data) {
                    setFeaturedCourses(coursesRes.data.filter(c => c.isFeatured || c.is_featured));
                }

                if (universitiesRes.data) {
                    setDynamicUniversities(universitiesRes.data);
                }

                if (skillDadUniversitiesRes.data) {
                    setDynamicSkillDadUniversities(skillDadUniversitiesRes.data);
                }

                if (storiesRes.data) {
                    setDynamicSuccessStories(storiesRes.data);
                }

                if (cmsRes.data) {
                    setCmsSettings(cmsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch public data:', error);
            } finally {
                setLoading(false);
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

    const landingDirectors = dynamicDirectors.filter(d => d.display_target === 'LANDING');
    const iitanLeads = dynamicDirectors.filter(d => d.display_target === 'IIT_LEADERSHIP');
    const directors = landingDirectors.length > 0 ? landingDirectors : staticDirectors;

    // Split dynamic logos into types
    const corporateLogos = dynamicLogos.filter(l => l.type === 'corporate');
    const universityPartners = dynamicLogos.filter(l => l.type === 'university');

    // Prepare partner rows - using final verified SVG URLs
    const row1Static = [
        { name: 'TCS', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg' },
        { name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg' },
        { name: 'Wipro', logo: null },
        { name: 'Accenture', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg' },
        { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
        { name: 'HCL Technologies', logo: null },
        { name: 'Capgemini', logo: null },
        { name: 'Cognizant', logo: null },
        { name: 'Tech Mahindra', logo: null },
        { name: 'Deloitte', logo: null }
    ];
    const row2Static = [
        { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
        { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
        { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
        { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
        { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
        { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
        { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Systems_logo_and_wordmark.svg' },
        { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Intel_logo_%282020%2C_light_blue%29.svg' },
        { name: 'Goldman Sachs', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg' },
        { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' }
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
            logo: (u.profileImage || u.profile?.profileImage || u.profile_image) ? getMediaUrl(u.profileImage || u.profile?.profileImage || u.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=128&background=5B5CFF&color=fff&bold=true`,
            image: (u.profileImage || u.profile?.profileImage || u.profile_image) ? getMediaUrl(u.profileImage || u.profile?.profileImage || u.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=128&background=5B5CFF&color=fff&bold=true`,
            description: u.bio || 'World-class institution providing excellence in global education through SkillDad.',
            established: u.profile?.foundedYear || u.profile?.established || (u.createdAt ? new Date(u.createdAt).getFullYear() : '2023'),
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

    // SkillDad-owned universities are display-only (no login/dashboard) - always shown after partner universities
    const skillDadUniversityCards = dynamicSkillDadUniversities.map(u => {
        const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=128&background=5B5CFF&color=fff&bold=true`;
        return {
            _id: `sd-${u.id}`,
            name: u.name,
            location: u.location || 'Global',
            students: '1,200+',
            programs: '24+',
            logo: u.profile_image ? getMediaUrl(u.profile_image) : fallbackLogo,
            image: u.cover_image ? getMediaUrl(u.cover_image) : (u.profile_image ? getMediaUrl(u.profile_image) : fallbackLogo),
            description: u.description || 'World-class institution providing excellence in global education through SkillDad.',
            established: '2023',
            rating: (4.8 + (Math.random() * 0.15)).toFixed(1),
            specialties: ['Innovation', 'Technology', 'Global Research', 'Leadership']
        };
    });

    const allUniversities = [...universities, ...skillDadUniversityCards];


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

    const visibleUnis = allUniversities.length > 0
        ? [0, 1, 2, 3].map(offset => allUniversities[(uniStartIndex + offset) % allUniversities.length])
        : [];

    return (
        <div className="min-h-screen selection:bg-primary/30 relative overflow-x-hidden text-text-primary bg-black">
            <Navbar />

            <HeroSection />

            {/* Trending / Featured Courses Section - admin-curated via the Featured toggle */}
            {featuredCourses.length > 0 && (
                <section id="courses" className="relative pt-20 md:pt-20 pb-16 md:pb-20 px-6 z-10 section-optimize">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-12">
                            <div className="text-center sm:text-left">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-flex font-normal items-center space-x-2 text-primary text-xs font-black uppercase tracking-widest"
                                >
                                    <TrendingUp size={15} />
                                    <span>Trending Now</span>
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.1 }}
                                    className="text-2xl sm:text-3xl font-black text-white font-jakarta tracking-tight"
                                >
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Featured</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Courses</span>
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                    className="text-text-secondary font-inter text-sm sm:text-base max-w-xl"
                                >
                                    Hand-picked by our team - the courses learners are enrolling in right now.
                                </motion.p>
                            </div>
                            <ModernButton
                                onClick={() => navigate('/courses')}
                                className="hidden sm:inline-flex !px-6 !py-3 !text-[10px] uppercase tracking-widest font-black shrink-0"
                            >
                                Explore Full Catalog <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-500 ease-in-out" />
                            </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {featuredCourses.slice(0, 6).map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>

                        <div className="flex justify-center mt-10 sm:hidden">
                            <ModernButton
                                onClick={() => navigate('/courses')}
                                className="w-full !py-4 !text-[10px] uppercase tracking-widest font-black"
                            >
                                Explore Full Catalog <ChevronRight size={14} className="ml-1 group-hover:translate-x-1" style={{ transition: 'transform 800ms ease-in-out' }} />
                            </ModernButton>
                        </div>
                    </div>
                </section>
            )}

            <CapabilitiesSection />
            <AnimatedLogoSection />

            {/* Hiring Partners Marquee Banner */}
            <section className="relative py-16 md:py-20 overflow-hidden bg-transparent z-10 section-optimize">
                {/* Label */}
                <div className="text-center mb-6 sm:mb-8 px-4">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-base md:text-xl font-black text-white font-jakarta tracking-tight uppercase break-words"
                    >
                        Companies That <span className="text-primary block sm:inline mt-1 sm:mt-0">Trust SkillDad</span>
                    </motion.h2>
                    <div className="w-12 h-0.5 bg-primary/20 mx-auto mt-3 rounded-full" />
                </div>

                {/* Row 1 - Scrolls Left */}
                <div className="relative overflow-hidden whitespace-nowrap mb-6 pointer-events-none sm:pointer-events-auto">
                    <div className="flex animate-scroll will-change-transform" style={{ animationDuration: '120s' }}>
                        {[...marqueeRow1, ...marqueeRow1].map((company, i) => (
                            <div key={i} className="ml-2 flex items-center space-x-3 group cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                                <div className="px-4 py-2.5 sm:py-3 flex items-center justify-center min-w-[120px] sm:min-w-[140px]">
                                    {(company.logo || company.imageUrl) ? (
                                        <div className="relative h-8 sm:h-15 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                            {/* Invisible spacer to set correct dimensions */}
                                            <img
                                                src={company.logo || getMediaUrl(company.imageUrl)}
                                                alt={company.name}
                                                className="h-full w-auto object-contain invisible"
                                            />
                                            {/* Solid Purple Silhouette */}
                                            <div
                                                className="absolute inset-0 bg-primary transition-opacity duration-500 group-hover:opacity-0"
                                                style={{
                                                    WebkitMaskImage: `url('${company.logo || getMediaUrl(company.imageUrl)}')`,
                                                    WebkitMaskSize: 'contain',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center'
                                                }}
                                            />
                                            {/* Original Colored Logo */}
                                            <img
                                                src={company.logo || getMediaUrl(company.imageUrl)}
                                                alt={company.name}
                                                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-white/70 font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap group-hover:text-white transition-colors">{company.name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Edge fades */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                </div>

                {/* Row 2 - Scrolls Right */}
                <div className="relative overflow-hidden whitespace-nowrap pointer-events-none sm:pointer-events-auto">
                    <div className="flex animate-scroll-reverse will-change-transform" style={{ animationDuration: '130s' }}>
                        {[...marqueeRow2, ...marqueeRow2].map((company, i) => (
                            <div key={i} className="ml-2 flex items-center space-x-3 group cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                                <div className="px-4 s:px-6 py-2.5 sm:py-3 flex items-center justify-center min-w-[120px] sm:min-w-[140px]">
                                    {(company.logo || company.imageUrl) ? (
                                        <div className="relative h-8 sm:h-15 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                            {/* Invisible spacer to set correct dimensions */}
                                            <img
                                                src={company.logo || getMediaUrl(company.imageUrl)}
                                                alt={company.name}
                                                className="h-full w-auto object-contain invisible"
                                            />
                                            {/* Solid Purple Silhouette */}
                                            <div
                                                className="absolute inset-0 bg-primary transition-opacity duration-500 group-hover:opacity-0"
                                                style={{
                                                    WebkitMaskImage: `url('${company.logo || getMediaUrl(company.imageUrl)}')`,
                                                    WebkitMaskSize: 'contain',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center'
                                                }}
                                            />
                                            {/* Original Colored Logo */}
                                            <img
                                                src={company.logo || getMediaUrl(company.imageUrl)}
                                                alt={company.name}
                                                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-white/70 font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap group-hover:text-white transition-colors">{company.name}</span>
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



            {/* Service Synergy - Feature Grid */}
            <section id="features" className="py-2 md:py-4 bg-transparent relative overflow-hidden px-6 section-optimize">

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        {/* Left Side - Text Content */}
                        <div className="text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex font-normal items-center space-x-2 text-primary text-xs uppercase tracking-widest"
                            >
                                <Cpu size={14} /> <span>Neural Core Architecture</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-2xl xs:text-3xl lg:text-4xl font-black text-text-primary mb-4 md:mb-6 font-jakarta tracking-tighter leading-[1.1] md:leading-[1.1]"
                            >
                                Master the <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary-dark">Institutional</span> Flow
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-sm sm:text-base lg:text-lg text-text-secondary font-inter leading-relaxed max-w-xl mx-auto lg:mx-0 px-4 sm:px-0"
                            >
                                Experience a platform where students, companies, and universities harmonize in a singular high-fidelity learning matrix.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto lg:mx-0 px-4 sm:px-0"
                            >
                                {[
                                    { icon: Users, title: 'Students', desc: 'Learn in-demand skills through guided, outcome-driven tracks.' },
                                    { icon: Building2, title: 'Universities', desc: 'Deliver accredited programs through a modern digital campus.' },
                                    { icon: Briefcase, title: 'Companies', desc: 'Hire job-ready talent straight from certified skill tracks.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                                        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                                            <item.icon size={18} />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Side - 3D Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="hidden lg:block h-130 gpu-accelerated"
                        >
                            <Animated3DShape />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* University Partners Section */}
            <section className="relative pt-16 md:pt-24 pb-8 md:pb-0 z-10 bg-transparent section-optimize">
                <div className="max-w-7xl mx-auto">
                    {/* Heading row - text left, 3D orb right */}
                    <div className="flex px-6 flex-col lg:flex-row items-center justify-between gap-8 mb-12 md:mb-16">

                        {/* Left - text */}
                        <div className="text-center lg:text-left flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex font-normal items-center space-x-2 text-primary text-xs uppercase tracking-widest"
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

                        {/* Right - 3D University Orb */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 40 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            className="hidden lg:block w-[320px] h-[320px] shrink-0 -ml-48 mr-[8%] gpu-accelerated"
                        >
                            <UniversityOrb3D universities={allUniversities} />
                        </motion.div>

                    </div>

                    {/* University Carousel (1 Row) */}
                    <div className="relative">
                        <div className="overflow-hidden px-6 pt-8 pb-16.5 min-h-[300px] relative">
                            <div className="flex flex-nowrap gap-4 sm:gap-6 w-full">
                                <AnimatePresence mode="popLayout">
                                    {visibleUnis.map((uni) => (
                                        <motion.div
                                            key={uni.name}
                                            layout
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                            className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)] shrink-0 flex"
                                        >
                                            <GlassCard
                                                className="!bg-white/[0.03] border-primary/30 hover:border-primary/60 hover:bg-white/[0.07] transition-all duration-300 w-full group flex flex-col items-start p-4 text-left hover:shadow-glow-purple cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/university-profile/${encodeURIComponent(uni.name)}`, { state: { university: uni } });
                                                }}
                                            >
                                                {/* University Icon + Tag row */}
                                                <div className="flex items-center gap-3 mb-2 w-full">
                                                    <div className="w-9 h-9 rounded-[14px] bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 border border-primary/30 group-hover:border-primary/50 overflow-hidden">
                                                        {uni.logo ? (
                                                            <img
                                                                src={uni.logo}
                                                                alt={uni.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <Library size={18} strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Ivy-Alliance</span>
                                                </div>

                                                {/* University Name */}
                                                <h3 className="text-[15px] leading-tight font-bold text-white mb-1 group-hover:text-primary transition-colors font-poppins line-clamp-2">{uni.name}</h3>
                                                <p className="text-[10px] leading-tight text-text-muted mb-2 flex items-start gap-1 font-inter">
                                                    <Globe size={10} className="shrink-0 mt-[2px]" />
                                                    <span className="line-clamp-2">{uni.location}</span>
                                                </p>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 w-full mb-2 mt-auto">
                                                    <div>
                                                        <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5 font-black">Scholars</p>
                                                        <p className="text-xs font-bold text-white">{uni.students}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5 font-black">Modules</p>
                                                        <p className="text-xs font-bold text-white">{uni.programs}</p>
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/platform');
                                                    }}
                                                    className="mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-between group/link cursor-pointer hover:bg-white/[0.02] transition-colors -mx-6 px-6"
                                                >
                                                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest group-hover/link:text-primary transition-colors">Expand Logic</span>
                                                    <ArrowRight size={14} className="text-text-muted group-hover/link:text-primary transition-all group-hover/link:translate-x-1" />
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {/* Manual Controls */}
                            <div className="flex justify-end mt-4 px-2">
                                <button
                                    onClick={() => setUniStartIndex(prev => prev + 1)}
                                    className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_rgba(110,40,255,0.2)] hover:shadow-glow-purple group active:scale-95"
                                    aria-label="Next Universities"
                                >
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Managed by IITans Section ── */}
            <section className="relative pt-8 md:pt-8 pb-8 md:pb-12 px-6 z-10 bg-black overflow-hidden section-optimize">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
                        <div className="text-center lg:text-left flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex font-normal items-center space-x-2 text-primary text-xs uppercase tracking-widest"
                            >
                                <Zap size={14} />
                                <span>Innovation Leadership</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-jakarta tracking-tight leading-tight"
                            >
                                Managed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary-dark">IITans in INDIA</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-text-secondary max-w-xl mx-auto lg:mx-0 font-inter text-base"
                            >
                                Our platform is architected and operated by elite graduates from India’s premier institutes, bringing industry-standard functional expertise to global education.
                            </motion.p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(iitanLeads.length > 0 ? iitanLeads : [
                            { name: 'Arpit Jain', alumni: 'IIT Delhi', role: 'Chief Executive Architect', image: '/assets/leadership/ceo.png', color: 'primary' },
                            { name: 'Neeraj Sharma', alumni: 'IIT Kanpur', role: 'Head of Technology Sync', image: '/assets/leadership/cto.png', color: 'emerald-400' },
                            { name: 'Priyanka Chopra', alumni: 'IIT Madras', role: 'Head of Operations & Excellence', image: '/assets/leadership/ops.png', color: 'amber-400' }
                        ]).map((lead, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                                whileHover={{}}
                                className="h-full group"
                            >
                                <GlassCard noHover className="!bg-white/[0.02] !border-2 !border-primary/40 hover:!border-primary/70 transition-all duration-500 h-full p-0 overflow-hidden text-left hover:shadow-2xl hover:shadow-primary/20">
                                    <div className="aspect-[4/5] overflow-hidden relative">
                                        <img
                                            src={getMediaUrl(lead.image || lead.imageUrl || lead.img)}
                                            alt={lead.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=5B5CFF&color=fff&bold=true`; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-white/10 dark:group-hover:bg-white/25 backdrop-blur-md rounded-full border border-white/20 dark:group-hover:border-white/60 text-[9px] font-black uppercase tracking-widest !text-white mb-2 transition-all duration-300">
                                                <span className={`w-1.5 h-1.5 rounded-full bg-${lead.accent_color || lead.color || 'primary'}`} />
                                                <span>{lead.university || lead.alumni} alumni</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white [.light-mode_&]:!text-white mb-1 font-jakarta">{lead.name}</h3>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{lead.title || lead.role}</p>
                                        </div>
                                    </div>
                                    <div className="pb-5 pt-3 px-0">
                                        <p className="text-xs text-white [.light-mode_&]:!text-gray-950 leading-relaxed font-inter opacity-80 group-hover:opacity-100 transition-opacity">
                                            {lead.bio || "Driving the core functional strategy and system reliability for SkillDad’s pan-India academic operations."}
                                        </p>
                                        <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Functional Leadership</span>
                                            <Activity size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Student Success & Videos Section (Campus Impact) ── */}
            {cmsSettings.campus_impact?.show_section === true && (
                <section className="relative py-16 md:py-24 px-6 z-10 bg-transparent section-optimize">
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
                            >
                                <Play size={14} />
                                <span>Campus Impact</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-jakarta tracking-tight"
                            >
                                Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Success Stories</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-text-secondary max-w-2xl mx-auto font-inter text-base"
                            >
                                Witness the transformative journey of students from partnered campuses into high-growth corporate roles.
                            </motion.p>
                        </div>

                        <div className="overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={successIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                                >
                                    {(() => {
                                        const allStories = dynamicSuccessStories.length > 0 ? dynamicSuccessStories : [
                                            { name: 'Rahul Kumar', campus: 'CIT Campus', package: '18 LPA', role: 'Full Stack Dev', imageUrl: '/assets/success/student1.png', story: 'Transformed his technical core within 6 months.' },
                                            { name: 'Sanya Sharma', campus: 'Global University', package: '24 LPA', role: 'AI Researcher', imageUrl: '/assets/success/student2.png', story: 'Mastered neural architectures and secured top ranking.' },
                                            { name: 'Arjun Mehta', campus: 'Tech Institute', package: '15 LPA', role: 'Product Manager', imageUrl: '/assets/success/student3.png', story: 'Achieved career momentum through strategic sync.' },
                                            { name: 'Priya Singh', campus: 'Data Institute', package: '14 LPA', role: 'Data Scientist', imageUrl: '/assets/success/student1.png', story: 'Built predictive models for global finance platforms.' },
                                            { name: 'Vikram Patel', campus: 'Cloud Academy', package: '20 LPA', role: 'Cloud Engineer', imageUrl: '/assets/success/student2.png', story: 'Architected scalable microservices for enterprise clients.' },
                                            { name: 'Anita Desai', campus: 'Cyber Hub', package: '16 LPA', role: 'Cyber Security', imageUrl: '/assets/success/student3.png', story: 'Secured critical infrastructure using modern cryptographic standards.' }
                                        ];

                                        const num = allStories.length;
                                        if (num === 0) return null;

                                        const visibleStories = [
                                            allStories[successIndex % num],
                                            allStories[(successIndex + 1) % num],
                                            allStories[(successIndex + 2) % num],
                                        ];

                                        return visibleStories.map((student, i) => {
                                            const videoSrc = student.videoUrl || student.video_url;
                                            return (
                                                <motion.div
                                                    key={student.name + i}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-50px" }}
                                                    transition={{ delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                                                    whileHover={{ y: -12, scale: 1.02 }}
                                                    className="group cursor-pointer"
                                                    onMouseEnter={(e) => {
                                                        const vid = e.currentTarget.querySelector('video');
                                                        if (vid) { vid.currentTime = 0; vid.play().catch(() => { }); }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const vid = e.currentTarget.querySelector('video');
                                                        if (vid) { vid.pause(); vid.currentTime = 0; }
                                                    }}
                                                    onClick={() => videoSrc && setActiveVideo({ url: videoSrc, name: student.name })}
                                                >
                                                    <GlassCard className="p-4 !bg-white/[0.03] border-white/5 hover:border-primary/40 transition-all duration-500 overflow-hidden hover:shadow-glow-purple">
                                                        <div className="aspect-video rounded-xl overflow-hidden mb-5 relative group-hover:shadow-2xl transition-all">
                                                            <img
                                                                src={getMediaUrl(student.imageUrl || student.image || student.img)}
                                                                alt={student.name}
                                                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${videoSrc ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
                                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=5B5CFF&color=fff&bold=true`; }}
                                                            />
                                                            {videoSrc && (
                                                                <video
                                                                    src={videoSrc.startsWith('http') ? videoSrc : getMediaUrl(videoSrc)}
                                                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                                    muted
                                                                    playsInline
                                                                    loop
                                                                    preload="metadata"
                                                                />
                                                            )}
                                                            <div className={`absolute inset-0 bg-black/40 transition-all duration-500 flex items-center justify-center ${videoSrc ? 'group-hover:bg-transparent' : 'group-hover:bg-black/20'}`}>
                                                                <div className={`w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-glow-primary transform scale-90 group-hover:scale-100 transition-all duration-500 ${videoSrc ? 'group-hover:opacity-0' : ''}`}>
                                                                    <Play size={20} fill="currentColor" />
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                                                Success Story
                                                            </div>
                                                        </div>
                                                        <div className="px-2">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-bold text-white font-jakarta">{student.name}</h3>
                                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/30">
                                                                    {student.package}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4">{student.campus} · {student.role}</p>
                                                            <p className="text-xs text-text-muted leading-relaxed font-inter mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                {student.story} Leveraging SkillDad’s neural learning path to master advanced industry modules.
                                                            </p>
                                                            <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Hired by Global HQ</span>
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                </motion.div>
                                            );
                                        });
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            )}

            {/* Video Modal */}
            {activeVideo && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                    <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm font-bold flex items-center gap-1"
                        >
                            ✕ Close
                        </button>
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
                            {activeVideo.url.startsWith('http') ? (
                                // External URL - embed in iframe (YouTube/Vimeo) or video tag
                                activeVideo.url.includes('youtube.com') || activeVideo.url.includes('youtu.be') ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${activeVideo.url.split('v=')[1]?.split('&')[0] || activeVideo.url.split('/').pop()}?modestbranding=1&rel=0&iv_load_policy=3`}
                                        className="w-full h-full"
                                        allow="autoplay; fullscreen"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video src={activeVideo.url} controls autoPlay className="w-full h-full" />
                                )
                            ) : (
                                <video src={getMediaUrl(activeVideo.url)} controls autoPlay className="w-full h-full" />
                            )}
                        </div>
                        <p className="text-center text-white/60 text-sm mt-3 font-jakarta">{activeVideo.name}'s Success Story</p>
                    </div>
                </div>
            )}

            {/* SkillDad Directors Section */}
            <section className="relative pt-8 md:pt-12 pb-16 md:pb-24 px-6 z-10 bg-transparent section-optimize">
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

                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
                                                src={(director.imageUrl || director.image) ? getMediaUrl(director.imageUrl || director.image) : ''}
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
                                    <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">{director.role || director.title}</p>

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
