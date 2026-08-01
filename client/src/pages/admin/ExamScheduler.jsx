import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Trophy, FileText } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ExamScheduler = () => {
    const [exams, setExams] = useState([]);
    const { showToast } = useToast();

    const getAuthConfig = () => {
        const rawInfo = localStorage.getItem('userInfo');
        if (!rawInfo) {
            console.warn('[getAuthConfig] No user info found - redirecting to login');
            window.location.href = '/login?session=expired';
            return null;
        }
        const userInfo = JSON.parse(rawInfo);
        if (!userInfo.token) {
            console.warn('[getAuthConfig] No token found - redirecting to login');
            window.location.href = '/login?session=expired';
            return null;
        }
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchExams = async () => {
        try {
            const config = getAuthConfig();
            if (!config) return;
            const { data } = await axios.get('/api/exams/admin/all', config);
            const examsList = data.data || data.exams || data;
            setExams(Array.isArray(examsList) ? examsList : []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            if (error.response?.status === 401) {
                console.warn('[fetchExams] Unauthorized - redirecting to login');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
                window.location.href = '/login?session=expired';
            } else {
                showToast('Error fetching exams', 'error');
            }
            setExams([]);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <DashboardHeading title="Exam Schedule Details" />
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-semibold uppercase">Total Exams</p>
                            <p className="text-lg font-semibold text-white font-inter">{exams.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 text-white rounded-2xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-semibold uppercase">Scheduled</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {exams.filter(e => e.status === 'scheduled').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-500/10 text-white rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-semibold uppercase">Ongoing</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {exams.filter(e => {
                                    const now = new Date();
                                    const start = new Date(e.scheduledStartTime || e.scheduled_start);
                                    const end = new Date(e.scheduledEndTime || e.scheduled_end);
                                    const qCount = Number(e.questionCount || e.question_count || (Array.isArray(e.questions) ? e.questions.length : 0));
                                    const hasQuestions = qCount > 0 || Boolean(e.linked_paper_id || e.question_paper_url || e.questionPaperUrl);
                                    return (e.status === 'ongoing' || (now >= start && now <= end)) && hasQuestions;
                                }).length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 text-white rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs font-semibold uppercase">Published</p>
                            <p className="text-lg font-semibold text-white font-inter">
                                {exams.filter(e => e.status === 'published').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Exams Table (Read-Only) */}
            <GlassCard className="!p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/70 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Exam Title</th>
                                <th className="px-6 py-4">University</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Start Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-sm">
                            {exams.map((exam) => {
                                const now = new Date();
                                const start = new Date(exam.scheduledStartTime || exam.scheduled_start);
                                const end = new Date(exam.scheduledEndTime || exam.scheduled_end);
                                const qCount = Number(exam.questionCount || exam.question_count || (Array.isArray(exam.questions) ? exam.questions.length : 0));
                                const hasQuestions = qCount > 0 || Boolean(exam.linked_paper_id || exam.question_paper_url || exam.questionPaperUrl);

                                let statusBadge;
                                if (exam.status === 'published') {
                                    statusBadge = <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black">PUBLISHED</span>;
                                } else if (exam.status === 'graded') {
                                    statusBadge = <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black">GRADED</span>;
                                } else if (exam.status === 'completed') {
                                    statusBadge = <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">COMPLETED</span>;
                                } else if (now >= start && now <= end && !hasQuestions) {
                                    statusBadge = (
                                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-black" title="Time window active, but no questions have been uploaded by university/partner">
                                            PENDING QUESTIONS
                                        </span>
                                    );
                                } else if ((exam.status === 'ongoing' || (now >= start && now <= end)) && hasQuestions) {
                                    statusBadge = <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black animate-pulse">ONGOING</span>;
                                } else if (exam.status === 'scheduled' || now < start) {
                                    statusBadge = <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-black">SCHEDULED</span>;
                                } else {
                                    statusBadge = <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded text-[10px] font-black">{exam.status?.toUpperCase()}</span>;
                                }

                                return (
                                    <tr key={exam._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-semibold">{exam.title}</div>
                                            {exam.isMockExam && (
                                                <span className="text-[10px] text-amber-400 font-bold">MOCK EXAM</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white/70">
                                            {exam.university
                                                ? (exam.university.profile?.universityName || exam.university.name || 'University')
                                                : 'All Universities'}
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{exam.course?.title || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                exam.examType === 'pdf-based' ? 'bg-purple-500/20 text-purple-400' :
                                                exam.examType === 'online-mcq' ? 'bg-emerald-500/20 text-emerald-400' :
                                                exam.examType === 'online-descriptive' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                                {exam.examType?.replace('-', ' ') || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/70">
                                            {new Date(exam.scheduledStartTime).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{exam.duration} min</td>
                                        <td className="px-6 py-4">{statusBadge}</td>
                                    </tr>
                                );
                            })}
                            {exams.length === 0 && (
                                <tr key="no-exams-row">
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/30 text-sm">
                                        No exams scheduled yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default ExamScheduler;
