import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Handshake,
    Building2,
    Globe,
    Users,
    TrendingUp,
    Award,
    ArrowRight,
    Star,
    CheckCircle,
    Briefcase,
    BadgeCheck,
    ChevronRight,
    Mail,
    MapPin,
    ExternalLink
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import { useNavigate } from 'react-router-dom';

const partners = [
    {
        id: 1,
        name: 'TCS',
        fullName: 'Tata Consultancy Services',
        logo: 'TCS',
        category: 'IT Services',
        location: 'Mumbai, India',
        description: 'Leading global IT services, consulting and business solutions partner, enabling thousands of SkillDad graduates to launch their careers.',
        students: '3,200+',
        openRoles: 120,
        rating: 4.8,
        tags: ['Software Engineering', 'Data Science', 'Cloud', 'AI/ML'],
        color: '#5B5CFF',
        since: '2022'
    },
    {
        id: 2,
        name: 'Infosys',
        fullName: 'Infosys Limited',
        logo: 'INF',
        category: 'IT Consulting',
        location: 'Bangalore, India',
        description: 'Global consulting and IT services leader partnering with SkillDad to bridge the gap between learning and industry-ready talent.',
        students: '2,800+',
        openRoles: 95,
        rating: 4.7,
        tags: ['Full Stack', 'DevOps', 'SAP', 'Digital Transformation'],
        color: '#7A5CFF',
        since: '2022'
    },
    {
        id: 3,
        name: 'Capgemini',
        fullName: 'Capgemini SE',
        logo: 'CAP',
        category: 'Technology & Consulting',
        location: 'Paris, France',
        description: 'A global leader in consulting, technology services, and digital transformation — a key collaborator in SkillDad\'s international placement network.',
        students: '1,900+',
        openRoles: 78,
        rating: 4.6,
        tags: ['Consulting', 'Cybersecurity', 'UX Design', 'Cloud'],
        color: '#B05CFF',
        since: '2023'
    },
    {
        id: 4,
        name: 'Wipro',
        fullName: 'Wipro Limited',
        logo: 'WIP',
        category: 'IT & BPO',
        location: 'Bangalore, India',
        description: 'A technology services giant actively hiring SkillDad graduates across engineering, analytics, and consulting roles worldwide.',
        students: '2,100+',
        openRoles: 85,
        rating: 4.5,
        tags: ['Java', 'Testing', 'Analytics', 'BPO'],
        color: '#5B5CFF',
        since: '2023'
    },
    {
        id: 5,
        name: 'Accenture',
        fullName: 'Accenture PLC',
        logo: 'ACC',
        category: 'Management Consulting',
        location: 'Dublin, Ireland',
        description: 'A global management consulting and professional services firm co-creating the next generation of tech leaders through SkillDad.',
        students: '2,500+',
        openRoles: 110,
        rating: 4.9,
        tags: ['Strategy', 'Digital', 'Technology', 'Operations'],
        color: '#7A5CFF',
        since: '2022'
    },
    {
        id: 6,
        name: 'Cognizant',
        fullName: 'Cognizant Technology Solutions',
        logo: 'COG',
        category: 'IT Services',
        location: 'New Jersey, USA',
        description: 'One of the world\'s leading IT services firms, consistently partnering with SkillDad to access top-quality, job-ready graduates.',
        students: '1,700+',
        openRoles: 65,
        rating: 4.6,
        tags: ['Healthcare IT', 'Fintech', 'Agile', 'QA'],
        color: '#B05CFF',
        since: '2023'
    },
    {
        id: 7,
        name: 'HCL Tech',
        fullName: 'HCL Technologies',
        logo: 'HCL',
        category: 'IT Services',
        location: 'Noida, India',
        description: 'A next-generation global technology company helping enterprises reimagine their businesses — powered by SkillDad talent pipelines.',
        students: '1,500+',
        openRoles: 58,
        rating: 4.4,
        tags: ['IoT', 'Cybersecurity', 'ERP', 'Automation'],
        color: '#5B5CFF',
        since: '2023'
    },
    {
        id: 8,
        name: 'Deloitte',
        fullName: 'Deloitte Touche Tohmatsu',
        logo: 'DEL',
        category: 'Professional Services',
        location: 'London, UK',
        description: 'Big Four firm offering audit, consulting, tax services — a premium partner channeling SkillDad graduates into elite professional roles globally.',
        students: '980+',
        openRoles: 42,
        rating: 4.9,
        tags: ['Risk Advisory', 'Tax', 'Finance', 'Consulting'],
        color: '#7A5CFF',
        since: '2023'
    }
];

const benefits = [
    {
        icon: Users,
        title: 'Talent Pipeline Access',
        desc: 'Get direct access to a pool of 1.2M+ pre-vetted, job-ready graduates across tech, finance, and design.'
    },
    {
        icon: BadgeCheck,
        title: 'Skill-Verified Candidates',
        desc: 'Every candidate is assessed through our AI-powered evaluation system before entering the placement pool.'
    },
    {
        icon: TrendingUp,
        title: 'Revenue Sharing',
        desc: 'Earn competitive commissions every time a student is placed through your referral or recruitment channel.'
    },
    {
        icon: Briefcase,
        title: 'Co-Branded Programs',
        desc: 'Launch custom upskilling programs in partnership with SkillDad, branded for your organization.'
    }
];

