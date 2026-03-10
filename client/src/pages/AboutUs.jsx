import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Globe, Award, Users, Book, Target } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 md:pt-40 pb-0 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-8 font-space">
                            <span className="text-gray-400">Our</span>{' '}
                            <span className="text-white">Story</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-300 mb-6 max-w-4xl mx-auto font-inter px-4 leading-relaxed">
                            We are on a mission to revolutionize the educational landscape by bridging the gap between talent, institutions, and industry leaders through high-fidelity digital learning experiences.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-12 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            {
                                title: 'Our Mission',
                                description: 'To democratize quality education and make advanced learning accessible to everyone, everywhere, regardless of their background.',
                                icon: Rocket,
                                color: '#5B5CFF'
                            },
                            {
                                title: 'Our Vision',
                                description: 'Creating a global ecosystem where knowledge flows seamlessly between world-class institutions and ambitious learners.',
                                icon: Globe,
                                color: '#7A5CFF'
                            },
                            {
                                title: 'Our Values',
                                description: 'Innovation, accessibility, excellence, and continuous growth drive every decision we make at SkillDad.',
                                icon: Award,
                                color: '#B05CFF'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <GlassCard className="h-full group hover:bg-white/[0.05] transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg border border-white/10" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                        <item.icon size={28} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 font-space">{item.title}</h3>
                                    <p className="text-gray-300 font-inter leading-relaxed">{item.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-20 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-xl md:text-3xl font-black text-white mb-6 font-jakarta">
                                High-Fidelity <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">Educational Matrix</span>
                            </h2>
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                Behind SkillDad is a team of educators, technologists, and industry experts dedicated to building the most advanced learning management system in the world. We don't just host courses; we engineer success paths.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: Users, label: '1.2M+ Active Students' },
                                    { icon: Book, label: '450+ Institutional Programs' },
                                    { icon: Target, label: '94% Career Transition Rate' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex items-center space-x-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <stat.icon size={20} />
                                        </div>
                                        <span className="text-white font-bold tracking-wide text-sm md:text-base">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent blur-[100px] rounded-full"></div>
                            <GlassCard className="!p-0 overflow-hidden border-white/20">
                                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                                    <Users size={120} className="text-white/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="p-6 text-center">
                                            <p className="text-white/60 text-sm uppercase tracking-[0.4em] font-black mb-2">Our Foundation</p>
                                            <h4 className="text-white text-3xl font-black font-space">Global Community</h4>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-8 font-jakarta">
                            Ready to join the revolution?
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <ModernButton onClick={() => window.location.href = '/register'} className="px-12 py-5 !text-[14px]">
                                Join the Matrix
                            </ModernButton>
                            <button onClick={() => window.location.href = '/support'} className="text-white font-bold uppercase tracking-widest text-xs hover:text-primary transition-colors">
                                Contact Our Team
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
