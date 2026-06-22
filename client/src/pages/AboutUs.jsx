import React from 'react';
import axios from 'axios';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Rocket, Globe, Award, Users, Book, Target, Linkedin, Loader2, Activity } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const floatAnimation = {
    y: ["-3%", "3%"],
    transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
    }
};

const TeamCard = ({ member }) => (
    <motion.div
        variants={fadeInUp}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        <GlassCard className="relative group overflow-hidden flex flex-col items-center text-center p-6 lg:p-8 !bg-[#0A0A10]/90 backdrop-blur-xl border-[#C026FF]/20 hover:border-[#C026FF]/60 transition-all duration-500 rounded-3xl shadow-2xl hover:shadow-[0_0_30px_rgba(192,38,255,0.15)] h-full">
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Image Section */}
            <div className="relative mb-6 w-full flex justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-white/10 group-hover:border-primary/50 transition-all duration-500 relative z-10 overflow-hidden bg-[#0A0A10]">
                    <img
                        src={
                            (member.imageUrl || member.image) 
                                ? ( (member.imageUrl || member.image).startsWith('http') 
                                    ? (member.imageUrl || member.image) 
                                    : `${axios.defaults.baseURL || ''}${member.imageUrl || member.image}` )
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=5B5CFF&color=fff&bold=true`
                        }
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-all duration-700"

                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=5B5CFF&color=fff&bold=true`;
                        }}
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="relative z-10 w-full mb-3 flex-grow flex flex-col items-center">
                <h3 className="text-lg md:text-xl font-black text-white mb-1.5 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary-light transition-all duration-500">{member.name}</h3>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-primary/90 mb-1.5">{member.role}</p>
                
                {member.university && (
                    <div className="mt-3 pt-3 border-t border-white/5 w-full">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-white/40 leading-relaxed italic">
                            {member.university}
                        </p>
                    </div>
                )}
                
                {member.bio && (
                    <p className="text-xs text-gray-400 font-inter leading-relaxed px-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-500 mt-3">
                        {member.bio}
                    </p>
                )}
            </div>

            {/* Social Link */}
            {member.linkedinUrl && (
                <div className="mt-auto pt-5 w-full flex justify-center border-t border-white/5 relative z-10">
                    <a 
                        href={member.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-[#0077B5] hover:shadow-[0_0_15px_rgba(0,119,181,0.5)] transition-all duration-300 transform hover:scale-110"
                    >
                        <Linkedin size={16} fill="currentColor" stroke="none" />
                    </a>
                </div>
            )}
        </GlassCard>
    </motion.div>
);

const AboutUs = () => {
    const [team, setTeam] = React.useState([]);
    const [cms, setCms] = React.useState({});
    const [loading, setLoading] = React.useState(true);



    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [teamRes, cmsRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/cms/about_us')
                ]);
                setTeam(teamRes.data);
                setCms(cmsRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getIcon = (iconName, fallback = LucideIcons.Rocket) => {
        const Icon = LucideIcons[iconName];
        return Icon || fallback;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05030B] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
            </div>
        );
    }

    const directors = team.filter(m => m.display_target === 'ABOUT_DIRECTOR' || (!m.display_target && (m.category === 'DIRECTOR' || !m.category)));
    const advisory = team.filter(m => m.display_target === 'ABOUT_ADVISORY' || (!m.display_target && m.category === 'ADVISORY'));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] overflow-hidden">
            <Navbar />

            {/* Floating Background Elements */}
            <motion.div animate={floatAnimation} className="absolute top-[10%] left-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <motion.div animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }} className="absolute top-[40%] right-[0%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#C026FF]/5 blur-[150px] rounded-full pointer-events-none -z-10" />

            {/* Hero Section */}
            <section className="relative pt-20 md:pt-28 pb-10 px-4 md:px-6 flex flex-col items-center justify-center">
                <motion.div 
                    className="max-w-4xl mx-auto text-center z-10 w-full"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 font-space tracking-tight leading-tight">
                            {cms.hero?.title && cms.hero.title.includes(' ') ? (

                                <>
                                    <span className="opacity-40">{cms.hero.title.split(' ')[0]}</span>{' '}
                                    <span className="premium-gradient-text">{cms.hero.title.split(' ').slice(1).join(' ')}</span>
                                </>
                            ) : (
                                <span className="premium-gradient-text">{cms.hero?.title || 'Our Story'}</span>

                            )}
                        </h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-sm md:text-lg text-gray-400 max-w-2xl mx-auto font-inter px-4 leading-relaxed"
                        >
                            {cms.hero?.story || 'We are on a mission to revolutionize the educational landscape...'}
                        </motion.p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Core Values Section */}
            <section className="pt-8 pb-12 md:pb-20 px-4 md:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {[
                            { ...cms.mission, Icon: getIcon(cms.mission?.icon, Rocket) },
                            { ...cms.vision, Icon: getIcon(cms.vision?.icon, Globe) },
                            { ...cms.values, Icon: getIcon(cms.values?.icon, Award) }
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeInUp} whileHover={{ y: -5 }}>
                                <GlassCard className="h-full group hover:bg-white/[0.04] transition-all duration-300 p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-white/5" style={{ backgroundColor: `${item.color || '#5B5CFF'}15`, color: item.color || '#5B5CFF' }}>
                                        <item.Icon size={20} strokeWidth={2.5} className="group-hover:drop-shadow-[0_0_8px_rgba(currentColor)]" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-space">{item.title}</h3>
                                    <p className="text-[11px] md:text-xs text-gray-400 font-inter leading-relaxed">{item.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-20 md:py-32 px-4 md:px-6 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-6 font-jakarta leading-tight">
                                {cms.impact_hero?.title && cms.impact_hero.title.includes(' ') ? (

                                    <>
                                        {cms.impact_hero.title.split(' ').slice(0, -1).join(' ')} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">
                                            {cms.impact_hero.title.split(' ').slice(-1)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark">
                                        {cms.impact_hero?.title || 'Educational Matrix'}
                                    </span>

                                )}
                            </h2>
                            <p className="text-sm md:text-base text-gray-400 mb-5 leading-relaxed max-w-lg">
                                {cms.impact_hero?.subtitle || "Behind SkillDad is a team of educators..."}
                            </p>
                            
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                {[
                                    { icon: Users, label: '1.2M+ Active Students' },
                                    { icon: Book, label: '450+ Institutional Programs' },
                                    { icon: Target, label: '94% Career Transition Rate' }
                                ].map((stat, idx) => (
                                    <motion.div variants={fadeInUp} key={idx} className="flex items-center space-x-4 bg-white/[0.02] p-3 md:p-4 rounded-2xl border border-white/5 w-fit pr-8 hover:bg-white/[0.04] transition-colors">
                                        <div className="p-2 md:p-2.5 bg-primary/10 rounded-xl text-primary">
                                            <stat.icon size={20} />
                                        </div>
                                        <span className="text-gray-200 font-bold text-sm md:text-base tracking-wide">{stat.label}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-full h-full min-h-[300px] flex items-center justify-center"
                        >
                            <motion.div animate={floatAnimation} className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-purple-500/10 to-transparent blur-[80px] rounded-full"></motion.div>
                            <GlassCard className="relative w-full max-w-sm aspect-square !p-0 overflow-hidden border-white/10 shadow-2xl group z-10 !bg-gradient-to-br !from-[#080810] !to-[#120B1F] !rounded-[40px]">
                                <div className="flex flex-col items-center justify-center w-full h-full p-6">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        className="w-24 h-24 md:w-28 md:h-28 mb-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(91,92,255,0.2)]"
                                    >
                                        <Users size={40} className="text-primary" />
                                    </motion.div>
                                    <div className="text-center w-full">
                                        <p className="text-primary/80 text-[10px] uppercase tracking-[0.4em] font-black mb-2">Our Foundation</p>
                                        <h4 className="text-white text-xl md:text-2xl font-black font-space">Global Community</h4>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Directors Section */}
            {directors.length > 0 && (
                <section className="py-20 md:py-32 px-4 md:px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mb-4 uppercase tracking-tighter">
                                {cms.directors_header?.title && cms.directors_header.title.includes(' ') ? (

                                    <>
                                        {cms.directors_header.title.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{cms.directors_header.title.split(' ').slice(-1)}</span>
                                    </>
                                ) : (
                                    <span className="text-primary">{cms.directors_header?.title || 'Directors & CEO'}</span>

                                )}
                            </h2>
                            {cms.directors_header?.subtitle && (
                                <p className="text-sm md:text-base text-gray-500 font-inter max-w-2xl mx-auto mb-6 italic leading-relaxed">
                                    "{cms.directors_header.subtitle}"
                                </p>
                            )}
                            <div className="h-1.5 w-16 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full mt-4"></div>
                        </motion.div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                        >
                            {directors.map((member) => (
                                <TeamCard key={member._id} member={member} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Advisory Board Section */}
            {advisory.length > 0 && (
                <section className="py-20 md:py-32 px-4 md:px-6 relative border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white font-space mb-4 uppercase tracking-tighter">
                                {cms.advisory_header?.title && cms.advisory_header.title.includes(' ') ? (

                                    <>
                                        {cms.advisory_header.title.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{cms.advisory_header.title.split(' ').slice(-1)}</span>
                                    </>
                                ) : (
                                    <span className="text-primary">{cms.advisory_header?.title || 'Advisory Board'}</span>

                                )}
                            </h2>
                            {cms.advisory_header?.description && (
                                <p className="text-sm md:text-base text-gray-500 font-inter max-w-2xl mx-auto mb-6 italic leading-relaxed">
                                    "{cms.advisory_header.description}"
                                </p>
                            )}
                            <div className="h-1.5 w-16 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full mt-4"></div>
                        </motion.div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                        >
                            {advisory.map((member) => (
                                <TeamCard key={member._id} member={member} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-24 md:py-32 px-4 md:px-6 border-t border-white/5 relative overflow-hidden">
                <motion.div animate={floatAnimation} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10"></motion.div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-8 font-jakarta">
                            Ready to join the revolution?
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <ModernButton onClick={() => window.location.href = '/register'} className="px-10 py-4 w-full sm:w-auto !text-xs shadow-[0_0_30px_rgba(91,92,255,0.3)] hover:shadow-[0_0_50px_rgba(91,92,255,0.5)]">
                                Join the Matrix
                            </ModernButton>
                            <button onClick={() => window.location.href = '/support'} className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors py-4 px-6 rounded-xl hover:bg-white/5 w-full sm:w-auto">
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
