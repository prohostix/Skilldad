import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, TrendingUp, Users, CheckCircle, AlertCircle, 
    Eye, Send, BarChart3, Trophy, Download 
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ResultsManagement = ({ examId }) => {
    const [results, setResults] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [ungradedCount, setUngradedCount] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        fetchResults();
        checkUngradedSubmissions();
    }, [examId]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.get(`/api/results/exam/${examId}`, config);
            setResults(response.data.results || []);
            setStatistics(response.data.statistics || null);
        } catch (err) {
            showToast('Failed to fetch results', 'error');
        } finally {
            setLoading(false);
        }
    };

    const checkUngradedSubmissions = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.get(
                `/api/submissions/exam/${examId}?status=submitted`,
                config
            );
            setUngradedCount(response.data.length);
        } catch (err) {
            console.error('Failed to check ungraded submissions:', err);
        }
    };

    const handlePublishResults = async () => {
        if (ungradedCount > 0) {
            showToast(
                `Cannot publish: ${ungradedCount} submission${ungradedCount !== 1 ? 's' : ''} still ungraded`,
                'error'
            );
            return;
        }

        setShowConfirmDialog(true);
    };

    const confirmPublish = async () => {
        setPublishing(true);
        setShowConfirmDialog(false);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const response = await axios.post(
                `/api/exams/${examId}/publish-results`,
                {},
                config
            );

            showToast(
                `Results published successfully! ${response.data.count} students notified`,
                'success'
            );
            fetchResults();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to publish results', 'error');
        } finally {
            setPublishing(false);
        }
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A+': 'text-green-400 bg-green-500/20',
            'A': 'text-green-400 bg-green-500/20',
            'B+': 'text-blue-400 bg-blue-500/20',
            'B': 'text-blue-400 bg-blue-500/20',
            'C': 'text-yellow-400 bg-yellow-500/20',
            'D': 'text-orange-400 bg-orange-500/20',
            'F': 'text-red-400 bg-red-500/20'
        };
        return colors[grade] || 'text-white/50 bg-white/10';
    };

    if (loading) {
        return (
            <GlassCard className="p-12">
                <div className="text-center text-white/50">Loading results...</div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <span className="text-sm text-white/50">Total Students</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{statistics.totalStudents}</p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <TrendingUp size={20} className="text-green-400" />
                            </div>
                            <span className="text-sm text-white/50">Average Score</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {statistics.averagePercentage?.toFixed(1)}%
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Trophy size={20} className="text-purple-400" />
                            </div>
                            <span className="text-sm text-white/50">Highest Score</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {statistics.highestScore}/{statistics.totalMarks}
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle size={20} className="text-green-400" />
                            </div>
                            <span className="text-sm text-white/50">Pass Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {statistics.passRate?.toFixed(1)}%
                        </p>
                    </GlassCard>
                </div>
            )}

            {/* Main Results Card */}
            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Exam Results</h3>
                        <p className="text-sm text-white/50">
                            {results.length} result{results.length !== 1 ? 's' : ''} generated
                            {ungradedCount > 0 && (
                                <span className="ml-2 text-yellow-400">
                                    • {ungradedCount} ungraded submission{ungradedCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {results.length > 0 && !results[0]?.isPublished && (
                            <ModernButton
                                onClick={handlePublishResults}
                                disabled={publishing || ungradedCount > 0}
                            >
                                <Send size={18} className="mr-2" />
                                {publishing ? 'Publishing...' : 'Publish Results'}
                            </ModernButton>
                        )}
                        {results[0]?.isPublished && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl">
                                <CheckCircle size={18} />
                                <span className="font-semibold">Published</span>
                            </div>
                        )}
                    </div>
                </div>

                {ungradedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3"
                    >
                        <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-semibold text-sm">
                                Grading Incomplete
                            </p>
                            <p className="text-yellow-400/70 text-sm mt-1">
                                {ungradedCount} submission{ungradedCount !== 1 ? 's' : ''} must be graded before publishing results.
                                Please complete grading first.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Results Table */}
                {results.length === 0 ? (
                    <div className="text-center py-12 text-white/30">
                        <BarChart3 size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">No results generated yet</p>
                        <p className="text-sm mt-2">Results will appear here after grading submissions</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Rank</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Student</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-white/70">Score</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-white/70">Percentage</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-white/70">Grade</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-white/70">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <motion.tr
                                        key={result._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {result.rank <= 3 && (
                                                    <Trophy
                                                        size={18}
                                                        className={
                                                            result.rank === 1
                                                                ? 'text-yellow-400'
                                                                : result.rank === 2
                                                                ? 'text-gray-400'
                                                                : 'text-orange-400'
                                                        }
                                                    />
                                                )}
                                                <span className="font-bold text-white">#{result.rank}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {result.student?.name || 'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-white/50">
                                                    {result.student?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="font-semibold text-white">
                                                {result.obtainedMarks}/{result.totalMarks}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="font-semibold text-white">
                                                {result.percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${getGradeColor(
                                                    result.grade
                                                )}`}
                                            >
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {result.isPassed ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
                                                    <CheckCircle size={14} />
                                                    Passed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
                                                    <AlertCircle size={14} />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirmDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Publish Results?
                                    </h3>
                                    <p className="text-sm text-white/70">
                                        This will make results visible to all students and send notifications.
                                        This action cannot be undone.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <ModernButton
                                        variant="secondary"
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </ModernButton>
                                    <ModernButton
                                        onClick={confirmPublish}
                                        className="flex-1"
                                    >
                                        Publish Now
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultsManagement;
