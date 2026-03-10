import React from 'react';
import { Mail, Phone, Heart } from 'lucide-react';

const DashboardFooter = () => {
    return (
        <footer className="relative bg-black border-t border-white/10 overflow-hidden">
            {/* Animated Gradient Line at Top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDuration: '1s' }} />
            
            {/* Floating Background Gradients */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '1.5s' }} />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-dark/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }} />
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Contact Info */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm group">
                            <Mail size={16} className="flex-shrink-0 group-hover:text-primary transition-colors" />
                            <a href="mailto:support@skilldad.com" className="hover:text-white transition-colors">
                                support@skilldad.com
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm group">
                            <Phone size={16} className="flex-shrink-0 group-hover:text-primary transition-colors" />
                            <a href="tel:+15551234567" className="hover:text-white transition-colors">
                                +1 (555) 123-4567
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="w-full border-t border-white/10"></div>
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-3 text-sm text-gray-400">
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

export default DashboardFooter;
