import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    Wallet,
    History,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    Eye,
    ChevronRight,
    Search,
    ShieldCheck,
    ArrowUpRight,
    Filter,
    Users,
    Building,
    CreditCard,
    Receipt,
    Calendar,
    Upload,
    Image,
    AlertCircle,
    BarChart3,
    PieChart,
    TrendingDown,
    RefreshCw,
    FileSpreadsheet,
    FileType
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { useToast } from '../../context/ToastContext';
import { useLocation } from 'react-router-dom';

const FinanceDashboard = () => {
    const { showToast } = useToast();
    const location = useLocation();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayouts: [],
        approvedPayouts: [],
        approvedPayoutsCount: 0,
        totalPayoutsAmount: 0,
        pendingPaymentsCount: 0,
        approvedPaymentsCount: 0,
        totalEnrollments: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payments');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPartner, setFilterPartner] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [studentPayments, setStudentPayments] = useState([]);
    const [enrollmentSummaries, setEnrollmentSummaries] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [allPartners, setAllPartners] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedReportType, setSelectedReportType] = useState(null);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [payoutReviewNotes, setPayoutReviewNotes] = useState('');
    const [payoutProofUrl, setPayoutProofUrl] = useState('');
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofModalUrl, setProofModalUrl] = useState(null); // for viewing attachment proof images

    // Helper to build correct image URL from DB path (handles with/without leading slash)
    const buildProofUrl = (rawUrl) => {
        if (!rawUrl) return null;
        if (rawUrl.startsWith('http')) return rawUrl;
        // Normalize: ensure single leading slash, then prepend backend origin
        const normalized = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        return `http://localhost:3030${normalized}`;
    };

    // Set active tab based on path
    useEffect(() => {
        if (location.pathname.includes('/payouts')) {
            setActiveTab('payouts');
        } else if (location.pathname.includes('/payments')) {
            setActiveTab('payments');
        } else if (location.pathname.includes('/reports')) {
            setActiveTab('reports');
        }
    }, [location]);

    const fetchStats = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/finance/stats', config);
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching finance stats:', error);
            showToast?.('Failed to fetch finance stats', 'error');
            setLoading(false);
        }
    };

    const fetchStudentPayments = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const params = new URLSearchParams({
                status: filterStatus,
                partner: filterPartner,
                search: searchTerm,
                limit: 100 // Fetch more for local filtering/display
            });
            const { data } = await axios.get(`/api/finance/payments?${params}`, config);
            setStudentPayments(data.payments || []);
        } catch (error) {
            console.error('Error fetching student payments:', error);
            showToast?.('Failed to fetch student payments', 'error');
        }
    };

    const fetchEnrollmentSummaries = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/finance/enrollment-summaries', config);
            setEnrollmentSummaries(data || []);
        } catch (error) {
            console.error('Error fetching enrollment summaries:', error);
            showToast?.('Failed to fetch enrollment summaries', 'error');
        }
    };

    const fetchPayoutHistory = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/finance/payout-history', config);
            setPayoutHistory(data.payouts || []);
        } catch (error) {
            console.error('Error fetching payout history:', error);
            showToast?.('Failed to fetch payout history', 'error');
        }
    };

    const fetchAllPartners = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/finance/partners', config);
            setAllPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchEnrollmentSummaries();
        fetchAllPartners();
    }, []);

    useEffect(() => {
        if (activeTab === 'payments') {
            fetchStudentPayments();
        } else if (activeTab === 'payouts') {
            fetchPayoutHistory();
        }
    }, [activeTab, filterStatus, filterPartner, searchTerm]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        if (activeTab === 'payments') {
            await fetchStudentPayments();
        } else if (activeTab === 'summaries') {
            await fetchEnrollmentSummaries();
        } else if (activeTab === 'payouts') {
            await fetchPayoutHistory();
        }
        setRefreshing(false);
        showToast?.('Data refreshed successfully', 'success');
    };

    const handlePaymentAction = async (paymentId, action) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const notes = prompt(`Enter notes for ${action}:`);

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/finance/payments/${paymentId}`, {
                status: action === 'approve' ? 'approved' : 'rejected',
                notes
            }, config);

            showToast?.(`Payment ${action}d successfully`, 'success');
            fetchStudentPayments();
            fetchStats();
        } catch (error) {
            console.error('Error updating payment:', error);
            showToast?.('Failed to update payment', 'error');
        }
    };

    const handlePayoutAction = async (id, status, notes, screenshotUrl) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/finance/payouts/${id}`, {
                status,
                notes,
                screenshotUrl
            }, config);
            showToast?.(`Payout ${status} successfully`, 'success');
            fetchStats();
            fetchPayoutHistory();
            setSelectedPayout(null);
        } catch (error) {
            console.error('Error updating payout:', error);
            showToast?.('Failed to update payout', 'error');
        }
    };

    const handlePayoutProofUpload = async (file) => {
        if (!file) return;
        setUploadingProof(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', `Payout Proof - ${selectedPayout?.partner?.name}`);
        formData.append('type', 'receipt');

        try {
            const config = { 
                headers: { 
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            const { data } = await axios.post('/api/documents/upload', formData, config);
            const finalUrl = data.fileUrl || data.file_url || data.url;
            setPayoutProofUrl(finalUrl);
            showToast?.('Proof uploaded successfully', 'success');
        } catch (error) {
            console.error('Error uploading proof:', error);
            showToast?.('Failed to upload proof', 'error');
        } finally {
            setUploadingProof(false);
        }
    };

    const exportReport = async (reportTitle, format = 'pdf') => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            showToast?.('Authentication required', 'error');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const reportTypeMap = {
                'revenue-analytics': 'revenue',
                'student-payment-ledger': 'payments',
                'partner-settlement-report': 'payouts',
                'institutional-enrollment': 'enrollments'
            };

            const frontendType = reportTitle.toLowerCase().replace(/ /g, '-');
            const backendType = reportTypeMap[frontendType] || 'revenue';

            console.log(`Exporting report: ${reportTitle} -> ${backendType} as ${format.toUpperCase()}`);

            const { data } = await axios.get(`/api/finance/export/${backendType}`, config);

            const fileName = `${frontendType}-${new Date().toISOString().split('T')[0]}`;

            if (format === 'pdf') {
                exportAsPDF(reportTitle, frontendType, data, fileName);
            } else if (format === 'excel') {
                exportAsExcel(reportTitle, frontendType, data, fileName);
            } else if (format === 'word') {
                exportAsWord(reportTitle, frontendType, data, fileName);
            }

            showToast?.(`${reportTitle} exported as ${format.toUpperCase()} successfully`, 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            const errorMsg = error.response?.data?.message || 'Failed to generate report';
            showToast?.(`Export Error: ${errorMsg}`, 'error');
        }
    };

    const exportAsPDF = (reportTitle, frontendType, data, fileName) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(reportTitle.toUpperCase(), 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`System: SkillDad Finance Architecture`, 14, 34);

        let tableHead = [];
        let tableData = [];

        if (frontendType === 'revenue-analytics' || frontendType === 'student-payment-ledger') {
            tableHead = [['Date', 'Student', 'Course', 'Amount', 'Method', 'Status', 'Transaction ID']];
            tableData = data.map(item => [
                new Date(item.Date).toLocaleDateString(),
                item.Student,
                item.Course,
                `₹${item.Amount}`,
                item.Method,
                item.Status.toUpperCase(),
                item.TransactionID
            ]);
        } else if (frontendType === 'partner-settlement-report') {
            tableHead = [['Request Date', 'Settlement Date', 'Partner', 'Amount', 'Status', 'Reference']];
            tableData = data.map(item => [
                new Date(item.RequestDate).toLocaleDateString(),
                item.SettlementDate ? new Date(item.SettlementDate).toLocaleDateString() : 'N/A',
                item.Partner,
                `₹${item.Amount}`,
                item.Status.toUpperCase(),
                item.Reference || 'N/A'
            ]);
        } else if (frontendType === 'institutional-enrollment') {
            tableHead = [['Center', 'Course', 'Enrollment Count', 'Revenue Generated']];
            tableData = data.map(item => [
                item.Center,
                item.Course,
                item.EnrollmentCount,
                `₹${item.RevenueGenerated}`
            ]);
        }

        autoTable(doc, {
            startY: 45,
            head: tableHead,
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [108, 99, 255] },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save(`${fileName}.pdf`);
    };

    const exportAsExcel = (reportTitle, frontendType, data, fileName) => {
        let worksheetData = [];

        // Add header rows
        worksheetData.push([reportTitle.toUpperCase()]);
        worksheetData.push([`Generated on: ${new Date().toLocaleString()}`]);
        worksheetData.push([`System: SkillDad Finance Architecture`]);
        worksheetData.push([]); // Empty row

        if (frontendType === 'revenue-analytics' || frontendType === 'student-payment-ledger') {
            worksheetData.push(
                ['Date', 'Student', 'Course', 'Amount', 'Method', 'Status', 'Transaction ID'],
                ...data.map(item => [
                    new Date(item.Date).toLocaleDateString(),
                    item.Student,
                    item.Course,
                    item.Amount,
                    item.Method,
                    item.Status.toUpperCase(),
                    item.TransactionID
                ])
            );
        } else if (frontendType === 'partner-settlement-report') {
            worksheetData.push(
                ['Request Date', 'Settlement Date', 'Partner', 'Amount', 'Status', 'Reference'],
                ...data.map(item => [
                    new Date(item.RequestDate).toLocaleDateString(),
                    item.SettlementDate ? new Date(item.SettlementDate).toLocaleDateString() : 'N/A',
                    item.Partner,
                    item.Amount,
                    item.Status.toUpperCase(),
                    item.Reference || 'N/A'
                ])
            );
        } else if (frontendType === 'institutional-enrollment') {
            worksheetData.push(
                ['Center', 'Course', 'Enrollment Count', 'Revenue Generated'],
                ...data.map(item => [
                    item.Center,
                    item.Course,
                    item.EnrollmentCount,
                    item.RevenueGenerated
                ])
            );
        }

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        // Auto-size columns
        const maxWidth = worksheetData.reduce((w, r) => Math.max(w, r.length), 10);
        worksheet['!cols'] = Array(maxWidth).fill({ wch: 20 });

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const exportAsWord = async (reportTitle, frontendType, data, fileName) => {
        const children = [
            new Paragraph({
                text: reportTitle.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Generated on: ${new Date().toLocaleString()}`,
                        size: 20
                    })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `System: SkillDad Finance Architecture`,
                        size: 20
                    })
                ],
                spacing: { after: 300 }
            })
        ];

        let tableRows = [];

        if (frontendType === 'revenue-report') {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Date', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Total Revenue', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Transaction Count', bold: true })] })
                    ]
                })
            );
            data.data.forEach(row => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(row._id)] }),
                            new TableCell({ children: [new Paragraph(`₹${row.totalRevenue}`)] }),
                            new TableCell({ children: [new Paragraph(row.count.toString())] })
                        ]
                    })
                );
            });
        } else if (frontendType === 'payment-summary') {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Student', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Email', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Course', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Status', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Date', bold: true })] })
                    ]
                })
            );
            data.data.forEach(p => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(p.student?.name || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(p.student?.email || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(p.course?.title || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(`₹${p.amount}`)] }),
                            new TableCell({ children: [new Paragraph(p.status.toUpperCase())] }),
                            new TableCell({ children: [new Paragraph(new Date(p.createdAt).toLocaleDateString())] })
                        ]
                    })
                );
            });
        } else if (frontendType === 'partner-payouts') {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Partner', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Email', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Status', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Date', bold: true })] })
                    ]
                })
            );
            data.data.forEach(p => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(p.partner?.name || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(p.partner?.email || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(`₹${p.amount}`)] }),
                            new TableCell({ children: [new Paragraph(p.status.toUpperCase())] }),
                            new TableCell({ children: [new Paragraph(new Date(p.createdAt).toLocaleDateString())] })
                        ]
                    })
                );
            });
        } else if (frontendType === 'enrollment-analytics') {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Center', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Total Enrollments', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Pending', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Approved', bold: true })] })
                    ]
                })
            );
            data.data.forEach(row => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(row._id || 'Direct')] }),
                            new TableCell({ children: [new Paragraph(row.totalEnrollments.toString())] }),
                            new TableCell({ children: [new Paragraph(`₹${row.totalAmount}`)] }),
                            new TableCell({ children: [new Paragraph(row.pendingCount.toString())] }),
                            new TableCell({ children: [new Paragraph(row.approvedCount.toString())] })
                        ]
                    })
                );
            });
        }

        const table = new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
        });

        children.push(table);

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${fileName}.docx`);
    };

    const filteredPayments = studentPayments.filter(payment => {
        const studentName = payment.student?.name || '';
        const studentEmail = payment.student?.email || '';
        const courseTitle = payment.course?.title || '';
        const partnerName = payment.partner?.name || '';

        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        const matchesPartner = filterPartner === 'all' || partnerName === filterPartner;
        return matchesSearch && matchesStatus && matchesPartner;
    });

    const isPayoutsPage = location.pathname.includes('/payouts');
    const isReportsPage = location.pathname.includes('/reports');
    const isMainDashboard = location.pathname.includes('/dashboard');

    const tabs = [
        { id: 'payments', label: 'Student Payments', icon: CreditCard },
        { id: 'summaries', label: 'Enrollment Summaries', icon: BarChart3 },
        { id: 'payouts', label: 'B2B Payouts', icon: Wallet },
        { id: 'reports', label: 'Financial Reports', icon: FileText }
    ];

    const displayTabs = isPayoutsPage 
        ? tabs.filter(t => t.id === 'payouts')
        : isReportsPage
        ? tabs.filter(t => t.id === 'reports')
        : tabs.filter(t => t.id !== 'payouts' && t.id !== 'reports');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-semibold text-white tracking-tight"
                    >
                        {isPayoutsPage ? 'Payout Management' : isReportsPage ? 'Financial Intelligence Reports' : 'Finance Dashboard'}
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">System Active</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton variant="secondary" onClick={() => {
                        setSelectedReportType('Financial Summary');
                        setShowExportModal(true);
                    }}>
                        <Download size={18} className="mr-2" /> Export Reports
                    </ModernButton>
                </div>
            </div>

            {/* Compact Stats Grid - Only show on main dashboard */}
            {!isPayoutsPage && !isReportsPage && (
                <div className="flex flex-wrap gap-3 w-full">
                    {[
                        { label: 'Revenue', val: `₹${stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'emerald', trend: '+22.5%' },
                        { label: 'Pending', val: stats.pendingPaymentsCount, icon: Clock, color: 'amber', trend: 'Active' },
                        { label: 'Payouts', val: `₹${stats.totalPayoutsAmount?.toLocaleString()}`, icon: Wallet, color: 'primary', trend: '+12.1%' },
                        { label: 'Enrollments', val: stats.totalEnrollments || 0, icon: Users, color: 'purple', trend: '+8.3%' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex-1 min-w-[200px] sm:min-w-[220px]"
                        >
                            <GlassCard className="py-1.5 px-3 bg-slate-900/10 flex items-center justify-between gap-2 border border-white/5 rounded-md hover:border-white/10 transition-all w-full h-full">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1 bg-${stat.color}-500/10 text-${stat.color === 'emerald' ? 'emerald-400' : stat.color === 'amber' ? 'amber-400' : stat.color === 'primary' ? 'primary' : 'purple-400'} rounded shrink-0`}>
                                        <stat.icon size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[9px] leading-tight">{stat.label}</span>
                                        <span className="font-extrabold text-white text-[13px] mt-0.5">{stat.val}</span>
                                    </div>
                                </div>
                                <span className="text-[8px] font-bold text-slate-400 border border-white/5 px-1.5 py-0.5 rounded shrink-0 bg-white/5">{stat.trend}</span>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Navigation Tabs - Only show on main dashboard */}
            {!isPayoutsPage && !isReportsPage && (
                <div className="flex flex-wrap gap-2 border-b border-white/10 overflow-x-auto">
                    {displayTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${activeTab === tab.id
                                ? 'bg-primary/20 text-primary border-b-2 border-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={window.innerWidth < 640 ? 14 : 16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="text-[11px] sm:text-sm">{window.innerWidth < 640 ? tab.label.split(' ')[0] : tab.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'payments' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Filters */}
                        <GlassCard className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search students, courses..."
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-white/10 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all" className="text-black">All Status</option>
                                    <option value="pending" className="text-black">Pending</option>
                                    <option value="approved" className="text-black">Approved</option>
                                    <option value="rejected" className="text-black">Rejected</option>
                                </select>
                                <select
                                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-white/10 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={filterPartner}
                                    onChange={(e) => setFilterPartner(e.target.value)}
                                >
                                    <option value="all" className="text-black">All Partners</option>
                                    {allPartners.map(partner => {
                                        const name = partner.role === 'university'
                                            ? (partner.profile?.universityName || partner.name)
                                            : partner.name;
                                        return (
                                            <option key={partner.id || partner._id} value={partner.id || partner._id} className="text-black">
                                                {name} ({partner.role})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </GlassCard>

                        {/* Student Payments Table */}
                        <GlassCard className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] responsive-table">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest">Student</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest">Course</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest">Amount</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest">Status</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest hidden md:table-cell">Partner</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest hidden sm:table-cell">Center</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-widest hidden lg:table-cell">Proof</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[10px] font-medium text-white/40 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredPayments.map((payment, index) => (
                                            <tr key={payment._id || `payment-${index}`} className="hover:bg-white/5 transition-colors">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div>
                                                        <div className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{payment.student?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{payment.student?.email || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white truncate max-w-[150px]">{payment.course?.title || 'N/A'}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-emerald-400">₹{payment.amount}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-tighter ${payment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300 hidden md:table-cell truncate max-w-[120px]">{payment.partner?.name || 'Direct'}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300 hidden sm:table-cell truncate max-w-[120px]">{payment.center || 'Online'}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="flex items-center space-x-1 text-primary hover:text-primary-light transition-colors"
                                                    >
                                                        <Image size={14} />
                                                        <span className="text-xs">View</span>
                                                    </button>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                    {payment.status === 'pending' && (
                                                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                                                            <button
                                                                onClick={() => handlePaymentAction(payment._id, 'approve')}
                                                                className="p-1.5 sm:p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                                            >
                                                                <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentAction(payment._id, 'reject')}
                                                                className="p-1.5 sm:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                            >
                                                                <XCircle size={14} className="sm:w-4 sm:h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'summaries' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {enrollmentSummaries.map((summary, index) => (
                                <GlassCard key={index} className="!p-6 hover:border-primary/40 transition-colors">
                                    <div className="flex items-center space-x-4 mb-5">
                                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                                            <Building size={26} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{summary.center || 'Direct Enrollment'}</h3>
                                            <p className="text-sm text-gray-400">{summary.partnerName || 'No Partner'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="text-sm text-gray-400 font-medium">Total Enrollments</span>
                                            <span className="text-base text-white font-black">{summary.totalEnrollments}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-500/5 p-3 rounded-lg">
                                            <span className="text-sm text-gray-400 font-medium">Total Amount</span>
                                            <span className="text-lg text-emerald-400 font-black">₹{summary.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <div className="bg-amber-500/5 p-3 rounded-lg text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Pending</p>
                                                <p className="text-lg text-amber-400 font-black">{summary.pendingPayments}</p>
                                            </div>
                                            <div className="bg-emerald-500/5 p-3 rounded-lg text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Approved</p>
                                                <p className="text-lg text-emerald-400 font-black">{summary.approvedPayments}</p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'payouts' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* B2B Partner Payout Requests */}
                        <GlassCard className="overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                                <div className="text-sm font-semibold text-slate-200 flex items-center">
                                    <Clock size={16} className="mr-2 text-slate-400" /> B2B Partner Payout Requests
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full responsive-table">
                                    <thead className="bg-slate-900/50 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Partner Entity</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {stats.pendingPayouts.map((payout) => (
                                            <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                            {payout.partner?.name ? payout.partner.name[0] : 'P'}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium text-white">{payout.partner?.name}</div>
                                                            <div className="text-[10px] text-slate-500">{payout.partner?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-emerald-400">₹{payout.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-[11px] text-slate-400 max-w-[200px] truncate" title={payout.notes || 'No notes'}>
                                                    {payout.notes || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-slate-500">
                                                    {payout.requestDate ? new Date(payout.requestDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout({ ...payout, _action: 'approved' });
                                                                setPayoutReviewNotes('');
                                                                setPayoutProofUrl('');
                                                            }}
                                                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout({ ...payout, _action: 'rejected' });
                                                                setPayoutReviewNotes('');
                                                                setPayoutProofUrl('');
                                                            }}
                                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>

                        {/* Payout History */}
                        <GlassCard className="overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                                <div className="text-sm font-semibold text-slate-200 flex items-center">
                                    <History size={16} className="mr-2 text-slate-400" /> Payout History & Settlement
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full responsive-table">
                                    <thead className="bg-slate-900/50 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Recipient</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Reference</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Settlement Date</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Attachment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {stats.approvedPayouts.map((payout) => (
                                            <tr key={payout._id} className="hover:bg-white/5 transition-colors text-xs">
                                                <td className="px-6 py-4 font-medium text-white">{payout.partner?.name}</td>
                                                <td className="px-6 py-4 font-semibold text-emerald-400">₹{payout.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px] truncate" title={payout.notes || 'No notes'}>
                                                    {payout.notes || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {new Date(payout.payoutDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {payout.screenshotUrl ? (
                                                        <button
                                                            onClick={() => setProofModalUrl(buildProofUrl(payout.screenshotUrl))}
                                                            className="flex items-center space-x-1 text-primary hover:text-primary-light transition-colors ml-auto"
                                                        >
                                                            <Eye size={16} />
                                                            <span className="text-xs">View Proof</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-600 italic">No attachment</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'Revenue Analytics', description: 'Full breakdown of monthly revenue, taxes, and net income.', icon: TrendingUp, formats: ['PDF', 'Excel', 'Word'], frequency: 'Real-time' },
                                { title: 'Student Payment Ledger', description: 'Complete transaction history including pending and failed attempts.', icon: Receipt, formats: ['PDF', 'Excel'], frequency: 'Daily' },
                                { title: 'Partner Settlement Report', description: 'Consolidated B2B payout history and pending settlement status.', icon: Wallet, formats: ['Excel', 'Word'], frequency: 'Weekly' },
                                { title: 'Institutional Enrollment', description: 'Center-wise performance metrics and student acquisition data.', icon: BarChart3, formats: ['PDF', 'Excel'], frequency: 'Real-time' }
                            ].map((report, index) => (
                                <GlassCard key={index} className="!p-0 overflow-hidden hover:border-slate-700 transition-all group bg-slate-900/20 border-white/5">
                                    <div className="p-6 flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors">
                                            <report.icon size={24} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-base font-semibold text-white tracking-tight">{report.title}</div>
                                                <span className="text-[10px] font-bold text-emerald-500/80 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-tighter">
                                                    {report.frequency}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed max-w-[300px]">
                                                {report.description}
                                            </p>
                                            <div className="flex items-center gap-2 pt-3">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Formats:</span>
                                                <div className="flex gap-1">
                                                    {report.formats.map(f => (
                                                        <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setSelectedReportType(report.title);
                                                setShowExportModal(true);
                                            }}
                                            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                                        >
                                            <Download size={14} />
                                            Generate Report
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Payout Review Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${selectedPayout._action === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {selectedPayout._action === 'approved' ? 'Approve' : 'Reject'} Payout Request
                            </h3>
                            <button
                                onClick={() => setSelectedPayout(null)}
                                className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400 font-medium">Partner:</span>
                                    <span className="text-white font-bold">{selectedPayout.partner?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 font-medium">Amount:</span>
                                    <span className="text-emerald-400 font-black">₹{selectedPayout.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Review Notes</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all font-medium min-h-[100px]"
                                    placeholder="Enter reason for approval or rejection..."
                                    value={payoutReviewNotes}
                                    onChange={(e) => setPayoutReviewNotes(e.target.value)}
                                />
                            </div>

                            {selectedPayout._action === 'approved' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Payment Proof / Screenshot</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="payout-proof-upload"
                                            accept="image/*"
                                            onChange={(e) => handlePayoutProofUpload(e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="payout-proof-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all"
                                        >
                                            {uploadingProof ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-2"></div>
                                                    <span className="text-xs text-gray-400">Uploading...</span>
                                                </div>
                                            ) : payoutProofUrl ? (
                                                <div className="flex flex-col items-center">
                                                    <CheckCircle2 className="text-emerald-400 mb-2" size={28} />
                                                    <span className="text-xs text-emerald-400 font-bold">Proof Uploaded Successfully</span>
                                                    <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[200px]">{payoutProofUrl}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto text-gray-400 group-hover:text-primary transition-colors mb-2" size={28} />
                                                    <p className="text-sm text-gray-400">Click to upload payment screenshot</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex pt-4 space-x-3">
                                <ModernButton
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setSelectedPayout(null)}
                                >
                                    Cancel
                                </ModernButton>
                                <ModernButton
                                    className={`flex-1 ${selectedPayout._action === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                    onClick={() => handlePayoutAction(selectedPayout._id, selectedPayout._action, payoutReviewNotes, payoutProofUrl)}
                                    disabled={uploadingProof || (selectedPayout._action === 'approved' && !payoutProofUrl)}
                                >
                                    Confirm {selectedPayout._action === 'approved' ? 'Approval' : 'Rejection'}
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Image Preview Modal (Payout Attachment) */}
            {proofModalUrl && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setProofModalUrl(null)}
                >
                    <div
                        className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                            <h3 className="text-base font-bold text-white flex items-center">
                                <Image size={18} className="mr-2 text-primary" />
                                Payment Proof / Screenshot
                            </h3>
                            <button
                                onClick={() => setProofModalUrl(null)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-4 bg-black/30">
                            <img
                                src={proofModalUrl}
                                alt="Payment proof"
                                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div
                                style={{ display: 'none' }}
                                className="w-full h-40 flex-col items-center justify-center text-gray-400 rounded-lg bg-white/5 border border-white/10"
                            >
                                <AlertCircle size={32} className="mb-2 text-red-400" />
                                <p className="text-sm">Image could not be loaded</p>
                                <a
                                    href={proofModalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary mt-1 hover:underline"
                                >
                                    Open directly
                                </a>
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs text-gray-500 truncate max-w-[300px]">{proofModalUrl}</span>
                            <a
                                href={proofModalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-xs text-primary hover:text-primary-light transition-colors"
                            >
                                <Eye size={14} className="mr-1" /> Open Full Size
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Screenshot Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
                    <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Payment Proof - {selectedPayment.student?.name || 'Student'}</h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Transaction ID:</span>
                                    <span className="text-white ml-2 text-xs font-mono">{selectedPayment.transactionId || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Course:</span>
                                    <span className="text-white ml-2">{selectedPayment.course?.title || 'Course'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-emerald-400 ml-2 font-bold">₹{selectedPayment.amount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Date:</span>
                                    <span className="text-white ml-2">{new Date(selectedPayment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Partner:</span>
                                    <span className="text-white ml-2">{selectedPayment.partner?.name || 'Direct'}</span>
                                </div>
                            </div>
                            <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                                <img
                                    src={selectedPayment.screenshotUrl ? (selectedPayment.screenshotUrl.startsWith('http') ? selectedPayment.screenshotUrl : `/${selectedPayment.screenshotUrl}`) : 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1000&auto=format&fit=crop'}
                                    alt="Payment proof"
                                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <ModernButton
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                    onClick={() => {
                                        handlePaymentAction(selectedPayment._id, 'approve');
                                        setSelectedPayment(null);
                                    }}
                                >
                                    <CheckCircle2 size={16} className="mr-2" />
                                    Approve Payment
                                </ModernButton>
                                <ModernButton
                                    variant="secondary"
                                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    onClick={() => {
                                        handlePaymentAction(selectedPayment._id, 'reject');
                                        setSelectedPayment(null);
                                    }}
                                >
                                    <XCircle size={16} className="mr-2" />
                                    Reject Payment
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Format Selection Modal */}
            {showExportModal && selectedReportType && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Export Format</h3>
                            <button
                                onClick={() => {
                                    setShowExportModal(false);
                                    setSelectedReportType(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <XCircle size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <p className="text-gray-400 mb-6">
                            Select the format to export <span className="text-primary font-semibold">{selectedReportType}</span>
                        </p>

                        <div className="space-y-3">
                            {/* PDF Option */}
                            <button
                                onClick={() => {
                                    exportReport(selectedReportType, 'pdf');
                                    setShowExportModal(false);
                                    setSelectedReportType(null);
                                }}
                                className="w-full flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-xl transition-all group"
                            >
                                <div className="p-3 bg-red-500/20 text-red-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <FileText size={28} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-white font-bold text-lg">PDF Document</h4>
                                    <p className="text-gray-400 text-sm">Portable Document Format</p>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                            </button>

                            {/* Excel Option */}
                            <button
                                onClick={() => {
                                    exportReport(selectedReportType, 'excel');
                                    setShowExportModal(false);
                                    setSelectedReportType(null);
                                }}
                                className="w-full flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-xl transition-all group"
                            >
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet size={28} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-white font-bold text-lg">Excel Spreadsheet</h4>
                                    <p className="text-gray-400 text-sm">Microsoft Excel Format (.xlsx)</p>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                            </button>

                            {/* Word Option */}
                            <button
                                onClick={() => {
                                    exportReport(selectedReportType, 'word');
                                    setShowExportModal(false);
                                    setSelectedReportType(null);
                                }}
                                className="w-full flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-xl transition-all group"
                            >
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <FileType size={28} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-white font-bold text-lg">Word Document</h4>
                                    <p className="text-gray-400 text-sm">Microsoft Word Format (.docx)</p>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <ModernButton
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    setShowExportModal(false);
                                    setSelectedReportType(null);
                                }}
                            >
                                Cancel
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
