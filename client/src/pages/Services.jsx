import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    CheckCircle2,
    ArrowRight,
    Zap,
    GraduationCap,
    Briefcase,
    Building2,
    Globe,
    Layers,
    ChevronDown,
    Shield,
    Users,
    Laptop,
    Award,
    Clock,
    PhoneCall,
    Mail,
    Send,
    Loader2
} from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

// Dynamic Lucide icon helper
const DynamicIcon = ({ name, ...props }) => {
    const iconMap = {
        GraduationCap,
        Briefcase,
        Building2,
        Globe,
        Shield,
        Zap,
        Award,
        Users,
        Laptop,
        Layers,
        Clock
    };
    const IconComponent = iconMap[name] || Zap;
    return <IconComponent {...props} />;
};

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedServiceId, setExpandedServiceId] = useState(null);

    // Consultation Booking Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        service: 'Placement Assurance',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Fallback services in case API response is empty
    const fallbackServices = [
        {
            id: 1,
            title: "100% Placement Assurance",
            category: "students",
            icon_name: "Briefcase",
            tag: "Flagship Program",
            description: "Guaranteed corporate placement pathways with rigorous interview bootcamps, resume engineering, and direct access to 200+ top hiring partners.",
            features: [
                "Guaranteed Interview Drives",
                "1-on-1 Mock Technical Interviews",
                "ATS-Optimized Resume Engineering",
                "Direct Corporate Referrals"
            ],
            sub_services: [
                { title: "Corporate Interview Sprints", desc: "Intensive domain-specific interview simulations with real recruiters." },
                { title: "Portfolio Curation", desc: "Build industry-vetted GitHub and live portfolio deployments." },
                { title: "Salary Negotiation Mentorship", desc: "Learn strategies to maximize starting packages and growth trajectories." }
            ]
        },
        {
            id: 2,
            title: "UGC-Recognized Degree Programs",
            category: "universities",
            icon_name: "GraduationCap",
            tag: "Academic Alliance",
            description: "Industry-integrated B.Voc and M.Voc degree programs accredited by top universities, combining academic rigor with hands-on enterprise training.",
            features: [
                "UGC & NAAC Accredited Syllabus",
                "Credit-Transfer & Blended Learning",
                "Industry Practical Practicums",
                "University Dual Certifications"
            ],
            sub_services: [
                { title: "B.Voc Digital Technology", desc: "Full 3-year industry-embedded degree with real job rotations." },
                { title: "Curriculum Integration", desc: "Modern syllabi aligned with emerging tech and market requirements." },
                { title: "Examination Governance", desc: "Secure digital assessments and standardized evaluation matrix." }
            ]
        },
        {
            id: 3,
            title: "Virtual Internship Programs",
            category: "students",
            icon_name: "Laptop",
            tag: "Experiential Learning",
            description: "Real-world project execution with live corporate mentors, agile standups, and blockchain-backed experience credentials.",
            features: [
                "Work on Live Industry Codebases",
                "Dedicated Corporate Mentors",
                "Agile Standups & Sprint Deliverables",
                "Verified Experience Credentials"
            ],
            sub_services: [
                { title: "Enterprise Sprints", desc: "Collaborate in cross-functional teams to solve live client problems." },
                { title: "Code Reviews & Feedback", desc: "Receive line-by-line feedback from lead engineers." },
                { title: "Verified Credentials", desc: "Tamper-proof blockchain experience certificates." }
            ]
        },
        {
            id: 4,
            title: "Global University Partnerships",
            category: "study_abroad",
            icon_name: "Globe",
            tag: "Global Campus",
            description: "International credit transfers, dual degree pathways, and global university exchange opportunities for aspiring global graduates.",
            features: [
                "International Credit Transfer",
                "Visa & Documentation Assistance",
                "Global Campus Alliances",
                "Post-Study Work Support"
            ],
            sub_services: [
                { title: "Pathways to UK & Europe", desc: "Seamless credit progression into accredited overseas degrees." },
                { title: "IELTS & GRE Coaching", desc: "Comprehensive language and aptitude test training." },
                { title: "Scholarship Guidance", desc: "Assistance with merit grants and international aid." }
            ]
        },
        {
            id: 5,
            title: "Skill Certification & Upskilling",
            category: "students",
            icon_name: "Award",
            tag: "Skill Mastery",
            description: "Short-term, high-impact certification bootcamps covering AI, Data Science, Full-Stack Web Development, and Digital Growth.",
            features: [
                "Hands-on Project Portfolio",
                "Instructor-Led Interactive Labs",
                "Industry-Recognized Badges",
                "Lifetime Learning Resources"
            ],
            sub_services: [
                { title: "Generative AI & Data Science", desc: "From foundation models to production deployments." },
                { title: "Modern Full-Stack Engineering", desc: "React, Node, Cloud, and scalable microservices." },
                { title: "Cloud & DevOps Labs", desc: "Hands-on infrastructure automation on AWS and Docker." }
            ]
        },
        {
            id: 6,
            title: "Enterprise Learning & Corporate Upskilling",
            category: "corporate",
            icon_name: "Building2",
            tag: "B2B Solutions",
            description: "Tailored workforce upskilling, recruit-train-deploy pipelines, and specialized institutional training suites for enterprise growth.",
            features: [
                "Customized Corporate Curriculum",
                "Recruit-Train-Deploy Model",
                "Talent Benchmark Assessments",
                "Enterprise Learning Analytics"
            ],
            sub_services: [
                { title: "Cohort-Based Training", desc: "Customized technical roadmaps for corporate new-hires." },
                { title: "Executive Coaching", desc: "Leadership workshops for senior management." },
                { title: "Talent Benchmarking", desc: "Objective skill assessments to optimize team productivity." }
            ]
        }
    ];

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await axios.get('/api/services');
                if (data && data.length > 0) {
                    setServices(data);
                } else {
                    setServices(fallbackServices);
                }
            } catch (err) {
                console.warn('Using fallback services:', err.message);
                setServices(fallbackServices);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                service: 'Placement Assurance',
                notes: ''
            });
            setTimeout(() => setSubmitSuccess(false), 5000);
        }, 800);
    };

    // Filter displayed services based on category tab
    const filteredServices = services.filter((s) => {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'students') return s.category === 'students' || s.category === 'main';
        if (activeCategory === 'universities') return s.category === 'universities' || s.category === 'academic';
        if (activeCategory === 'corporate') return s.category === 'corporate' || s.category === 'b2b';
        if (activeCategory === 'study_abroad') return s.category === 'study_abroad';
        return true;
    });

    const displayServices = filteredServices.length > 0 ? filteredServices : fallbackServices;

    return (
        <div className="min-h-screen bg-[#080512] [.light-mode_&]:!bg-[#F8FAFC] text-white [.light-mode_&]:!text-slate-900 font-sans selection:bg-[#4C1D95] selection:text-white transition-colors duration-300">
            <Navbar />

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 1: HERO (MATCHING REFERENCE VIDEO FRAME 1.6s)
                Clean card enclosure, left headline & CTA, right photo with floating tags
            ═════════════════════════════════════════════════════════════════ */}
            <section className="pt-6 sm:pt-10 md:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="relative rounded-[28px] sm:rounded-[36px] bg-white [.dark-mode_&]:!bg-[#0D091F] border border-slate-100 [.dark-mode_&]:!border-purple-900/30 p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_-15px_rgba(76,29,149,0.08)] [.dark-mode_&]:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
                    
                    {/* Abstract colorful faceted ribbon accent (inspired by reference video) */}
                    <div className="absolute top-0 left-1/3 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none opacity-85 z-0">
                        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                            <polygon points="100,20 180,80 120,180 30,120" fill="url(#heroPolyGrad)" opacity="0.85" />
                            <polygon points="100,20 120,180 40,80" fill="url(#heroPolyGrad2)" opacity="0.6" />
                            <defs>
                                <linearGradient id="heroPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4C1D95" />
                                    <stop offset="50%" stopColor="#38BDF8" />
                                    <stop offset="100%" stopColor="#A3E635" />
                                </linearGradient>
                                <linearGradient id="heroPolyGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                        {/* Left Column: Headlines & Action Buttons */}
                        <div className="lg:col-span-6 space-y-6 text-left">
                            {/* Eyebrow Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] dark:text-purple-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                                    <Sparkles size={13} className="text-[#4C1D95] dark:text-purple-300" />
                                    <span>Career &amp; Learning Services</span>
                                </div>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight leading-[1.12] text-slate-900 dark:text-white"
                            >
                                Empowering Learners With{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] via-purple-600 to-[#7C3AED] dark:from-purple-300 dark:via-purple-400 dark:to-indigo-300">
                                    Future-Ready Services
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal"
                            >
                                Comprehensive educational and career advancement programs designed for students, academic institutions, and enterprise partners — with guaranteed placement pathways.
                            </motion.p>

                            {/* Dual CTA Buttons (Matching reference video pill buttons) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="flex flex-wrap items-center gap-3 pt-2"
                            >
                                <a
                                    href="#strategy-session"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-900/25 transition-all duration-300 hover:scale-102"
                                >
                                    <span>Plan Your Path</span>
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                        <ArrowRight size={12} />
                                    </div>
                                </a>
                                <a
                                    href="#ecosystem"
                                    className="inline-flex items-center px-6 py-3.5 rounded-full border border-slate-300 dark:border-purple-800/60 bg-slate-50 dark:bg-purple-950/40 hover:bg-slate-100 dark:hover:bg-purple-900/50 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm transition-all duration-300"
                                >
                                    Explore Ecosystem
                                </a>
                            </motion.div>

                            {/* Social Proof Avatar Stack */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-purple-900/30"
                            >
                                <div className="flex -space-x-2">
                                    <img src="/assets/success/student1.png" alt="Student" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0D091F] object-cover" />
                                    <img src="/assets/success/student2.png" alt="Student" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0D091F] object-cover" />
                                    <img src="/assets/success/student3.png" alt="Student" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0D091F] object-cover" />
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Trusted by <strong className="text-slate-800 dark:text-white">10,000+ students</strong> &amp; 50+ university partners
                                </span>
                            </motion.div>
                        </div>

                        {/* Right Column: Hero Visual with Floating Pill Tags (Matching reference video) */}
                        <div className="lg:col-span-6 relative flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative w-full max-w-[480px] rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-purple-800/40 shadow-xl bg-slate-100 dark:bg-purple-950/40"
                            >
                                <img
                                    src="/career_hero_student.jpg"
                                    alt="SkillDad Learning Services"
                                    className="w-full h-[320px] sm:h-[380px] object-cover object-top"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/course_hero_student.jpg";
                                    }}
                                />

                                {/* Floating Filter Pills Overlapping Bottom of Photo (Identical to reference video) */}
                                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2 rounded-2xl bg-white/85 dark:bg-black/60 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg">
                                    <span className="px-2.5 py-1 rounded-full bg-[#4C1D95] text-white text-[10px] sm:text-xs font-semibold shadow-xs">
                                        Placement Support
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs font-medium">
                                        Degree Programs
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs font-medium">
                                        Virtual Internships
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs font-medium hidden sm:inline-block">
                                        Global Campus
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 2: WHAT MAKES OUR SERVICES WORK? (FRAME 4.8s)
                Dark sleek container, split headline & description, horizontal card gallery
            ═════════════════════════════════════════════════════════════════ */}
            <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-[28px] sm:rounded-[36px] bg-[#0A071A] border border-purple-900/40 p-6 sm:p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    
                    {/* Header Split */}
                    <div className="grid lg:grid-cols-12 gap-6 items-end pb-8 sm:pb-10 border-b border-white/10 text-left">
                        <div className="lg:col-span-6 space-y-2">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#A3E635]">
                                WHY SKILLDAD SERVICES
                            </span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                                What Makes Our Services Deliver Results?
                            </h2>
                        </div>
                        <div className="lg:col-span-6">
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                Practical education turns career aspirations into verified placements. We merge UGC-accredited university curricula, real-world corporate codebases, and 1-on-1 industry mentorship so every learner achieves measurable career outcomes.
                            </p>
                        </div>
                    </div>

                    {/* Horizontal Media Gallery Row (Matching reference video row of rounded cards) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 pt-8 sm:pt-10">
                        {/* Card 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group flex flex-col justify-between"
                        >
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                                <img
                                    src="/assets/about/values_mentor.jpg"
                                    alt="Live Mentorship"
                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-black/50 px-2 py-0.5 rounded-md">
                                    Mentorship
                                </span>
                            </div>
                            <div className="p-3 text-left">
                                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">1-on-1 Mentorship</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400">Direct technical guidance from industry engineers.</p>
                            </div>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group flex flex-col justify-between"
                        >
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                                <img
                                    src="/assets/about/mission_laptop.jpg"
                                    alt="Hands-on Project Labs"
                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-black/50 px-2 py-0.5 rounded-md">
                                    Project Labs
                                </span>
                            </div>
                            <div className="p-3 text-left">
                                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">Live Corporate Sprints</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400">Work directly on real-world client challenges.</p>
                            </div>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group flex flex-col justify-between"
                        >
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                                <img
                                    src="/assets/about/vision_campus.jpg"
                                    alt="Accredited Degrees"
                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-black/50 px-2 py-0.5 rounded-md">
                                    Accredited
                                </span>
                            </div>
                            <div className="p-3 text-left">
                                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">UGC Degree Matrix</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400">Formal university recognition with credit transfers.</p>
                            </div>
                        </motion.div>

                        {/* Card 4 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group flex flex-col justify-between"
                        >
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                                <img
                                    src="/assets/about/vision_graduate.jpg"
                                    alt="Placement Assurance"
                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/50 px-2 py-0.5 rounded-md">
                                    Placement
                                </span>
                            </div>
                            <div className="p-3 text-left">
                                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">Placement Drives</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400">100% placement support with top enterprise recruiters.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 3: A COMPLETE ECOSYSTEM, NOT A ONE-OFF COURSE (FRAME 8.0s)
                Vibrant purple container, category tabs, and 3 playfully tilted cards with loop line
            ═════════════════════════════════════════════════════════════════ */}
            <section id="ecosystem" className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#4C1D95] via-[#3B0764] to-[#240B47] text-white p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-2xl border border-purple-500/20">
                    
                    {/* Decorative curved loop string in background (exact match from reference video) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/20 fill-none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 120 180 C 350 80, 500 240, 800 120 C 1050 20, 1150 260, 1000 320 C 850 360, 750 200, 920 160 C 1100 120, 1300 280, 1500 190" strokeWidth="2.5" strokeDasharray="6 6" />
                    </svg>

                    {/* Section Header */}
                    <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10 mb-8 sm:mb-10">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#A3E635]">
                            HOW IT WORKS
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                            A Complete Ecosystem, <br />Not A One-Off Course
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto leading-relaxed">
                            SkillDad turns ambition into career readiness through a connected suite of services that guide learners from day one to corporate onboarding.
                        </p>

                        {/* Category Filter Pills (Identical to reference video pills) */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                            {[
                                { key: 'all', label: 'All Services' },
                                { key: 'students', label: 'For Students' },
                                { key: 'universities', label: 'For Universities' },
                                { key: 'corporate', label: 'For Corporates' },
                                { key: 'study_abroad', label: 'Study Abroad' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveCategory(tab.key)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                        activeCategory === tab.key
                                            ? 'bg-white text-[#4C1D95] shadow-md scale-105'
                                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3 Playfully Tilted Cards (Exact reproduction from reference video frame 8.0s) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 relative z-10 max-w-4xl mx-auto pt-2">
                        
                        {/* Card 1: Match & Assess (Tilted Counter-Clockwise, Lime Accent) */}
                        <motion.div
                            whileHover={{ scale: 1.04, rotate: 0 }}
                            className="p-6 rounded-[22px] bg-[#A3E635] text-slate-900 shadow-xl -rotate-[3deg] transition-all duration-300 text-left flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900/10 text-slate-900 text-[10px] font-bold uppercase tracking-wider">
                                    Stage 01
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Match &amp; Align</h3>
                                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                    Discover student skill baselines, align personalized university curricula, and map out target high-growth tech domains.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-900/15 text-[11px] font-bold text-slate-900 flex items-center justify-between">
                                <span>Aptitude &amp; Roadmap</span>
                                <ArrowRight size={13} />
                            </div>
                        </motion.div>

                        {/* Card 2: Direct & Execute (Upright, Crisp White Card) */}
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            className="p-6 rounded-[22px] bg-white text-slate-900 shadow-2xl transition-all duration-300 text-left flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] text-[10px] font-bold uppercase tracking-wider">
                                    Stage 02
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Learn &amp; Build</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                    Live interactive workshops, hands-on virtual internship sprints, and recognized university degree practicums.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] font-bold text-[#4C1D95] flex items-center justify-between">
                                <span>Curriculum &amp; Projects</span>
                                <ArrowRight size={13} />
                            </div>
                        </motion.div>

                        {/* Card 3: Package & Place (Tilted Clockwise, Cyan Accent) */}
                        <motion.div
                            whileHover={{ scale: 1.04, rotate: 0 }}
                            className="p-6 rounded-[22px] bg-[#38BDF8] text-slate-950 shadow-xl rotate-[3deg] transition-all duration-300 text-left flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950/10 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                                    Stage 03
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">Certify &amp; Place</h3>
                                <p className="text-xs text-slate-900 leading-relaxed font-medium">
                                    Deliver verified credentials, mock interview readiness, and direct recruitment placement drives with enterprise partners.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-950/15 text-[11px] font-bold text-slate-950 flex items-center justify-between">
                                <span>Placement Assurance</span>
                                <ArrowRight size={13} />
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 4: CORE SERVICE OUTCOMES (FRAME 10.4s)
                Dark container, 4 overlapping tilted cards with floating icon badges
            ═════════════════════════════════════════════════════════════════ */}
            <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-[28px] sm:rounded-[36px] bg-[#0A071A] border border-purple-900/40 p-6 sm:p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    
                    {/* Header */}
                    <div className="max-w-2xl text-left space-y-2 mb-8 sm:mb-10">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-300">
                            WHAT AND WHY
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                            Service Outcomes You Shouldn't Miss
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-normal">
                            Engineered for high student satisfaction, accredited university compliance, and tangible placement returns.
                        </p>
                    </div>

                    {/* 4 Overlapping Tilted Cards with Floating Circular Icon Badges (Exact match frame 10.4s) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 lg:gap-3 items-stretch pt-3 pb-8">
                        
                        {/* Outcome Card 1: Purple with Bolt Badge */}
                        <div className="relative group">
                            {/* Floating circular icon badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#38BDF8] text-slate-950 flex items-center justify-center shadow-md z-20">
                                <Zap size={14} className="fill-current" />
                            </div>
                            <div className="h-full p-5 rounded-2xl bg-[#3B0764] border border-purple-500/30 text-white -rotate-[2deg] group-hover:rotate-0 transition-transform duration-300 text-left pt-7 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-white">Faster Placement</h4>
                                    <p className="text-xs text-purple-200 leading-relaxed">
                                        Accelerate your time-to-offer with pre-cleared interview pipelines and verified mock assessments.
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#A3E635] pt-3 block">100% Placement Pathway</span>
                            </div>
                        </div>

                        {/* Outcome Card 2: White with Checkmark Badge */}
                        <div className="relative group">
                            {/* Floating circular icon badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#A3E635] text-slate-900 flex items-center justify-center shadow-md z-20">
                                <CheckCircle2 size={14} className="stroke-[2.5]" />
                            </div>
                            <div className="h-full p-5 rounded-2xl bg-white text-slate-900 rotate-[1deg] group-hover:rotate-0 transition-transform duration-300 text-left pt-7 shadow-lg flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-slate-900">Academic Credibility</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Earn degrees and certifications that carry authentic UGC recognition and global industry trust.
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#4C1D95] pt-3 block">UGC &amp; NAAC Recognized</span>
                            </div>
                        </div>

                        {/* Outcome Card 3: Cyan with Book Badge */}
                        <div className="relative group">
                            {/* Floating circular icon badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-md z-20">
                                <Layers size={14} />
                            </div>
                            <div className="h-full p-5 rounded-2xl bg-[#0EA5E9] text-slate-950 -rotate-[1.5deg] group-hover:rotate-0 transition-transform duration-300 text-left pt-7 shadow-lg flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-slate-950">Reusable Portfolio</h4>
                                    <p className="text-xs text-slate-900 leading-relaxed font-medium">
                                        Graduate with deployable production projects, GitHub repositories, and verified experience letters.
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-white pt-3 block">Live Project Assets</span>
                            </div>
                        </div>

                        {/* Outcome Card 4: White with Shield Badge */}
                        <div className="relative group">
                            {/* Floating circular icon badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#A3E635] text-slate-900 flex items-center justify-center shadow-md z-20">
                                <Shield size={14} />
                            </div>
                            <div className="h-full p-5 rounded-2xl bg-white text-slate-900 rotate-[2deg] group-hover:rotate-0 transition-transform duration-300 text-left pt-7 shadow-lg flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-slate-900">Turnkey Guidance</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Dedicated mentor monitoring, 24/7 academic query resolution, and structured sprint reviews.
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#4C1D95] pt-3 block">Continuous Mentorship</span>
                            </div>
                        </div>

                    </div>

                    {/* Dynamic Full Service Offerings Directory from Database */}
                    <div className="pt-8 border-t border-white/10 text-left">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-extrabold text-white">Full Services Catalog</h3>
                                <p className="text-xs text-slate-400">Click any service to view its included modules and practicum details.</p>
                            </div>
                            <span className="text-xs font-bold text-[#A3E635] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                {displayServices.length} Programs
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayServices.map((service) => (
                                <div
                                    key={service.id}
                                    className={`p-4 rounded-xl border transition-all duration-300 ${
                                        expandedServiceId === service.id
                                            ? 'bg-purple-950/50 border-purple-500/50 shadow-md'
                                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#4C1D95]/30 border border-[#4C1D95]/40 flex items-center justify-center text-purple-300 shrink-0">
                                            <DynamicIcon name={service.icon_name} size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">{service.title}</h4>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{service.description}</p>
                                        </div>
                                        <button
                                            onClick={() => setExpandedServiceId(expandedServiceId === service.id ? null : service.id)}
                                            className="p-1 rounded-md text-slate-400 hover:text-white"
                                            aria-label="Toggle details"
                                        >
                                            <ChevronDown size={14} className={`transition-transform ${expandedServiceId === service.id ? 'rotate-180 text-purple-300' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Features List */}
                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                                        {(service.features || []).slice(0, 3).map((f, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                                                <CheckCircle2 size={11} className="text-[#A3E635] shrink-0" />
                                                <span className="truncate">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expandable Sub-services Drawer */}
                                    <AnimatePresence>
                                        {expandedServiceId === service.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs"
                                            >
                                                {service.details && (
                                                    <p className="text-[11px] text-purple-200 italic pl-2 border-l-2 border-purple-400">
                                                        "{service.details}"
                                                    </p>
                                                )}
                                                {(service.sub_services || []).map((sub, idx) => (
                                                    <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5">
                                                        <span className="font-bold text-white block text-[10.5px]">{sub.title}</span>
                                                        <span className="text-[10px] text-slate-400 block">{sub.desc}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 5: HIGH-IMPACT STATEMENT BANNER (FRAME 12.8s)
                Vibrant lime/chartreuse banner with bold typographic manifesto
            ═════════════════════════════════════════════════════════════════ */}
            <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-[28px] sm:rounded-[36px] bg-[#A3E635] text-slate-950 p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-800 block mb-2 font-mono">
                        GROWTH • ACADEMIC EXCELLENCE • CAREER VALUE
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight leading-tight max-w-3xl mx-auto">
                        The Best Educational Programs Do More Than Deliver Lessons.{' '}
                        <span className="underline decoration-slate-900/30 underline-offset-4">
                            They Build Lifelong Careers.
                        </span>
                    </h2>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 6: BOOK YOUR STRATEGY SESSION / CONSULTATION (FRAME 14.4s)
                Split container with left copy + geometric crystal and right floating form card
            ═════════════════════════════════════════════════════════════════ */}
            <section id="strategy-session" className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="rounded-[28px] sm:rounded-[36px] bg-white [.dark-mode_&]:!bg-[#0D091F] border border-slate-100 [.dark-mode_&]:!border-purple-900/30 p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_-15px_rgba(76,29,149,0.08)] [.dark-mode_&]:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden text-left">
                    
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        
                        {/* Left Side: Headline & Narrative Copy */}
                        <div className="lg:col-span-5 space-y-4">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#4C1D95] dark:text-purple-300">
                                PLAN YOUR NEXT STEP
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                                Book Your{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] to-purple-600 dark:from-purple-300 dark:to-indigo-300">
                                    Strategy Session
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                Tell us what you are aiming for, which domain you wish to enter, and where you need mentorship. Our counseling team will map a practical career &amp; educational roadmap tailored for you.
                            </p>

                            {/* Direct Contact Items */}
                            <div className="pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95] dark:text-purple-300">
                                        <Mail size={13} />
                                    </div>
                                    <span>support@skilldad.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95] dark:text-purple-300">
                                        <PhoneCall size={13} />
                                    </div>
                                    <span>+91 73031 22594</span>
                                </div>
                            </div>

                            {/* Faceted Crystal Emblem (Exact motif from video frame 14.4s) */}
                            <div className="pt-4 hidden sm:block">
                                <div className="w-16 h-16 opacity-85">
                                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                                        <polygon points="50,10 90,50 50,90 10,50" fill="url(#crystalGrad1)" />
                                        <polygon points="50,10 50,90 90,50" fill="url(#crystalGrad2)" opacity="0.7" />
                                        <defs>
                                            <linearGradient id="crystalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#A3E635" />
                                                <stop offset="50%" stopColor="#4C1D95" />
                                                <stop offset="100%" stopColor="#38BDF8" />
                                            </linearGradient>
                                            <linearGradient id="crystalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#7C3AED" />
                                                <stop offset="100%" stopColor="#06B6D4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Consultation Form (Matching reference video floating white card) */}
                        <div className="lg:col-span-7">
                            <div className="p-6 sm:p-8 rounded-[24px] bg-slate-50 dark:bg-purple-950/30 border border-slate-200/80 dark:border-purple-800/40 shadow-md">
                                {submitSuccess ? (
                                    <div className="py-10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Request Received!</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                                            Thank you. Our senior academic counselor will reach out via WhatsApp &amp; Email within 24 hours.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                    Phone / WhatsApp
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="+91 98765 43210"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Preferred Service or Program
                                            </label>
                                            <select
                                                value={formData.service}
                                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                                            >
                                                <option value="Placement Assurance">100% Placement Assurance Program</option>
                                                <option value="Degree Programs">UGC-Recognized Degree Programs (B.Voc / M.Voc)</option>
                                                <option value="Virtual Internships">Virtual Internship &amp; Corporate Projects</option>
                                                <option value="Skill Certification">Industry Skill Certifications</option>
                                                <option value="Study Abroad">Global University &amp; Credit Transfer</option>
                                                <option value="University Alliances">Institutional / University Alliances</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Tell us about your background &amp; goals
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="e.g. Completed BCA, looking for cloud or full-stack placements..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C1D95] resize-none"
                                            />
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        <span>Submitting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Request Consultation</span>
                                                        <Send size={12} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Services;
