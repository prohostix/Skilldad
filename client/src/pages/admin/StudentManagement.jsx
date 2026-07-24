import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Edit,
    Eye,
    Trash2,
    Download,
    FileText,
    BookOpen,
    Award,
    Calendar,
    Mail,
    Phone,
    MapPin,
    X,
    Save,
    Upload,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    UserPlus,
    UserMinus,
    GraduationCap,
    Loader2,
    ExternalLink
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getMediaUrl } from '../../utils/media';

const StudentManagement = () => {
    const { showToast } = useToast();
    const { socket } = useSocket();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [documents, setDocuments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [rewardWallet, setRewardWallet] = useState({ total: 0, history: [] });
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [universities, setUniversities] = useState([]);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlUniversityId = searchParams.get('universityId') || 'all';
    const [selectedUniversityId, setSelectedUniversityId] = useState(urlUniversityId);

    // Enroll modal state
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [enrollCourseId, setEnrollCourseId] = useState('');
    const [enrollUniversityId, setEnrollUniversityId] = useState('');
    const [enrollNote, setEnrollNote] = useState('');
    const [previewDoc, setPreviewDoc] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [enrollBatchId, setEnrollBatchId] = useState('');
    const [enrollBatches, setEnrollBatches] = useState([]);
    
    // Assign batch for existing enrollment
    const [showAssignBatchModal, setShowAssignBatchModal] = useState(false);
    const [selectedEnrollmentForBatch, setSelectedEnrollmentForBatch] = useState(null);
    const [assignBatchData, setAssignBatchData] = useState({
        courseId: '',
        batchId: ''
    });
    const [batchOptions, setBatchOptions] = useState([]);

    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: () => {}
    });

    const openConfirmModal = ({ title, message, confirmText = 'Confirm', type = 'danger', onConfirm }) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText: 'Cancel',
            type,
            onConfirm
        });
    };

    useEffect(() => {
        fetchStudents();
        fetchCourses();

        // Socket Listener for Real-time Updates
        const handleUserListUpdate = (data) => {
            if (data.action === 'created' && data.user?.role?.toLowerCase() === 'student') {
                setStudents(prev => {
                    if (prev.some(s => s._id === data.user._id)) return prev;
                    const newStudent = {
                        ...data.user,
                        enrollmentCount: 0,
                        course: 'New/Pending'
                    };
                    return [newStudent, ...prev];
                });
                showToast?.(`New student registered: ${data.user.name}`, 'info');
            } else if (data.action === 'deleted') {
                setStudents(prev => prev.filter(s => s._id !== data.user._id));
            } else if (data.action === 'updated' && data.user?.role?.toLowerCase() === 'student') {
                setStudents(prev => prev.map(s => s._id === data.user._id ? { ...s, ...data.user } : s));
            }
        };

        if (socket) {
            socket.on('userListUpdate', handleUserListUpdate);
        }

        // Auto-refresh every 30 seconds to get latest updates
        const interval = setInterval(() => {
            fetchStudents();
        }, 30000);

        return () => {
            if (socket) socket.off('userListUpdate', handleUserListUpdate);
            clearInterval(interval);
        };
    }, [selectedCourseId, selectedUniversityId, socket]);

    // Update state when URL changes
    useEffect(() => {
        if (urlUniversityId !== selectedUniversityId) {
            setSelectedUniversityId(urlUniversityId);
        }
    }, [urlUniversityId]);

    const fetchCourses = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [coursesRes, univRes] = await Promise.all([
                axios.get('/api/courses/admin', config),
                axios.get('/api/admin/universities', config)
            ]);

            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            setUniversities(Array.isArray(univRes.data) ? univRes.data : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Update enroll batches when selected course changes
    useEffect(() => {
        const fetchEnrollBatches = async () => {
            if (!enrollCourseId) {
                setEnrollBatches([]);
                setEnrollBatchId('');
                return;
            }
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`/api/batches/course/${enrollCourseId}`, config);
                setEnrollBatches(data);
                setEnrollBatchId('');
            } catch (err) {
                console.error('Error fetching enroll batches:', err);
                setEnrollBatches([]);
            }
        };
        fetchEnrollBatches();
    }, [enrollCourseId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: {
                    courseId: selectedCourseId,
                    universityId: selectedUniversityId
                }
            };
            const { data } = await axios.get('/api/admin/students', config);
            setStudents(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
            showToast?.('Failed to fetch students', 'error');
        }
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch student documents
            const docsResponse = await axios.get(`/api/admin/students/${studentId}/documents`, config);
            setDocuments(docsResponse.data);

            // Fetch student enrollments
            const enrollResponse = await axios.get(`/api/admin/students/${studentId}/enrollments`, config);
            setEnrollments(enrollResponse.data);

            // Fetch student reward wallet
            const walletResponse = await axios.get(`/api/admin/students/${studentId}/reward-points`, config);
            setRewardWallet(walletResponse.data);
        } catch (error) {
            console.error('Error fetching student details:', error);
            showToast?.('Failed to fetch student details', 'error');
        }
    };

    const handleViewStudent = async (student) => {
        setSelectedStudent(student);
        setEditData({ ...student, phone: student.profile?.phone || '' });
        setEditMode(false);

        await fetchStudentDetails(student._id);
    };

    const handleEditStudent = () => {
        setEditMode(true);
    };

    const handleSaveStudent = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.put(`/api/admin/students/${selectedStudent._id}`, editData, config);

            showToast?.('Student updated successfully', 'success');
            setEditMode(false);
            fetchStudents();
            setSelectedStudent({ ...selectedStudent, ...editData });
        } catch (error) {
            console.error('Error updating student:', error);
            showToast?.('Failed to update student', 'error');
        }
    };

    const handleDeleteStudent = (studentId) => {
        openConfirmModal({
            title: 'Delete Student Account',
            message: `Are you sure you want to delete ${selectedStudent?.name || 'this student'}? All associated enrollments and records will be deleted.`,
            confirmText: 'Delete Student',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                    await axios.delete(`/api/admin/students/${studentId}`, config);

                    showToast?.('Student deleted successfully', 'success');
                    fetchStudents();
                    setSelectedStudent(null);
                } catch (error) {
                    console.error('Error deleting student:', error);
                    showToast?.('Failed to delete student', 'error');
                }
            }
        });
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());

        // This logic is simple but since we don't have per-student enrollment titles pre-fetched for the whole list, 
        // we'll rely on the existing searchTerm.
        // For a more advanced "Web Development" specific check, we'd need a backend filtered route.
        return matchesSearch;
    });

    // Helper to get university display name
    const getUniversityName = (student) => {
        return student.universityId?.profile?.universityName || student.universityId?.name || 'Independent';
    };

    const handleExportStudents = () => {
        try {
            // Create CSV content
            const headers = ['Name', 'Email', 'Phone', 'Address', 'Verified', 'Created Date'];
            const csvContent = [
                headers.join(','),
                ...students.map(student => [
                    student.name || '',
                    student.email || '',
                    student.phone || '',
                    `"${(student.address || '').replace(/"/g, '""')}"`, // Escape quotes in address
                    student.isVerified ? 'Yes' : 'No',
                    new Date(student.createdAt).toLocaleDateString()
                ].join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast?.('Students data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting students:', error);
            showToast?.('Failed to export students', 'error');
        }
    };

    const handleExportPDF = () => {
        try {
            // Check if jsPDF and autoTable are available
            if (!jsPDF) {
                showToast?.('PDF library not loaded', 'error');
                return;
            }

            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text('SkillDad Student Audit Report', 14, 22);
            
            doc.setFontSize(11);
            doc.setTextColor(100);
            
            // Add date and count
            const date = new Date().toLocaleDateString();
            doc.text(`Generated on: ${date}`, 14, 30);
            doc.text(`Total Students: ${filteredStudents.length}`, 14, 36);
            
            // Define columns
            const tableColumn = ["Name", "Email", "Phone", "University", "Verified", "Joined"];
            
            // Define rows
            const tableRows = filteredStudents.map(student => [
                student.name || 'N/A',
                student.email || 'N/A',
                student.phone || 'N/A',
                getUniversityName(student),
                student.isVerified ? 'Yes' : 'No',
                student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
            ]);

            // Auto-table
            // Check if doc.autoTable exists (plugin style) or use imported function
            if (typeof doc.autoTable === 'function') {
                doc.autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 45,
                    theme: 'grid',
                    headStyles: { fillColor: [91, 92, 240] },
                    styles: { fontSize: 8 }
                });
            } else {
                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 45,
                    theme: 'grid',
                    headStyles: { fillColor: [91, 92, 240] },
                    styles: { fontSize: 8 }
                });
            }

            doc.save(`students_report_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast?.('PDF report generated successfully', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast?.('Failed to generate PDF report: ' + error.message, 'error');
        }
    };

    const [addStudentOpen, setAddStudentOpen] = useState(false);
    const [newStudentData, setNewStudentData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        phone: '', 
        role: 'student', 
        universityId: '' 
    });

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/users', newStudentData, config);
            showToast?.('Student added successfully', 'success');
            setAddStudentOpen(false);
            setNewStudentData({ name: '', email: '', password: '', phone: '', role: 'student', universityId: '' });
            fetchStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            showToast?.('Failed to add student', 'error');
        }
    };

    const handleOpenEnrollModal = () => {
        const studentUniId = selectedStudent?.universityId?._id || selectedStudent?.universityId || selectedStudent?.university_id || '';
        setEnrollUniversityId(studentUniId);
        setEnrollCourseId('');
        setEnrollBatchId('');
        setEnrollNote('');
        setEnrollError('');
        setEnrollModalOpen(true);
    };

    const handleAdminEnroll = async () => {
        if (!enrollCourseId) {
            setEnrollError('Please select a course');
            return;
        }
        if (!selectedStudent) return;

        setEnrolling(true);
        setEnrollError('');
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(
                `/api/admin/students/${selectedStudent._id}/enroll`,
                {
                    courseId: enrollCourseId,
                    universityId: enrollUniversityId || undefined,
                    batchId: enrollBatchId || undefined,
                    note: enrollNote
                },
                config
            );
            showToast?.(`✅ ${data.message}`, 'success');
            setEnrollModalOpen(false);
            setEnrollCourseId('');
            setEnrollUniversityId('');
            setEnrollBatchId('');
            setEnrollNote('');
            // Refresh enrollments in detail view
            await fetchStudentDetails(selectedStudent._id);
            fetchStudents();
        } catch (error) {
            setEnrollError(error.response?.data?.message || 'Failed to enroll student');
        } finally {
            setEnrolling(false);
        }
    };

    const handleAssignBatch = async () => {
        try {
            if (!assignBatchData.courseId) {
                showToast?.('Please select a course', 'warning');
                return;
            }
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            await axios.put('/api/enrollment/assign-batch', {
                studentId: selectedStudent._id,
                courseId: assignBatchData.courseId,
                batchId: assignBatchData.batchId
            }, config);
            
            showToast?.('Batch assigned successfully', 'success');
            setShowAssignBatchModal(false);
            await fetchStudentDetails(selectedStudent._id);
        } catch (error) {
            console.error('Error assigning batch:', error);
            showToast?.(error.response?.data?.message || 'Failed to assign batch', 'error');
        }
    };

    const handleAdminUnenroll = (courseId, courseTitle) => {
        openConfirmModal({
            title: 'Remove Enrollment',
            message: `Are you sure you want to remove ${selectedStudent?.name || 'student'} from "${courseTitle}"?`,
            confirmText: 'Remove Course',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    await axios.delete(`/api/admin/students/${selectedStudent._id}/enroll/${courseId}`, config);
                    showToast?.('Student unenrolled successfully', 'success');
                    await fetchStudentDetails(selectedStudent._id);
                    fetchStudents();
                } catch (error) {
                    showToast?.(error.response?.data?.message || 'Failed to unenroll student', 'error');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Student Management" />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <ModernButton variant="secondary" onClick={handleExportStudents} title="Export CSV" className="flex-1 sm:flex-none !px-3 !py-2.5">
                        <Download size={14} className="mr-1.5" /> CSV
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={handleExportPDF} title="Export PDF" className="flex-1 sm:flex-none !px-3 !py-2.5">
                        <FileText size={14} className="mr-1.5" /> PDF
                    </ModernButton>
                    <ModernButton onClick={() => setAddStudentOpen(true)} className="w-full sm:w-auto !px-4 !py-2.5">
                        <Plus size={16} className="mr-1.5" /> Add Student
                    </ModernButton>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
                <GlassCard className="!p-2 flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </GlassCard>
                <GlassCard className="!p-2 flex flex-row gap-2 shrink-0">
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-36 bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                        <option value="all" className="bg-slate-900">All Courses</option>
                        {courses.map(c => (
                            <option key={c._id} value={c._id} className="bg-slate-900">{c.title}</option>
                        ))}
                    </select>
                    <select
                        value={selectedUniversityId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedUniversityId(val);
                            setSearchParams(prev => {
                                if (val === 'all') {
                                    prev.delete('universityId');
                                } else {
                                    prev.set('universityId', val);
                                }
                                return prev;
                            });
                        }}
                        className="w-36 bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                        <option value="all" className="bg-slate-900">All Universities</option>
                        {universities.map(u => (
                            <option key={u._id} value={u._id} className="bg-slate-900">
                                {u.profile?.universityName || u.name} {u.role === 'partner' ? '(Partner)' : ''}
                            </option>
                        ))}
                    </select>
                </GlassCard>
            </div>

            {/* Students Table */}
            <GlassCard className="overflow-hidden !p-0 sm:!p-6">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">University / Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Registered By</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Enrolled Course</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Enrollments</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {student.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="cursor-pointer group/name" onClick={() => handleViewStudent(student)}>
                                                <div className="text-sm font-medium text-white group-hover/name:text-primary transition-colors">{student.name}</div>
                                                <div className="text-xs text-gray-400">ID: {student._id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">{getUniversityName(student)}</div>
                                        <div className="text-[10px] text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block w-max mb-1.5 ${
                                                student.connectionType === 'Course Enrolled' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                                student.connectionType === 'Discount Code' ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' :
                                                student.connectionType === 'Directly Registered' ? 'bg-primary/20 text-primary border-primary/30' :
                                                student.connectionType === 'University Affiliated' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                            }`}>
                                                {student.connectionType || 'Self-registered'}
                                            </span>
                                            {student.registeredBy ? (
                                                <div>
                                                    <div className="text-sm font-medium text-white leading-tight">{student.registeredBy.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase">{student.registeredBy.role}</div>
                                                    {student.partnerCode && student.connectionType === 'Discount Code' && (
                                                        <div className="text-[9px] text-amber-400 font-mono mt-0.5">Code: {student.partnerCode}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-500 italic">No Reference</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-white/70 font-medium italic">{student.course || 'No Course'}</div>
                                        {student.batchName && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[9px] font-bold">
                                                Batch: {student.batchName}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white">{student.enrollmentCount || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${student.isVerified
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {student.isVerified ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewStudent(student)}
                                                className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                    {filteredStudents.map((student) => (
                        <div key={student._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col space-y-4 shadow-sm relative group overflow-hidden">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/20 transition-all"></div>
                            
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3 cursor-pointer group/nav" onClick={() => handleViewStudent(student)}>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold shadow-sm group-hover/nav:bg-primary group-hover/nav:text-white transition-all">
                                        {student.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="font-bold text-white text-sm group-hover/nav:text-primary transition-colors truncate">{student.name}</p>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] sm:text-xs text-white/50 truncate max-w-[160px] sm:max-w-none">{student.email}</span>
                                            <span className="text-[9px] text-white/30 truncate mt-0.5">UID: {student._id.slice(-8)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 border-t border-white/5 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/50 uppercase tracking-wider font-bold">University</span>
                                    <span className="text-sm font-medium text-white text-right max-w-[150px] leading-tight line-clamp-2">{getUniversityName(student)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/50 uppercase tracking-wider font-bold">Enrolled Course</span>
                                    <span className="text-xs text-primary font-medium italic truncate max-w-[150px]">{student.course || 'No Course'}</span>
                                </div>
                                <div className="flex flex-col border-t border-white/5 pt-2 mt-2">
                                    <span className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">Registered By</span>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                            student.connectionType === 'Course Enrolled' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                            student.connectionType === 'Discount Code' ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' :
                                            student.connectionType === 'Directly Registered' ? 'bg-primary/20 text-primary border-primary/30' :
                                            student.connectionType === 'University Affiliated' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}>
                                            {student.connectionType || 'Self-registered'}
                                        </span>
                                        {student.registeredBy ? (
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-white">{student.registeredBy.name}</div>
                                                <div className="text-[9px] text-gray-500 uppercase">{student.registeredBy.role}</div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">No Reference</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/50 uppercase tracking-wider font-bold">Total Enrollments</span>
                                    <span className="text-sm font-black text-white px-2 py-0.5 bg-white/10 rounded">{student.enrollmentCount || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${student.isVerified
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                    {student.isVerified ? 'Active' : 'Pending'}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleViewStudent(student)}
                                        className="p-2 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-all shadow-sm"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all shadow-sm"
                                        title="Delete Student"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Add Student Modal */}
            {addStudentOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-[99999] p-4 pt-20 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full relative z-[100000] border border-white/10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Add New Student</h2>
                            <button onClick={() => setAddStudentOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                                    value={newStudentData.name}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                                    value={newStudentData.email}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                                    value={newStudentData.password}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 919999999999"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none font-mono"
                                    value={newStudentData.phone}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                                />
                                <p className="text-[10px] text-white/30 mt-1">Include country code without + (e.g., 91 for India)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">University / Institution</label>
                                <select
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                    value={newStudentData.universityId}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, universityId: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900">Independent (No University / Partner)</option>
                                    {universities.filter(u => u.role === 'university' || u.role === 'partner').map(u => (
                                        <option key={u._id} value={u._id} className="bg-slate-900">
                                            {u.profile?.universityName || u.name} {u.role === 'partner' ? '(B2B Partner)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAddStudentOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton type="submit" className="flex-1">
                                    Add Student
                                </ModernButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-[99999] p-4 pt-20 overflow-y-auto">
                    <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full relative z-[100000] max-h-[90vh] overflow-y-auto border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Student Details</h2>
                            <div className="flex items-center space-x-2">
                                {!editMode && (
                                    <button
                                        onClick={handleEditStudent}
                                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Full Name</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={editData.name || ''}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="text-white mt-1">{selectedStudent.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                                        {editMode ? (
                                            <input
                                                type="email"
                                                value={editData.email || ''}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="text-white mt-1">{selectedStudent.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={editData.phone || ''}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                placeholder="e.g. 919999999999"
                                            />
                                        ) : (
                                            <p className="text-white mt-1">{selectedStudent.profile?.phone || 'No phone number'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Bio</label>
                                        {editMode ? (
                                            <textarea
                                                value={editData.bio || ''}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                rows="2"
                                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="text-white mt-1">{selectedStudent.bio || 'No bio'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Status</label>
                                        <p className="text-white mt-0.5">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${selectedStudent.isVerified
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {selectedStudent.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Reward Wallet</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-black">
                                                {rewardWallet.total} PTS
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Balance</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Institution / University</label>
                                        <p className="text-white mt-1">{getUniversityName(selectedStudent)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Registered By</label>
                                        {selectedStudent.registeredBy ? (
                                            <div className="mt-1">
                                                <p className="text-white font-medium">{selectedStudent.registeredBy.name}</p>
                                                <p className="text-xs text-primary uppercase">{selectedStudent.registeredBy.role}</p>
                                                <p className="text-xs text-gray-400">{selectedStudent.registeredBy.email}</p>
                                                {selectedStudent.partnerCode && (
                                                    <p className="text-xs text-amber-400 font-mono mt-1">Code: {selectedStudent.partnerCode}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-white mt-1 italic text-sm text-gray-400">Self-registered</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Enrollments */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Enrollments ({enrollments.length})</h3>
                                    <button
                                        onClick={handleOpenEnrollModal}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                    >
                                        <GraduationCap size={14} />
                                        Enroll in Course
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {enrollments.map((enrollment) => (
                                        <div key={enrollment._id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{enrollment.course?.title || 'Unknown Course'}</p>
                                                    {(enrollment.course?.universityName || enrollment.course?.instructor?.profile?.universityName || enrollment.course?.instructor?.name) && (
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1">
                                                            {enrollment.course.universityName || enrollment.course.instructor?.profile?.universityName || enrollment.course.instructor?.name}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                         <p className="text-xs text-gray-400">Progress: {enrollment.progress || 0}%</p>
                                                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                             enrollment.batchName || enrollment.batch_name
                                                                 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                                 : 'bg-white/5 text-gray-400 border-white/10'
                                                         }`}>
                                                             Batch: {enrollment.batchName || enrollment.batch_name || 'No Batch Assigned'}
                                                         </span>
                                                     </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEnrollmentForBatch(enrollment);
                                                            setAssignBatchData({ 
                                                                courseId: enrollment.course?._id, 
                                                                batchId: enrollment.batchId || enrollment.batch_id || '' 
                                                            });
                                                            setShowAssignBatchModal(true);
                                                            // Fetch batches for this course
                                                            const fetchBatches = async () => {
                                                                try {
                                                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                                                                    const { data } = await axios.get(`/api/batches/course/${enrollment.course?._id}`, config);
                                                                    setBatchOptions(data);
                                                                } catch (err) {
                                                                    console.error('Error fetching batches:', err);
                                                                    setBatchOptions([]);
                                                                }
                                                            };
                                                            fetchBatches();
                                                        }}
                                                        className="p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-[10px] font-bold flex items-center gap-1"
                                                        title="Assign or Change Batch"
                                                    >
                                                        <Users size={12} />
                                                        {enrollment.batchName || enrollment.batch_name ? `Batch: ${enrollment.batchName || enrollment.batch_name}` : 'Assign Batch'}
                                                    </button>
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${enrollment.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {enrollment.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleAdminUnenroll(enrollment.course?._id, enrollment.course?.title)}
                                                        title="Unenroll"
                                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs"
                                                    >
                                                        <UserMinus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {enrollments.length === 0 && (
                                        <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                                            <GraduationCap className="text-gray-600 mx-auto mb-2" size={28} />
                                            <p className="text-gray-400 text-sm">No enrollments yet</p>
                                            <button
                                                onClick={handleOpenEnrollModal}
                                                className="mt-2 text-xs text-emerald-400 hover:underline"
                                            >
                                                + Enroll in a course
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Uploaded Documents ({documents.length})</h3>
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc._id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <FileText size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white">{doc.title}</p>
                                                        <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border ${
                                                            doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            doc.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                        }`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {doc.type} • {new Date(doc.created_at || doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {(doc.file_url || doc.fileUrl) && (
                                                    <button
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors"
                                                        title="Preview Document"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                {doc.status === 'submitted' && (
                                                    <button
                                                        onClick={() => navigate('/admin/document-review')}
                                                        className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                                                        title="Go to Review Hub"
                                                    >
                                                        <Clock size={14} />
                                                    </button>
                                                )}
                                                <a
                                                    href={getMediaUrl(doc.file_url || doc.fileUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {documents.length === 0 && (
                                        <p className="text-gray-400 text-sm">No documents uploaded</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {editMode && (
                                <div className="flex space-x-3 pt-4 border-t border-white/10">
                                    <ModernButton onClick={handleSaveStudent} className="flex-1">
                                        <Save size={16} className="mr-2" />
                                        Save Changes
                                    </ModernButton>
                                    <ModernButton
                                        variant="secondary"
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditData(selectedStudent);
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </ModernButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll in Course Modal */}
            {enrollModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200000] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-2xl p-5 max-w-lg w-full border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <GraduationCap className="text-emerald-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-tight">Enroll in Course</h2>
                                    <p className="text-[11px] text-gray-400">Free enrollment for <span className="text-emerald-400 font-semibold">{selectedStudent.name}</span></p>
                                </div>
                            </div>
                            <button onClick={() => setEnrollModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* STEP 1: SELECT UNIVERSITY / INSTITUTION */}
                            <div>
                                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                                    1. Choose University / Partner
                                </label>
                                <select
                                    value={enrollUniversityId}
                                    onChange={(e) => {
                                        setEnrollUniversityId(e.target.value);
                                        setEnrollCourseId('');
                                        setEnrollError('');
                                    }}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="" className="bg-slate-900">-- SkillDad Direct (Independent) --</option>
                                    {universities.filter(u => u.role === 'university' || u.role === 'partner').map(u => (
                                        <option key={u._id} value={u._id} className="bg-slate-900">
                                            {u.profile?.universityName || u.name} {u.role === 'partner' ? '(B2B Partner)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Select university/partner to view its courses, or choose SkillDad Direct</p>
                            </div>

                            {/* STEP 2: SELECT COURSE */}
                            <div>
                                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                                    2. Select Course *
                                </label>
                                <select
                                    value={enrollCourseId}
                                    onChange={(e) => { setEnrollCourseId(e.target.value); setEnrollError(''); }}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="" className="bg-slate-900">-- Choose a course --</option>
                                    {courses
                                        .filter(c => {
                                            // Exclude already enrolled courses
                                            const isEnrolled = enrollments.some(e => {
                                                const enrolledId = e.course?._id || e.course_id || e.course;
                                                return String(enrolledId) === String(c._id);
                                            });
                                            if (isEnrolled) return false;

                                            // If a university / partner is selected: ONLY show courses provided by or assigned to that university
                                            if (enrollUniversityId) {
                                                const selectedUni = universities.find(u => String(u._id) === String(enrollUniversityId));
                                                const assignedCourseIds = Array.isArray(selectedUni?.profile?.assigned_courses)
                                                    ? selectedUni.profile.assigned_courses.map(id => String(id))
                                                    : [];
                                                const courseInstructorId = String(c.instructor_id || c.instructorId || c.submitted_by || c.instructor?._id || c.instructor || '');
                                                const isProvidedByUni = courseInstructorId === String(enrollUniversityId);
                                                const isAssignedToUni = assignedCourseIds.includes(String(c._id));

                                                return isProvidedByUni || isAssignedToUni;
                                            }

                                            // If SkillDad Direct / Independent is selected, show courses provided directly by SkillDad or all courses
                                            return true;
                                        })
                                        .map(c => (
                                            <option key={c._id} value={c._id} className="bg-slate-900">
                                                {c.title}
                                            </option>
                                        ))
                                    }
                                </select>
                                {(() => {
                                    const availableForUni = courses.filter(c => {
                                        const isEnrolled = enrollments.some(e => {
                                            const enrolledId = e.course?._id || e.course_id || e.course;
                                            return String(enrolledId) === String(c._id);
                                        });
                                        if (isEnrolled) return false;

                                        if (enrollUniversityId) {
                                            const selectedUni = universities.find(u => String(u._id) === String(enrollUniversityId));
                                            const assignedCourseIds = Array.isArray(selectedUni?.profile?.assigned_courses)
                                                ? selectedUni.profile.assigned_courses.map(id => String(id))
                                                : [];
                                            const courseInstructorId = String(c.instructor_id || c.instructorId || c.submitted_by || c.instructor?._id || c.instructor || '');
                                            const isProvidedByUni = courseInstructorId === String(enrollUniversityId);
                                            const isAssignedToUni = assignedCourseIds.includes(String(c._id));

                                            return isProvidedByUni || isAssignedToUni;
                                        }
                                        return true;
                                    });

                                    if (enrollUniversityId && availableForUni.length === 0) {
                                        return (
                                            <p className="text-[10px] text-amber-400 mt-1.5 font-medium">
                                                ⚠️ No courses currently assigned to or provided by this university/partner.
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            
                            {enrollCourseId && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">3. Assign to Batch (optional)</label>
                                    <select
                                        value={enrollBatchId}
                                        onChange={(e) => setEnrollBatchId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                                    >
                                        <option value="" className="bg-slate-900">-- No Batch (Global) --</option>
                                        {enrollBatches.filter(batch => batch.is_active !== false).map(batch => (
                                            <option key={batch.id} value={batch.id} className="bg-slate-900">{batch.name}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                            <div>
                                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Note (optional)</label>
                                <textarea
                                    value={enrollNote}
                                    onChange={(e) => setEnrollNote(e.target.value)}
                                    rows={1}
                                    placeholder="e.g. Sponsored by admin, scholarship, etc."
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none text-xs resize-none"
                                />
                            </div>
                            <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                                    <span className="font-black">ℹ️ Free Enrollment:</span> No payment required. A ₹0 record will appear in Finance Dashboard with status <span className="font-bold text-emerald-400">Approved</span>. Student gets full course access immediately.
                                </p>
                            </div>
                            {enrollError && (
                                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-xs text-red-400 font-medium">{enrollError}</p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEnrollModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdminEnroll}
                                    disabled={enrolling || !enrollCourseId}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    {enrolling ? (
                                        <><Loader2 size={14} className="animate-spin" /> Enrolling...</>
                                    ) : (
                                        <><GraduationCap size={14} /> Enroll Now</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <div className="fixed inset-0 z-[200001] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewDoc(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{previewDoc.title}</h2>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                                            {previewDoc.type} • {selectedStudent.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={getMediaUrl(previewDoc.file_url || previewDoc.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                    <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/40">
                                <iframe 
                                    src={getMediaUrl(previewDoc.file_url || previewDoc.fileUrl)} 
                                    className="w-full h-full border-none"
                                    title="Document Preview"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Assign Batch Modal (Admin) */}
            {showAssignBatchModal && selectedEnrollmentForBatch && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[250000] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-primary/30 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Update Batch</h2>
                            <button onClick={() => setShowAssignBatchModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Student</p>
                                <p className="text-white font-bold">{selectedStudent.name}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Course</p>
                                <p className="text-primary font-medium">{selectedEnrollmentForBatch.course?.title}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Select Batch</label>
                                <select
                                    value={assignBatchData.batchId}
                                    onChange={(e) => setAssignBatchData({ ...assignBatchData, batchId: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900">-- No Batch (Global) --</option>
                                    {batchOptions.map(batch => (
                                        <option key={batch.id} value={batch.id} className="bg-slate-900">{batch.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAssignBatchModal(false)}
                                className="flex-1 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <ModernButton onClick={handleAssignBatch} className="flex-1">
                                Update Batch
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Custom Styled Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[300000] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl shrink-0">
                                    <Trash2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{confirmModal.message}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    {confirmModal.cancelText || 'Cancel'}
                                </button>
                                <button
                                    onClick={() => {
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                        confirmModal.onConfirm?.();
                                    }}
                                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/25"
                                >
                                    {confirmModal.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentManagement;
