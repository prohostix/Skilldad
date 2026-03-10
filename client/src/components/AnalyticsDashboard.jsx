import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    CheckCircle, 
    Clock, 
    Target,
    FileText,
    Code,
    ClipboardCheck,
    Calendar,
    Filter,
    AlertCircle,
    Award
} from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import ChartCard from './ui/ChartCard';

const AnalyticsDashboard = ({ courseId }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: {}
            };

            // Add date filters if set
            if (startDate) config.params.startDate = startDate;
            if (endDate) config.params.endDate = endDate;

            const { data } = await axios.get(
                `/api/analytics/${courseId}`,
                config
            );

            setAnalyticsData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.response?.data?.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        fetchAnalytics();
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setTimeout(() => fetchAnalytics(), 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <GlassCard className="bg-red-500/10 border-red-500/20">
                <div className="flex items-center space-x-3">
                    <AlertCircle size={24} className="text-red-400" />
                    <p className="text-red-400 font-bold">{error}</p>
                </div>
            </GlassCard>
        );
    }

    const {
        courseName,
        submissionStatistics,
        questionAnalytics,
        contentCompletionRates,
        gradingQueue
    } = analyticsData;

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'exercise':
                return <Code size={16} className="text-blue-400" />;
            case 'practice':
                return <FileText size={16} className="text-purple-400" />;
            case 'quiz':
                return <ClipboardCheck size={16} className="text-emerald-400" />;
            default:
                return <FileText size={16} className="text-slate-400" />;
        }
    };

    // Prepare chart data for submission statistics
    const submissionChartData = [
        { name: 'Total', value: submissionStatistics.total },
        { name: 'Graded', value: submissionStatistics.graded },
        { name: 'Pending', value: submissionStatistics.pending }
    ];

    // Prepare chart data for grading queue
    const queueChartData = [
        { name: 'Exercises', value: gradingQueue.exercises },
        { name: 'Practices', value: gradingQueue.practices },
        { name: 'Quizzes', value: gradingQueue.quizzes }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header with Course Name and Filters */}
            <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary-purple/10 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary/20 rounded-xl">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white font-poppins">
                                Course Analytics
                            </h2>
                            <p className="text-sm text-slate-400 font-bold">
                                {courseName}
                            </p>
                        </div>
                    </div>
                    <ModernButton
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="!py-2"
                    >
                        <Filter size={16} />
                        <span>Filters</span>
                    </ModernButton>
                </div>

                {/* Date Range Filters */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <ModernButton
                                variant="primary"
                                onClick={handleApplyFilters}
                                className="!py-2"
                            >
                                <Calendar size={16} />
                                <span>Apply Filters</span>
                            </ModernButton>
                            <ModernButton
                                variant="secondary"
                                onClick={handleClearFilters}
                                className="!py-2"
                            >
                                Clear
                            </ModernButton>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Submission Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Submissions */}
                <GlassCard className="border-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                Total Submissions
                            </p>
                            <div className="text-3xl font-extrabold text-white font-poppins">
                                {submissionStatistics.total}
                            </div>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FileText size={24} className="text-blue-400" />
                        </div>
                    </div>
                </GlassCard>

                {/* Average Score */}
                <GlassCard className="border-emerald-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                Average Score
                            </p>
                            <div className="text-3xl font-extrabold text-emerald-400 font-poppins">
                                {submissionStatistics.averageScore.toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <Award size={24} className="text-emerald-400" />
                        </div>
                    </div>
                </GlassCard>

                {/* Passing Rate */}
                <GlassCard className="border-purple-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                Passing Rate
                            </p>
                            <div className="text-3xl font-extrabold text-purple-400 font-poppins">
                                {submissionStatistics.passingRate.toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Target size={24} className="text-purple-400" />
                        </div>
                    </div>
                </GlassCard>

                {/* Pending Grading */}
                <GlassCard className="border-yellow-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                Pending Grading
                            </p>
                            <div className="text-3xl font-extrabold text-yellow-400 font-poppins">
                                {submissionStatistics.pending}
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <Clock size={24} className="text-yellow-400" />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submission Status Chart */}
                <ChartCard
                    title="Submission Status"
                    subtitle="Distribution of submission states"
                    data={submissionChartData}
                    type="bar"
                    dataKey="value"
                />

                {/* Grading Queue Chart */}
                <ChartCard
                    title="Grading Queue by Type"
                    subtitle="Pending submissions by content type"
                    data={queueChartData}
                    type="bar"
                    dataKey="value"
                />
            </div>

            {/* Grading Queue Statistics */}
            <GlassCard className="border-yellow-500/20">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Clock size={20} className="text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white font-poppins">
                        Grading Queue Statistics
                    </h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Total Pending
                        </p>
                        <div className="text-2xl font-extrabold text-yellow-400 font-poppins">
                            {gradingQueue.total}
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Exercises
                        </p>
                        <div className="text-2xl font-extrabold text-blue-400 font-poppins">
                            {gradingQueue.exercises}
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Practices
                        </p>
                        <div className="text-2xl font-extrabold text-purple-400 font-poppins">
                            {gradingQueue.practices}
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Avg Grading Time
                        </p>
                        <div className="text-2xl font-extrabold text-white font-poppins">
                            {gradingQueue.averageGradingTimeMinutes}m
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Content Completion Rates */}
            <GlassCard className="border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <CheckCircle size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white font-poppins">
                        Content Completion Rates
                    </h3>
                </div>

                <div className="space-y-4">
                    {contentCompletionRates.map((content) => (
                        <div 
                            key={content.contentId}
                            className="p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        {getContentTypeIcon(content.contentType)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">
                                            {content.contentTitle}
                                        </p>
                                        <p className="text-xs text-slate-400 font-bold capitalize">
                                            {content.contentType}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-extrabold text-primary font-poppins">
                                        {content.completionRate.toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Completion
                                    </p>
                                </div>
                            </div>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary-purple rounded-full transition-all duration-1000"
                                    style={{ width: `${content.completionRate}%` }}
                                ></div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Students Attempted
                                    </p>
                                    <p className="text-sm text-white font-bold">
                                        {content.studentsAttempted} / {content.totalStudents}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Total Submissions
                                    </p>
                                    <p className="text-sm text-white font-bold">
                                        {content.totalSubmissions}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Average Score
                                    </p>
                                    <p className="text-sm text-white font-bold">
                                        {content.averageScore.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Avg Attempts
                                    </p>
                                    <p className="text-sm text-white font-bold">
                                        {content.averageAttempts.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {contentCompletionRates.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-400 font-bold">
                                No content data available for the selected period
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Question Analytics */}
            <GlassCard className="border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <TrendingUp size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white font-poppins">
                        Question Performance Analytics
                    </h3>
                </div>

                <div className="space-y-6">
                    {questionAnalytics.map((content) => (
                        <div key={content.contentId} className="space-y-3">
                            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    {getContentTypeIcon(content.contentType)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {content.contentTitle}
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold capitalize">
                                        {content.contentType} • {content.questions.length} questions
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {content.questions.map((question, index) => (
                                    <div 
                                        key={question.questionId}
                                        className="p-3 bg-white/5 rounded-lg border border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded">
                                                        Q{index + 1}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-white/10 text-slate-400 text-xs font-bold rounded capitalize">
                                                        {question.questionType.replace('-', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-300 line-clamp-2">
                                                    {question.questionText}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className={`text-lg font-extrabold font-poppins ${
                                                    question.averagePercentage >= 70 ? 'text-emerald-400' :
                                                    question.averagePercentage >= 50 ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                    {question.averagePercentage.toFixed(1)}%
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Avg Score
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Correct Rate
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {question.correctRate.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Total Attempts
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {question.totalAttempts}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Max Points
                                                </p>
                                                <p className="text-sm text-white font-bold">
                                                    {question.maxPoints}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {questionAnalytics.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-400 font-bold">
                                No question data available for the selected period
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default AnalyticsDashboard;
