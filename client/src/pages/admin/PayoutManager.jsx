import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PayoutManager = () => {
    const [payouts, setPayouts] = useState([]);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <DashboardHeading title="Payout Management" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <GlassCard className="!p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/70 text-xs uppercase">
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
                            {payouts.map((payout) => (
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
                                <img
                                    src={selectedPayout.screenshotUrl || 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=1000&auto=format&fit=crop'}
                                    alt="Payout Screenshot"
                                    className="w-full h-auto max-h-[500px] object-contain rounded-lg mx-auto"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
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
