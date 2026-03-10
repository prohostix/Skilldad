import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/logo.png';

const SkillDadLogo = ({ className = "w-full h-full", ...props }) => {
    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            {/* Clear Aura Pulse (Sharp, no blur) */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-[-10%] bg-primary/10 rounded-full pointer-events-none"
            />

            {/* Sharp Logo Image */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <motion.img
                    src={logoImg}
                    alt="SkillDad Logo"
                    className="relative z-10 w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    {...props}
                />

                {/* Discrete Shine Effect */}
                <motion.div
                    animate={{
                        x: ['-200%', '200%'],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 2
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-25 z-20 pointer-events-none"
                />
            </div>

            {/* Orbiting Points */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute w-[110%] h-[110%] z-0 pointer-events-none"
                >
                    <div
                        className="w-1 h-1 bg-primary/40 rounded-full absolute"
                        style={{
                            top: '0',
                            left: '50%',
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default SkillDadLogo;
