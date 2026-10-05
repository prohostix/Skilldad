import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = 10;
        const decrement = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - decrement;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isPaused, duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            badge: 'Updated',
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
            badgeBg: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            progressBar: 'bg-emerald-500',
        },
        error: {
            icon: AlertCircle,
            badge: 'Error',
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
            badgeBg: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
            progressBar: 'bg-rose-500',
        },
        info: {
            icon: Info,
            badge: 'Notification',
            accent: 'bg-primary',
            iconBg: 'bg-primary/10 text-primary dark:text-primary-light border border-primary/20',
            badgeBg: 'text-primary dark:text-primary-light bg-primary/10 border-primary/20',
            progressBar: 'bg-primary',
        },
        warning: {
            icon: AlertTriangle,
            badge: 'Notice',
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
            badgeBg: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
            progressBar: 'bg-amber-500',
        },
    };

    const current = config[type] || config.success;
    const IconComponent = current.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
            {/* Top Accent Strip */}
            <div className={`h-1 w-full ${current.accent}`} />

            <div className="flex items-center gap-3.5 p-4">
                {/* Status Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.iconBg} shadow-sm`}>
                    <IconComponent size={20} strokeWidth={2.2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase border ${current.badgeBg}`}>
                            {current.badge}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close notification"
                >
                    <X size={15} strokeWidth={2.4} />
                </button>
            </div>

            {/* Auto-dismiss progress line */}
            <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
                <div
                    className={`h-full ${current.progressBar} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    );
};

export default Toast;
