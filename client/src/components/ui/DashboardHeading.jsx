import React from 'react';
import { motion } from 'framer-motion';

const DashboardHeading = ({ title, className = '' }) => {
    const words = title.split(' ');
    const lastWord = words.pop();
    const restOfTitle = words.join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${className}`}
        >
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <span className="opacity-40">{restOfTitle}</span>
                <span className="premium-gradient-text">{lastWord}</span>
            </h1>
        </motion.div>
    );
};

export default DashboardHeading;
