import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Ticket,
    Plus,
    Trash2,
    Calendar,
    Tag,
    Users,
    Clock,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Copy,
    ExternalLink
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        value: '',
        type: 'percentage',
        expiryDate: ''
    });
    const { showToast } = useToast();

    const fetchCoupons = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('/api/discount', config);
            setCoupons(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showToast('Failed to load coupons', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const payload = {
                code: newCoupon.code,
                value: Number(newCoupon.value),
                type: newCoupon.type,
                expiryDate: newCoupon.expiryDate || null
            };

            await axios.post('/api/discount', payload, config);
            showToast(`Coupon ${newCoupon.code} created successfully`, 'success');
            setIsModalOpen(false);
            setNewCoupon({ code: '', value: '', type: 'percentage', expiryDate: '' });
            fetchCoupons();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create coupon', 'error');
        }
    };

    const handleDeleteCoupon = async (id, code) => {
        if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.delete(`/api/discount/${id}`, config);
            showToast(`Coupon ${code} deleted`, 'info');
            fetchCoupons();
        } catch (error) {
            showToast('Failed to delete coupon', 'error');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Code copied!', 'success');
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DashboardHeading title="Coupon Architecture" />
                <ModernButton onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Generate New Coupon
                </ModernButton>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="group hover:border-primary/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Ticket size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Active Infrastructure</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{coupons.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="group hover:border-emerald-500/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            <Users size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Total Redemptions</p>
                            <p className="text-2xl font-bold text-white tracking-tight">1,248</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="group hover:border-amber-500/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <Tag size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Revenue Impact</p>
                            <p className="text-2xl font-bold text-white tracking-tight">₹12.5k</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Main Table Area */}
            <GlassCard className="!p-0 overflow-hidden border-white/5 shadow-2xl">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Tag size={20} className="mr-2 text-primary" /> Active Coupons
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by code..."
                            className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-6 py-4">Coupon Code</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-white/30 italic">No coupons found in system registry</td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon._id} className="group hover:bg-white/5 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                    <Ticket size={16} className="text-primary" />
                                                </div>
                                                <span className="font-mono font-bold text-white tracking-widest">{coupon.code}</span>
                                                <button onClick={() => copyToClipboard(coupon.code)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-white/70 text-sm font-medium">
                                            {coupon.type}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-white">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-xs text-white/50">
                                                <Clock size={12} className="mr-1.5" />
                                                {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Infinite'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) ? (
                                                <span className="flex items-center text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-full w-fit">
                                                    <CheckCircle size={10} className="mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded-full w-fit">
                                                    <XCircle size={10} className="mr-1" /> Expired
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                                                className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <GlassCard className="w-full max-w-md shadow-2xl border-primary/20 bg-black/90">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <Plus size={22} className="mr-2 text-primary" /> Generate Coupon
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/30 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Coupon Signature</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SKILLFALL50"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-primary font-mono tracking-widest uppercase"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Architecture</label>
                                    <select
                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                        value={newCoupon.type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Value Matrix</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                        value={newCoupon.value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Expiry Horizon (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer [color-scheme:dark]"
                                        value={newCoupon.expiryDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                    />
                                    <Calendar className="absolute right-4 top-3 text-white/20 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold text-white/50 hover:bg-white/5 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1 py-3">
                                    Initialize Code
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default CouponManager;
