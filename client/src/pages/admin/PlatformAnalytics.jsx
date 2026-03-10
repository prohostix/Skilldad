import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    Users,
    Target,
    CircleDollarSign,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    X,
    Download
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import ChartCard from '../../components/ui/ChartCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PlatformAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [showCustomRange, setShowCustomRange] = useState(false);
    const [showGoals, setShowGoals] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const { showToast } = useToast();

    const handleExportAnalytics = () => {
        try {
            // Flatten demographics data
            const roleCsv = analytics.userStats.map(s => `User Role,${s._id},${s.count}`).join('\n');
            const sourceCsv = analytics.enrollmentSources.map(s => `Enrollment Source,${s.source},${s.count}`).join('\n');
            const revenueCsv = Object.entries(analytics.revenueImpact).map(([key, val]) => `Revenue Impact,${key.toUpperCase()},${val}`).join('\n');

            const csvContent = [
                'Metric Group,Key,Value',
                roleCsv,
                sourceCsv,
                revenueCsv
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `platform_analytics_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('Analytics exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export analytics', 'error');
        }
    };

    const fetchAnalytics = async (startDate = '', endDate = '') => {
        try {
            setAnalytics(null);
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: { startDate, endDate }
            };
            const { data } = await axios.get('/api/admin/analytics', config);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            showToast('Failed to fetch analytics', 'error');
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (!analytics) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const COLORS = ['#6D28D9', '#8B5CF6', '#C026FF', '#5B5CFF']; // Deep Purple to Blue Palette

    const enrollmentData = analytics.enrollmentSources.map(s => ({
        name: s.source,
        value: s.count
    }));

    const roleData = analytics.userStats.map(s => ({
        name: s._id,
        value: s.count
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="Intelligence & Metrics" />
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton variant="secondary" onClick={handleExportAnalytics} className="!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20 hover:!bg-emerald-500/20">
                        <Download size={18} className="mr-2" /> Export Data
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={() => setShowCustomRange(true)}>
                        <Calendar size={18} className="mr-2" /> Custom Range
                    </ModernButton>
                    <ModernButton onClick={() => setShowGoals(true)}>
                        <Target size={18} className="mr-2" /> View Goals
                    </ModernButton>
                </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics.revenueImpact).map(([key, val], i) => (
                    <GlassCard key={key} className="relative overflow-hidden group border-[#7C3AED]/30 !p-4">
                        <div className="relative z-10 text-left">
                            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-widest font-inter mb-1">
                                {key} Impact
                            </p>
                            <p className="text-xl font-semibold text-white font-inter">
                                ${val.toLocaleString()}
                            </p>
                            <div className="mt-2 flex items-center space-x-2 text-[#E879F9] text-xs font-semibold">
                                <TrendingUp size={12} />
                                <span>+14.2%</span>
                            </div>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <CircleDollarSign size={80} color={COLORS[i % COLORS.length]} />
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Enrollment Distribution"
                    data={enrollmentData}
                    type="bar"
                    color="#5B5CF0"
                />

                <GlassCard title="User Demographics" icon={PieChartIcon} className="!p-4">
                    <div className="h-[280px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="#020005" // Match background for separation
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0B001A', borderColor: '#7C3AED', color: '#fff' }}
                                    itemStyle={{ color: '#E9D5FF' }}
                                />
                                <RechartsLegend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#E9D5FF' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Comparative Analysis (Placeholder/Extended) */}
            <GlassCard title="Strategic Growth Map" icon={BarChart3} className="!p-4">
                <div className="h-[300px] mt-4" style={{ minWidth: 0, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                        <BarChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A78BFA', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A78BFA', fontSize: 12 }} />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0B001A', borderColor: '#7C3AED', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {enrollmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Custom Range Modal */}
            {showCustomRange && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCustomRange(false);
                        }
                    }}
                >
                    <GlassCard
                        className="w-full max-w-md relative z-[100000] my-8 bg-black/95 border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white font-inter">Select Date Range</h3>
                            <button
                                onClick={() => setShowCustomRange(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 font-inter">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-inter"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowCustomRange(false)}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium font-inter"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (dateRange.startDate && dateRange.endDate) {
                                            fetchAnalytics(dateRange.startDate, dateRange.endDate);
                                            setShowCustomRange(false);
                                        } else {
                                            showToast('Please select both start and end dates', 'error');
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-medium font-inter shadow-lg shadow-primary/30"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* View Goals Modal */}
            {showGoals && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowGoals(false);
                        }
                    }}
                >
                    <GlassCard
                        className="w-full max-w-2xl relative z-[100000] my-8 bg-black/95 border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white font-inter">Platform Goals</h3>
                            <button
                                onClick={() => setShowGoals(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Goal Cards */}
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-white font-inter">Student Enrollment</h4>
                                    <span className="text-xs text-emerald-400 font-bold">75% Complete</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-xs text-white/50 mt-2 font-inter">Target: 2000 students | Current: 1500 students</p>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-white font-inter">Revenue Target</h4>
                                    <span className="text-xs text-primary font-bold">60% Complete</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full" style={{ width: '60%' }}></div>
                                </div>
                                <p className="text-xs text-white/50 mt-2 font-inter">Target: $100k | Current: $60k</p>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-white font-inter">Course Completion Rate</h4>
                                    <span className="text-xs text-purple-400 font-bold">85% Complete</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <p className="text-xs text-white/50 mt-2 font-inter">Target: 90% | Current: 76.5%</p>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-white font-inter">Partner Network</h4>
                                    <span className="text-xs text-rose-400 font-bold">40% Complete</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                                <p className="text-xs text-white/50 mt-2 font-inter">Target: 50 partners | Current: 20 partners</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setShowGoals(false)}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-medium font-inter shadow-lg shadow-primary/30"
                            >
                                Close
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PlatformAnalytics;
