import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
    'Analyzing your answers...',
    'Finding courses that match your goals...',
    'Building your learning path...'
];

const CourseFinderAnalyzing = ({ onDone, durationPerStep = 700 }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const stepMs = reduceMotion ? 150 : durationPerStep;
        if (step >= MESSAGES.length - 1) {
            const t = setTimeout(onDone, stepMs);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setStep((s) => s + 1), stepMs);
        return () => clearTimeout(t);
    }, [step, durationPerStep, onDone]);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" style={{ background: '#FAF8FF' }}>
            <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: '#F3E8FF' }}>
                    <Sparkles className="w-8 h-8" style={{ color: '#6D28D9' }} />
                </div>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="text-base font-semibold text-slate-700"
                        role="status"
                        aria-live="polite"
                    >
                        {MESSAGES[step]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CourseFinderAnalyzing;
