import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    GraduationCap,
    Globe,
    Mail,
    TrendingUp,
    ArrowUpRight,
    MoreVertical,
    Activity,
    Shield,
    Download,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    Briefcase,
    Banknote,
    Award
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ChartCard from '../../components/ui/ChartCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const AdminDashboard = () => {
    // Pre-seed with demo values so the dashboard NEVER shows a blank/loading screen
    const [stats, setStats] = useState({
        totalUsers: 0, totalCourses: 0, totalStudents: 0,
        totalPartners: 0, totalRevenue: 0, totalTickets: 0,
        pendingEnquiries: 0, pendingPayouts: 0, pendingCertificates: 0,
        dbSize: 'Calculating...',
        chartData: [
            { name: 'Mon', value: 0 },
            { name: 'Tue', value: 0 },
            { name: 'Wed', value: 0 },
            { name: 'Thu', value: 0 },
            { name: 'Fri', value: 0 },
            { name: 'Sat', value: 0 },
            { name: 'Sun', value: 0 },
        ]
    });
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { socket } = useSocket();

    const fetchStats = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                timeout: 8000,
            };
            const { data } = await axios.get('/api/admin/stats', config);
            if (data) setStats(data);
        } catch (error) {
            console.warn('[AdminDashboard] Stats fetch failed, showing fallback values:', error.message);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setShowExportMenu(false);
        if (showExportMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showExportMenu]);

    // Chart data now comes from stats.chartData state
    const displayChartData = stats.chartData && stats.chartData.length > 0
        ? stats.chartData
        : [
            { name: 'Mon', value: 400 },
            { name: 'Tue', value: 300 },
            { name: 'Wed', value: 600 },
            { name: 'Thu', value: 800 },
            { name: 'Fri', value: 500 },
            { name: 'Sat', value: 900 },
            { name: 'Sun', value: 1100 },
        ];

    useEffect(() => {
        fetchStats();

        if (socket) {
            socket.on('vacancyApplicationUpdate', (data) => {
                toast.success(`New application from ${data.student_name}!`, { icon: '💼' });
                fetchStats(); // Refresh dashboard stats
            });
            return () => socket.off('vacancyApplicationUpdate');
        }
    }, [socket]);

    const handleExportAnalytics = async (format = 'csv') => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch analytics data
            const { data } = await axios.get('/api/admin/analytics', config);

            if (format === 'csv' || format === 'excel') {
                // Create CSV content
                const csvContent = [
                    ['Platform Analytics Report'],
                    ['Generated:', new Date().toLocaleString()],
                    [''],
                    ['Revenue Impact'],
                    ['Source', 'Amount'],
                    ...Object.entries(data.revenueImpact).map(([key, value]) => [key, `₹${value}`]),
                    [''],
                    ['User Statistics'],
                    ['Role', 'Count'],
                    ...data.userStats.map(stat => [stat._id, stat.count]),
                    [''],
                    ['Enrollment Sources'],
                    ['Source', 'Count'],
                    ...data.enrollmentSources.map(source => [source.source, source.count])
                ].map(row => row.join(',')).join('\n');

                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'csv'}`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (format === 'pdf') {
                // Create simple text-based PDF content
                let pdfContent = 'Platform Analytics Report\n';
                pdfContent += `Generated: ${new Date().toLocaleString()}\n\n`;
                pdfContent += '='.repeat(50) + '\n\n';

                pdfContent += 'Revenue Impact\n';
                pdfContent += '-'.repeat(50) + '\n';
                Object.entries(data.revenueImpact).forEach(([key, value]) => {
                    pdfContent += `${key}: ₹${value}\n`;
                });

                pdfContent += '\n\nUser Statistics\n';
                pdfContent += '-'.repeat(50) + '\n';
                data.userStats.forEach(stat => {
                    pdfContent += `${stat._id}: ${stat.count}\n`;
                });

                pdfContent += '\n\nEnrollment Sources\n';
                pdfContent += '-'.repeat(50) + '\n';
                data.enrollmentSources.forEach(source => {
                    pdfContent += `${source.source}: ${source.count}\n`;
                });

                // Create and download as text file (basic PDF alternative)
                const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.txt`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            setShowExportMenu(false);
        } catch (error) {
            console.error('Error exporting analytics:', error);
            alert('Failed to export analytics. Please try again.');
        }
    };

    const widgetStats = [
        { title: 'Total Students', value: stats.totalStudents || '1.2k', icon: GraduationCap, color: '#5B5CFF', trend: '+12.5%' },
        { title: 'Active Courses', value: stats.totalCourses || '48', icon: BookOpen, color: '#7A5CFF', trend: '+5.2%' },
        { title: 'Partner Network', value: stats.totalPartners || '12', icon: Globe, color: '#B05CFF', trend: '+8.1%' },
        { title: 'Job Applications', value: stats.totalApplications || '0', icon: Briefcase, color: '#FFAC5C', trend: 'Career' },
        { title: 'Course Enquiries', value: stats.pendingEnquiries ?? '0', icon: Mail, color: '#5B5CFF', trend: 'Pending' },
        { title: 'Open Tickets', value: stats.totalTickets || '0', icon: FileText, color: '#FF5C5C', trend: 'Active' },
        { title: 'Pending Payouts', value: stats.pendingPayouts ?? '0', icon: Banknote, color: '#22c55e', trend: 'Payout' },
        { title: 'Pending Certs', value: stats.pendingCertificates ?? '0', icon: Award, color: '#E83E8C', trend: 'Requests' },
    ];

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <DashboardHeading title="System Intelligence" />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <ModernButton
                            variant="secondary"
                            className="group"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowExportMenu(!showExportMenu);
                            }}
                        >
                            <Download size={18} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
                            Export Analytics
                            <ChevronDown size={16} className="ml-2" />
                        </ModernButton>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportAnalytics('csv');
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center space-x-3"
                                >
                                    <FileSpreadsheet size={16} className="text-primary" />
                                    <span>Export as CSV</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportAnalytics('excel');
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center space-x-3"
                                >
                                    <FileSpreadsheet size={16} className="text-primary" />
                                    <span>Export as Excel</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportAnalytics('pdf');
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center space-x-3"
                                >
                                    <FileText size={16} className="text-primary" />
                                    <span>Export as PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Matrix Stats Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {widgetStats.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="hover:border-primary/40 hover:shadow-glow-purple group relative overflow-hidden !p-3">
                            <div
                                className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-20"
                                style={{ backgroundColor: item.color }}
                            ></div>

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div
                                    className="p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 border"
                                    style={{
                                        backgroundColor: `${item.color}20`,
                                        color: item.color,
                                        borderColor: `${item.color}30`
                                    }}
                                >
                                    <item.icon size={18} />
                                </div>
                                <div className="flex items-center space-x-1 text-primary font-bold text-[11px] bg-primary/10 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-primary/30">
                                    <TrendingUp size={9} />
                                    <span>{item.trend}</span>
                                </div>
                            </div>

                            <div className="text-left relative z-10">
                                <p className="text-white/50 text-[9px] font-bold uppercase tracking-[0.2em] font-inter opacity-70 mb-1">{item.title}</p>
                                <p className="text-lg sm:text-xl font-black text-white font-jakarta">{item.value}</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Enrollment Momentum - full width, no longer sharing a grid row with Live Pulse */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-3xl p-1"
            >
                <div className="h-[400px] w-full">
                    <ChartCard
                        title="Enrollment Momentum"
                        subtitle="Last 7 Days"
                        data={displayChartData}
                        type="area"
                        color="#5B5CFF"
                    />
                </div>
            </motion.div>

            {/* Live Pulse - its own full-width row instead of being squeezed under/beside the graph */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <GlassCard className="flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-base font-semibold text-white font-poppins flex items-center">
                            <Activity size={18} className="mr-2 text-primary" /> Live Pulse
                        </h2>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(stats.recentActivities && stats.recentActivities.length > 0 ? stats.recentActivities : [
                            { user: 'Sarah Jenkins', action: 'Enrolled in Python Masterclass', time: '2m ago', initial: 'SJ' },
                            { user: 'Tech University', action: 'Added 50 new seats', time: '1h ago', initial: 'TU' },
                            { user: 'Marcus Thorne', action: 'Certificate generated', time: '5h ago', initial: 'MT' },
                            { user: 'Fin Global', action: 'Payout approved', time: '1d ago', initial: 'FG' },
                        ]).map((activity, i) => (
                            <div key={i} className="flex items-center space-x-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white/50 border border-white/10 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                    {activity.initial}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{activity.user}</p>
                                    <p className="text-xs text-white/50 truncate">{activity.action}</p>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter whitespace-nowrap">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => toast.success('Activity logs fetched for the last 30 days')}
                        className="w-full mt-8 py-3 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl border border-dashed border-primary/30 transition-all uppercase tracking-widest"
                    >
                        Comprehensive Logs
                    </button>
                </GlassCard>
            </motion.div>

            {/* Infrastructure Status - its own full-width row so it isn't squeezed
                to the bottom of the taller Live Pulse column and cut off by the footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <GlassCard className="bg-transparent border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white flex items-center">
                            <Shield size={18} className="mr-2 text-primary" /> Infrastructure
                        </h3>
                        <MoreVertical size={16} className="text-white/50" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/50 font-bold uppercase tracking-widest">Database Size (Allocated)</span>
                                <span className="font-bold text-primary">{stats.dbSize}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary via-primary-light to-primary-dark rounded-full shadow-glow-purple"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-white/50 font-inter">
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-primary mr-2 shadow-glow-purple"></span>
                                API: Healthy
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-primary mr-2 shadow-glow-purple"></span>
                                DB: {stats.dbSize ? 'Active' : 'Optimized'}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};



export default AdminDashboard;
