import React, { useEffect } from 'react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, CheckCircle, Info, RefreshCcw, CreditCard, ExternalLink, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const LegalPage = ({ title, subtitle, icon: Icon, content, lastUpdated }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#020205] text-white selection:bg-primary/30 selection:text-white">
            <Navbar />

            {/* Premium Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[80px]" />
            </div>

            <main className="relative pt-32 pb-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">

                    {/* Header Section */}
                    <div className="relative mb-16 text-center">
                        {Icon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 mb-6 shadow-2xl"
                            >
                                <Icon size={32} className="text-primary animate-pulse" />
                            </motion.div>
                        )}

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black font-space tracking-tight mb-4 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
                        >
                            {title}
                        </motion.h1>

                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg md:text-xl text-gray-400 font-inter max-w-2xl mx-auto mb-6"
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center gap-3 py-2 px-4 rounded-full bg-white/5 border border-white/10 w-fit mx-auto"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Version 2.4 — Updated {lastUpdated}</span>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-16">

                        {/* Table of Contents - Left Sidebar */}
                        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
                            <div className="space-y-6">
                                <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">On this page</p>
                                <nav className="space-y-3">
                                    {content.map((section, idx) => (
                                        <a
                                            key={idx}
                                            href={`#section-${idx}`}
                                            className="block text-sm text-gray-500 hover:text-white transition-all duration-300 group flex items-center gap-2"
                                        >
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                            {section.heading}
                                        </a>
                                    ))}
                                </nav>

                                <div className="pt-8 border-t border-white/5">
                                    <GlassCard className="!p-6 !bg-primary/5 border-primary/20">
                                        <p className="text-xs font-bold text-white mb-2 font-space">Need Clarification?</p>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-4">Our legal team is available for platform synchronization queries.</p>
                                        <a href="mailto:legal@skilldad.com" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
                                            Open Request <ExternalLink size={12} />
                                        </a>
                                    </GlassCard>
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="lg:col-span-9">
                            <div className="space-y-16">
                                {content.map((section, idx) => (
                                    <motion.section
                                        key={idx}
                                        id={`#section-${idx}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="relative"
                                    >
                                        <div className="absolute -left-8 top-0 h-full w-px bg-gradient-to-b from-primary/50 via-secondary/20 to-transparent" />

                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <span className="text-primary font-space font-black text-2xl opacity-20">0{idx + 1}</span>
                                                <h2 className="text-2xl md:text-3xl font-black text-white font-space tracking-tight">
                                                    {section.heading}
                                                </h2>
                                            </div>

                                            <div className="space-y-6">
                                                <p className="text-base text-gray-400 font-inter leading-relaxed">
                                                    {section.text}
                                                </p>

                                                {section.subpoints && (
                                                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                                                        {section.subpoints.map((point, pIdx) => (
                                                            <div key={pIdx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                                        <CheckCircle size={12} />
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 font-medium leading-relaxed">{point}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.section>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Footer - Tightened spacing */}
                    <div className="mt-16 pt-16 border-t border-white/10 text-center max-w-4xl mx-auto">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-4xl font-black text-white font-space mb-8 tracking-tight bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent"
                        >
                            Stay synchronized with our updates.
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 mb-12 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                        >
                            We transparently communicate all policy changes to our institutional partners and individual learners through our enterprise notification node.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center"
                        >
                            <button onClick={() => window.print()} className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-3 backdrop-blur-xl">
                                <FileText size={20} /> Download as PDF
                            </button>
                            <a href="mailto:support@skilldad.com" className="px-10 py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-[0_0_30px_rgba(110,40,255,0.4)] flex items-center justify-center gap-3">
                                Contact Support <ArrowRight size={20} />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export const PrivacyPolicy = () => (
    <LegalPage
        title="Privacy Policy"
        lastUpdated="February 25, 2026"
        content={[
            {
                heading: "Data Harvesting Node",
                text: "We collect specific identifiers to ensure your learning experience is synchronized across the SkillDad ecosystem. This includes technical telemetry and personal credentials provided during initialization.",
                subpoints: [
                    "Biometric authentication metadata for secure login",
                    "Real-time neuro-learning pace telemetry",
                    "Institutional affiliation identifiers",
                    "Transaction history for certification issuance"
                ]
            },
            {
                heading: "Processing Algorithms",
                text: "Your information is processed through our secure computing cluster to optimize course delivery and personalize the Aura AI assistant's responses to your specific needs.",
                subpoints: [
                    "Dynamic content scaling based on progress",
                    "Automated certification verification protocols",
                    "Risk mitigation and fraud prevention detection",
                    "Advanced analytics for university performance"
                ]
            },
            {
                heading: "Secure-Core Protection",
                text: "We utilize multi-layer encryption and decentralized storage patterns to ensure that unauthorized nodes cannot access your student identity or academic record.",
                subpoints: [
                    "AES-256 military-grade encryption for all data",
                    "SOC-2 Type II compliant server architecture",
                    "Mandatory multi-factor initialization for admins",
                    "Zero-knowledge proof patterns for sensitive data"
                ]
            }
        ]}
    />
);

export const TermsOfService = () => (
    <LegalPage
        title="Terms of Service"
        subtitle="The foundational framework for our institutional and individual synergy."
        lastUpdated="February 25, 2026"
        content={[
            {
                heading: "User Synchronization",
                text: "By accessing the SkillDad platform, you agree to abide by our governance protocols. Unauthorized access to source nodes or misuse of AI tools will result in session termination.",
                subpoints: [
                    "Legitimate identity verification is required",
                    "One-user-per-synchronization node policy",
                    "Proper use of platform-wide bandwidth",
                    "Prohibition of content extraction attempts"
                ]
            },
            {
                heading: "Intellectual Sovereignty",
                text: "All 3D assets, interactive curriculum nodes, and neural engine algorithms are the protected intellectual property of SkillDad and its partner universities.",
                subpoints: [
                    "Limited license for individual educational use",
                    "Strict prohibition of commercial distribution",
                    "Proper attribution for research publications",
                    "Copyright protection for live-stream recordings"
                ]
            },
            {
                heading: "Platform Uptime & Maintenance",
                text: "We strive for 99.99% system availability. Essential maintenance windows are synchronized across timezones to minimize disruption to global learning cycles.",
                subpoints: [
                    "Automated recovery for failed session nodes",
                    "Scheduled updates for core neural algorithms",
                    "Transparency in platform telemetry status",
                    "Response protocols for unexpected downtime"
                ]
            }
        ]}
    />
);

export const CookiePolicy = () => (
    <LegalPage
        title="Cookie Policy"
        lastUpdated="February 25, 2026"
        content={[
            {
                heading: "Essential session nodes",
                text: "These cookies are the backbone of our secure authentication framework. They maintain your encrypted portal connection while you navigate between the course catalog and your dashboard.",
                subpoints: [
                    "Secure authentication tokens",
                    "CSRF protection for state-changing actions",
                    "Cloud-load balancing identifiers",
                    "Real-time socket.io session persistence"
                ]
            },
            {
                heading: "Performance Telemetry",
                text: "We use performance nodes to analyze how our 3D interfaces render on various devices, ensuring that our complex canvas animations remain fluid and lag-free.",
                subpoints: [
                    "3D rendering speed telemetry",
                    "Regional API latency mapping",
                    "Bug-reporting and error logs",
                    "Layout responsiveness diagnostics"
                ]
            }
        ]}
    />
);

export const RefundPolicy = () => (
    <LegalPage
        title="Refund Policy"
        subtitle="Transparent protocols for financial reconciliation and course reversals."
        lastUpdated="February 25, 2026"
        content={[
            {
                heading: "Individual Enrollment",
                text: "We offer a 7-day synchronization reversal period. If the course curriculum does not align with your educational goals, your transaction can be reconciled.",
                subpoints: [
                    "Full refund if under 15% course completion",
                    "Credit transfer to alternative curriculum nodes",
                    "Automatic reversal for failed payment attempts",
                    "Support for all global gateway providers"
                ]
            },
            {
                heading: "Non-Refundable Assets",
                text: "Certain premium certification keys and personalized AI mentoring tokens are consumed upon generation and cannot be returned to the inventory.",
                subpoints: [
                    "Official academic certification issuance",
                    "Third-party external examination keys",
                    "Personalized 1-on-1 expert session codes",
                    "Specialized administrative processing fees"
                ]
            }
        ]}
    />
);
