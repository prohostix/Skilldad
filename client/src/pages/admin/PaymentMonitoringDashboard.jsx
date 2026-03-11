import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Activity,
    TrendingUp,
    Clock,
    DollarSign,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Zap,
    Database,
    Server,
    Bell,
    Eye,
    Check,
    X as XIcon,
    FileText
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';

const PaymentMonitoringDashboard = () => {
    const { showToast } = useToast();
    const socket = useSocket();
    const [timeRange, setTimeRange] = useState('24h');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [health, setHealth] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [pendingProofs, setPendingProofs] = useState([]);
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
        fetchPendingProofs();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchData(true);
            fetchPendingProofs(true);
        }, 30000);

        // Socket listener for new payment proofs
        if (socket) {
            socket.on('payment_proof_uploaded', (data) => {
                showToast(`New payment proof from ${data.studentName}`, 'info');
                fetchPendingProofs(true);
            });
        }

        return () => {
            clearInterval(interval);
            if (socket) {
                socket.off('payment_proof_uploaded');
            }
        };
    }, [timeRange, socket]);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch metrics and health in parallel
            const [metricsRes, healthRes] = await Promise.all([
                axios.get(`/api/admin/monitoring/metrics?timeRange=${timeRange}`, config),
                axios.get('/api/admin/monitoring/health', config)
            ]);

            if (metricsRes.data.success) {
                setMetrics(metricsRes.data.metrics);
                // Extract recent transactions from metrics if available
                if (metricsRes.data.metrics.recentTransactions) {
                    setTransactions(metricsRes.data.metrics.recentTransactions);
                }
            }

            if (healthRes.data.success) {
                setHealth(healthRes.data.health);
                setAlerts(healthRes.data.health.alerts || []);
            }
        } catch (error) {
            console.error('Error fetching monitoring data:', error);
            if (!silent) {
                showToast(error.response?.data?.message || 'Failed to fetch monitoring data', 'error');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchPendingProofs = async (silent = false) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/payment/pending-proofs', config);
            
            if (data.success) {
                setPendingProofs(data.payments);
            }
        } catch (error) {
            console.error('Error fetching pending proofs:', error);
            if (!silent) {
                showToast('Failed to fetch pending payment proofs', 'error');
            }
        }
    };

    const handleApproveProof = async (paymentId) => {
        setProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`/api/payment/${paymentId}/approve`, {}, config);
            
            if (data.success) {
                showToast('Payment approved and enrollment activated', 'success');
                setShowProofModal(false);
                setSelectedProof(null);
                fetchPendingProofs();
            }
        } catch (error) {
            console.error('Error approving payment:', error);
            showToast(error.response?.data?.message || 'Failed to approve payment', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectProof = async (paymentId) => {
        if (!rejectReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        setProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`/api/payment/${paymentId}/reject`, { reason: rejectReason }, config);
            
            if (data.success) {
                showToast('Payment rejected', 'success');
                setShowProofModal(false);
                setSelectedProof(null);
                setRejectReason('');
                fetchPendingProofs();
            }
        } catch (error) {
            console.error('Error rejecting payment:', error);
            showToast(error.response?.data?.message || 'Failed to reject payment', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRefresh = () => {
        fetchData();
    };

    const getHealthStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'text-emerald-400';
            case 'degraded':
                return 'text-amber-400';
            case 'unhealthy':
                return 'text-red-400';
            default:
                return 'text-white/50';
        }
    };

    const getHealthStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="text-emerald-400" size={20} />;
            case 'degraded':
                return <AlertTriangle className="text-amber-400" size={20} />;
            case 'unhealthy':
                return <XCircle className="text-red-400" size={20} />;
            default:
                return <Activity className="text-white/50" size={20} />;
        }
    };

    const getPaymentMethodIcon = (method) => {
        return <CreditCard className="text-white/50" size={16} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardHeading title="Payment Monitoring Dashboard" />
                <div className="flex items-center space-x-3">
                    <ModernButton
                        variant="secondary"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </ModernButton>
                </div>
            </div>

            {/* Time Range Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="!p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <Clock className="text-primary" size={20} />
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                Time Range
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:ml-auto">
                            {['24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        timeRange === range
                                            ? 'bg-primary text-white shadow-glow-gradient'
                                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="!p-4 border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-start space-x-3">
                            <Bell className="text-amber-400 mt-1" size={20} />
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-amber-400 mb-2">Active Alerts</h3>
                                <div className="space-y-2">
                                    {alerts.map((alert, index) => (
                                        <div key={index} className="text-xs text-white/70">
                                            • {alert}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Pending Payment Proofs */}
            {pendingProofs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FileText className="text-primary mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">
                                    Pending Payment Proofs ({pendingProofs.length})
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {pendingProofs.map((proof, index) => (
                                <motion.div
                                    key={proof._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <img
                                            src={proof.course?.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                            alt={proof.course?.title}
                                            className="w-16 h-12 object-cover rounded-lg"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-sm">
                                                {proof.student?.name}
                                            </p>
                                            <p className="text-xs text-white/50">
                                                {proof.course?.title}
                                            </p>
                                            <p className="text-xs text-white/50 mt-1">
                                                {new Date(proof.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right mr-4">
                                            <p className="text-white font-bold">₹{proof.amount}</p>
                                            <p className="text-xs text-white/50 capitalize">
                                                {proof.paymentMethod?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <ModernButton
                                            variant="secondary"
                                            onClick={() => {
                                                setSelectedProof(proof);
                                                setShowProofModal(true);
                                            }}
                                        >
                                            <Eye size={16} className="mr-2" />
                                            Review
                                        </ModernButton>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Proof Review Modal */}
            {showProofModal && selectedProof && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Review Payment Proof</h3>
                            <button
                                onClick={() => {
                                    setShowProofModal(false);
                                    setSelectedProof(null);
                                    setRejectReason('');
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <XIcon size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Student Info */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
                                    Student Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-white/50">Name</p>
                                        <p className="text-white font-semibold">{selectedProof.student?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Email</p>
                                        <p className="text-white font-semibold">{selectedProof.student?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
                                    Payment Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-white/50">Course</p>
                                        <p className="text-white font-semibold">{selectedProof.course?.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Amount</p>
                                        <p className="text-white font-semibold">₹{selectedProof.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Payment Method</p>
                                        <p className="text-white font-semibold capitalize">
                                            {selectedProof.paymentMethod?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Transaction ID</p>
                                        <p className="text-white font-semibold font-mono text-xs">
                                            {selectedProof.transactionId}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-white/50">Submitted</p>
                                        <p className="text-white font-semibold">
                                            {new Date(selectedProof.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {selectedProof.notes && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-white/50">Notes</p>
                                            <p className="text-white">{selectedProof.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Screenshot */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
                                    Payment Screenshot
                                </h4>
                                <img
                                    src={`/${selectedProof.screenshotUrl}`}
                                    alt="Payment Proof"
                                    className="w-full rounded-lg border border-white/10"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                                    }}
                                />
                            </div>

                            {/* Rejection Reason Input */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <label className="block text-sm font-bold text-white/50 uppercase tracking-wider mb-2">
                                    Rejection Reason (if rejecting)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Enter reason for rejection..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <ModernButton
                                    variant="secondary"
                                    onClick={() => handleRejectProof(selectedProof._id)}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <XIcon size={16} className="mr-2" />
                                    {processing ? 'Processing...' : 'Reject'}
                                </ModernButton>
                                <ModernButton
                                    onClick={() => handleApproveProof(selectedProof._id)}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <Check size={16} className="mr-2" />
                                    {processing ? 'Processing...' : 'Approve & Enroll'}
                                </ModernButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Key Metrics */}
            {metrics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <TrendingUp className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">Key Metrics</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Success Rate */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Success Rate
                                    </span>
                                    <CheckCircle2
                                        className={metrics.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}
                                        size={20}
                                    />
                                </div>
                                <p className={`text-2xl font-bold ${
                                    metrics.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                    {metrics.successRate.toFixed(2)}%
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                    {metrics.successfulPayments} / {metrics.totalAttempts} successful
                                </p>
                            </div>

                            {/* Avg Processing Time */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Avg Processing Time
                                    </span>
                                    <Clock
                                        className={metrics.averageProcessingTime <= 5 ? 'text-emerald-400' : 'text-amber-400'}
                                        size={20}
                                    />
                                </div>
                                <p className={`text-2xl font-bold ${
                                    metrics.averageProcessingTime <= 5 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                    {metrics.averageProcessingTime.toFixed(2)}s
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                    {metrics.averageProcessingTime <= 5 ? 'Within threshold' : 'Above threshold'}
                                </p>
                            </div>

                            {/* Total Amount */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Total Amount
                                    </span>
                                    <DollarSign className="text-blue-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    ₹{metrics.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                    {timeRange === '24h' ? 'Last 24 hours' : timeRange === '7d' ? 'Last 7 days' : 'Last 30 days'}
                                </p>
                            </div>

                            {/* Failed Payments */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Failed Payments
                                    </span>
                                    <XCircle className="text-red-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-red-400">
                                    {metrics.failedPayments}
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                    {((metrics.failedPayments / metrics.totalAttempts) * 100).toFixed(1)}% of total
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Charts Row */}
            {metrics && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Payment Method Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center mb-6">
                                <CreditCard className="text-primary mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">Payment Method Distribution</h2>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(metrics.paymentMethodDistribution || {}).map(([method, count]) => {
                                    const percentage = (count / metrics.totalAttempts) * 100;
                                    return (
                                        <div key={method} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    {getPaymentMethodIcon(method)}
                                                    <span className="text-white capitalize">
                                                        {method.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-white/50">
                                                    {count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Failure Reasons Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center mb-6">
                                <AlertTriangle className="text-amber-400 mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">Failure Reasons</h2>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(metrics.failureReasons || {}).map(([reason, count]) => {
                                    const percentage = metrics.failedPayments > 0 
                                        ? (count / metrics.failedPayments) * 100 
                                        : 0;
                                    return (
                                        <div key={reason} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="text-red-400" size={16} />
                                                    <span className="text-white capitalize">
                                                        {reason.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-white/50">
                                                    {count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}

            {/* System Health Status */}
            {health && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <Activity className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">System Health</h2>
                            <div className="ml-auto flex items-center space-x-2">
                                {getHealthStatusIcon(health.overall)}
                                <span className={`text-sm font-semibold ${getHealthStatusColor(health.overall)}`}>
                                    {health.overall.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Database */}
                            {health.components?.database && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Database className="text-white/50" size={20} />
                                            <span className="text-white font-semibold">Database</span>
                                        </div>
                                        {getHealthStatusIcon(health.components.database.status)}
                                    </div>
                                    <p className="text-xs text-white/50">
                                        Response Time: {health.components.database.responseTime}ms
                                    </p>
                                </div>
                            )}

                            {/* HDFC Gateway */}
                            {health.components?.hdfc_gateway && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="text-white/50" size={20} />
                                            <span className="text-white font-semibold">HDFC Gateway</span>
                                        </div>
                                        {getHealthStatusIcon(health.components.hdfc_gateway.status)}
                                    </div>
                                    <p className="text-xs text-white/50">
                                        Response Time: {health.components.hdfc_gateway.responseTime}ms
                                    </p>
                                </div>
                            )}

                            {/* Redis Cache */}
                            {health.components?.redis_cache && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Server className="text-white/50" size={20} />
                                            <span className="text-white font-semibold">Redis Cache</span>
                                        </div>
                                        {getHealthStatusIcon(health.components.redis_cache.status)}
                                    </div>
                                    <p className="text-xs text-white/50">
                                        Response Time: {health.components.redis_cache.responseTime}ms
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-white/50">
                                Last checked: {new Date(health.lastChecked).toLocaleString()}
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Real-time Transaction List */}
            {transactions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <Activity className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">Recent Transactions</h2>
                        </div>

                        <div className="space-y-2">
                            {transactions.slice(0, 10).map((transaction, index) => (
                                <motion.div
                                    key={transaction.transactionId || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        {transaction.status === 'success' ? (
                                            <CheckCircle2 className="text-emerald-400" size={18} />
                                        ) : transaction.status === 'failed' ? (
                                            <XCircle className="text-red-400" size={18} />
                                        ) : (
                                            <Clock className="text-amber-400" size={18} />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-mono">
                                                {transaction.transactionId}
                                            </p>
                                            <p className="text-xs text-white/50">
                                                {transaction.paymentMethod?.replace(/_/g, ' ')} • 
                                                {new Date(transaction.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            ₹{transaction.amount?.toLocaleString()}
                                        </p>
                                        <p className={`text-xs ${
                                            transaction.status === 'success' ? 'text-emerald-400' :
                                            transaction.status === 'failed' ? 'text-red-400' :
                                            'text-amber-400'
                                        }`}>
                                            {transaction.status}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}
        </div>
    );
};

export default PaymentMonitoringDashboard;
