import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Clock, Trophy, Trash2, FileText, Upload, Link, Eye, ChevronDown } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ExamScheduler = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        university: '',
        examType: 'online-mcq',
        scheduledStartTime: '',
        scheduledEndTime: '',
        duration: 60,
        totalMarks: 100,
        passingScore: 40,
        isMockExam: false,
        instructions: '',
    });


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
            // Handle different response formats: { data: [...] }, { exams: [...] }, or [...]
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

    const fetchCourses = async () => {
        try {
            const config = getAuthConfig();
            if (!config) return;
            const { data } = await axios.get('/api/courses/admin', config);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            if (error.response?.status === 401) {
                console.warn('[fetchCourses] Unauthorized');
            }
        }
    };

    const fetchUniversities = async () => {
        try {
            const config = getAuthConfig();
            if (!config) return;
            const { data } = await axios.get('/api/admin/universities', config);
            setUniversities(data);
        } catch (error) {
            console.error('Error fetching universities:', error);
            if (error.response?.status === 401) {
                console.warn('[fetchUniversities] Unauthorized');
            }
        }
    };


    useEffect(() => {
        fetchExams();
        fetchCourses();
        fetchUniversities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate time window
        const startTime = new Date(formData.scheduledStartTime);
        const endTime = new Date(formData.scheduledEndTime);
        const durationMs = formData.duration * 60 * 1000;

        if (endTime <= startTime) {
            showToast('End time must be after start time', 'error');
            return;
        }

        if ((endTime - startTime) < durationMs) {
            showToast('Duration must fit within the time window', 'error');
            return;
        }

        try {
            const payload = {
                ...formData,
                scheduledStartTime: formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString() : null,
                scheduledEndTime: formData.scheduledEndTime ? new Date(formData.scheduledEndTime).toISOString() : null
            };
            await axios.post('/api/exams/admin/schedule', payload, getAuthConfig());
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                course: '',
                university: '',
                examType: 'online-mcq',
                scheduledStartTime: '',
                scheduledEndTime: '',
                duration: 60,
                totalMarks: 100,
                passingScore: 40,
                isMockExam: false,
                instructions: ''
            });
            fetchExams();
            showToast('Exam scheduled successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error scheduling exam', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam? This will remove all associated questions, submissions, and results.')) {
            try {
                await axios.delete(`/api/exams/admin/${id}`, getAuthConfig());
                fetchExams();
                showToast('Exam deleted successfully', 'success');
            } catch (error) {
                showToast(error.response?.data?.message || 'Error deleting exam', 'error');
            }
        }
    };


    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <DashboardHeading title="Exam Scheduler" />
                    </div>
                    <div className="flex gap-2">
                        <ModernButton onClick={() => setShowModal(true)} className="!px-4 !py-2 text-sm">
                            <Plus size={16} className="mr-1.5" /> Schedule Exam
                        </ModernButton>
                    </div>
                </div>

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
                                    {exams.filter(e => e.status === 'ongoing').length}
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
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {exams.map((exam) => {
                                    const now = new Date();
                                    const start = new Date(exam.scheduledStartTime);
                                    const end = new Date(exam.scheduledEndTime);

                                    let statusBadge;
                                    if (exam.status === 'published') {
                                        statusBadge = <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black">PUBLISHED</span>;
                                    } else if (exam.status === 'graded') {
                                        statusBadge = <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black">GRADED</span>;
                                    } else if (exam.status === 'completed') {
                                        statusBadge = <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">COMPLETED</span>;
                                    } else if (exam.status === 'ongoing' || (now >= start && now <= end)) {
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
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${exam.examType === 'pdf-based' ? 'bg-purple-500/20 text-purple-400' :
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
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(exam._id)}
                                                    className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {exams.length === 0 && (
                                    <tr key="no-exams-row">
                                        <td colSpan={8} className="px-6 py-12 text-center text-white/30 text-sm">
                                            No exams scheduled yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* Schedule Exam Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <GlassCard className="w-full max-w-2xl relative z-[100000] my-8 bg-black/95 border-white/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-white mb-4 font-inter">Schedule New Exam</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Exam Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Midterm Examination - Data Structures"
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of exam content and topics"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">University *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    >
                                        <option value="">Select University</option>
                                        {universities && universities.map((uni) => (
                                            <option key={uni._id} value={uni._id} className="bg-[#0B0F1A]">
                                                {uni.profile?.universityName || uni.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Course *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map((course) => (
                                            <option key={course._id} value={course._id} className="bg-[#0B0F1A]">
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Exam Type *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.examType}
                                        onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                                    >
                                        <option value="online-mcq" className="bg-[#0B0F1A]">Online MCQ</option>
                                        <option value="online-descriptive" className="bg-[#0B0F1A]">Online Descriptive</option>
                                        <option value="pdf-based" className="bg-[#0B0F1A]">PDF-Based</option>
                                        <option value="mixed" className="bg-[#0B0F1A]">Mixed (MCQ + Descriptive)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Scheduled Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white [color-scheme:dark]"
                                        value={formData.scheduledStartTime}
                                        onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Scheduled End Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white [color-scheme:dark]"
                                        value={formData.scheduledEndTime}
                                        onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Total Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Mock Exam</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.isMockExam}
                                        onChange={(e) => setFormData({ ...formData, isMockExam: e.target.value === 'true' })}
                                    >
                                        <option value="false" className="bg-[#0B0F1A]">No</option>
                                        <option value="true" className="bg-[#0B0F1A]">Yes</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Instructions</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Special instructions for students taking this exam"
                                />
                            </div>

                            <div className="flex gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1 !py-2 text-sm">
                                    Schedule Exam
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </>
    );
};

export default ExamScheduler;
