import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, XCircle, Eye, Download, Search, Filter } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PayoutManager = () => {
    const [payouts, setPayouts] = useState([]);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const { showToast } = useToast();

    const fetchPayouts = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/finance/payouts', config);
            // Handle both array response and paginated object response
            setPayouts(Array.isArray(data) ? data : data.payouts || []);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleApprove = async (id) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            await axios.put(`/api/finance/payouts/${id}/approve`, {}, config);
            fetchPayouts();
            showToast('Payout approved successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error approving payout', 'error');
        }
    };

    const handleReject = async (id) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            await axios.put(`/api/finance/payouts/${id}/reject`, {}, config);
            fetchPayouts();
            showToast('Payout rejected', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error rejecting payout', 'error');
        }
    };

    const filteredPayouts = payouts
        .filter(payout => {
            const matchesSearch = !searchTerm || payout.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'amount-high') {
                return b.amount - a.amount;
            } else if (sortBy === 'amount-low') {
                return a.amount - b.amount;
            }
            return 0;
        });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <DashboardHeading title="Payout Management" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase">Total Payouts</p>
                            <p className="text-lg font-semibold text-white font-inter">{payouts.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase">Pending</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {payouts.filter(p => p.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase">Approved</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {payouts.filter(p => p.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase">Rejected</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {payouts.filter(p => p.status === 'rejected').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by partner name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-primary transition-all text-sm font-inter"
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto bg-[#0B0F1A] border border-white/10 rounded-xl text-xs font-semibold text-white px-4 py-3.5 focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[140px]"
                    >
                        <option value="all" className="bg-[#0D121F]">All Status</option>
                        <option value="pending" className="bg-[#0D121F]">Pending</option>
                        <option value="approved" className="bg-[#0D121F]">Approved</option>
                        <option value="rejected" className="bg-[#0D121F]">Rejected</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-auto bg-[#0B0F1A] border border-white/10 rounded-xl text-xs font-semibold text-white px-4 py-3.5 focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[150px]"
                    >
                        <option value="newest" className="bg-[#0D121F]">Newest First</option>
                        <option value="oldest" className="bg-[#0D121F]">Oldest First</option>
                        <option value="amount-high" className="bg-[#0D121F]">Amount: High to Low</option>
                        <option value="amount-low" className="bg-[#0D121F]">Amount: Low to High</option>
                    </select>
                </div>
            </div>

            <GlassCard className="!p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/70 text-xs uppercase border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Partner</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Screenshot</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredPayouts.map((payout) => (
                                <tr key={payout._id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-white font-semibold">
                                        {payout.partner?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        ₹{payout.amount?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        {new Date(payout.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${payout.status === 'approved'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : payout.status === 'rejected'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {payout.screenshotUrl ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedPayout(payout);
                                                    setShowModal(true);
                                                }}
                                                className="text-primary hover:text-primary/80 flex items-center gap-2"
                                            >
                                                <Eye size={18} /> View
                                            </button>
                                        ) : (
                                            <span className="text-white/40">No screenshot</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {payout.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(payout._id)}
                                                    className="text-emerald-400 hover:text-emerald-300"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(payout._id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {showModal && selectedPayout && (
                <div
                    className="fixed inset-0 z-[99999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                            setSelectedPayout(null);
                        }
                    }}
                >
                    <GlassCard className="w-full max-w-4xl relative z-[100000] bg-black/95 border-white/20 my-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white font-inter">Payout Screenshot</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPayout(null);
                                }}
                                className="text-white/70 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-white/50">Partner</p>
                                    <p className="text-white font-bold">{selectedPayout.partner?.name}</p>
                                </div>
                                <div>
                                    <p className="text-white/50">Amount</p>
                                    <p className="text-white font-bold">₹{selectedPayout.amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-white/50">Date</p>
                                    <p className="text-white font-bold">
                                        {new Date(selectedPayout.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/50">Status</p>
                                    <p className="text-white font-bold capitalize">{selectedPayout.status}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                {selectedPayout.screenshotUrl ? (
                                    <img
                                        src={`/${selectedPayout.screenshotUrl}`}
                                        alt="Payout Screenshot"
                                        className="w-full h-auto max-h-[500px] object-contain rounded-lg mx-auto"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    style={{ display: selectedPayout.screenshotUrl ? 'none' : 'flex' }}
                                    className="flex-col items-center justify-center py-12 text-white/30"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-sm">No screenshot attached</p>
                                </div>
                            </div>
                            {selectedPayout.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleReject(selectedPayout._id);
                                            setShowModal(false);
                                        }}
                                        className="flex-1 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors font-bold"
                                    >
                                        Reject
                                    </button>
                                    <ModernButton
                                        onClick={() => {
                                            handleApprove(selectedPayout._id);
                                            setShowModal(false);
                                        }}
                                        className="flex-1"
                                    >
                                        Approve Payout
                                    </ModernButton>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PayoutManager;
