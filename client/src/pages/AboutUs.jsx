import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Rocket, Globe, Award, Users, Book, Target, Linkedin } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const TeamCard = ({ member, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
    >
        <GlassCard className="relative group overflow-hidden flex flex-col items-center text-center p-10 !bg-[#0A0A10] border-[#C026FF]/20 hover:border-[#C026FF]/50 transition-all duration-500 rounded-[40px] shadow-2xl hover:shadow-[#C026FF]/10">
            {/* Image Section */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="w-36 h-36 rounded-full p-1 border-2 border-white/5 group-hover:border-primary transition-all duration-500 relative z-10 mx-auto overflow-hidden">
                    <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=5B5CFF&color=fff&bold=true`;
                        }}
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="relative z-10 w-full mb-4">
                <h3 className="text-2xl font-black text-white mb-2 font-space tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {member.name}
                </h3>
                <p className="text-[11px] text-primary font-black uppercase tracking-[0.3em] mb-4 opacity-80">
                    {member.role}
                </p>
                
                {member.bio && (
                    <p className="text-sm text-gray-400 font-inter leading-relaxed px-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                        {member.bio}
                    </p>
                )}
            </div>

            {/* Social Link */}
            {member.linkedinUrl && (
                <div className="mt-auto pt-6 w-full flex justify-center border-t border-white/5">
                    <a 
                        href={member.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-[#0077B5] hover:bg-[#0077B5]/10 transition-all duration-300"
                    >
                        <Linkedin size={20} fill="currentColor" stroke="none" />
                    </a>
                </div>
            )}
        </GlassCard>
    </motion.div>
);
const AboutUs = () => {
    const [team, setTeam] = React.useState([]);

    React.useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get('/api/public/directors');
                setTeam(res.data);
            } catch (err) {
                console.error('Failed to fetch team members:', err);
            }
        };
        fetchTeam();
    }, []);

    const directors = team.filter(m => m.category === 'DIRECTOR' || !m.category);
    const advisory = team.filter(m => m.category === 'ADVISORY');

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

            {/* Directors Section */}
            {directors.length > 0 && (
                <section className="py-24 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mb-4 uppercase tracking-tighter">Directors <span className="text-primary">&</span> CEO</h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {directors.map((member, i) => (
                                <TeamCard key={member._id} member={member} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Advisory Board Section */}
            {advisory.length > 0 && (
                <section className="py-24 px-6 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mb-4 uppercase tracking-tighter">Advisory <span className="text-primary">Board</span></h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {advisory.map((member, i) => (
                                <TeamCard key={member._id} member={member} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

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
