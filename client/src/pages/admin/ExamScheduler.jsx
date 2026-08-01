import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Calendar, Clock, Trophy, FileText, Search, X, 
    BookOpen, GraduationCap, Info, Eye, CheckCircle2, AlertCircle 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ExamScheduler = () => {
    const [exams, setExams] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedExam, setSelectedExam] = useState(null);
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

    // Filter Logic
    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const matchesSearch = exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exam.university?.profile?.universityName || exam.university?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status determination
            const now = new Date();
            const start = new Date(exam.scheduledStartTime || exam.scheduled_start);
            const end = new Date(exam.scheduledEndTime || exam.scheduled_end);
            const qCount = Number(exam.questionCount || exam.question_count || (Array.isArray(exam.questions) ? exam.questions.length : 0));
            const hasQuestions = qCount > 0 || Boolean(exam.linked_paper_id || exam.question_paper_url || exam.questionPaperUrl);
            
            let status = exam.status;
            if (now >= start && now <= end && hasQuestions && exam.status !== 'published') {
                status = 'ongoing';
            } else if (now < start && exam.status === 'scheduled') {
                status = 'scheduled';
            }

            const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
            const matchesType = selectedType === 'all' || exam.examType === selectedType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [exams, searchQuery, selectedStatus, selectedType]);

    const getStatusBadge = (exam) => {
        const now = new Date();
        const start = new Date(exam.scheduledStartTime || exam.scheduled_start);
        const end = new Date(exam.scheduledEndTime || exam.scheduled_end);
        const qCount = Number(exam.questionCount || exam.question_count || (Array.isArray(exam.questions) ? exam.questions.length : 0));
        const hasQuestions = qCount > 0 || Boolean(exam.linked_paper_id || exam.question_paper_url || exam.questionPaperUrl);

        if (exam.status === 'published') {
            return <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">PUBLISHED</span>;
        } else if (exam.status === 'graded') {
            return <span className="bg-blue-500/10 border border-blue-500/35 text-blue-400 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">GRADED</span>;
        } else if (exam.status === 'completed') {
            return <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">COMPLETED</span>;
        } else if (now >= start && now <= end && !hasQuestions) {
            return <span className="bg-yellow-500/10 border border-yellow-500/35 text-yellow-300 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">PENDING QUESTIONS</span>;
        } else if ((exam.status === 'ongoing' || (now >= start && now <= end)) && hasQuestions) {
            return <span className="bg-red-500/15 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider animate-pulse">ONGOING</span>;
        } else if (exam.status === 'scheduled' || now < start) {
            return <span className="bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">SCHEDULED</span>;
        } else {
            return <span className="bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">{exam.status || 'UNKNOWN'}</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <DashboardHeading title="Exam Schedule Hub" />
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Total Exams</p>
                            <p className="text-2xl font-bold text-white font-inter mt-1">{exams.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Scheduled</p>
                            <p className="text-2xl font-bold text-white font-inter mt-1">
                                {exams.filter(e => e.status === 'scheduled').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="hover:border-red-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Ongoing</p>
                            <p className="text-2xl font-bold text-white font-inter mt-1">
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
                <GlassCard className="hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Published Results</p>
                            <p className="text-2xl font-bold text-white font-inter mt-1">
                                {exams.filter(e => e.status === 'published').length}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Filter Bar */}
            <GlassCard className="p-4 flex flex-row flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search exam, course, or university..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-primary/50 transition-all outline-none"
                    />
                </div>
                
                <div className="flex gap-3 flex-shrink-0">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                    >
                        <option value="all" className="bg-[#0f0720]">All Statuses</option>
                        <option value="scheduled" className="bg-[#0f0720]">Scheduled</option>
                        <option value="ongoing" className="bg-[#0f0720]">Ongoing</option>
                        <option value="completed" className="bg-[#0f0720]">Completed</option>
                        <option value="graded" className="bg-[#0f0720]">Graded</option>
                        <option value="published" className="bg-[#0f0720]">Published</option>
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                    >
                        <option value="all" className="bg-[#0f0720]">All Types</option>
                        <option value="online-mcq" className="bg-[#0f0720]">Online MCQ</option>
                        <option value="online-descriptive" className="bg-[#0f0720]">Online Descriptive</option>
                        <option value="pdf-based" className="bg-[#0f0720]">PDF-Based</option>
                        <option value="mixed" className="bg-[#0f0720]">Mixed</option>
                    </select>
                </div>
            </GlassCard>

            {/* Main Table Grid */}
            <GlassCard className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/50 text-[11px] uppercase font-bold tracking-wider border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">Exam Title</th>
                                <th className="px-6 py-4">Institution</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredExams.map((exam) => (
                                <tr key={exam._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-semibold">{exam.title}</div>
                                        {exam.isMockExam && (
                                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 inline-block">MOCK EXAM</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={14} className="text-primary" />
                                            <span>
                                                {exam.university
                                                    ? (exam.university.profile?.universityName || exam.university.name || 'University')
                                                    : 'All Universities'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} className="text-indigo-400" />
                                            <span>{exam.course?.title || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                            exam.examType === 'pdf-based' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                                            exam.examType === 'online-mcq' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                            exam.examType === 'online-descriptive' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                            'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                                        }`}>
                                            {exam.examType?.replace('-', ' ') || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/70 font-inter">
                                        {new Date(exam.scheduledStartTime).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })} &bull; {new Date(exam.scheduledStartTime).toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-white/70 font-inter">{exam.duration} mins</td>
                                    <td className="px-6 py-4">{getStatusBadge(exam)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedExam(exam)}
                                            className="p-2 bg-white/5 hover:bg-primary/20 text-white/70 hover:text-white rounded-xl transition-all border border-white/10"
                                            title="View Full Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExams.length === 0 && (
                                <tr key="no-exams">
                                    <td colSpan={8} className="px-6 py-12 text-center text-white/30 text-sm">
                                        No matching exams found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Premium Details Drawer/Modal */}
            {selectedExam && (
                <div 
                    className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedExam(null)}
                >
                    <GlassCard 
                        className="w-full max-w-2xl relative my-8 bg-[#0F0720]/95 border-white/20 p-6 md:p-8 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedExam(null)}
                            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="space-y-6">
                            {/* Heading */}
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-xl font-bold text-white leading-tight font-inter">{selectedExam.title}</h3>
                                    {selectedExam.isMockExam && (
                                        <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">MOCK EXAM</span>
                                    )}
                                </div>
                                <p className="text-white/40 text-xs mt-1">Exam ID: {selectedExam._id}</p>
                            </div>

                            {/* Main Badges */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Exam Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedExam)}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Duration</p>
                                    <p className="text-sm font-semibold text-white mt-1 font-inter">{selectedExam.duration} Minutes</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Total Marks</p>
                                    <p className="text-sm font-semibold text-white mt-1 font-inter">{selectedExam.totalMarks || 100} Marks</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Passing Criteria</p>
                                    <p className="text-sm font-semibold text-white mt-1 font-inter">{selectedExam.passingScore || 40}% Score</p>
                                </div>
                            </div>

                            {/* Institution Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                    <div className="flex items-center gap-2 text-white/50 text-xs font-semibold">
                                        <GraduationCap size={16} className="text-primary" />
                                        <span>Institution (University/Partner)</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white">
                                        {selectedExam.university?.profile?.universityName || selectedExam.university?.name || 'All Universities'}
                                    </p>
                                    <p className="text-white/40 text-[10px]">Role: {selectedExam.university?.role?.toUpperCase() || 'UNIVERSITY'}</p>
                                </div>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                    <div className="flex items-center gap-2 text-white/50 text-xs font-semibold">
                                        <BookOpen size={16} className="text-indigo-400" />
                                        <span>Target Course</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white">{selectedExam.course?.title || 'N/A'}</p>
                                    <p className="text-white/40 text-[10px]">Category: {selectedExam.course?.category || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Time Window */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Scheduling Window</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-inter">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
                                        <div>
                                            <p className="text-white/40 text-[10px] font-bold uppercase">Starts At</p>
                                            <p className="text-white font-semibold mt-0.5">
                                                {new Date(selectedExam.scheduledStartTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                                        <div>
                                            <p className="text-white/40 text-[10px] font-bold uppercase">Ends At</p>
                                            <p className="text-white font-semibold mt-0.5">
                                                {new Date(selectedExam.scheduledEndTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description & Instructions */}
                            {selectedExam.description && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Exam Description</h4>
                                    <p className="text-sm text-white/70 leading-relaxed bg-white/5 border border-white/5 p-3.5 rounded-xl">
                                        {selectedExam.description}
                                    </p>
                                </div>
                            )}

                            {selectedExam.instructions && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Instructions for Candidates</h4>
                                    <div className="text-sm text-white/70 leading-relaxed bg-white/5 border border-white/5 p-3.5 rounded-xl flex gap-3 items-start">
                                        <Info size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <p>{selectedExam.instructions}</p>
                                    </div>
                                </div>
                            )}

                            {/* Question Paper & Details */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-4">
                                <div className="space-y-1">
                                    <p className="text-white/50 text-xs font-semibold">Question Configuration</p>
                                    <p className="text-xs text-white/40">
                                        {selectedExam.linked_paper_id || selectedExam.question_paper_url || selectedExam.questionPaperUrl
                                            ? 'PDF Question Paper Uploaded'
                                            : `Digital MCQ/Descriptive (${selectedExam.questions?.length || selectedExam.questionCount || 0} Questions)`
                                        }
                                    </p>
                                </div>
                                
                                {Boolean(selectedExam.linked_paper_id || selectedExam.question_paper_url || selectedExam.questionPaperUrl) && (
                                    <a 
                                        href={selectedExam.question_paper_url || selectedExam.questionPaperUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
                                    >
                                        <FileText size={14} /> Open Question Paper
                                    </a>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default ExamScheduler;
