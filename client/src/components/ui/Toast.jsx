import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-emerald-400" />,
        error: <XCircle size={20} className="text-rose-400" />,
        info: <AlertCircle size={20} className="text-primary" />
    };

    const colors = {
        success: 'border-emerald-400/30 bg-emerald-400/10',
        error: 'border-rose-400/30 bg-rose-400/10',
        info: 'border-primary/30 bg-primary/10'
    };

    return (
        <div className={`fixed top-4 right-4 z-[99999] animate-in slide-in-from-top-2 fade-in duration-300`}>
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${colors[type]} backdrop-blur-xl shadow-2xl min-w-[300px]`}>
                {icons[type]}
                <span className="flex-1 text-sm text-white font-medium font-inter">{message}</span>
                <button
                    onClick={onClose}
                    className="text-white/50 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
