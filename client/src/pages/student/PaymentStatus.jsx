import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Download,
    ArrowLeft,
    CreditCard,
    Calendar,
    Hash,
    FileText,
    DollarSign,
    Tag,
    AlertCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const PaymentStatus = () => {
    const { transactionId } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTransactionStatus();
    }, [transactionId]);

    const fetchTransactionStatus = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(
                `/api/payment/status/${transactionId}`,
                config
            );

            setTransaction(data.transaction);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch transaction details');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        setChecking(true);
        await fetchTransactionStatus();
        setChecking(false);
    };

    const handleDownloadReceipt = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                responseType: 'blob'
            };

            const { data } = await axios.get(
                `/api/payment/receipt/${transactionId}`,
                config
            );

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${transactionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download receipt:', err);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            success: {
                icon: CheckCircle,
                color: 'emerald',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                label: 'Payment Successful'
            },
            failed: {
                icon: XCircle,
                color: 'red',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                text: 'text-red-400',
                label: 'Payment Failed'
            },
            pending: {
                icon: Clock,
                color: 'amber',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
                label: 'Payment Pending'
            },
            processing: {
                icon: Loader2,
                color: 'blue',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                text: 'text-blue-400',
                label: 'Processing Payment'
            },
            refunded: {
                icon: RefreshCw,
                color: 'gray',
                bg: 'bg-gray-500/10',
                border: 'border-gray-500/20',
                text: 'text-gray-400',
                label: 'Payment Refunded'
            }
        };

        return configs[status] || configs.pending;
    };

    const getTimelineSteps = () => {
        if (!transaction) return [];

        const steps = [
            {
                label: 'Payment Initiated',
                timestamp: transaction.initiatedAt,
                completed: true
            },
            {
                label: 'Processing',
                timestamp: transaction.callbackReceivedAt,
                completed: transaction.status !== 'pending'
            },
            {
                label: transaction.status === 'success' ? 'Completed' : transaction.status === 'failed' ? 'Failed' : 'Pending',
                timestamp: transaction.completedAt,
                completed: transaction.status === 'success' || transaction.status === 'failed' || transaction.status === 'refunded'
            }
        ];

        return steps;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <GlassCard className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Transaction Not Found</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <ModernButton onClick={() => navigate('/dashboard/payment-history')}>
                        <ArrowLeft size={18} />
                        Back to Payment History
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    const statusConfig = getStatusConfig(transaction.status);
    const StatusIcon = statusConfig.icon;
    const timelineSteps = getTimelineSteps();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard/payment-history')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft size={18} />
                    Back to History
                </button>

                <ModernButton
                    onClick={handleCheckStatus}
                    disabled={checking}
                    variant="secondary"
                    className="!px-4 !py-2"
                >
                    {checking ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            Check Status
                        </>
                    )}
                </ModernButton>
            </div>

            <DashboardHeading title="Transaction Details" className="text-2xl font-black" />

            {/* Status Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className={`p-6 ${statusConfig.border} border-2`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 ${statusConfig.bg} rounded-2xl`}>
                                <StatusIcon className={`w-8 h-8 ${statusConfig.text} ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">{statusConfig.label}</h2>
                                <p className="text-sm text-gray-400">
                                    Transaction ID: <span className="font-mono">{transaction.transactionId}</span>
                                </p>
                            </div>
                        </div>

                        {transaction.status === 'success' && transaction.receiptUrl && (
                            <ModernButton
                                onClick={handleDownloadReceipt}
                                className="!px-6"
                            >
                                <Download size={18} />
                                Download Receipt
                            </ModernButton>
                        )}
                    </div>
                </GlassCard>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Course Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <FileText size={14} />
                                Course Information
                            </h3>

                            <div className="flex gap-4">
                                {transaction.course?.thumbnail && (
                                    <img
                                        src={transaction.course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                        alt={transaction.course.title}
                                        className="w-32 h-20 object-cover rounded-xl"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-white mb-2">
                                        {transaction.course?.title || 'Course Enrollment'}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        {transaction.course?.instructor?.name || 'SkillDad'}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Payment Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Clock size={14} />
                                Payment Timeline
                            </h3>

                            <div className="space-y-6">
                                {timelineSteps.map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                                                    ? 'bg-primary/20 border-2 border-primary'
                                                    : 'bg-white/5 border-2 border-white/10'
                                                }`}>
                                                {step.completed ? (
                                                    <CheckCircle className="text-primary" size={20} />
                                                ) : (
                                                    <Clock className="text-gray-500" size={20} />
                                                )}
                                            </div>
                                            {index < timelineSteps.length - 1 && (
                                                <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary/30' : 'bg-white/10'
                                                    }`} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <p className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-gray-500'
                                                }`}>
                                                {step.label}
                                            </p>
                                            {step.timestamp && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(step.timestamp).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Refund Information */}
                    {transaction.status === 'refunded' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard className="p-6 border-gray-500/20">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <RefreshCw size={14} />
                                    Refund Information
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-400">Refund Amount</span>
                                        <span className="text-sm font-bold text-white">
                                            ₹{parseFloat(transaction.refundAmount || transaction.finalAmount).toFixed(2)}
                                        </span>
                                    </div>
                                    {transaction.refundInitiatedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-400">Refund Initiated</span>
                                            <span className="text-sm text-white">
                                                {new Date(transaction.refundInitiatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {transaction.refundCompletedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-400">Refund Completed</span>
                                            <span className="text-sm text-white">
                                                {new Date(transaction.refundCompletedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {transaction.refundReason && (
                                        <div className="pt-3 border-t border-white/10">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Reason</span>
                                            <p className="text-sm text-white mt-1">{transaction.refundReason}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-4">
                                        <p className="text-xs text-amber-400">
                                            Refunds typically take 5-7 business days to reflect in your account.
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Error Information */}
                    {transaction.status === 'failed' && transaction.errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard className="p-6 border-red-500/20">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    Error Details
                                </h3>

                                <div className="space-y-3">
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-sm text-red-400">{transaction.errorMessage}</p>
                                        {transaction.errorCategory && (
                                            <p className="text-xs text-gray-500 mt-2 capitalize">
                                                Category: {transaction.errorCategory.replace('_', ' ')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <ModernButton
                                            onClick={() => navigate('/support')}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            <ExternalLink size={16} />
                                            Contact Support
                                        </ModernButton>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar - Transaction Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Amount Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <DollarSign size={14} />
                                Amount Breakdown
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Original Price</span>
                                    <span className="text-white font-semibold">
                                        ₹{parseFloat(transaction.originalAmount).toFixed(2)}
                                    </span>
                                </div>

                                {transaction.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-400">Discount</span>
                                        <span className="text-emerald-400 font-semibold">
                                            -₹{parseFloat(transaction.discountAmount).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {transaction.gstAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">GST (18%)</span>
                                        <span className="text-white font-semibold">
                                            ₹{parseFloat(transaction.gstAmount).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/10">
                                    <span className="text-white">Total Paid</span>
                                    <span className="text-primary">
                                        ₹{parseFloat(transaction.finalAmount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Payment Method */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <CreditCard size={14} />
                                Payment Method
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Method</span>
                                    <span className="text-white font-semibold capitalize">
                                        {transaction.paymentMethod?.replace('_', ' ') || 'N/A'}
                                    </span>
                                </div>

                                {transaction.paymentMethodDetails?.cardType && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Card Type</span>
                                        <span className="text-white font-semibold">
                                            {transaction.paymentMethodDetails.cardType}
                                        </span>
                                    </div>
                                )}

                                {transaction.paymentMethodDetails?.cardLast4 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Card Number</span>
                                        <span className="text-white font-mono">
                                            •••• {transaction.paymentMethodDetails.cardLast4}
                                        </span>
                                    </div>
                                )}

                                {transaction.gatewayTransactionId && (
                                    <div className="pt-3 border-t border-white/10">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Gateway ID</span>
                                        <p className="text-xs text-white font-mono mt-1 break-all">
                                            {transaction.gatewayTransactionId}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Discount Code */}
                    {transaction.discountCode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <GlassCard className="p-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Tag size={14} />
                                    Discount Applied
                                </h3>

                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <p className="text-sm font-bold text-white mb-1">{transaction.discountCode}</p>
                                    <p className="text-xs text-emerald-400">
                                        {transaction.discountPercentage
                                            ? `${transaction.discountPercentage}% off`
                                            : `₹${parseFloat(transaction.discountAmount).toFixed(2)} off`}
                                    </p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
