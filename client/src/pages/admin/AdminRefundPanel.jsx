import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    RefreshCw,
    DollarSign,
    FileText,
    Shield,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    ArrowLeft
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const AdminRefundPanel = () => {
    const { showToast } = useToast();
    const [transactionId, setTransactionId] = useState('');
    const [transaction, setTransaction] = useState(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [refundStatus, setRefundStatus] = useState(null);

    const fetchTransaction = async () => {
        if (!transactionId.trim()) {
            showToast('Please enter a transaction ID', 'error');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/payment/status/${transactionId}`, config);
            
            if (data.success) {
                setTransaction(data.transaction);
                setRefundAmount(data.transaction.amount.toString());
                showToast('Transaction loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error fetching transaction:', error);
            showToast(error.response?.data?.message || 'Failed to fetch transaction', 'error');
            setTransaction(null);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRefund = async (e) => {
        e.preventDefault();

        if (!transaction) {
            showToast('Please load a transaction first', 'error');
            return;
        }

        if (!refundAmount || parseFloat(refundAmount) <= 0) {
            showToast('Please enter a valid refund amount', 'error');
            return;
        }

        if (parseFloat(refundAmount) > parseFloat(transaction.amount)) {
            showToast('Refund amount cannot exceed original amount', 'error');
            return;
        }

        if (!refundReason.trim()) {
            showToast('Please enter a refund reason', 'error');
            return;
        }

        if (!twoFACode.trim()) {
            showToast('Please enter 2FA code', 'error');
            return;
        }

        setProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.post('/api/admin/payment/refund', {
                transactionId: transaction.transactionId,
                amount: parseFloat(refundAmount),
                reason: refundReason,
                twoFACode
            }, config);

            if (data.success) {
                setRefundStatus({
                    success: true,
                    refundTransactionId: data.refundTransactionId,
                    status: data.status,
                    estimatedCompletionDate: data.estimatedCompletionDate
                });
                showToast('Refund processed successfully', 'success');
                
                // Reset form
                setRefundAmount('');
                setRefundReason('');
                setTwoFACode('');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
            showToast(error.response?.data?.message || 'Failed to process refund', 'error');
            setRefundStatus({
                success: false,
                error: error.response?.data?.message || 'Failed to process refund'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setTransactionId('');
        setTransaction(null);
        setRefundAmount('');
        setRefundReason('');
        setTwoFACode('');
        setRefundStatus(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <DashboardHeading title="Refund Management" />
                {transaction && (
                    <ModernButton variant="secondary" onClick={handleReset}>
                        <ArrowLeft size={18} className="mr-2" />
                        New Search
                    </ModernButton>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Transaction Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <Search className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">Search Transaction</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="TXN_1234567890"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    disabled={loading}
                                />
                            </div>

                            <ModernButton
                                variant="primary"
                                onClick={fetchTransaction}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} className="mr-2" />
                                        Load Transaction
                                    </>
                                )}
                            </ModernButton>
                        </div>

                        {/* Transaction Details */}
                        {transaction && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 pt-6 border-t border-white/10 space-y-3"
                            >
                                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">
                                    Transaction Details
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Transaction ID:</span>
                                        <span className="text-white font-mono">{transaction.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Amount:</span>
                                        <span className="text-emerald-400 font-bold">₹{transaction.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Status:</span>
                                        <span className={`font-bold ${
                                            transaction.status === 'success' ? 'text-emerald-400' :
                                            transaction.status === 'pending' ? 'text-amber-400' :
                                            'text-red-400'
                                        }`}>
                                            {transaction.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Payment Method:</span>
                                        <span className="text-white">{transaction.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Date:</span>
                                        <span className="text-white">
                                            {new Date(transaction.initiatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* Refund Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <RefreshCw className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">Process Refund</h2>
                        </div>

                        {!transaction ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="text-white/30 mb-4" size={48} />
                                <p className="text-white/50 text-sm">
                                    Load a transaction to process refund
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleProcessRefund} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Refund Amount (₹)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                            placeholder="0.00"
                                            max={transaction.amount}
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            disabled={processing}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">
                                        Max: ₹{transaction.amount}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Refund Reason
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 text-white/30" size={18} />
                                        <textarea
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            placeholder="Enter reason for refund..."
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                            disabled={processing}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        2FA Code
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                                        <input
                                            type="text"
                                            value={twoFACode}
                                            onChange={(e) => setTwoFACode(e.target.value)}
                                            placeholder="Enter 2FA code"
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            disabled={processing}
                                            required
                                        />
                                    </div>
                                </div>

                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={18} className="mr-2" />
                                            Process Refund
                                        </>
                                    )}
                                </ModernButton>
                            </form>
                        )}

                        {/* Refund Status */}
                        {refundStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-xl border ${
                                    refundStatus.success
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {refundStatus.success ? (
                                        <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} />
                                    ) : (
                                        <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-sm mb-2 ${
                                            refundStatus.success ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {refundStatus.success ? 'Refund Initiated' : 'Refund Failed'}
                                        </h4>
                                        {refundStatus.success ? (
                                            <div className="space-y-1 text-xs text-white/70">
                                                <p>Refund ID: {refundStatus.refundTransactionId}</p>
                                                <p>Status: {refundStatus.status}</p>
                                                <p>Estimated Completion: {new Date(refundStatus.estimatedCompletionDate).toLocaleDateString()}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-white/70">{refundStatus.error}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminRefundPanel;
