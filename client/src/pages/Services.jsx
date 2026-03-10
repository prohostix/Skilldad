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
    const mainServices = [
        {
            id: 1,
            title: "Online Learning Platform",
            description: "Comprehensive e-learning solution with interactive courses, assessments, and progress tracking.",
            icon: BookOpen,
            features: ["Interactive Courses", "Progress Tracking", "Assessments", "Certificates"],
            color: "primary"
        },
        {
            id: 2,
            title: "Live Virtual Classes",
            description: "Real-time interactive sessions with expert instructors and collaborative learning environments.",
            icon: Video,
            features: ["HD Video Streaming", "Interactive Whiteboard", "Screen Sharing", "Recording"],
            color: "emerald"
        },
        {
            id: 3,
            title: "Corporate Training",
            description: "Customized training programs for businesses to upskill their workforce effectively.",
            icon: Users,
            features: ["Custom Curriculum", "Team Management", "Analytics", "Bulk Enrollment"],
            color: "amber"
        },
        {
            id: 4,
            title: "AI-Powered Learning",
            description: "Personalized learning paths powered by artificial intelligence and machine learning.",
            icon: Brain,
            features: ["Adaptive Learning", "Smart Recommendations", "Performance Analytics", "Skill Assessment"],
            color: "purple"
        },
        {
            id: 5,
            title: "Internship Programs",
            description: "Connect students with real-world internship opportunities and hands-on industry experience.",
            icon: Briefcase,
            features: ["Industry Partnerships", "Project-Based Learning", "Mentorship Support", "Experience Certificates"],
            color: "blue"
        },
        {
            id: 6,
            title: "Placement Assessments",
            description: "Comprehensive evaluation and preparation for campus placements and job interviews.",
            icon: ClipboardCheck,
            features: ["Mock Interviews", "Aptitude Tests", "Technical Assessments", "Career Guidance"],
            color: "teal"
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
                                whileHover={{ y: -10 }}
                                className="group"
                            >
                                <GlassCard className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 p-6 md:p-8">
                                    <div className={`w-16 h-16 mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <service.icon className="text-purple-500" size={32} />
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
