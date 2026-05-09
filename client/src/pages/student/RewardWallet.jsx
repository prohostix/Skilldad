import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    Gift, 
    Users, 
    Copy, 
    Check, 
    ExternalLink, 
    TrendingUp, 
    MessageSquare,
    Share2,
    Calendar,
    ArrowUpRight,
    Award,
    History,
    Sparkles,
    Clock,
    Search,
    ChevronRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import ReferralModal from '../../components/student/ReferralModal';
import { useUser } from '../../context/UserContext';

const RewardWallet = () => {
    const { showToast } = useToast();
    const { rewardPoints: balance, refreshPoints } = useUser();
    const [referralData, setReferralData] = useState({ code: '', link: '' });
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReferModalOpen, setIsReferModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [codeRes, referralsRes] = await Promise.all([
                axios.get('/api/referrals/my-code', config),
                axios.get('/api/referrals/my-referrals', config)
            ]);
            
            await refreshPoints();
            setReferralData(codeRes.data);
            setReferrals(referralsRes.data);
        } catch (err) {
            console.error('Error fetching wallet data:', err);
            showToast?.('Failed to fetch wallet data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        showToast?.('Referral link copied!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Join SkillDad',
            text: 'I am inviting you to join SkillDad, an advanced digital learning platform! Register using my link to get 50 booster points.',
            url: referralData.link
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast?.('Shared successfully!', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(referralData.link);
                }
            }
        } else {
            copyToClipboard(referralData.link);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const filteredReferrals = referrals.filter(r => 
        r.referred_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredHistory = (balance.history || []).filter(h => 
        h.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'network', label: 'Network Assets' },
        { id: 'ledger', label: 'Performance Ledger' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-12 animate-in fade-in duration-500">
            {/* Standardized Page Header */}
            <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <DashboardHeading title="Reward Wallet" />
                    <p className="text-xs text-white/40 mt-0.5 font-medium">Manage your academic growth rewards and referral network.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsReferModalOpen(true)}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Gift size={12} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Refer & Earn</span>
                    </button>
                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                        <Wallet size={12} className="text-primary" />
                        <span className="text-xs font-bold text-white leading-none">
                            {balance.total} <span className="text-[10px] text-primary/70 uppercase font-bold">pts</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Toolbar - Placement Style */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full sm:w-auto">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); setSearchQuery(''); }}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                activeTab === id ? 'bg-primary text-white shadow-sm' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: 'Platform Balance', val: balance.total, suffix: ' pts', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                                { label: 'Network Size', val: referrals.length, suffix: ' refs', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                { label: 'Pending Points', val: '0', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                                { label: 'Growth Status', val: 'Bronze', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
                            ].map((stat, i) => (
                                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-3 transition-colors hover:bg-white/[0.04]">
                                    <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color} ${stat.border}`}>
                                        <stat.icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">{stat.label}</p>
                                        <p className="text-lg font-black text-white leading-none mt-1">{stat.val}<span className="text-[10px] ml-0.5 opacity-40 font-bold">{stat.suffix || ''}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Referral Protocol Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 whitespace-nowrap font-mono">
                                    <Share2 size={8} /> Protocol: Growth
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                            </div>
                            
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                    <Sparkles size={200} />
                                </div>
                                
                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="max-w-xl">
                                        <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest text-primary">
                                            Academic Referral Network <Sparkles size={14} className="text-amber-400" />
                                        </h3>
                                        <p className="text-[11px] text-white/40 font-bold leading-relaxed">
                                            Expand the SkillDad global network to unlock premium rewards. Gain <span className="text-emerald-400">100 points</span> for every valid student activation via your unique terminal. New activations receive a <span className="text-primary font-bold">50 point</span> initialization bonus.
                                        </p>
                                    </div>
                                    
                                    <div className="flex-1 max-w-2xl w-full">
                                        <div className="p-1 bg-black/40 border border-white/10 rounded-xl flex items-center group/input focus-within:border-primary/50 transition-all">
                                            <span className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hidden sm:block border-r border-white/5 mr-2">Link</span>
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={referralData.link} 
                                                className="flex-1 bg-transparent px-3 py-3 text-[11px] text-white/60 focus:outline-none font-mono truncate"
                                            />
                                            <button 
                                                onClick={() => copyToClipboard(referralData.link)}
                                                className="px-6 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/5"
                                            >
                                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                                {copied ? 'Captured' : 'Execute Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'network' && (
                    <motion.div 
                        key="network"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 whitespace-nowrap font-mono">
                                <Users size={8} /> Referral Network
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredReferrals.map((ref, idx) => (
                                <motion.div 
                                    key={ref.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all p-5 flex flex-col group"
                                >
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[12px] font-black text-white/30 uppercase group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            {ref.referred_name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate">{ref.referred_name}</p>
                                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                                <Calendar size={9} /> {new Date(ref.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Asset Gained</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-black text-emerald-400">+{ref.points_awarded}</span>
                                            <TrendingUp size={10} className="text-emerald-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredReferrals.length === 0 && (
                                <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl">
                                    <Users size={24} className="mx-auto text-white/10 mb-3" />
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{searchQuery ? 'No Results Found' : 'No Assets Detected'}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ledger' && (
                    <motion.div 
                        key="ledger"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 whitespace-nowrap font-mono">
                                <History size={8} /> Performance Ledger
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredHistory.map((log, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="rounded-xl border border-white/5 bg-white/[0.015] p-4 flex items-start justify-between group hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-default"
                                >
                                    <div className="min-w-0 pr-4 flex-1">
                                        <p className="text-xs font-bold text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">{log.reason}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={9} /> {new Date(log.created_at).toLocaleDateString()}
                                            </p>
                                            {log.reference_name && (
                                                <div className="flex items-center gap-1.5 py-0.5 px-2 bg-primary/10 border border-primary/20 rounded-md">
                                                    <span className="text-[7.5px] font-black text-primary uppercase tracking-[0.2em] font-mono">Reference:</span>
                                                    <span className="text-[9px] font-bold text-white/60 uppercase">{log.reference_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-[11px] font-black ${log.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {log.points > 0 ? '+' : ''}{log.points} <span className="text-[8px] uppercase tracking-tighter opacity-60 ml-0.5">{log.points > 0 ? 'PTS' : 'PTS'}</span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 justify-end">
                                            <span className={`w-1.5 h-1.5 rounded-full ${log.points > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest uppercase">Verified Log</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredHistory.length === 0 && (
                                <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl">
                                    <History size={24} className="mx-auto text-white/10 mb-3" />
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{searchQuery ? 'No Results Found' : 'Log History Empty'}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ReferralModal isOpen={isReferModalOpen} onClose={() => setIsReferModalOpen(false)} />
        </div>
    );
};


export default RewardWallet;
