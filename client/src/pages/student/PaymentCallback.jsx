import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Loader2,
    Download,
    Home,
    RefreshCw,
    AlertTriangle,
    CreditCard,
    Calendar,
    Hash,
    FileText
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

import { useSocket } from '../../context/SocketContext';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const [status, setStatus] = useState('processing'); // processing, success, failed, expired
    const [transactionData, setTransactionData] = useState(null);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        processCallback();

        if (socket) {
            socket.on('PAYMENT_STATUS_UPDATE', (data) => {
                const transactionId = searchParams.get('transactionId');
                if (data.transactionId === transactionId) {
                    processCallback(); // Refetch data to get full transaction details
                }
            });

            return () => socket.off('PAYMENT_STATUS_UPDATE');
        }
    }, [socket]);

    const processCallback = async () => {
        try {
            const transactionId = searchParams.get('transactionId');
            const paymentStatus = searchParams.get('status');
            const gatewayTransactionId = searchParams.get('gatewayTransactionId');
            const signature = searchParams.get('signature');

            const redirectStatus = searchParams.get('redirect_status');
            const paymentIntent = searchParams.get('payment_intent');

            if (!transactionId || (!paymentStatus && !redirectStatus)) {
                setStatus('failed');
                setError('Invalid payment callback data');
                return;
            }

            // In local/Elements environment where webhooks might be disabled or delayed,
            // we proactively push the success state to the backend callback endpoint using redirect_status.
            if (redirectStatus === 'succeeded') {
                try {
                    await axios.get(`/api/payment/callback?transactionId=${transactionId}&status=success&gatewayTransactionId=${paymentIntent || ''}`);
                } catch (e) {
                    console.error("Manual callback trigger failed", e);
                }
            }

            // Simulate processing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch transaction details
            const { data } = await axios.get(
                `/api/payment/status/${transactionId}`,
                config
            );

            setTransactionData(data.transaction);
            setStatus(data.transaction.status);
            setRetryCount(data.transaction.retryCount || 0);
        } catch (err) {
            setStatus('failed');
            setError(err.response?.data?.message || 'Failed to process payment callback');
        }
    };

    const handleDownloadReceipt = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                responseType: 'blob'
            };

            const { data } = await axios.get(
                `/api/payment/receipt/${transactionData.transactionId}`,
                config
            );

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${transactionData.transactionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download receipt:', err);
        }
    };

    const handleRetryPayment = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post(
                `/api/payment/retry/${transactionData.transactionId}`,
                {},
                config
            );

            window.location.href = data.paymentUrl;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retry payment');
        }
    };

    if (status === 'processing') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <Loader2 className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
                    <p className="text-gray-400">Please wait while we confirm your transaction...</p>
                </motion.div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30"
                        >
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </motion.div>

                        <div className="flex flex-col items-center mb-3">
                            <DashboardHeading title="Payment Successful!" />
                        </div>
                        <p className="text-gray-400 mb-8">
                            Your enrollment has been confirmed. You can now access the course.
                        </p>

                        {transactionData && (
                            <div className="space-y-4 mb-8">
                                <div className="grid md:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                            <Hash size={14} />
                                            <span className="uppercase tracking-widest font-bold">Transaction ID</span>
                                        </div>
                                        <p className="text-white font-mono text-sm">{transactionData.transactionId}</p>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                            <FileText size={14} />
                                            <span className="uppercase tracking-widest font-bold">Course</span>
                                        </div>
                                        <p className="text-white text-sm font-semibold line-clamp-1">
                                            {transactionData.course?.title || 'Course Enrollment'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                            <CreditCard size={14} />
                                            <span className="uppercase tracking-widest font-bold">Amount Paid</span>
                                        </div>
                                        <p className="text-emerald-400 text-lg font-bold">
                                            ₹{parseFloat(transactionData.finalAmount).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                            <CreditCard size={14} />
                                            <span className="uppercase tracking-widest font-bold">Payment Method</span>
                                        </div>
                                        <p className="text-white text-sm capitalize">
                                            {transactionData.paymentMethod?.replace('_', ' ') || 'Card'}
                                            {transactionData.paymentMethodDetails?.cardLast4 &&
                                                ` •••• ${transactionData.paymentMethodDetails.cardLast4}`
                                            }
                                        </p>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 md:col-span-2">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                            <Calendar size={14} />
                                            <span className="uppercase tracking-widest font-bold">Date & Time</span>
                                        </div>
                                        <p className="text-white text-sm">
                                            {new Date(transactionData.completedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <ModernButton
                                onClick={() => navigate('/dashboard')}
                                className="!px-8"
                            >
                                <Home size={18} className="mr-2" />
                                Go to Dashboard
                            </ModernButton>

                            {transactionData?.receiptUrl && (
                                <ModernButton
                                    onClick={handleDownloadReceipt}
                                    variant="secondary"
                                    className="!px-8"
                                >
                                    <Download size={18} className="mr-2" />
                                    Download Receipt
                                </ModernButton>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-xs text-gray-500">
                                A confirmation email with your receipt has been sent to your registered email address.
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    // Expired session status
    if (status === 'expired') {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-500/30"
                        >
                            <AlertTriangle className="w-12 h-12 text-amber-400" />
                        </motion.div>

                        <h1 className="text-3xl font-black text-white mb-3">Payment Session Expired</h1>
                        <p className="text-gray-400 mb-8">
                            Your payment session has expired after 15 minutes of inactivity. For security reasons, payment sessions have a limited validity period.
                        </p>

                        {transactionData && (
                            <div className="space-y-4 mb-8">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-amber-400 mt-1" size={20} />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white mb-2">Session Details</p>
                                            <p className="text-xs text-gray-400 mb-1">
                                                Transaction ID: {transactionData.transactionId}
                                            </p>
                                            <p className="text-xs text-gray-400 mb-1">
                                                Course: {transactionData.course?.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mb-1">
                                                Amount: ₹{parseFloat(transactionData.finalAmount).toFixed(2)}
                                            </p>
                                            {transactionData.sessionExpiresAt && (
                                                <p className="text-xs text-gray-400">
                                                    Expired At: {new Date(transactionData.sessionExpiresAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
                                    <p className="text-sm text-blue-400">
                                        <strong>What happened?</strong> Payment sessions expire after 15 minutes to protect your security. You can create a new payment session to complete your enrollment.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <ModernButton
                                onClick={() => navigate(transactionData?.course?._id ? `/course/${transactionData.course._id}` : '/courses')}
                                className="!px-8"
                            >
                                <RefreshCw size={18} />
                                Create New Payment Session
                            </ModernButton>

                            <ModernButton
                                onClick={() => navigate('/dashboard')}
                                variant="secondary"
                                className="!px-8"
                            >
                                <Home size={18} />
                                Go to Dashboard
                            </ModernButton>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-xs text-gray-500">
                                No charges were made to your account. You can safely create a new payment session.
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    // Failed status
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-500/30"
                    >
                        <XCircle className="w-12 h-12 text-red-400" />
                    </motion.div>

                    <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>
                    <p className="text-gray-400 mb-8">
                        {error || transactionData?.errorMessage || 'Your payment could not be processed. Please try again.'}
                    </p>

                    {transactionData && (
                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-red-400 mt-1" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white mb-1">Error Details</p>
                                        <p className="text-xs text-gray-400">
                                            Transaction ID: {transactionData.transactionId}
                                        </p>
                                        {transactionData.errorCategory && (
                                            <p className="text-xs text-gray-400 mt-1 capitalize">
                                                Reason: {transactionData.errorCategory.replace('_', ' ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {transactionData.errorCategory === 'insufficient_funds' && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                                    <p className="text-sm text-amber-400">
                                        <strong>Suggestion:</strong> Please ensure you have sufficient balance in your account.
                                    </p>
                                </div>
                            )}

                            {transactionData.errorCategory === 'card_declined' && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                                    <p className="text-sm text-amber-400">
                                        <strong>Suggestion:</strong> Please try a different payment method or contact your bank.
                                    </p>
                                </div>
                            )}

                            {transactionData.errorCategory === 'expired' && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                                    <p className="text-sm text-amber-400">
                                        <strong>Note:</strong> Your payment session expired after 15 minutes. Please create a new payment session to try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {retryCount < 3 && transactionData && transactionData.errorCategory !== 'expired' && (
                            <ModernButton
                                onClick={handleRetryPayment}
                                className="!px-8"
                            >
                                <RefreshCw size={18} />
                                Try Again ({3 - retryCount} attempts left)
                            </ModernButton>
                        )}

                        {transactionData && transactionData.errorCategory === 'expired' && (
                            <ModernButton
                                onClick={() => navigate(transactionData?.course?._id ? `/course/${transactionData.course._id}` : '/courses')}
                                className="!px-8"
                            >
                                <RefreshCw size={18} />
                                Create New Payment Session
                            </ModernButton>
                        )}

                        <ModernButton
                            onClick={() => navigate('/dashboard')}
                            variant="secondary"
                            className="!px-8"
                        >
                            <Home size={18} />
                            Go to Dashboard
                        </ModernButton>
                    </div>

                    {retryCount >= 3 && (
                        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-sm text-gray-400">
                                Maximum retry attempts reached. Please contact{' '}
                                <a href="/support" className="text-primary hover:underline">
                                    support
                                </a>{' '}
                                for assistance.
                            </p>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default PaymentCallback;