const Partners = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'IT Services', 'IT Consulting', 'Technology & Consulting', 'Management Consulting', 'Professional Services', 'IT & BPO'];

    const filtered = activeCategory === 'All'
        ? partners
        : partners.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen selection:bg-primary/30 relative overflow-x-hidden text-text-primary bg-black/20 backdrop-blur-[1px]">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-36 pb-20 px-6 z-10 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <Handshake size={14} />
                        <span>Hiring Partners</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-black text-white font-jakarta tracking-tighter mb-8 drop-shadow-lg"
                        style={{
                            fontSize: 'clamp(1.75rem, 5vw, 4rem)',
                            lineHeight: '1.1',
                            letterSpacing: '-0.03em'
                        }}
                    >
                        Companies That <br />
                        <span
                            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark"
                            style={{ display: 'inline-block' }}
                        >
                            Trust SkillDad
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-text-secondary text-base md:text-lg font-inter max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Our global network of 150+ partner companies actively recruit from SkillDad's talent pool — placing graduates in roles across engineering, consulting, finance, and beyond.
                    </motion.p>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-8"
                    >
                        {[
                            { value: '150+', label: 'Partner Companies' },
                            { value: '94%', label: 'Placement Rate' },
                            { value: '12,000+', label: 'Students Placed' },
                            { value: '32', label: 'Countries' }
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-black text-white font-inter-tight">{s.value}</p>
                                <p className="text-xs uppercase tracking-widest text-white/50 font-black mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="relative px-6 pb-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border ${activeCategory === cat
                                    ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(91,92,255,0.4)]'
                                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Cards Grid */}
            <section className="relative px-6 pb-20 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((partner, i) => (
                            <motion.div
                                key={partner.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                whileHover={{ y: -4 }}
                                className="group"
                            >
                                <GlassCard className="h-full flex flex-col !p-6 border-white/10 hover:border-primary/40 hover:bg-white/[0.07] transition-all duration-300">
                                    {/* Logo + Name */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black border shadow-lg"
                                            style={{
                                                backgroundColor: `${partner.color}20`,
                                                color: partner.color,
                                                borderColor: `${partner.color}40`
                                            }}
                                        >
                                            {partner.logo}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-black text-white">{partner.rating}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-black text-white mb-0.5 font-poppins">{partner.name}</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">{partner.category}</p>

                                    <div className="flex items-center gap-1 text-white/40 mb-3">
                                        <MapPin size={10} />
                                        <span className="text-[10px] font-medium">{partner.location}</span>
                                    </div>

                                    <p className="text-xs text-white/60 font-inter leading-relaxed mb-4 flex-1">
                                        {partner.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mb-5">
                                        {partner.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${partner.color}15`,
                                                    color: partner.color
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-xs font-black text-white">{partner.students}</p>
                                            <p className="text-[9px] text-white/40 uppercase tracking-wider">Students Hired</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white">{partner.openRoles}</p>
                                            <p className="text-[9px] text-white/40 uppercase tracking-wider">Open Roles</p>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="mt-4 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                    >
                                        View Opportunities
                                        <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partnership Benefits */}
            <section className="relative py-20 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4"
                        >
                            <Award size={14} />
                            <span>Why Partner With Us</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-6xl font-black text-white font-jakarta tracking-tight"
                        >
                            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Mutual Growth</span>
                        </motion.h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <GlassCard className="h-full !p-6 border-white/10 hover:border-primary/30 hover:bg-white/[0.06] transition-all duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                                        <b.icon size={22} />
                                    </div>
                                    <h3 className="text-sm font-black text-white mb-2 font-poppins">{b.title}</h3>
                                    <p className="text-xs text-white/55 font-inter leading-relaxed">{b.desc}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden border border-primary/20 p-10 md:p-16 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(91,92,255,0.12) 0%, rgba(192,38,255,0.08) 100%)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <Handshake size={40} className="text-primary mx-auto mb-4 opacity-80" />
                            <h2 className="text-3xl sm:text-5xl font-black text-white font-jakarta tracking-tight mb-4">
                                Become a SkillDad Partner
                            </h2>
                            <p className="text-white/60 font-inter text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                                Join our global partner ecosystem. Get access to pre-screened graduates, co-brand training programs, and build your future workforce today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <ModernButton
                                    onClick={() => navigate('/support')}
                                    className="px-10 py-3 text-sm font-black uppercase tracking-widest"
                                >
                                    Apply as Partner
                                    <ArrowRight size={16} className="ml-2 inline" />
                                </ModernButton>
                                <button
                                    onClick={() => navigate('/support')}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                                >
                                    <Mail size={14} />
                                    Contact Our Team
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Partners;
