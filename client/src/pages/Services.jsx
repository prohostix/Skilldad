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
            <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 font-space">
                            <span className="text-gray-400">Our</span>{' '}
                            <span className="text-white">Services</span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-4xl mx-auto font-inter px-4">
                            Comprehensive learning solutions designed to empower individuals, teams, and organizations with cutting-edge educational technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Services */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                        {mainServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <GlassCard className={`h-full transition-all duration-500 overflow-hidden ${expandedId === service.id ? 'ring-2 ring-primary/50 shadow-glow-purple bg-white/10' : 'hover:shadow-2xl hover:shadow-primary/10'} p-0`}>
                                    <div className="p-6 md:p-8 cursor-pointer" onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}>
                                        <div className="flex items-start justify-between">
                                            <div className={`w-16 h-16 mb-6 rounded-2xl ${service.bg_class || 'bg-primary/10'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <DynamicIcon name={service.icon_name} className={service.color_class || 'text-primary'} size={32} />
                                            </div>
                                            <div className={`p-2 rounded-full border border-white/10 ${expandedId === service.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/40'}`}>
                                                {expandedId === service.id ? (
                                                    <DynamicIcon name="ChevronDown" className="w-5 h-5 rotate-180 transition-transform" />
                                                ) : (
                                                    <DynamicIcon name="ChevronDown" className="w-5 h-5 transition-transform" />
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-space">
                                            {service.title}
                                        </h3>

                                        <p className="text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                                            {service.description}
                                        </p>

                                        <div className="space-y-4">
                                            <h4 className="text-xs md:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-accent to-white uppercase tracking-wider mb-2">Key Highlights</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {(service.features || []).slice(0, expandedId === service.id ? service.features.length : 4).map((feature, idx) => (
                                                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-all">
                                                        <LucideIcons.CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
                                                        <span className="text-xs md:text-sm text-gray-300 font-medium">{feature}</span>
                                                    </div>
                                                ))}
                                                {service.features && service.features.length > 4 && expandedId !== service.id && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedId(service.id);
                                                        }}
                                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group/more w-full"
                                                    >
                                                        <span className="text-xs font-black text-primary uppercase tracking-widest">+{service.features.length - 4} Advanced Features</span>
                                                        <LucideIcons.ArrowRight size={14} className="text-primary group-hover/more:translate-x-1 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                    
                                    {/* Expanded Content */}
                                    <div className={`border-t border-white/10 bg-black/20 overflow-hidden transition-all duration-500 ${expandedId === service.id ? 'max-h-[800px] opacity-100 p-6 md:p-8' : 'max-h-0 opacity-0 p-0'}`}>
                                        <p className="text-white/80 leading-relaxed mb-6 italic border-l-2 border-primary pl-4">"{service.details}"</p>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Included Sub-Services</h4>
                                        <div className="space-y-4">
                                            {(service.sub_services || []).map((sub, idx) => (
                                                <div key={idx} className="flex items-start space-x-3">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm">{sub.title}</h5>
                                                        <p className="text-white/50 text-xs mt-0.5">{sub.desc}</p>
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

            {/* Additional Features */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-white mb-6 font-space">
                            <span className="text-gray-400">Advanced</span>{' '}
                            <span className="text-white">Features</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                            Discover the powerful features that make our platform the preferred choice for modern learning.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <GlassCard className="text-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <DynamicIcon name={feature.icon_name} className="text-purple-400" size={24} />
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
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
