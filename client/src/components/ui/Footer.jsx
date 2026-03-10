import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Youtube, Heart, Globe } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useUser } from '../../context/UserContext';

const Footer = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const footerRef = useRef(null);

    // Helper to get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'university': return '/university/dashboard';
            case 'partner': return '/partner/dashboard';
            case 'finance': return '/finance/dashboard';
            default: return '/dashboard';
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <footer
            ref={footerRef}
            className={`relative bg-[#0B0F1A] border-t border-white/10 overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Animated Gradient Line at Top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDuration: '1s' }} />

            {/* Floating Background Gradients */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '1.5s' }} />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-dark/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }} />

            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-flex items-center space-x-3 group mb-6">
                            <img
                                src={logoImg}
                                alt="SkillDad Logo"
                                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(192,38,255,0.5)]"
                            />
                            <span className="text-2xl font-black text-white tracking-tight font-space">
                                SkillDad
                            </span>
                        </Link>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm font-inter">
                            Empowering learners and organizations with scalable, modern education solutions.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            {[
                                { icon: Linkedin, href: '#', color: 'hover:bg-primary' },
                                { icon: Twitter, href: '#', color: 'hover:bg-primary-light' },
                                { icon: Youtube, href: '#', color: 'hover:bg-primary-dark' },
                                { icon: Instagram, href: '#', color: 'hover:bg-pink-600' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${social.color} hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 font-inter">
                            Company
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        About Us
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/courses"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Courses
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/platform"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Universities
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Services
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/support"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Support
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 font-inter">
                            Resources
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/courses"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Course Catalog
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/support"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Help Center
                                    </span>
                                </Link>
                            </li>
                            {user ? (
                                <li>
                                    <Link
                                        to={getDashboardLink()}
                                        className="text-primary font-bold hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                                            Go to Dashboard
                                        </span>
                                    </Link>
                                </li>
                            ) : (
                                <>
                                    <li>
                                        <Link
                                            to="/login"
                                            className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                Student Login
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/register"
                                            className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                Get Started
                                            </span>
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li>
                                <button
                                    onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter text-left"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Home
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 font-inter">
                            Legal
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Privacy Policy
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Terms of Service
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/cookies"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Cookie Policy
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/refund-policy"
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center group font-inter"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Refund Policy
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6 font-inter">
                            Contact
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400 text-sm group">
                                <Mail size={16} className="mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                                <a href="mailto:support@skilldad.com" className="hover:text-white transition-colors font-inter">
                                    support@skilldad.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm group">
                                <Phone size={16} className="mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                                <a href="tel:+15551234567" className="hover:text-white transition-colors font-inter">
                                    +1 (555) 123-4567
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="font-inter">
                                    123 Learning Street<br />Education City, EC 12345
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider with Gradient */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400 font-inter">
                        <p>© 2026 SkillDad. All rights reserved.</p>
                        <span className="hidden md:block text-gray-600">•</span>
                        <p className="flex items-center gap-2">
                            Built with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> for modern learning
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </footer>
    );
};

export default Footer;
