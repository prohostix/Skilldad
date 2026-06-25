import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Sparkles, Gift, Users, Rocket } from 'lucide-react';
import axios from 'axios';

const ReferralModal = ({ isOpen, onClose }) => {
    const [referralData, setReferralData] = useState({ code: '', link: '' });
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchReferralCode();
        }
    }, [isOpen]);

    const fetchReferralCode = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get('/api/referrals/my-code', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setReferralData({
                code: data.code,
                link: data.link
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching referral code:', error);
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralData.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join SkillDad',
                    text: `Use my referral code ${referralData.code} to get a 50 point welcome bonus on SkillDad!`,
                    url: referralData.link,
                });
            } catch (err) {
                console.log('Share failed:', err);
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0A0514] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header Image/Pattern */}
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                        </div>

                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 px-6 pt-12 pb-8 flex flex-col items-center text-center">
                            {/* Icon Stack */}
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(192,38,255,0.4)] transform rotate-3">
                                <Gift size={32} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">Refer a Friend</h2>
                            <p className="text-slate-400 text-sm max-w-xs mb-8">
                                Invite friends to SkillDad and earn <span className="text-primary font-bold">100 points</span> each. They'll also get a <span className="text-emerald-400 font-bold">50 point</span> headstart!
                            </p>

                            {/* Code Badge */}
                            <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
                                <div className="text-[7.5px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-4">Your Unique Terminal</div>
                                
                                {loading ? (
                                    <div className="h-12 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between pointer-events-none px-2 mb-2">
                                            <div className="text-3xl font-black text-white tracking-widest font-mono">{referralData.code}</div>
                                            <Sparkles className="text-primary animate-pulse" size={24} />
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={copyToClipboard}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                                            >
                                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                {copied ? 'Copied' : 'Copy Link'}
                                            </button>
                                            <button 
                                                onClick={handleShare}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                                            >
                                                <Share2 size={14} />
                                                BroadCast
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rewards Recap */}
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                            <Users size={10} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">You Earn</span>
                                    </div>
                                    <div className="text-sm font-black text-white">100 Points</div>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <Rocket size={10} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">They Get</span>
                                    </div>
                                    <div className="text-sm font-black text-white">50 Points</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
