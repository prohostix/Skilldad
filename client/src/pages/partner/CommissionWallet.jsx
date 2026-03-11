import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { Wallet, History, Users, DollarSign, Calculator, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CommissionWallet = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [studentCount, setStudentCount] = useState('');
    const [feePerStudent, setFeePerStudent] = useState('');
    const [commissionRate] = useState(15); // e.g. 15% rate

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    const fetchPayouts = async () => {
        try {
            const { data } = await axios.get('/api/partner/payouts', config);
            setPayouts(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchPayouts();
        }
    }, []);

    const estimatedCommission = (Number(studentCount) * Number(feePerStudent) * (commissionRate / 100)) || 0;

    const handleRequestCommission = async (e) => {
        e.preventDefault();
        if (!studentCount || !feePerStudent || Number(studentCount) <= 0 || Number(feePerStudent) <= 0) {
            toast.error('Please enter valid positive numbers');
            return;
        }

        const payoutDetails = {
            amount: estimatedCommission,
            notes: `Commission requested for ${studentCount} students. Fee: ₹${feePerStudent} each. Rate: ${commissionRate}%`
        };

        try {
            await axios.post('/api/partner/payout', payoutDetails, config);
            toast.success('Commission payout requested successfully!');
            setStudentCount('');
            setFeePerStudent('');
            fetchPayouts(); // Refresh wallet
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    const pendingTotal = payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const approvedTotal = payouts
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h4" className="text-white font-bold tracking-tight">
                        Commission & Wallet
                    </Typography>
                    <Typography className="text-gray-400 mt-2">
                        Calculate and claim your B2B partner commissions based on enrolled students.
                    </Typography>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wallet Overview */}
                <GlassCard className="col-span-full lg:col-span-1 border-primary/20 shadow-lg shadow-primary/5">
                    <h3 className="font-bold text-white mb-6 flex items-center">
                        <Wallet className="mr-2 text-primary" size={20} />
                        My Wallet
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                                Pending Payouts (To Get)
                            </p>
                            <p className="text-3xl font-black text-amber-400">
                                ₹{pendingTotal.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
                                Total Earned (Approved)
                            </p>
                            <p className="text-2xl font-black text-emerald-400">
                                ₹{approvedTotal.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Commission Claims Form */}
                <GlassCard className="col-span-full lg:col-span-2">
                    <h3 className="font-bold text-white mb-6 flex items-center">
                        <Calculator className="mr-2 text-emerald-400" size={20} />
                        Claim Commission
                    </h3>
                    <form onSubmit={handleRequestCommission} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Number of Enrolled Students
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                        placeholder="e.g. 10"
                                        value={studentCount}
                                        onChange={e => setStudentCount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Average Fee per Student (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                        placeholder="e.g. 500"
                                        value={feePerStudent}
                                        onChange={e => setFeePerStudent(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-primary-light mb-1">Estimated Commission ({commissionRate}%)</p>
                                <p className="text-2xl font-bold text-white">₹{estimatedCommission.toLocaleString()}</p>
                            </div>
                            <ModernButton type="submit" disabled={estimatedCommission <= 0} className="w-full md:w-auto p-4 flex items-center justify-center">
                                <Plus size={18} className="mr-2" />
                                Submit to Wallet
                            </ModernButton>
                        </div>
                    </form>
                </GlassCard>
            </div>

            {/* Payout History / Report */}
            <GlassCard>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white flex items-center">
                        <History className="mr-2 text-primary" size={20} />
                        Payout Report History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 flex items-center hidden md:table-cell">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                    Notes (Student Count & Fee)
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No commission claims yet. claim your first commission above.
                                    </td>
                                </tr>
                            ) : payouts.map((payout) => (
                                <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-400 hidden md:table-cell">
                                        {new Date(payout.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                                            ₹{payout.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 md:hidden mt-0.5">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 hidden sm:table-cell">
                                        {payout.notes || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${payout.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                            payout.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {payout.status === 'approved' && <CheckCircle2 size={12} className="mr-1" />}
                                            {payout.status === 'pending' && <AlertCircle size={12} className="mr-1" />}
                                            {payout.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default CommissionWallet;
