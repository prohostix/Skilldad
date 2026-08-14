import React from 'react';
import { motion } from 'framer-motion';

const ModernButton = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) => {
    const baseStyles = 'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-poppins font-semibold text-sm transition-all flex items-center justify-center space-x-2 touch-manipulation min-h-[36px]';

    const variants = {
        primary: 'bg-[#4C1D95] hover:bg-[#3B0764] dark:bg-none dark:bg-gradient-to-r dark:from-primary-dark dark:via-primary dark:to-primary-light text-white hover:scale-[1.02] shadow-md hover:shadow-lg dark:hover:shadow-glow-gradient dark:shadow-glow-purple transition-all duration-300',
        secondary: 'bg-white/5 backdrop-blur-md text-slate-100 border border-primary/40 hover:bg-white/10 hover:border-primary hover:shadow-glow-purple transition-all duration-300',
        outline: 'border-2 border-primary/50 text-slate-100 hover:border-primary hover:bg-primary/10 hover:shadow-glow-pink',
        ghost: 'text-text-secondary hover:bg-white/5 hover:text-primary',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </motion.button>
    );
};

export default ModernButton;
