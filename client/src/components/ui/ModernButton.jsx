import React from 'react';

const ModernButton = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button', style, ...props }) => {
    const baseStyles = 'group relative px-3 py-1.5 rounded-lg font-inter font-semibold text-xs transition-all inline-flex items-center justify-center space-x-1.5 touch-manipulation shadow-sm';

    const variants = {
        primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]',
        secondary: 'bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-sm active:scale-[0.98]',
        outline: 'border border-primary/40 text-primary hover:bg-primary/5 transition-all duration-200 active:scale-[0.98]',
        ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            style={style}
            {...props}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="relative z-10 flex items-center space-x-1.5">
                {children}
            </span>
        </button>
    );
};

export default ModernButton;
