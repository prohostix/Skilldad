import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import ModernButton from './ModernButton';

const ConfirmDialog = ({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    danger = true,
    onConfirm,
    onCancel
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                className="w-full max-w-sm bg-black/95 backdrop-blur-xl rounded-[24px] p-6 border-2 border-primary/20 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    <X size={16} />
                </button>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                    <AlertTriangle size={22} />
                </div>

                <h3 className="text-base font-semibold text-white font-inter mb-2">{title}</h3>
                {message && (
                    <p className="text-sm text-white/60 font-inter mb-6 leading-relaxed">{message}</p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 border border-white/10 rounded-xl transition-colors font-inter"
                    >
                        {cancelLabel}
                    </button>
                    {danger ? (
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500/90 hover:bg-red-500 rounded-xl transition-colors font-inter shadow-lg shadow-red-500/20"
                        >
                            {confirmLabel}
                        </button>
                    ) : (
                        <ModernButton onClick={onConfirm} className="flex-1 !py-2.5">
                            {confirmLabel}
                        </ModernButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
