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

    // Set active tab based on path
    useEffect(() => {
        if (location.pathname.includes('/payouts')) {
            setActiveTab('payouts');
        } else if (location.pathname.includes('/payments')) {
            setActiveTab('payments');
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

    const handlePayoutAction = async (id, status) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const notes = prompt(`Enter notes for ${status}:`);
        let screenshotUrl = '';
        if (status === 'approved') {
            screenshotUrl = prompt('Enter Screenshot/Payment Proof URL:');
        }
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
        } catch (error) {
            console.error('Error updating payout:', error);
            showToast?.('Failed to update payout', 'error');
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
                'revenue-report': 'revenue',
                'payment-summary': 'payments',
                'partner-payouts': 'payouts',
                'enrollment-analytics': 'enrollments',
                'financial-summary': 'revenue'
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

        if (frontendType === 'revenue-report') {
            tableHead = [['Date', 'Total Revenue', 'Transaction Count']];
            tableData = data.data.map(row => [row._id, `₹${row.totalRevenue}`, row.count]);
        } else if (frontendType === 'payment-summary') {
            tableHead = [['Student', 'Email', 'Course', 'Amount', 'Status', 'Date']];
            tableData = data.data.map(p => [
                p.student?.name || 'N/A',
                p.student?.email || 'N/A',
                p.course?.title || 'N/A',
                `₹${p.amount}`,
                p.status.toUpperCase(),
                new Date(p.createdAt).toLocaleDateString()
            ]);
        } else if (frontendType === 'partner-payouts') {
            tableHead = [['Partner', 'Email', 'Amount', 'Status', 'Date']];
            tableData = data.data.map(p => [
                p.partner?.name || 'N/A',
                p.partner?.email || 'N/A',
                `₹${p.amount}`,
                p.status.toUpperCase(),
                new Date(p.createdAt).toLocaleDateString()
            ]);
        } else if (frontendType === 'enrollment-analytics') {
            tableHead = [['Center', 'Total Enrollments', 'Amount', 'Pending', 'Approved']];
            tableData = data.data.map(row => [
                row._id || 'Direct',
                row.totalEnrollments,
                `₹${row.totalAmount}`,
                row.pendingCount,
                row.approvedCount
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

        if (frontendType === 'revenue-report') {
            worksheetData.push(['Date', 'Total Revenue', 'Transaction Count']);
            data.data.forEach(row => {
                worksheetData.push([row._id, row.totalRevenue, row.count]);
            });
        } else if (frontendType === 'payment-summary') {
            worksheetData.push(['Student', 'Email', 'Course', 'Amount', 'Status', 'Date']);
            data.data.forEach(p => {
                worksheetData.push([
                    p.student?.name || 'N/A',
                    p.student?.email || 'N/A',
                    p.course?.title || 'N/A',
                    p.amount,
                    p.status.toUpperCase(),
                    new Date(p.createdAt).toLocaleDateString()
                ]);
            });
        } else if (frontendType === 'partner-payouts') {
            worksheetData.push(['Partner', 'Email', 'Amount', 'Status', 'Date']);
            data.data.forEach(p => {
                worksheetData.push([
                    p.partner?.name || 'N/A',
                    p.partner?.email || 'N/A',
                    p.amount,
                    p.status.toUpperCase(),
                    new Date(p.createdAt).toLocaleDateString()
                ]);
            });
        } else if (frontendType === 'enrollment-analytics') {
            worksheetData.push(['Center', 'Total Enrollments', 'Amount', 'Pending', 'Approved']);
            data.data.forEach(row => {
                worksheetData.push([
                    row._id || 'Direct',
                    row.totalEnrollments,
                    row.totalAmount,
                    row.pendingCount,
                    row.approvedCount
                ]);
            });
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

    const tabs = [
        { id: 'payments', label: 'Student Payments', icon: CreditCard },
        { id: 'summaries', label: 'Enrollment Summaries', icon: BarChart3 },
        { id: 'payouts', label: 'B2B Payouts', icon: Wallet },
        { id: 'reports', label: 'Financial Reports', icon: FileText }
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-semibold text-white font-inter text-left"
                    >
                        Finance Department Panel
                    </motion.h1>
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

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', val: `₹${stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'emerald', trend: '+22.5%' },
                    { label: 'Pending Payments', val: stats.pendingPaymentsCount, icon: Clock, color: 'amber', trend: 'Active' },
                    { label: 'Partner Payouts', val: `₹${stats.totalPayoutsAmount?.toLocaleString()}`, icon: Wallet, color: 'primary', trend: '+12.1%' },
                    { label: 'Total Enrollments', val: stats.totalEnrollments || 0, icon: Users, color: 'purple', trend: '+8.3%' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="group hover:border-primary/40 transition-colors relative overflow-hidden h-full !p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color === 'emerald' ? 'emerald' : stat.color === 'amber' ? 'amber' : 'purple'}-500/10 text-${stat.color === 'primary' ? 'primary' : stat.color === 'emerald' ? 'emerald-400' : stat.color === 'amber' ? 'amber-400' : 'purple-400'} rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={28} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-left">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-white leading-tight">{stat.val}</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${activeTab === tab.id
                            ? 'bg-primary/20 text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

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
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search students, courses..."
                                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                            <option key={partner._id} value={partner._id} className="text-black">
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
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Partner</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Center</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Proof</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
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
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-emerald-400">₹{payment.amount}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${payment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-base font-bold text-white flex items-center">
                                    <Clock size={20} className="mr-2 text-primary" /> B2B Partner Payout Requests
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Partner</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Notes</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Request Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {stats.pendingPayouts.map((payout) => (
                                            <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                            {payout.partner?.name ? payout.partner.name[0] : 'P'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{payout.partner?.name}</div>
                                                            <div className="text-sm text-gray-400">{payout.partner?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-400">₹{payout.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px] truncate" title={payout.notes || 'No notes'}>
                                                    {payout.notes || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {payout.requestDate ? new Date(payout.requestDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handlePayoutAction(payout._id, 'approved')}
                                                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePayoutAction(payout._id, 'rejected')}
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
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-base font-bold text-white flex items-center">
                                    <History size={20} className="mr-2 text-emerald-400" /> Payout History & Status
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Partner</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Notes</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Payout Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {stats.approvedPayouts.map((payout) => (
                                            <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-white">{payout.partner?.name}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-400">₹{payout.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px] truncate" title={payout.notes || 'No notes'}>
                                                    {payout.notes || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {new Date(payout.payoutDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => window.open(payout.screenshotUrl || 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=1000&auto=format&fit=crop', '_blank')}
                                                        className="flex items-center space-x-1 text-primary hover:text-primary-light transition-colors ml-auto"
                                                    >
                                                        <Eye size={16} />
                                                        <span className="text-xs">View Proof</span>
                                                    </button>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { title: 'Revenue Report', description: 'Comprehensive revenue analysis', icon: TrendingUp, type: 'revenue' },
                                { title: 'Payment Summary', description: 'Student payment breakdown', icon: Receipt, type: 'payments' },
                                { title: 'Partner Payouts', description: 'B2B payout history', icon: Wallet, type: 'payouts' },
                                { title: 'Enrollment Analytics', description: 'Center-wise enrollment data', icon: BarChart3, type: 'enrollments' }
                            ].map((report, index) => (
                                <GlassCard key={index} className="!p-8 hover:border-primary/40 transition-all duration-300 cursor-pointer group hover:bg-white/[0.02]">
                                    <div className="flex flex-col items-center text-center space-y-4 mb-6">
                                        <div className="p-5 bg-primary/20 text-primary rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-primary/20">
                                            <report.icon size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed px-4">{report.description}</p>
                                        </div>
                                    </div>
                                    <ModernButton
                                        className="w-full text-sm py-3.5 font-bold tracking-wide"
                                        onClick={() => {
                                            setSelectedReportType(report.title);
                                            setShowExportModal(true);
                                        }}
                                    >
                                        <Download size={18} className="mr-2" />
                                        Export {report.title}
                                    </ModernButton>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

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
                                    src={selectedPayment.screenshotUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1000&auto=format&fit=crop'}
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
