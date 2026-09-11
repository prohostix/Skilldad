import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Mail, Phone, MapPin, Youtube, Heart, Globe } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useUser } from '../../context/UserContext';

const Footer = ({ forceVisible = false }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const footerRef = useRef(null);

    // Helper to get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'university': return '/university/dashboard';
            case 'partner': return '/partner/dashboard';
            case 'finance': return '/finance/dashboard';
            case 'sales': return '/sales/dashboard';
            default: return '/dashboard';
        }
    };

    return (
        <footer
            ref={footerRef}
            className="relative bg-[#05050A] border-t border-white/5 overflow-hidden pt-8 mt-8"
        >
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-dark/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-6">
                
                {/* Modern Pre-footer Call to Action */}
                <div className="mb-8 pb-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white font-space tracking-tight mb-1">
                            Ready to transform your future?
                        </h2>
                        <p className="text-gray-400 font-inter text-xs md:text-sm max-w-xl">
                            Join thousands of learners and organizations building the skills of tomorrow, today.
                        </p>
                    </div>
                    {user ? (
                        <button onClick={() => navigate(getDashboardLink())} className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold font-inter text-sm shadow-glow-purple hover:scale-105 transition-transform duration-300">
                            Go to Dashboard
                        </button>
                    ) : (
                        <button onClick={() => navigate('/register')} className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold font-inter text-sm shadow-glow-purple hover:scale-105 transition-transform duration-300">
                            Get Started Now
                        </button>
                    )}
                </div>

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-8 mb-6">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="inline-flex items-center space-x-3 group mb-4">
                            <img
                                src={logoImg}
                                alt="SkillDad Logo"
                                className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform duration-500"
                            />
                            <span className="brand-text text-xl font-black font-space text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-widest">
                                SkillDad
                            </span>
                        </Link>

                        <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-xs font-inter">
                            Empowering learners and organizations with scalable, modern education solutions for a rapidly changing world.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            {[
                                { icon: Linkedin, href: 'https://linkedin.com/company/skilldad', glow: 'hover:shadow-[0_0_15px_#0A66C2]', color: 'hover:text-[#0A66C2]' },
                                { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585350489284', glow: 'hover:shadow-[0_0_15px_#1877F2]', color: 'hover:text-[#1877F2]' },
                                { icon: Youtube, href: 'https://youtube.com/@skilldad', glow: 'hover:shadow-[0_0_15px_#FF0000]', color: 'hover:text-[#FF0000]' },
                                { icon: Instagram, href: 'https://www.instagram.com/skilldad_', glow: 'hover:shadow-[0_0_15px_#E1306C]', color: 'hover:text-[#E1306C]' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 ${social.glow} ${social.color}`}
                                >
                                    <social.icon size={16} strokeWidth={2.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links Container */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {/* Company Section */}
                        <div>
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light font-black text-xs uppercase tracking-[0.2em] mb-4 font-space">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Courses', path: '/courses' },
                                    { name: 'Universities', path: '/platform' },
                                    { name: 'Services', path: '/services' },
                                    { name: 'Support', path: '/support' }
                                ].map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                            <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources Section */}
                        <div>
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light font-black text-xs uppercase tracking-[0.2em] mb-4 font-space">
                                Resources
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/courses" className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                        <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                        Course Catalog
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/support" className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                        <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                        Help Center
                                    </Link>
                                </li>
                                {user ? (
                                    <li>
                                        <Link to={getDashboardLink()} className="text-[#7C3AED] font-bold hover:text-[#6D28D9] text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                            <span className="w-0 h-0.5 bg-[#7C3AED] mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                            Go to Dashboard
                                        </Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link to="/login" className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                                <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                                Student Login
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/register" className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                                <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                                Get Started
                                            </Link>
                                        </li>
                                    </>
                                )}
                                <li>
                                    <button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                        <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                        Home
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Legal Section */}
                        <div>
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light font-black text-xs uppercase tracking-[0.2em] mb-4 font-space">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    { name: 'Privacy Policy', path: '/privacy' },
                                    { name: 'Terms of Service', path: '/terms' },
                                    { name: 'Cookie Policy', path: '/cookies' },
                                    { name: 'Refund Policy', path: '/refund-policy' }
                                ].map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white text-xs transition-all duration-200 inline-flex items-center group font-inter">
                                            <span className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light font-black text-xs uppercase tracking-[0.2em] mb-4 font-space">
                                Contact
                            </h3>
                            <ul className="space-y-3">

                                <li>
                                    <a href="tel:+916238067220" className="text-gray-400 hover:text-white text-xs transition-colors duration-200 flex items-center group font-inter">
                                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2 group-hover:bg-primary/20 transition-colors">
                                            <Phone size={12} className="group-hover:text-primary" />
                                        </div>
                                        <span>+91 6238067220</span>
                                    </a>
                                </li>
                                <li>
                                    <div className="text-gray-400 text-xs flex items-start group font-inter mt-1">
                                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2 mt-0.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <MapPin size={12} className="group-hover:text-primary" />
                                        </div>
                                        <span className="leading-relaxed">
                                            A-18, S1, Second Floor,<br />Sector 59, Noida<br />UP 201301
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-gray-500 font-inter text-center md:text-left">
                        © 2026 SkillDad. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">

                        <a href="mailto:support@skilldad.com" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors duration-200 font-inter">
                            <Mail size={11} />
                            support@skilldad.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
