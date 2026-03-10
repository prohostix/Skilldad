import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    Calendar,
    DollarSign,
    Upload,
    X
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PaymentHistory = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        courseId: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        notes: '',
        screenshot: null
    });
    const [uploading, setUploading] = useState(false);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchPaymentHistory();
        fetchCourses();
    }, [statusFilter, pagination.currentPage]);

    const fetchCourses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/courses', config);
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                ...(statusFilter !== 'all' && { status: statusFilter })
            };

            const { data } = await axios.get('/api/payment/history', { ...config, params });

            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Failed to fetch payment history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (transactionId) => {
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

    const handleUploadProof = async (e) => {
        e.preventDefault();
        
        if (!uploadForm.courseId || !uploadForm.amount || !uploadForm.screenshot) {
            showToast('Please fill all required fields and upload screenshot', 'error');
            return;
        }

        setUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('courseId', uploadForm.courseId);
            formData.append('amount', uploadForm.amount);
            formData.append('paymentMethod', uploadForm.paymentMethod);
            formData.append('notes', uploadForm.notes);
            formData.append('screenshot', uploadForm.screenshot);

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.post('/api/payment/manual', formData, config);

            if (data.success) {
                showToast('Payment proof submitted successfully! Waiting for approval.', 'success');
                setShowUploadModal(false);
                setUploadForm({
                    courseId: '',
                    amount: '',
                    paymentMethod: 'bank_transfer',
                    notes: '',
                    screenshot: null
                });
                fetchPaymentHistory();
            }
        } catch (err) {
            console.error('Failed to upload payment proof:', err);
            showToast(err.response?.data?.message || 'Failed to submit payment proof', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }
            setUploadForm({ ...uploadForm, screenshot: file });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            success: {
                icon: CheckCircle,
                color: 'emerald',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400'
            },
            approved: {
                icon: CheckCircle,
                color: 'emerald',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400'
            },
            failed: {
                icon: XCircle,
                color: 'red',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                text: 'text-red-400'
            },
            rejected: {
                icon: XCircle,
                color: 'red',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                text: 'text-red-400'
            },
            pending: {
                icon: Clock,
                color: 'amber',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400'
            },
            refunded: {
                icon: RefreshCw,
                color: 'gray',
                bg: 'bg-gray-500/10',
                border: 'border-gray-500/20',
                text: 'text-gray-400'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.border} border rounded-full`}>
                <Icon size={14} className={config.text} />
                <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
                    {status}
                </span>
            </div>
        );
    };

    const filteredTransactions = transactions.filter(transaction =>
        searchQuery === '' ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DashboardHeading title="Payment History" className="text-2xl font-black" />

                <div className="flex items-center gap-3">
                    <ModernButton onClick={() => setShowUploadModal(true)}>
                        <Upload size={18} className="mr-2" />
                        Upload Payment Proof
                    </ModernButton>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors text-sm w-64"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                            }}
                            className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="approved">Approved</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Upload Payment Proof</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadProof} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Course <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={uploadForm.courseId}
                                    onChange={(e) => {
                                        const course = courses.find(c => c._id === e.target.value);
                                        setUploadForm({
                                            ...uploadForm,
                                            courseId: e.target.value,
                                            amount: course?.price || ''
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title} - ₹{course.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Amount (₹) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={uploadForm.amount}
                                    onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Payment Method
                                </label>
                                <select
                                    value={uploadForm.paymentMethod}
                                    onChange={(e) => setUploadForm({ ...uploadForm, paymentMethod: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="cryptocurrency">Cryptocurrency</option>
                                    <option value="cash">Cash</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Payment Screenshot <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                                {uploadForm.screenshot && (
                                    <p className="text-xs text-green-400 mt-1">
                                        Selected: {uploadForm.screenshot.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={uploadForm.notes}
                                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Add any additional notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <ModernButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </ModernButton>
                                <ModernButton
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1"
                                >
                                    {uploading ? 'Uploading...' : 'Submit Proof'}
                                </ModernButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {filteredTransactions.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
                    <p className="text-gray-400 mb-6">
                        {searchQuery ? 'Try adjusting your search criteria' : 'You haven\'t made any payments yet'}
                    </p>
                    {!searchQuery && (
                        <ModernButton onClick={() => navigate('/courses')}>
                            Browse Courses
                        </ModernButton>
                    )}
                </GlassCard>
            ) : (
                <>
                    <div className="space-y-4">
                        {filteredTransactions.map((transaction, index) => (
                            <motion.div
                                key={transaction._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard
                                    className="p-6 hover:border-primary/40 transition-all cursor-pointer group"
                                    onClick={() => navigate(`/dashboard/payment-status/${transaction.transactionId}`)}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Course Thumbnail */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={transaction.course?.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                                alt={transaction.course?.title}
                                                className="w-24 h-16 object-cover rounded-lg"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                            />
                                        </div>

                                        {/* Transaction Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                                        {transaction.course?.title || 'Course Enrollment'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                                        {transaction.transactionId}
                                                    </p>
                                                </div>
                                                {getStatusBadge(transaction.status)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                                                        <DollarSign size={12} />
                                                        <span className="uppercase tracking-wider font-bold">Amount</span>
                                                    </div>
                                                    <p className="text-white font-bold">
                                                        ₹{parseFloat(transaction.finalAmount).toFixed(2)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                                                        <CreditCard size={12} />
                                                        <span className="uppercase tracking-wider font-bold">Method</span>
                                                    </div>
                                                    <p className="text-white text-sm capitalize">
                                                        {transaction.paymentMethod?.replace('_', ' ') || 'N/A'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                                                        <Calendar size={12} />
                                                        <span className="uppercase tracking-wider font-bold">Date</span>
                                                    </div>
                                                    <p className="text-white text-sm">
                                                        {new Date(transaction.initiatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-end gap-2">
                                                    {transaction.status === 'success' && transaction.receiptUrl && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadReceipt(transaction.transactionId);
                                                            }}
                                                            className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary transition-all"
                                                            title="Download Receipt"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <p className="text-sm text-gray-400">
                                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                                {pagination.totalItems} transactions
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    disabled={pagination.currentPage === 1}
                                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            const current = pagination.currentPage;
                                            return page === 1 || page === pagination.totalPages ||
                                                (page >= current - 1 && page <= current + 1);
                                        })
                                        .map((page, index, array) => (
                                            <React.Fragment key={page}>
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${pagination.currentPage === page
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        ))}
                                </div>

                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentHistory;
