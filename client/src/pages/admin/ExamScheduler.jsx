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
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [linkingExam, setLinkingExam] = useState(null); // exam being linked to a paper
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        course: '',
        targetUniversity: '',
        scheduledDate: '',
        deadline: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        examMode: 'digital',
        isPublished: false,
    });

    const [uploadData, setUploadData] = useState({ title: '', type: 'exam_paper', course: '' });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchExams = async () => {
        try {
            const { data } = await axios.get('/api/exams', getAuthConfig());
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses/admin', getAuthConfig());
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchUniversities = async () => {
        try {
            const { data } = await axios.get('/api/admin/universities', getAuthConfig());
            setUniversities(data);
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            const { data } = await axios.get('/api/documents?type=exam_paper', getAuthConfig());
            setDocuments(data.filter(d => d.type === 'exam_paper'));
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchCourses();
        fetchUniversities();
        fetchDocuments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/exams', formData, getAuthConfig());
            setShowModal(false);
            setFormData({ title: '', course: '', targetUniversity: '', scheduledDate: '', deadline: '', duration: 60, totalMarks: 100, passingMarks: 40, examMode: 'digital', isPublished: false });
            fetchExams();
            showToast('Exam scheduled successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error scheduling exam', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scheduled exam?')) {
            try {
                await axios.delete(`/api/exams/${id}`, getAuthConfig());
                fetchExams();
                showToast('Exam deleted successfully', 'success');
            } catch (error) {
                showToast(error.response?.data?.message || 'Error deleting exam', 'error');
            }
        }
    };

    const handleUploadPaper = async (e) => {
        e.preventDefault();
        if (!uploadFile) return showToast('Please select a file', 'error');
        setUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('document', uploadFile);
            formData.append('title', uploadData.title);
            formData.append('type', uploadData.type);
            formData.append('course', uploadData.course);

            await axios.post('/api/documents/upload', formData, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            showToast('Question paper uploaded!', 'success');
            setShowUploadModal(false);
            setUploadData({ title: '', type: 'exam_paper', course: '' });
            setUploadFile(null);
            fetchDocuments();
        } catch (err) {
            showToast(err.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleLinkPaper = async (examId, paperId) => {
        try {
            await axios.put(`/api/exams/${examId}`, { linkedPaper: paperId, examMode: 'paper-based', isPublished: true }, getAuthConfig());
            showToast('Question paper linked to exam! Students can now access it during exam window.', 'success');
            setLinkingExam(null);
            fetchExams();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to link paper', 'error');
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
                        <ModernButton variant="secondary" onClick={() => setShowUploadModal(true)} className="!px-4 !py-2 text-sm">
                            <Upload size={16} className="mr-1.5" /> Upload Paper
                        </ModernButton>
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
                                <p className="text-white/50 text-xs font-semibold uppercase">Upcoming</p>
                                <p className="text-lg font-semibold text-white font-inter">
                                    {exams.filter(e => new Date(e.scheduledDate) > new Date()).length}
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
                                <p className="text-white/50 text-xs font-semibold uppercase">Completed</p>
                                <p className="text-lg font-semibold text-white font-inter">
                                    {exams.filter(e => new Date(e.scheduledDate) < new Date()).length}
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
                                <p className="text-white/50 text-xs font-semibold uppercase">Papers Uploaded</p>
                                <p className="text-lg font-semibold text-white font-inter">{documents.length}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Uploaded Question Papers */}
                {documents.length > 0 && (
                    <GlassCard>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={16} className="text-indigo-400" /> Uploaded Question Papers
                        </h3>
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <div key={doc._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-white text-sm font-semibold">{doc.title}</p>
                                        <p className="text-white/40 text-xs">{doc.format} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `/${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-white/40 hover:text-white transition-colors"
                                            title="Preview"
                                        >
                                            <Eye size={16} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* Exams Table */}
                <GlassCard className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-white/70 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Exam Title</th>
                                    <th className="px-6 py-4">University</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Scheduled Date</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Mode</th>
                                    <th className="px-6 py-4">Paper Linked</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {exams.map((exam) => {
                                    const isUpcoming = new Date(exam.scheduledDate) > new Date();
                                    const hasPaper = !!exam.linkedPaper;
                                    return (
                                        <tr key={exam._id} className="hover:bg-white/5">
                                            <td className="px-6 py-4 text-white font-semibold">{exam.title}</td>
                                            <td className="px-6 py-4 text-white/70">
                                                {exam.targetUniversity
                                                    ? (exam.targetUniversity.profile?.universityName || exam.targetUniversity.name || 'University')
                                                    : 'All Universities'}
                                            </td>
                                            <td className="px-6 py-4 text-white/70">{exam.course?.title || 'N/A'}</td>
                                            <td className="px-6 py-4 text-white/70">
                                                {new Date(exam.scheduledDate).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-white/70">{exam.duration} min</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${exam.examMode === 'paper-based' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {exam.examMode || 'digital'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasPaper ? (
                                                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                                                        <FileText size={12} /> {exam.linkedPaper?.title || 'Linked'}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setLinkingExam(exam._id)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg text-xs font-semibold transition-all"
                                                    >
                                                        <Link size={12} /> Link Paper
                                                    </button>
                                                )}
                                                {linkingExam === exam._id && (
                                                    <div className="mt-2 flex flex-col gap-1">
                                                        {documents.length === 0 ? (
                                                            <p className="text-white/30 text-xs">No papers uploaded yet.</p>
                                                        ) : (
                                                            documents.map(doc => (
                                                                <button
                                                                    key={doc._id}
                                                                    onClick={() => handleLinkPaper(exam._id, doc._id)}
                                                                    className="text-left px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 text-white/70 hover:text-white rounded-lg text-xs transition-all"
                                                                >
                                                                    {doc.title}
                                                                </button>
                                                            ))
                                                        )}
                                                        <button
                                                            onClick={() => setLinkingExam(null)}
                                                            className="text-white/30 text-xs hover:text-white/60 text-left px-2"
                                                        >Cancel</button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isUpcoming
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-white/10 text-white/50'
                                                    }`}>
                                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                                </span>
                                            </td>
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
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-white/30 text-sm">
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
                    <GlassCard className="w-full max-w-xl relative z-[100000] my-8 bg-black/95 border-white/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-white mb-4 font-inter">Schedule New Exam</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Exam Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Target University</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.targetUniversity || ''}
                                        onChange={(e) => setFormData({ ...formData, targetUniversity: e.target.value })}
                                    >
                                        <option value="">All Universities</option>
                                        {universities && universities.map((uni) => (
                                            <option key={uni._id} value={uni._id} className="bg-[#0B0F1A]">
                                                {uni.name} ({uni.profile?.universityName || 'Uni'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Course</label>
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
                                    <label className="block text-white/70 text-xs mb-1.5">Exam Mode</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.examMode}
                                        onChange={(e) => setFormData({ ...formData, examMode: e.target.value })}
                                    >
                                        <option value="digital">Digital (MCQ)</option>
                                        <option value="paper-based">Paper-Based</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Publish Now</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                                    >
                                        <option value="false">Draft (Hidden)</option>
                                        <option value="true">Published (Visible to Students)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Scheduled Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white [color-scheme:dark]"
                                        value={formData.scheduledDate}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white [color-scheme:dark]"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Duration (min)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Total Marks</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1.5">Passing Marks</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                        value={formData.passingMarks}
                                        onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                                    />
                                </div>
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

            {/* Upload Question Paper Modal */}
            {showUploadModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowUploadModal(false); }}
                >
                    <GlassCard className="w-full max-w-md relative z-[100000] my-8 bg-black/95 border-white/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-white mb-4 font-inter">Upload Question Paper</h3>
                        <form onSubmit={handleUploadPaper} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Paper Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                    value={uploadData.title}
                                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                    placeholder="e.g. Midterm - Advanced Mathematics 2025"
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                    value={uploadData.type}
                                    onChange={e => setUploadData({ ...uploadData, type: e.target.value })}
                                >
                                    <option value="exam_paper">Question Paper</option>
                                    <option value="answer_sheet">Answer Sheet / Key</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">Related Course (optional)</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                    value={uploadData.course}
                                    onChange={e => setUploadData({ ...uploadData, course: e.target.value })}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id} className="bg-[#0B0F1A]">{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white/70 text-xs mb-1.5">File (PDF, DOC, DOCX, JPG, PNG)</label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={e => setUploadFile(e.target.files[0])}
                                    className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" disabled={uploading} className="flex-1 !py-2 text-sm">
                                    {uploading ? 'Uploading...' : 'Upload Paper'}
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
