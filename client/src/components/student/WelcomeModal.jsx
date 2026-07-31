import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Compass, BookOpen } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose, name }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-24 px-4 sm:px-6">
                    {/* Invisible click-outside-to-close layer — no dark/blur tint, so the
                        dashboard behind stays fully visible instead of being hidden. */}
                    <div onClick={onClose} className="absolute inset-0" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-lg bg-[#0A0514] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none">
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 px-6 pt-12 pb-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(192,38,255,0.4)] transform rotate-3">
                                <Sparkles size={32} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">
                                Welcome to SkillDad, {name}!
                            </h2>
                            <p className="text-slate-400 text-sm max-w-sm mb-8">
                                Your account is all set up. This is your dashboard — track enrolled courses, live classes, exams, and rewards from right here.
                            </p>

                            <div className="w-full flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => { onClose(); navigate('/courses'); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all"
                                >
                                    <Compass size={16} />
                                    Explore Courses
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all"
                                >
                                    <BookOpen size={16} />
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeModal;
