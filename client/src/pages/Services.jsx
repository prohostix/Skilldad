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
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 md:pt-28 pb-6 px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center space-y-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 border border-primary/25 rounded-full text-xs font-black uppercase tracking-widest text-primary shadow-sm"
                    >
                        <LucideIcons.Sparkles size={13} className="animate-pulse" />
                        <span>SkillDad Educational Ecosystem</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space tracking-tight"
                    >
                        <span className="opacity-40">Our</span>{' '}
                        <span className="premium-gradient-text">Services</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-inter leading-relaxed px-4"
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
                                    <GlassCard className="!bg-[#0A0714]/90 backdrop-blur-2xl border-primary/30 hover:border-primary/60 transition-all duration-500 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-[0_0_50px_rgba(110,40,255,0.18)] overflow-hidden">
                                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                                            {/* Left — Main Details */}
                                            <div className="lg:col-span-7 space-y-4 text-left">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-12 h-12 rounded-2xl ${featured.bg_class || 'bg-primary/15'} flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20 shrink-0`}>
                                                        <DynamicIcon name={featured.icon_name} className={featured.color_class || 'text-primary'} size={24} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Featured Service</span>
                                                        <h2 className="text-2xl sm:text-3xl font-black text-white font-space leading-tight">
                                                            {featured.title}
                                                        </h2>
                                                    </div>
                                                </div>

                                                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-inter">
                                                    {featured.description}
                                                </p>

                                                {featured.details && (
                                                    <div className="p-3.5 rounded-xl bg-white/[0.02] border-l-2 border-primary border-y border-r border-white/5 italic text-xs text-gray-300 font-inter leading-relaxed">
                                                        "{featured.details}"
                                                    </div>
                                                )}

                                                <div className="pt-2">
                                                    <ModernButton
                                                        onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
                                                        className="!px-5 !py-2.5 !text-xs font-bold uppercase tracking-wider"
                                                    >
                                                        {expandedId === featured.id ? 'Hide Details' : 'View Full Details'}
                                                    </ModernButton>
                                                </div>
                                            </div>

                                            {/* Right — Key Highlights Box */}
                                            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 text-left h-full flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                                                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 font-space">
                                                            <LucideIcons.ShieldCheck size={14} className="text-primary" />
                                                            <span>Key Highlights</span>
                                                        </h3>
                                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Placement Core</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                                                        {(featured.features || []).map((feature, idx) => (
                                                            <div key={idx} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all">
                                                                <LucideIcons.CheckCircle2 className="text-emerald-400 shrink-0" size={14} />
                                                                <span className="text-xs text-gray-200 font-medium">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between font-inter">
                                                    <span>Outcome Driven</span>
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
                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 font-space">
                                                        Included Sub-Services & Modules
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {featured.sub_services.map((sub, idx) => (
                                                            <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all space-y-1.5">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                                    <h5 className="font-bold text-white text-xs font-inter">{sub.title}</h5>
                                                                </div>
                                                                <p className="text-gray-400 text-[11px] leading-relaxed font-inter">{sub.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>
                                </motion.div>
                            </div>
                        </section>

                        {/* ── Remaining Main Services ─────────────────────── */}
                        <section className="py-8 px-4 sm:px-6">
                            <div className="max-w-6xl mx-auto space-y-6">
                                <div className="flex items-center justify-between text-left border-b border-white/10 pb-4">
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Specialized Modules</span>
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
                                            <GlassCard className={`h-full transition-all duration-500 overflow-hidden rounded-3xl ${expandedId === service.id ? 'ring-1 ring-primary/50 shadow-glow-purple bg-[#0A0714]' : 'hover:shadow-xl hover:shadow-primary/10'} p-6 flex flex-col justify-between text-left`}>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`w-11 h-11 rounded-xl ${service.bg_class || 'bg-primary/10'} flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shrink-0`}>
                                                            <DynamicIcon name={service.icon_name} className={service.color_class || 'text-primary'} size={22} />
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                                            className={`p-1.5 rounded-full border border-white/10 ${expandedId === service.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                                        >
                                                            <DynamicIcon name="ChevronDown" className={`w-4 h-4 transition-transform duration-300 ${expandedId === service.id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-black text-white font-space mb-1.5">{service.title}</h3>
                                                        <p className="text-gray-300 text-xs font-inter leading-relaxed line-clamp-3">{service.description}</p>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                                        {(service.features || []).slice(0, 4).map((feature, idx) => (
                                                            <div key={idx} className="flex items-center space-x-2 text-[11px] text-gray-300 font-inter">
                                                                <LucideIcons.CheckCircle2 className="text-emerald-400 shrink-0" size={13} />
                                                                <span className="truncate">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5 mt-4">
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                                        className="text-xs font-bold text-primary hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
                                                    >
                                                        <span>{expandedId === service.id ? 'Close Details' : 'Explore Service'}</span>
                                                        <LucideIcons.ArrowRight size={13} />
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
                                                                <p className="text-xs text-gray-300 italic border-l-2 border-primary pl-2.5">
                                                                    "{service.details}"
                                                                </p>
                                                            )}
                                                            {(service.sub_services || []).length > 0 && (
                                                                <div className="space-y-2 pt-2">
                                                                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Included Modules</span>
                                                                    {service.sub_services.map((sub, idx) => (
                                                                        <div key={idx} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px]">
                                                                            <span className="font-bold text-white block">{sub.title}</span>
                                                                            <span className="text-gray-400 text-[10px]">{sub.desc}</span>
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
            <section className="py-12 md:py-16 px-4 sm:px-6 border-t border-white/10 bg-white/[0.01]">
                <div className="max-w-6xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-2"
                    >
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Standard Infrastructure</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white font-space">
                            Advanced Platform Capabilities
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto font-inter">
                            Enterprise-grade features integrated into the SkillDad educational platform.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{ y: -4 }}
                            >
                                <GlassCard className="text-left hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-5 rounded-2xl space-y-3 h-full">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                        <DynamicIcon name={feature.icon_name} className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-1 font-space">{feature.title}</h3>
                                        <p className="text-gray-400 text-xs font-inter leading-relaxed">{feature.description}</p>
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
