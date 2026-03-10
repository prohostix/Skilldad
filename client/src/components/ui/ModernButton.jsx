import React from 'react';
import { motion } from 'framer-motion';

const ModernButton = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) => {
    const baseStyles = 'px-6 py-3 rounded-xl font-poppins font-semibold transition-all flex items-center justify-center space-x-2';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white hover:shadow-glow-gradient hover:scale-[1.02] shadow-glow-purple',
        secondary: 'bg-white/5 backdrop-blur-md text-white border border-primary/40 hover:bg-white/10 hover:border-primary hover:shadow-glow-purple transition-all duration-300',
        outline: 'border-2 border-primary/50 text-white hover:border-primary hover:bg-primary/10 hover:shadow-glow-pink',
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
