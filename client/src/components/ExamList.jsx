import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import { useToast } from '../context/ToastContext';

const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        university: '',
        course: '',
        examType: '',
        isMockExam: '',
        search: ''
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [exams, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examsRes, universitiesRes, coursesRes] = await Promise.all([
                axios.get('/api/exams/admin/all', getAuthConfig()),
                axios.get('/api/admin/universities', getAuthConfig()),
                axios.get('/api/courses/admin', getAuthConfig())
            ]);

            setExams(examsRes.data.exams || examsRes.data);
            setUniversities(universitiesRes.data);
            setCourses(coursesRes.data.courses || coursesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Error loading exam data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...exams];

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(exam => exam.status === filters.status);
        }

        // University filter
        if (filters.university) {
            filtered = filtered.filter(exam => exam.university?._id === filters.university);
        }

        // Course filter
        if (filters.course) {
            filtered = filtered.filter(exam => exam.course?._id === filters.course);
        }

        // Exam type filter
        if (filters.examType) {
            filtered = filtered.filter(exam => exam.examType === filters.examType);
        }

        // Mock exam filter
        if (filters.isMockExam !== '') {
            filtered = filtered.filter(exam => exam.isMockExam === (filters.isMockExam === 'true'));
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(exam =>
                exam.title.toLowerCase().includes(searchLower) ||
                exam.description?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredExams(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleDelete = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam? This will remove all associated questions, submissions, and results.')) {
            try {
                await axios.delete(`/api/exams/admin/${examId}`, getAuthConfig());
                showToast('Exam deleted successfully', 'success');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Error deleting exam', 'error');
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            university: '',
            course: '',
            examType: '',
            isMockExam: '',
            search: ''
        });
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadge = (exam) => {
        const now = new Date();
        const start = new Date(exam.scheduledStartTime);
        const end = new Date(exam.scheduledEndTime);

        if (exam.status === 'published') {
            return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black">PUBLISHED</span>;
        } else if (exam.status === 'graded') {
            return <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black">GRADED</span>;
        } else if (exam.status === 'completed') {
            return <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">COMPLETED</span>;
        } else if (exam.status === 'ongoing' || (now >= start && now <= end)) {
            return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black animate-pulse">ONGOING</span>;
        } else if (exam.status === 'scheduled' || now < start) {
            return <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-black">SCHEDULED</span>;
        }
        return <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded text-[10px] font-black">{exam.status?.toUpperCase()}</span>;
    };

    const getExamTypeBadge = (examType) => {
        const colors = {
            'pdf-based': 'bg-purple-500/20 text-purple-400',
            'online-mcq': 'bg-emerald-500/20 text-emerald-400',
            'online-descriptive': 'bg-blue-500/20 text-blue-400',
            'mixed': 'bg-indigo-500/20 text-indigo-400'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colors[examType] || 'bg-white/10 text-white/60'}`}>
                {examType?.replace('-', ' ') || 'N/A'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-white/50">Loading exams...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Filter size={16} />
                        Filters
                    </h3>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search exams..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="graded">Graded</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    {/* Mock Exam Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                            value={filters.isMockExam}
                            onChange={(e) => handleFilterChange('isMockExam', e.target.value)}
                        >
                            <option value="">All Exams</option>
                            <option value="false">Regular Only</option>
                            <option value="true">Mock Only</option>
                        </select>
                    </div>

                    {/* University Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                            value={filters.university}
                            onChange={(e) => handleFilterChange('university', e.target.value)}
                        >
                            <option value="">All Universities</option>
                            {universities.map(uni => (
                                <option key={uni._id} value={uni._id} className="bg-[#0B0F1A]">
                                    {uni.profile?.universityName || uni.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                            value={filters.course}
                            onChange={(e) => handleFilterChange('course', e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id} className="bg-[#0B0F1A]">
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-xs text-white/50">
                    Showing {currentExams.length} of {filteredExams.length} exams
                </div>
            </GlassCard>

            {/* Exams Table */}
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
                            {currentExams.map((exam) => (
                                <tr key={exam._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-semibold">{exam.title}</div>
                                        {exam.isMockExam && (
                                            <span className="text-[10px] text-amber-400 font-bold">MOCK EXAM</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        {exam.university?.profile?.universityName || exam.university?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">{exam.course?.title || 'N/A'}</td>
                                    <td className="px-6 py-4">{getExamTypeBadge(exam.examType)}</td>
                                    <td className="px-6 py-4 text-white/70 text-sm">
                                        {new Date(exam.scheduledStartTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-white/70">{exam.duration} min</td>
                                    <td className="px-6 py-4">{getStatusBadge(exam)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => window.location.href = `/admin/exams/${exam._id}`}
                                                className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam._id)}
                                                className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Exam"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentExams.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-white/30 text-sm">
                                        No exams found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <div className="text-xs text-white/50">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    // Show first, last, current, and adjacent pages
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                    currentPage === pageNum
                                                        ? 'bg-primary text-white'
                                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="text-white/30">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ExamList;
