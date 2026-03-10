import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', title, icon: Icon, onClick, style, lowBlur = false, ...rest }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" },
                borderColor: "rgba(109, 64, 255, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.08)"
            }}
            className={`relative group bg-white/[0.03] ${lowBlur ? 'backdrop-blur-md' : 'backdrop-blur-xl'} rounded-[24px] p-6 border-2 border-primary/20 transition-all duration-500 shadow-2xl ${className}`}
            onClick={onClick}
            style={style}
            {...rest}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(109,40,255,0.15)]" />

            {(title || Icon) && (
                <div className="flex items-center mb-4 space-x-3">
                    {Icon && (
                        <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/20 group-hover:border-primary/50 transition-colors">
                            <Icon size={20} />
                        </div>
                    )}
                    {title && (
                        <h3 className="text-lg font-bold text-white font-space tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
