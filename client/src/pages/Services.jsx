import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const Services = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [mainServices, setMainServices] = useState([]);
    const [additionalFeatures, setAdditionalFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await axios.get('/api/services');
                setMainServices(data.filter(s => s.category === 'main'));
                setAdditionalFeatures(data.filter(s => s.category === 'additional'));
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch services:', error);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const DynamicIcon = ({ name, ...props }) => {
        const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
        return <Icon {...props} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05030B] flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05030B] text-white selection:bg-primary selection:text-white relative overflow-hidden">
            {/* Background Accent Lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] pointer-events-none -z-10" />

            <Navbar />

            {/* Hero Section */}
            <section className="pt-28 md:pt-36 pb-12 px-4 sm:px-6 relative">
                <div className="max-w-4xl mx-auto text-center space-y-4">


                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-black font-space tracking-tight leading-tight"
                    >
                        Our <span className="premium-gradient-text">Services</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-inter leading-relaxed"
                    >
                        Comprehensive, outcome-focused educational services designed to empower students, academic institutions, and enterprise partners — featuring{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary font-bold">
                            100% Placement Assurance
                        </span>.
                    </motion.p>
                </div>
            </section>

            {/* ── FEATURED: Placement Service ───────────────────────── */}
            {mainServices.length > 0 && (() => {
                const featured = mainServices[0];
                const rest = mainServices.slice(1);
                return (
                    <>
                        <section className="py-6 px-4 sm:px-6">
                            <div className="max-w-6xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="relative group rounded-3xl p-[1px] bg-gradient-to-r from-primary/50 via-primary/20 to-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(110,40,255,0.2)]">
                                        <GlassCard className="about-card-bg backdrop-blur-3xl rounded-[23px] p-6 sm:p-8 md:p-10 space-y-8">
                                            <div className="grid lg:grid-cols-12 gap-8 items-start">
                                                {/* Left — Main Details */}
                                                <div className="lg:col-span-7 space-y-5 text-left">
                                                    <div className="flex items-start space-x-4">
                                                        <div className={`w-14 h-14 rounded-2xl ${featured.bg_class || 'bg-primary/15'} flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20 shrink-0`}>
                                                            <DynamicIcon name={featured.icon_name} className={featured.color_class || 'text-primary'} size={28} />
                                                        </div>
                                                        <div>
                                                            <div className="inline-block px-2.5 py-0.5 rounded-md bg-primary/20 border border-primary/30 text-[11px] font-bold text-primary tracking-wider uppercase mb-1">
                                                                Featured Service
                                                            </div>
                                                            <h2 className="text-2xl sm:text-3xl font-black text-white font-space leading-tight">
                                                                {featured.title}
                                                            </h2>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-300 leading-relaxed font-inter">
                                                        {featured.description}
                                                    </p>

                                                    {featured.details && (
                                                        <div className="p-4 rounded-xl about-inner-card-bg border-l-4 border-primary border-y border-r border-white/5 text-xs sm:text-sm text-gray-300 font-inter leading-relaxed">
                                                            "{featured.details}"
                                                        </div>
                                                    )}

                                                    <div className="pt-2">
                                                        <ModernButton
                                                            onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
                                                            className="!px-6 !py-3 !text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                                                        >
                                                            {expandedId === featured.id ? 'Hide Details' : 'View Full Details'}
                                                        </ModernButton>
                                                    </div>
                                                </div>

                                                {/* Right — Key Highlights Box */}
                                                <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl about-inner-card-bg border border-white/10 space-y-4 text-left h-full flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-space">
                                                                <LucideIcons.ShieldCheck size={16} className="text-primary" />
                                                                <span>Key Highlights</span>
                                                            </h3>
                                                            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                Placement Core
                                                            </span>
                                                        </div>

                                                        <div className="space-y-2.5">
                                                            {(featured.features || []).map((feature, idx) => (
                                                                <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl about-inner-card-bg border border-white/5 hover:border-primary/30 transition-all duration-300">
                                                                    <LucideIcons.CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                                                                    <span className="text-xs sm:text-sm text-gray-200 font-medium font-inter">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5 text-xs text-gray-400 flex items-center justify-between font-inter">
                                                        <span className="flex items-center gap-1.5">
                                                            <LucideIcons.Zap size={13} className="text-amber-400" />
                                                            Outcome Driven
                                                        </span>
                                                        <span className="text-primary font-bold">100% Verified Matrix</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Sub-services Drawer */}
                                            <AnimatePresence>
                                                {expandedId === featured.id && (featured.sub_services || []).length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.4 }}
                                                        className="mt-8 pt-6 border-t border-white/10 text-left"
                                                    >
                                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-space flex items-center gap-2">
                                                            <LucideIcons.Layers size={14} className="text-primary" />
                                                            Included Sub-Services & Modules
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {featured.sub_services.map((sub, idx) => (
                                                                <div key={idx} className="p-4 rounded-xl about-inner-card-bg border border-white/10 hover:border-primary/40 transition-all space-y-2 group/sub">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 group-hover/sub:scale-125 transition-transform" />
                                                                        <h5 className="font-bold text-white text-xs sm:text-sm font-inter">{sub.title}</h5>
                                                                    </div>
                                                                    <p className="text-gray-400 text-xs leading-relaxed font-inter">{sub.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassCard>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        {/* ── Remaining Main Services ─────────────────────── */}
                        <section className="py-12 px-4 sm:px-6">
                            <div className="max-w-6xl mx-auto space-y-8">
                                <div className="flex items-center justify-between text-left border-b border-white/10 pb-4">
                                    <div>
                                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest block mb-1">Specialized Modules</span>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white font-space">Core Offerings</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rest.map((service, index) => (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 25 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group h-full"
                                        >
                                            <GlassCard className={`h-full transition-all duration-300 overflow-hidden rounded-2xl border ${expandedId === service.id ? 'border-primary/50 about-card-bg shadow-[0_0_30px_rgba(110,40,255,0.15)]' : 'border-white/10 hover:border-primary/30'} p-6 flex flex-col justify-between text-left`}>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`w-12 h-12 rounded-xl ${service.bg_class || 'bg-primary/10'} flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shrink-0`}>
                                                            <DynamicIcon name={service.icon_name} className={service.color_class || 'text-primary'} size={24} />
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                                            className={`p-2 rounded-xl border transition-colors ${expandedId === service.id ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                            aria-label="Toggle details"
                                                        >
                                                            <DynamicIcon name="ChevronDown" className={`w-4 h-4 transition-transform duration-300 ${expandedId === service.id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-bold text-white font-space mb-2 group-hover:text-primary-light transition-colors">{service.title}</h3>
                                                        <p className="text-gray-300 text-xs sm:text-sm font-inter leading-relaxed line-clamp-3">{service.description}</p>
                                                    </div>

                                                    <div className="space-y-2 pt-3 border-t border-white/5">
                                                        {(service.features || []).slice(0, 4).map((feature, idx) => (
                                                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-300 font-inter">
                                                                <LucideIcons.CheckCircle2 className="text-emerald-400 shrink-0" size={14} />
                                                                <span className="truncate">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5 mt-5">
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                                        className="text-xs font-bold text-primary hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
                                                    >
                                                        <span>{expandedId === service.id ? 'Close Details' : 'Explore Service'}</span>
                                                        <LucideIcons.ArrowRight size={14} />
                                                    </button>
                                                </div>

                                                {/* Expanded Details */}
                                                <AnimatePresence>
                                                    {expandedId === service.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="mt-4 pt-4 border-t border-white/10 space-y-3"
                                                        >
                                                            {service.details && (
                                                                <p className="text-xs text-gray-300 italic border-l-2 border-primary pl-3 py-1">
                                                                    "{service.details}"
                                                                </p>
                                                            )}
                                                            {(service.sub_services || []).length > 0 && (
                                                                <div className="space-y-2 pt-2">
                                                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Included Modules</span>
                                                                    {service.sub_services.map((sub, idx) => (
                                                                        <div key={idx} className="p-2.5 rounded-lg about-inner-card-bg border border-white/5 text-xs">
                                                                            <span className="font-bold text-white block mb-0.5">{sub.title}</span>
                                                                            <span className="text-gray-400 text-[11px] leading-relaxed block">{sub.desc}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                );
            })()}

            {/* Additional Features */}
            <section className="py-16 md:py-20 px-4 sm:px-6 border-t border-white/10 bg-white/[0.01] relative">
                <div className="max-w-6xl mx-auto space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-3"
                    >
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Standard Infrastructure</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white font-space">
                            Advanced Platform Capabilities
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto font-inter">
                            Enterprise-grade features seamlessly integrated into the SkillDad educational platform.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{ y: -4 }}
                            >
                                <GlassCard className="text-left border border-white/10 hover:border-primary/30 transition-all duration-300 p-6 rounded-2xl space-y-4 h-full">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                        <DynamicIcon name={feature.icon_name} className="text-primary" size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-base font-bold text-white font-space">{feature.title}</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm font-inter leading-relaxed">{feature.description}</p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Services;
