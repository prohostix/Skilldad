import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Calendar,
    Play,
    Download,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    FileSpreadsheet,
    DollarSign,
    TrendingUp,
    Clock,
    FileText
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ReconciliationDashboard = () => {
    const { showToast } = useToast();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [running, setRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reconciliation, setReconciliation] = useState(null);
    const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        // Set default dates (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    }, []);

    const handleRunReconciliation = async () => {
        if (!startDate || !endDate) {
            showToast('Please select date range', 'error');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            showToast('Start date must be before end date', 'error');
            return;
        }

        setRunning(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.post('/api/admin/reconciliation/run', {
                startDate,
                endDate
            }, config);

            if (data.success) {
                showToast('Reconciliation started', 'info');
                // Poll for results
                setTimeout(() => fetchReconciliation(data.reconciliationId), 2000);
            }
        } catch (error) {
            console.error('Error running reconciliation:', error);
            showToast(error.response?.data?.message || 'Failed to run reconciliation', 'error');
            setRunning(false);
        }
    };

    const fetchReconciliation = async (reconciliationId) => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.get(`/api/admin/reconciliation/${reconciliationId}`, config);

            if (data.success) {
                setReconciliation(data.report);
                showToast('Reconciliation completed', 'success');
            }
        } catch (error) {
            console.error('Error fetching reconciliation:', error);
            showToast(error.response?.data?.message || 'Failed to fetch reconciliation', 'error');
        } finally {
            setRunning(false);
            setLoading(false);
        }
    };

    const handleResolveDiscrepancy = async (discrepancy) => {
        if (!resolutionNotes.trim()) {
            showToast('Please enter resolution notes', 'error');
            return;
        }

        setResolving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.post('/api/admin/reconciliation/resolve', {
                reconciliationId: reconciliation.reconciliationId,
                transactionId: discrepancy.transactionId,
                notes: resolutionNotes
            }, config);

            if (data.success) {
                showToast('Discrepancy resolved', 'success');
                setSelectedDiscrepancy(null);
                setResolutionNotes('');
                // Refresh reconciliation data
                fetchReconciliation(reconciliation.reconciliationId);
            }
        } catch (error) {
            console.error('Error resolving discrepancy:', error);
            showToast(error.response?.data?.message || 'Failed to resolve discrepancy', 'error');
        } finally {
            setResolving(false);
        }
    };

    const handleExportReport = async (format = 'csv') => {
        if (!reconciliation) {
            showToast('No reconciliation data to export', 'error');
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` },
                responseType: 'blob'
            };
            
            const { data } = await axios.get(
                `/api/admin/reconciliation/${reconciliation.reconciliationId}/export?format=${format}`,
                config
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reconciliation_${reconciliation.reconciliationId}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast(`Report exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            showToast('Failed to export report', 'error');
        }
    };

    const getDiscrepancyIcon = (type) => {
        switch (type) {
            case 'amount_mismatch':
                return <DollarSign className="text-amber-400" size={20} />;
            case 'missing_in_system':
                return <XCircle className="text-red-400" size={20} />;
            case 'missing_in_gateway':
                return <AlertTriangle className="text-orange-400" size={20} />;
            default:
                return <AlertTriangle className="text-white/50" size={20} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardHeading title="Reconciliation Dashboard" />
                {reconciliation && (
                    <div className="flex flex-wrap items-center gap-3">
                        <ModernButton variant="secondary" onClick={() => handleExportReport('csv')}>
                            <FileSpreadsheet size={18} className="mr-2" />
                            Export CSV
                        </ModernButton>
                        <ModernButton variant="secondary" onClick={() => handleExportReport('excel')}>
                            <Download size={18} className="mr-2" />
                            Export Excel
                        </ModernButton>
                    </div>
                )}
            </div>

            {/* Date Range Picker */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="!p-6">
                    <div className="flex items-center mb-6">
                        <Calendar className="text-primary mr-3" size={24} />
                        <h2 className="text-lg font-bold text-white font-poppins">Reconciliation Period</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={running}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={running}
                            />
                        </div>

                        <ModernButton
                            variant="primary"
                            onClick={handleRunReconciliation}
                            disabled={running}
                            className="md:w-auto w-full"
                        >
                            {running ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play size={18} className="mr-2" />
                                    Run Reconciliation
                                </>
                            )}
                        </ModernButton>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Reconciliation Summary */}
            {reconciliation && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center mb-6">
                                <TrendingUp className="text-primary mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">Reconciliation Summary</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Total Transactions */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Total Transactions
                                        </span>
                                        <FileText className="text-blue-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {reconciliation.summary.totalTransactions}
                                    </p>
                                </div>

                                {/* Matched Transactions */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Matched
                                        </span>
                                        <CheckCircle2 className="text-emerald-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {reconciliation.summary.matchedTransactions}
                                    </p>
                                </div>

                                {/* Unmatched Transactions */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Unmatched
                                        </span>
                                        <XCircle className="text-red-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-red-400">
                                        {reconciliation.summary.unmatchedTransactions}
                                    </p>
                                </div>
                            </div>

                            {/* Amount Totals */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {/* Total Amount */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Total Amount
                                        </span>
                                        <DollarSign className="text-blue-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ₹{reconciliation.summary.totalAmount.toLocaleString()}
                                    </p>
                                </div>

                                {/* Settled Amount */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Settled
                                        </span>
                                        <CheckCircle2 className="text-emerald-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        ₹{reconciliation.summary.settledAmount.toLocaleString()}
                                    </p>
                                </div>

                                {/* Pending Amount */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Pending
                                        </span>
                                        <Clock className="text-amber-400" size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-amber-400">
                                        ₹{reconciliation.summary.pendingAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Discrepancies List */}
                    {reconciliation.discrepancies && reconciliation.discrepancies.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard className="!p-6">
                                <div className="flex items-center mb-6">
                                    <AlertTriangle className="text-amber-400 mr-3" size={24} />
                                    <h2 className="text-lg font-bold text-white font-poppins">
                                        Discrepancies ({reconciliation.discrepancies.length})
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {reconciliation.discrepancies.map((discrepancy, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`bg-white/5 rounded-xl p-4 border ${
                                                discrepancy.resolved
                                                    ? 'border-emerald-500/30'
                                                    : 'border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3 flex-1">
                                                    {getDiscrepancyIcon(discrepancy.type)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="text-white font-mono text-sm">
                                                                {discrepancy.transactionId}
                                                            </span>
                                                            {discrepancy.resolved && (
                                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                                                    Resolved
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                                                            {discrepancy.type.replace(/_/g, ' ')}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            {discrepancy.systemAmount !== undefined && (
                                                                <div>
                                                                    <span className="text-white/50">System: </span>
                                                                    <span className="text-white font-bold">
                                                                        ₹{discrepancy.systemAmount}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {discrepancy.gatewayAmount !== undefined && (
                                                                <div>
                                                                    <span className="text-white/50">Gateway: </span>
                                                                    <span className="text-white font-bold">
                                                                        ₹{discrepancy.gatewayAmount}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {discrepancy.notes && (
                                                            <p className="text-xs text-white/70 mt-2 italic">
                                                                Note: {discrepancy.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {!discrepancy.resolved && (
                                                    <ModernButton
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setSelectedDiscrepancy(discrepancy)}
                                                    >
                                                        Resolve
                                                    </ModernButton>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </>
            )}

            {/* Loading State */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                >
                    <Loader2 className="text-primary animate-spin mb-4" size={48} />
                    <p className="text-white/50 text-sm">Loading reconciliation data...</p>
                </motion.div>
            )}

            {/* Resolve Discrepancy Modal */}
            {selectedDiscrepancy && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => !resolving && setSelectedDiscrepancy(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center mb-6">
                                <CheckCircle2 className="text-primary mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">Resolve Discrepancy</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                                        Transaction ID
                                    </p>
                                    <p className="text-white font-mono">{selectedDiscrepancy.transactionId}</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                                        Discrepancy Type
                                    </p>
                                    <p className="text-white">{selectedDiscrepancy.type.replace(/_/g, ' ')}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Resolution Notes
                                    </label>
                                    <textarea
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="Enter notes explaining how this discrepancy was resolved..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        disabled={resolving}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <ModernButton
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedDiscrepancy(null);
                                            setResolutionNotes('');
                                        }}
                                        disabled={resolving}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </ModernButton>
                                    <ModernButton
                                        variant="primary"
                                        onClick={() => handleResolveDiscrepancy(selectedDiscrepancy)}
                                        disabled={resolving}
                                        className="flex-1"
                                    >
                                        {resolving ? (
                                            <>
                                                <Loader2 size={18} className="mr-2 animate-spin" />
                                                Resolving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} className="mr-2" />
                                                Resolve
                                            </>
                                        )}
                                    </ModernButton>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ReconciliationDashboard;