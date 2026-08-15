import React from 'react';

const ModernButton = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) => {
    const baseStyles = 'group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-poppins font-semibold text-sm transition-all flex items-center justify-center space-x-2 touch-manipulation min-h-[36px]';

    const variants = {
        primary: 'bg-[#4C1D95] dark:bg-none dark:bg-gradient-to-r dark:from-primary-dark dark:via-primary dark:to-primary-light text-white shadow-md hover:shadow-lg dark:hover:shadow-glow-gradient dark:shadow-glow-purple transition-all duration-300 before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.5)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]',
        secondary: 'bg-white/5 backdrop-blur-md text-slate-100 border border-primary/40 hover:bg-white/10 hover:border-primary hover:shadow-glow-purple transition-all duration-300',
        outline: 'border-2 border-primary/50 text-slate-100 hover:border-primary hover:bg-primary/10 hover:shadow-glow-pink',
        ghost: 'text-text-secondary hover:bg-white/5 hover:text-primary',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="relative z-10 flex items-center space-x-2">
                {children}
            </span>
        </button>
    );
};

export default ModernButton;
