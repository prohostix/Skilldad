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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <DashboardHeading title="Coupon Architecture" />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold font-inter inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm w-fit"
                >
                    <Plus size={14} /> <span>Generate New Coupon</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <Ticket size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">Active Infrastructure</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">{coupons.length}</p>
                    </div>
                </div>
                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <Users size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">Total Redemptions</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">1,248</p>
                    </div>
                </div>
                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <Tag size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">Revenue Impact</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">₹12.5k</p>
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                        <Tag size={15} className="text-primary" /> <span>Active Coupons</span>
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by code..."
                            className="pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary w-full sm:w-60 font-inter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-2.5 top-2 text-slate-400 dark:text-slate-500" size={14} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-inter">
                                <th className="px-3.5 py-2.5">Coupon Code</th>
                                <th className="px-3.5 py-2.5">Type</th>
                                <th className="px-3.5 py-2.5">Value</th>
                                <th className="px-3.5 py-2.5">Expiry</th>
                                <th className="px-3.5 py-2.5">Status</th>
                                <th className="px-3.5 py-2.5 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-3.5 py-8 text-center">
                                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-3.5 py-8 text-center text-slate-400 text-xs italic font-inter">No coupons found in system registry</td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                                    <Ticket size={13} />
                                                </div>
                                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tracking-wider">{coupon.code}</span>
                                                <button onClick={() => copyToClipboard(coupon.code)} title="Copy Code" className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-primary transition-all">
                                                    <Copy size={13} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2 capitalize text-slate-600 dark:text-slate-300 text-xs font-inter">
                                            {coupon.type}
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <span className="text-xs font-semibold text-slate-900 dark:text-white font-inter">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-inter">
                                                <Clock size={12} className="mr-1 text-slate-400" />
                                                {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Infinite'}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            {(!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) ? (
                                                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-inter">
                                                    <CheckCircle size={10} className="mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md font-inter">
                                                    <XCircle size={10} className="mr-1" /> Expired
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3.5 py-2 text-right">
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                                className="p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-[#0E0B1A] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                                <Plus size={16} className="text-primary" /> <span>Generate Coupon</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <XCircle size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SKILLFALL50"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary font-mono tracking-wider uppercase font-inter"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary cursor-pointer font-inter"
                                        value={newCoupon.type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                    >
                                        <option value="percentage" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Percentage (%)</option>
                                        <option value="fixed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary font-inter"
                                        value={newCoupon.value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-inter mb-1">Expiry Date (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary cursor-pointer font-inter"
                                        value={newCoupon.expiryDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all font-inter"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-dark text-white transition-all shadow-sm font-inter"
                                >
                                    Initialize Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManager;
