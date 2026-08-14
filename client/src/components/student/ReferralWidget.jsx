import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, Users, Star, ChevronDown, ChevronUp, Trophy, Zap, X, Share2 } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';

// ── Floating "Refer & Earn" FAB ──────────────────────────────────────────────
export const ReferFAB = ({ onClick }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full
                   bg-gradient-to-r from-[#8A2BE2] to-[#FF2FD1]
                   text-white font-black text-[11px] uppercase tracking-widest
                   shadow-[0_0_30px_rgba(255,47,209,0.4)] hover:shadow-[0_0_45px_rgba(255,47,209,0.6)]
                   hover:scale-105 active:scale-95 transition-all"
        title="Refer & Earn"
    >
        <Gift size={16} />
        Refer &amp; Earn
    </motion.button>
);

// ── Referral Drawer / Modal ──────────────────────────────────────────────────
export const ReferralDrawer = ({ open, onClose }) => {
    const [referralData, setReferralData] = useState({ code: '', link: '' });
    const [rewardData, setRewardData] = useState({ total: 0, history: [] });
    const [referrals, setReferrals] = useState([]);
    const [copied, setCopied] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [codeRes, pointsRes, referralsRes] = await Promise.allSettled([
                axios.get('/api/referrals/my-code'),
                axios.get('/api/referrals/my-points'),
                axios.get('/api/referrals/my-referrals'),
            ]);

            if (codeRes.status === 'fulfilled') {
                setReferralData(codeRes.value.data);
            } else {
                setError('Could not load referral code. Please try again.');
            }
            if (pointsRes.status === 'fulfilled') setRewardData(pointsRes.value.data);
            if (referralsRes.status === 'fulfilled') setReferrals(referralsRes.value.data);
        } catch (e) {
            setError('Failed to load referral data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) fetchData();
    }, [open, fetchData]);

    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const share = async () => {
        if (navigator.share && referralData.link) {
            try {
                await navigator.share({
                    title: 'Join SkillDad',
                    text: `Join me on SkillDad - Placement Guaranteed European University Skill Programs! Use my code ${referralData.code} and get 50 bonus reward points.`,
                    url: referralData.link,
                });
                return;
            } catch { }
        }
        copy(referralData.link, 'link');
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        key="drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0B0715] border-l border-white/10 z-50 flex flex-col overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-primary/10 to-pink-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <Gift size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm">Refer &amp; Earn</p>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">+100 pts per referral</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Reward Points */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-400/70 uppercase tracking-widest">Your Balance</p>
                                        <p className="text-2xl font-black text-white">
                                            {rewardData.total.toLocaleString()}
                                            <span className="text-[12px] text-amber-400 ml-1">pts</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{referrals.length} referred</p>
                                    <div className="flex items-center gap-1 mt-1 justify-end">
                                        <Trophy size={11} className="text-amber-400" />
                                        <span className="text-[10px] font-black text-amber-400">+100 pts each</span>
                                    </div>
                                </div>
                            </div>

                            {/* How it works */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">How it works</p>
                                <div className="space-y-2">
                                    {[
                                        { icon: '1', text: 'Share your unique referral link with friends' },
                                        { icon: '2', text: 'They register on SkillDad using your link' },
                                        { icon: '3', text: 'You earn 100 pts • They get 50 welcome pts' },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                                {s.icon}
                                            </div>
                                            <p className="text-xs text-white/60">{s.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Referral Code */}
                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-14 bg-white/5 rounded-2xl" />
                                    <div className="h-10 bg-white/5 rounded-xl" />
                                </div>
                            ) : error ? (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                                    <p className="text-sm text-red-400">{error}</p>
                                    <button onClick={fetchData} className="mt-2 text-[11px] font-black text-red-400 underline">Retry</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Your Referral Code</p>

                                    {/* Code Box */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-black/40 border-2 border-primary/30 rounded-2xl px-4 py-3.5 font-mono text-lg font-black text-primary tracking-[0.25em] text-center select-all">
                                            {referralData.code}
                                        </div>
                                        <button
                                            onClick={() => copy(referralData.code, 'code')}
                                            className={`p-3.5 rounded-2xl border-2 transition-all ${copied === 'code' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'}`}
                                        >
                                            {copied === 'code' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>

                                    {/* Enrollment Link */}
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Enrollment Link</p>
                                        <p className="text-[11px] text-primary/80 break-all font-mono">{referralData.link}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => copy(referralData.link, 'link')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${copied === 'link' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-white/5 border-white/15 text-white hover:bg-white/10'}`}
                                        >
                                            {copied === 'link' ? <Check size={14} /> : <Copy size={14} />}
                                            {copied === 'link' ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <button
                                            onClick={share}
                                            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary/30 bg-primary/10 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary/20 transition-all"
                                        >
                                            <Share2 size={14} />
                                            Share
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Referred People */}
                            {referrals.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Users size={11} />
                                        People You Referred ({referrals.length})
                                    </p>
                                    <div className="space-y-2">
                                        {referrals.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                                        {r.referred_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-bold text-white">{r.referred_name}</p>
                                                        <p className="text-[9px] text-white/30">{new Date(r.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-black text-amber-400">+{r.points_awarded} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Points History */}
                            {rewardData.history.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Zap size={11} />
                                        Points History
                                    </p>
                                    <div className="space-y-2">
                                        {rewardData.history.map((h, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                                                <span className="text-[11px] text-white/50 truncate max-w-[180px]">{h.reason}</span>
                                                <span className="text-[11px] font-black text-amber-400 ml-2 shrink-0">+{h.points}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ── Inline Dashboard Widget (compact) ───────────────────────────────────────
const ReferralWidget = ({ userInfo }) => {
    const [rewardData, setRewardData] = useState({ total: 0 });
    const [referrals, setReferrals] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get('/api/referrals/my-points'),
            axios.get('/api/referrals/my-referrals'),
        ]).then(([pointsRes, referralsRes]) => {
            if (pointsRes.status === 'fulfilled') setRewardData(pointsRes.value.data);
            if (referralsRes.status === 'fulfilled') setReferrals(referralsRes.value.data);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                {/* Reward Points */}
                <GlassCard className="p-5 mb-4 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 hover:border-amber-400/50 transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-400/70 uppercase tracking-widest">Reward Points</p>
                                <p className="text-2xl font-black text-white leading-tight">
                                    {loading ? '-' : rewardData.total.toLocaleString()}
                                    <span className="text-[11px] text-amber-400 font-bold ml-1.5">pts</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{referrals.length} referred</p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                                <Trophy size={11} className="text-amber-400" />
                                <span className="text-[10px] font-black text-amber-400">+100 pts each</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Refer & Earn CTA */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/30 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(138,43,226,0.2)] transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Gift size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-[11px] font-black text-primary uppercase tracking-widest">Refer &amp; Earn</p>
                            <p className="text-[10px] text-white/40">Invite friends · 100 pts per referral</p>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-white/30 -rotate-90 group-hover:text-primary transition-colors" />
                </button>
            </motion.div>

            <ReferralDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
};

export default ReferralWidget;
