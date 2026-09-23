import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Target, GraduationCap, Briefcase, Clock, ArrowRight } from 'lucide-react';
import courseFinderImg from '../../../assets/course_finder_character.jpg';

const CourseFinderWelcome = ({ onStart, onSkip }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-transparent">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                className="relative w-full max-w-[460px] bg-white dark:bg-[#150d2a] rounded-[24px] p-6 sm:p-7 shadow-xl border border-purple-100/70 dark:border-purple-900/30 overflow-hidden"
            >
                {/* Top Hero Section: Illustration + Text */}
                <div className="flex items-center gap-4 text-left mb-5">
                    {/* Illustration */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-purple-100/60 dark:bg-purple-900/20 rounded-full blur-lg scale-90 -z-0"></div>
                        <img
                            src={courseFinderImg || '/assets/course_finder_character.jpg'}
                            alt="Career Guide"
                            className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-sm"
                        />
                    </div>

                    {/* Heading and details */}
                    <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 text-[11px] font-semibold mb-1.5">
                            <Compass size={12} className="text-[#4C1D95] dark:text-purple-300" />
                            <span>Course Finder</span>
                        </div>
                        <h2 className="text-[22px] font-bold tracking-tight leading-[1.2] mb-1.5 font-jakarta">
                            <span className="text-[#4C1D95] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#E9D5FF] block">
                                Discover Your
                            </span>
                            <span className="text-[#4C1D95] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#E9D5FF] block">
                                Career Path
                            </span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-normal">
                            Answer a few quick questions and we'll help you find courses that match your goals, interests and career plans.
                        </p>
                    </div>
                </div>

                {/* 3 Pillar Features */}
                <div className="grid grid-cols-3 gap-2 py-3.5 border-t border-slate-100 dark:border-white/5 my-1">
                    <div className="flex flex-col items-center text-center px-0.5">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                            <Target size={15} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                            Personalized recommendations
                        </span>
                    </div>

                    <div className="flex flex-col items-center text-center px-0.5">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                            <GraduationCap size={15} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                            Career-focused learning path
                        </span>
                    </div>

                    <div className="flex flex-col items-center text-center px-0.5">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#4C1D95] dark:text-purple-400 mb-1.5">
                            <Briefcase size={15} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                            Job-oriented suggestions
                        </span>
                    </div>
                </div>

                {/* Takes about 2 minutes */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400 font-medium my-2.5">
                    <Clock size={13} className="text-purple-600 dark:text-purple-400" />
                    <span>Takes about 2 minutes</span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center mt-2">
                    <button
                        onClick={onStart}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#3b1675] dark:bg-[#6D28D9] dark:hover:bg-[#5b21b6] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/20 hover:shadow-purple-900/30 transition-all active:scale-[0.99]"
                    >
                        <span>Find My Course</span>
                        <ArrowRight size={15} />
                    </button>
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="mt-2 text-[11px] sm:text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-0.5"
                        >
                            Maybe later
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CourseFinderWelcome;
