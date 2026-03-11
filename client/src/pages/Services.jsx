import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Video,
    Award,
    Brain,
    Zap,
    Shield,
    Globe,
    Clock,
    Target,
    TrendingUp,
    Headphones,
    Code,
    Database,
    Smartphone,
    Cloud,
    Lock,
    CheckCircle,
    Briefcase,
    ClipboardCheck
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const Services = () => {
    const [expandedId, setExpandedId] = React.useState(null);

    const mainServices = [
        {
            id: 1,
            title: "Online Learning Platform",
            description: "Comprehensive e-learning solution with interactive courses, assessments, and progress tracking.",
            icon: BookOpen,
            features: ["Interactive Courses", "Progress Tracking", "Assessments", "Certificates"],
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            details: "Our flagship Online Learning Platform transforms traditional education into a digital-first, universally accessible experience for modern learners.",
            subServices: [
                { title: "Custom Course Builder", desc: "Drag-and-drop structure for educators." },
                { title: "Automated Grading", desc: "Instant feedback on assignments and quizzes." },
                { title: "Discussion Forums", desc: "Built-in community engagement tools." }
            ]
        },
        {
            id: 2,
            title: "Live Virtual Classes",
            description: "Real-time interactive sessions with expert instructors and collaborative learning environments.",
            icon: Video,
            features: ["HD Video Streaming", "Interactive Whiteboard", "Screen Sharing", "Recording"],
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            details: "Bridging the gap between online flexibility and in-person engagement, our Live Virtual Classes provide an immersive 'Studio Mode' experience.",
            subServices: [
                { title: "Studio Interface", desc: "Premium layout with integrated chat & Q&A." },
                { title: "Cloud Recording", desc: "Auto-syncs recordings to the student dashboard." },
                { title: "Breakout Rooms", desc: "Facilitate small group discussions instantly." }
            ]
        },
        {
            id: 3,
            title: "Corporate Training",
            description: "Customized training programs for businesses to upskill their workforce effectively.",
            icon: Users,
            features: ["Custom Curriculum", "Team Management", "Analytics", "Bulk Enrollment"],
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            details: "Empower your workforce with tailored curriculums designed to close skill gaps and align with your strategic business objectives.",
            subServices: [
                { title: "B2B Dashboards", desc: "Track employee KPI and learning metrics." },
                { title: "Compliance Pathways", desc: "Mandatory training tracking and certification." },
                { title: "White-labeling", desc: "Train your team on a fully branded portal." }
            ]
        },
        {
            id: 4,
            title: "AI-Powered Learning",
            description: "Personalized learning paths powered by artificial intelligence and machine learning.",
            icon: Brain,
            features: ["Adaptive Learning", "Smart Recommendations", "Performance Analytics", "Skill Assessment"],
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            details: "Leverage machine learning to create adaptive, highly personalized learning journeys that evolve with the student's pacing and proficiency.",
            subServices: [
                { title: "Smart Tutor", desc: "24/7 AI chatbot assistance for course material." },
                { title: "Content Generation", desc: "AI-assisted quiz and assignment creation." },
                { title: "Predictive Analytics", desc: "Identify at-risk students before they fall behind." }
            ]
        },
        {
            id: 5,
            title: "Internship Programs",
            description: "Connect students with real-world internship opportunities and hands-on industry experience.",
            icon: Briefcase,
            features: ["Industry Partnerships", "Project-Based Learning", "Mentorship Support", "Experience Certificates"],
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            details: "Bridge the gap between academia and industry. We guarantee practical exposure through structured, mentor-led virtual internship programs.",
            subServices: [
                { title: "Live Projects", desc: "Work on real-world industry challenges." },
                { title: "Mentor Tracking", desc: "1-on-1 guidance from seasoned professionals." },
                { title: "Verified Credentials", desc: "Blockchain-backed experience letters." }
            ]
        },
        {
            id: 6,
            title: "Placement Assessments",
            description: "Comprehensive evaluation and preparation for campus placements and job interviews.",
            icon: ClipboardCheck,
            features: ["Mock Interviews", "Aptitude Tests", "Technical Assessments", "Career Guidance"],
            color: "text-teal-500",
            bg: "bg-teal-500/10",
            details: "Ensure your students are career-ready with rigorous, standard-aligned assessments mirroring tier-1 company recruitment drives.",
            subServices: [
                { title: "Code Sandboxes", desc: "Live coding environments for technical tests." },
                { title: "AI Interviewer", desc: "Automated behavioral and technical mock interviews." },
                { title: "Detailed Scorecards", desc: "Granular feedback on specific competency areas." }
            ]
        }
    ];

    const additionalFeatures = [
        {
            title: "24/7 Support",
            description: "Round-the-clock technical and academic support for all users.",
            icon: Headphones,
            color: "rose"
        },
        {
            title: "Mobile Learning",
            description: "Learn on-the-go with our mobile-optimized platform and native apps.",
            icon: Smartphone,
            color: "blue"
        },
        {
            title: "Cloud Infrastructure",
            description: "Scalable and reliable cloud-based infrastructure for seamless learning.",
            icon: Cloud,
            color: "indigo"
        },
        {
            title: "Advanced Security",
            description: "Enterprise-grade security with data encryption and privacy protection.",
            icon: Shield,
            color: "green"
        },
        {
            title: "API Integration",
            description: "Seamless integration with existing systems through robust APIs.",
            icon: Code,
            color: "orange"
        },
        {
            title: "Analytics Dashboard",
            description: "Comprehensive analytics and reporting for insights and decision-making.",
            icon: Database,
            color: "cyan"
        }
    ];

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
                                            <div className={`w-16 h-16 mb-6 rounded-2xl ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <service.icon className={service.color} size={32} />
                                            </div>
                                            <div className={`p-2 rounded-full border border-white/10 ${expandedId === service.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/40'}`}>
                                                {expandedId === service.id ? (
                                                    <svg className="w-5 h-5 rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-space">
                                            {service.title}
                                        </h3>

                                        <p className="text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                                            {service.description}
                                        </p>

                                        <div className="space-y-3">
                                            <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Key Features</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {service.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center space-x-2">
                                                        <CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
                                                        <span className="text-xs md:text-sm text-gray-300">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Content */}
                                    <div className={`border-t border-white/10 bg-black/20 overflow-hidden transition-all duration-500 ${expandedId === service.id ? 'max-h-[800px] opacity-100 p-6 md:p-8' : 'max-h-0 opacity-0 p-0'}`}>
                                        <p className="text-white/80 leading-relaxed mb-6 italic border-l-2 border-primary pl-4">"{service.details}"</p>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Included Sub-Services</h4>
                                        <div className="space-y-4">
                                            {service.subServices?.map((sub, idx) => (
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
                                        <feature.icon className="text-purple-400" size={24} />
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
