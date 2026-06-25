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
            <section className="pt-20 md:pt-24 pb-4 md:pb-6 px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white mb-2 font-space">
                            <span className="opacity-40">Our</span>{' '}
                            <span className="premium-gradient-text">Services</span>
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 mb-4 max-w-2xl mx-auto font-inter px-4">
                            Comprehensive learning solutions designed to empower individuals, teams, and organizations — with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary font-black">
                                Placement Guaranteed
                            </span>.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURED: Placement Service ───────────────────────── */}
            {mainServices.length > 0 && (() => {
                const featured = mainServices[0];
                const rest = mainServices.slice(1);
                return (
                    <>
                        <section className="pb-8 px-6">
                            <div className="max-w-5xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7 }}
                                >


                                    <GlassCard className="!bg-gradient-to-br from-primary/10 via-white/[0.04] to-purple-900/10 border-primary/40 hover:border-primary/70 ring-1 ring-primary/20 p-0 overflow-hidden group transition-all duration-500 hover:shadow-[0_0_60px_rgba(91,92,255,0.2)] rounded-3xl">
                                        <div className="grid lg:grid-cols-2 gap-0">
                                            {/* Left — Info */}
                                            <div className="p-4 md:p-5">
                                                <div className={`w-10 h-10 mb-3 rounded-xl ${featured.bg_class || 'bg-primary/10'} flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-primary/20`}>
                                                    <DynamicIcon name={featured.icon_name} className={featured.color_class || 'text-primary'} size={20} />
                                                </div>
                                                <h2 className="text-xl md:text-2xl font-black text-white mb-2 font-space leading-tight">
                                                    {featured.title}
                                                </h2>
                                                <p className="text-gray-400 mb-3 leading-relaxed text-xs max-w-lg">
                                                    {featured.description}
                                                </p>
                                                {featured.details && (
                                                    <p className="text-white/60 italic border-l-2 border-primary pl-3 mb-3 text-xs leading-relaxed">
                                                        "{featured.details}"
                                                    </p>
                                                )}
                                                <ModernButton
                                                    onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
                                                    className="!px-4 !py-1.5 !text-[10px]"
                                                >
                                                    {expandedId === featured.id ? 'Hide Details' : 'View Full Details'}
                                                </ModernButton>
                                            </div>

                                            {/* Right — Features */}
                                            <div className="p-4 md:p-5 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 flex flex-col justify-center">
                                                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                                                    Key Highlights
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1.5">
                                                    {(featured.features || []).map((feature, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-primary/30 transition-all">
                                                            <LucideIcons.CheckCircle className="text-emerald-400 flex-shrink-0" size={12} />
                                                            <span className="text-[11px] text-gray-300 font-medium">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Sub-services expanded */}
                                                {expandedId === featured.id && (featured.sub_services || []).length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-6 pt-6 border-t border-white/10"
                                                    >
                                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Included Sub-Services</h4>
                                                        <div className="space-y-3">
                                                            {featured.sub_services.map((sub, idx) => (
                                                                <div key={idx} className="flex items-start space-x-3">
                                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                                    <div>
                                                                        <h5 className="font-bold text-white text-xs">{sub.title}</h5>
                                                                        <p className="text-white/50 text-[10px] mt-0.5">{sub.desc}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </div>
                        </section>

                        {/* ── Remaining Main Services ─────────────────────── */}
                        <section className="pb-16 px-6">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6">More Services</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                    {rest.map((service, index) => (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group h-full"
                                        >
                                            <GlassCard className={`h-full transition-all duration-500 overflow-hidden rounded-3xl ${expandedId === service.id ? 'ring-1 ring-primary/50 shadow-glow-purple bg-white/10' : 'hover:shadow-2xl hover:shadow-primary/10'} p-0`}>
                                                <div className="p-5 md:p-6 cursor-pointer flex flex-col h-full" onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`w-12 h-12 rounded-xl ${service.bg_class || 'bg-primary/10'} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                                            <DynamicIcon name={service.icon_name} className={service.color_class || 'text-primary'} size={24} />
                                                        </div>
                                                        <div className={`p-1.5 rounded-full border border-white/10 ${expandedId === service.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/40'}`}>
                                                            <DynamicIcon name="ChevronDown" className={`w-4 h-4 transition-transform ${expandedId === service.id ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-space">{service.title}</h3>
                                                    <p className="text-gray-400 mb-4 leading-relaxed text-xs flex-grow">{service.description}</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
                                                        {(service.features || []).slice(0, expandedId === service.id ? service.features.length : 4).map((feature, idx) => (
                                                            <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-all">
                                                                <LucideIcons.CheckCircle className="text-emerald-400 flex-shrink-0" size={12} />
                                                                <span className="text-[11px] md:text-xs text-gray-300 font-medium">{feature}</span>
                                                            </div>
                                                        ))}
                                                        {service.features && service.features.length > 4 && expandedId !== service.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedId(service.id); }}
                                                                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all w-full"
                                                            >
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">+{service.features.length - 4} More</span>
                                                                <LucideIcons.ArrowRight size={12} className="text-primary" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`border-t border-white/10 bg-black/20 overflow-hidden transition-all duration-500 ${expandedId === service.id ? 'max-h-[800px] opacity-100 p-5 md:p-6' : 'max-h-0 opacity-0 p-0'}`}>
                                                    <p className="text-white/80 leading-relaxed mb-4 text-xs italic border-l-2 border-primary pl-3">"{service.details}"</p>
                                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Included Sub-Services</h4>
                                                    <div className="space-y-3">
                                                        {(service.sub_services || []).map((sub, idx) => (
                                                            <div key={idx} className="flex items-start space-x-2.5">
                                                                <div className="mt-1 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                                                <div>
                                                                    <h5 className="font-bold text-white text-xs">{sub.title}</h5>
                                                                    <p className="text-white/50 text-[10px] mt-0.5">{sub.desc}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
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
            <section className="pb-16 px-6 border-t border-white/5 pt-16 bg-white/[0.01]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-lg md:text-xl lg:text-3xl font-black text-white mb-4 font-space">
                            <span className="opacity-40">Advanced</span>{' '}
                            <span className="text-white">Features</span>
                        </h2>
                        <p className="text-sm text-gray-400 max-w-2xl mx-auto px-4">
                            Discover the powerful features that make our platform the preferred choice for modern learning.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <GlassCard className="text-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-5 rounded-2xl">
                                    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-purple-500/10 flex items-center justify-center shadow-sm">
                                        <DynamicIcon name={feature.icon_name} className="text-purple-400" size={20} />
                                    </div>
                                    <h3 className="text-sm md:text-base font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
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
