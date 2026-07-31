import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Mail,
    Phone,
    BookOpen,
    FileText,
    Trophy,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    ShieldCheck,
    Download,
    GraduationCap,
    AlertCircle,
    X,
    ExternalLink
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PartnerStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        course: '',
        courseFee: '',
        university: '',
        partnerCode: '',
        customCode: '',
        batch_id: ''
    });
    const [availableBatches, setAvailableBatches] = useState([]);
    const [showCustomCodeInput, setShowCustomCodeInput] = useState(false);
    const [partnerCodes, setPartnerCodes] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableUniversities, setAvailableUniversities] = useState([]);
    const [selectedStudentForDocs, setSelectedStudentForDocs] = useState(null);
    const [selectedStudentForCerts, setSelectedStudentForCerts] = useState(null);
    const [studentDocs, setStudentDocs] = useState([]);
    const [studentCerts, setStudentCerts] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [filterBatch, setFilterBatch] = useState('all');
    const [filterCourseBatches, setFilterCourseBatches] = useState([]);
    const [showAssignBatchModal, setShowAssignBatchModal] = useState(false);
    const [selectedStudentForBatch, setSelectedStudentForBatch] = useState(null);
    const [assignBatchData, setAssignBatchData] = useState({
        courseId: '',
        batchId: ''
    });
    const [batchOptions, setBatchOptions] = useState([]);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/partner/students', config);
            setStudents(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            showToast('Failed to fetch students', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo.token) {
            fetchStudents();
            fetchCodes();
            fetchCourses();
            fetchUniversities();
        }
    }, []);

    const fetchCodes = async () => {
        try {
            const { data } = await axios.get('/api/partner/discounts', config);
            setPartnerCodes(Array.isArray(data) ? data : []);
            if (data.length > 0) {
                setNewStudentData(prev => ({ ...prev, partnerCode: data[0].code }));
            }
        } catch (error) {
            console.error('Error fetching partner codes:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses', config);
            setAvailableCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setAvailableCourses([]);
        }
    };

    // Update filter batches when filterCourse changes
    useEffect(() => {
        const updateFilterBatches = async () => {
            if (filterCourse === 'all') {
                setFilterCourseBatches([]);
                setFilterBatch('all');
                return;
            }

            const selectedCourse = availableCourses.find(c => c.title === filterCourse);
            if (selectedCourse) {
                try {
                    const { data } = await axios.get(`/api/batches/course/${selectedCourse._id || selectedCourse.id}`, config);
                    setFilterCourseBatches(data);
                } catch (err) {
                    console.error('Error fetching filter batches:', err);
                    setFilterCourseBatches([]);
                }
            } else {
                setFilterCourseBatches([]);
            }
            setFilterBatch('all');
        };

        updateFilterBatches();
    }, [filterCourse, availableCourses]);

    const fetchUniversities = async () => {
        try {
            const { data } = await axios.get('/api/public/universities');
            console.log('Fetched universities:', data);
            console.log('Universities count:', data?.length);
            setAvailableUniversities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching universities:', error);
            setAvailableUniversities([]);
        }
    };

    const handleCourseChange = async (courseId) => {
        const selectedCourse = availableCourses.find(c => c._id === courseId);
        setNewStudentData(prev => ({
            ...prev,
            course: courseId,
            courseFee: selectedCourse ? selectedCourse.price : '',
            batch_id: '' // Reset batch when course changes
        }));

        if (courseId) {
            try {
                const { data } = await axios.get(`/api/batches/course/${courseId}`, config);
                setAvailableBatches(data);
            } catch (err) {
                console.error('Error fetching batches:', err);
                setAvailableBatches([]);
            }
        } else {
            setAvailableBatches([]);
        }
    };

    const handleRegisterStudent = async () => {
        try {
            if (!newStudentData.name || !newStudentData.email || !newStudentData.password) {
                showToast('Please fill all required fields', 'warning');
                return;
            }
            
            // Use custom code if provided, otherwise use selected partner code
            const codeToUse = showCustomCodeInput ? newStudentData.customCode : newStudentData.partnerCode;
            
            if (!codeToUse) {
                showToast('You must select or enter an affiliation code!', 'warning');
                return;
            }

            // Prepare data with the appropriate code
            const dataToSend = {
                ...newStudentData,
                partnerCode: codeToUse,
                batchId: newStudentData.batch_id // backend expects batchId
            };

            await axios.post('/api/partner/register-student', dataToSend, config);

            setShowRegisterStudentModal(false);
            setShowCustomCodeInput(false);
            setNewStudentData({ 
                name: '', 
                email: '', 
                phone: '', 
                password: '', 
                course: '', 
                courseFee: '',
                university: '',
                partnerCode: partnerCodes.length > 0 ? partnerCodes[0].code : '',
                customCode: ''
            });
            showToast('Student registered in the system successfully!', 'success');

            // Refresh list
            fetchStudents();
        } catch (error) {
            console.error('Error registering student:', error);
            showToast(error.response?.data?.message || 'Failed to register student', 'error');
        }
    };

    const handleDeleteStudent = (studentId) => {
        if (window.confirm('Are you sure you want to remove this student from the system? Note: actual deletion might not be supported based on permissions.')) {
            // we could call api to delete or unassign the student if such an API existed
            showToast('Delete operation not permitted for B2B Partners', 'warning');
        }
    };

    const handleAssignBatch = async () => {
        try {
            if (!assignBatchData.courseId) {
                showToast('Please select a course', 'warning');
                return;
            }
            await axios.put('/api/enrollment/assign-batch', {
                studentId: selectedStudentForBatch._id || selectedStudentForBatch.id,
                courseId: assignBatchData.courseId,
                batchId: assignBatchData.batchId
            }, config);
            showToast('Batch assigned successfully', 'success');
            setShowAssignBatchModal(false);
            fetchStudents();
        } catch (error) {
            console.error('Error assigning batch:', error);
            showToast(error.response?.data?.message || 'Failed to assign batch', 'error');
        }
    };

    const fetchStudentDocs = async (studentId) => {
        try {
            setAssetsLoading(true);
            const { data } = await axios.get('/api/documents', {
                ...config,
                params: { student: studentId }
            });
            setStudentDocs(data);
        } catch (error) {
            console.error('Error fetching student documents:', error);
            showToast('Failed to fetch documents', 'error');
        } finally {
            setAssetsLoading(false);
        }
    };

    const fetchStudentCerts = async (studentId) => {
        try {
            setAssetsLoading(true);
            const { data } = await axios.get('/api/certificates/admin/all', {
                ...config,
                params: { studentId }
            });
            setStudentCerts(data);
        } catch (error) {
            console.error('Error fetching student certificates:', error);
            showToast('Failed to fetch certificates', 'error');
        } finally {
            setAssetsLoading(false);
        }
    };

    const handleDocumentReview = async (id, status, reason = '') => {
        setReviewing(true);
        try {
            await axios.put(`/api/documents/${id}/review`, { status, rejectionReason: reason }, config);
            showToast(`Document ${status} successfully!`, 'success');
            // Refresh documents for current student
            if (selectedStudentForDocs) fetchStudentDocs(selectedStudentForDocs._id || selectedStudentForDocs.id);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to review document', 'error');
        } finally {
            setReviewing(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Match course - check if any enrollment matches the filterCourse title
        const matchesCourse = filterCourse === 'all' || 
            (student.enrollments && student.enrollments.some(e => e.course_title === filterCourse)) ||
            student.course === filterCourse;

        // Match batch
        let matchesBatch = filterBatch === 'all';
        if (filterBatch !== 'all' && student.enrollments) {
            matchesBatch = student.enrollments.some(e => 
                (filterCourse === 'all' || e.course_title === filterCourse) && 
                e.batch_id === filterBatch
            );
        }

        return matchesSearch && matchesCourse && matchesBatch;
    });

    const courses = [...new Set((students || []).map(s => s.course).filter(Boolean))];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Student Management" />
                </div>
                <ModernButton onClick={() => setShowRegisterStudentModal(true)} className="group shadow-lg shadow-primary/20">
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Register New Student
                </ModernButton>
            </div>

            {/* Search and Filter */}
            <GlassCard className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                        />
                    </div>
                    {courses.length > 0 && (
                        <div className="flex gap-2">
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary text-sm min-w-[140px]"
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>

                            {filterCourse !== 'all' && filterCourseBatches.length > 0 && (
                                <select
                                    value={filterBatch}
                                    onChange={(e) => setFilterBatch(e.target.value)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary text-sm min-w-[140px] animate-in slide-in-from-left-2 duration-300"
                                >
                                    <option value="all">All Batches</option>
                                    {filterCourseBatches.map(batch => (
                                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Students List */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <span>My Network Students</span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                            {filteredStudents.length}
                        </span>
                    </h2>
                </div>
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                        <Users className="mx-auto mb-2 opacity-50" size={32} />
                        <p>No students found in your network.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredStudents.map(student => (
                            <div key={student._id || student.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {student.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{student.name}</h3>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                    student.connection_type === 'Course Enrolled' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                                    student.connection_type === 'Discount Code' ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' :
                                                    'bg-primary/20 text-primary border-primary/30'
                                                }`}>
                                                    {student.connection_type || 'Directly Registered'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {(student.enrollments && student.enrollments.length > 0) ? (
                                                    student.enrollments.map((en, idx) => {
                                                        const cTitle = en.courseTitle || en.course_title;
                                                        const bName = en.batchName || en.batch_name;
                                                        return (
                                                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
                                                                <span className="text-xs font-semibold text-white/80">{cTitle}</span>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                                                    bName 
                                                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                                                        : 'bg-white/5 text-gray-400 border-white/10'
                                                                }`}>
                                                                    Batch: {bName || 'No Batch Assigned'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-white/60">{student.course || 'Unassigned'}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                                            student.batchName || student.batch_name
                                                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                                                : 'bg-white/5 text-gray-400 border-white/10'
                                                        }`}>
                                                            Batch: {student.batchName || student.batch_name || 'No Batch Assigned'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                                                <span className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {student.email}
                                                </span>
                                                {student.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {student.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedStudentForBatch(student);
                                                    setAssignBatchData({ courseId: '', batchId: '' });
                                                    setShowAssignBatchModal(true);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-lg transition-all"
                                                title="Assign Batch"
                                            >
                                                <Users size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedStudentForDocs(student);
                                                    fetchStudentDocs(student._id || student.id);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-lg transition-all"
                                                title="View Documents"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedStudentForCerts(student);
                                                    fetchStudentCerts(student._id || student.id);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-lg transition-all"
                                                title="View Certificates"
                                            >
                                                <Trophy size={16} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">Status</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${student.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {student.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Register New Student Modal */}
            {showRegisterStudentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={(e) => { 
                    if (e.target === e.currentTarget) {
                        setShowRegisterStudentModal(false);
                        setShowCustomCodeInput(false);
                        setNewStudentData({ 
                            name: '', 
                            email: '', 
                            phone: '', 
                            password: '', 
                            course: '', 
                            courseFee: '',
                            university: '',
                            partnerCode: partnerCodes.length > 0 ? partnerCodes[0].code : '',
                            customCode: ''
                        });
                    }
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Register New Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={newStudentData.name}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="Enter student's full name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={newStudentData.email}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="student@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Password *</label>
                                <input
                                    type="password"
                                    value={newStudentData.password}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="Temporary password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={newStudentData.phone}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Course *</label>
                                <select
                                    value={newStudentData.course}
                                    onChange={(e) => handleCourseChange(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {availableCourses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {availableBatches.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">Select Batch</label>
                                    <select
                                        value={newStudentData.batch_id}
                                        onChange={(e) => setNewStudentData({ ...newStudentData, batch_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="">No Batch (Global)</option>
                                        {availableBatches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Course Fee</label>
                                <input
                                    type="text"
                                    value={newStudentData.courseFee ? `₹${newStudentData.courseFee}` : ''}
                                    readOnly
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
                                    placeholder="Auto-filled based on course"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">University *</label>
                                <select
                                    value={newStudentData.university}
                                    onChange={(e) => {
                                        setNewStudentData({ ...newStudentData, university: e.target.value });
                                    }}
                                    className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="">Select a university</option>
                                    {availableUniversities.length > 0 ? (
                                        availableUniversities.map(uni => (
                                            <option key={uni._id} value={uni._id}>
                                                {uni.profile?.universityName || uni.name || uni.email}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading universities...</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Affiliation Code *</label>
                                <select
                                    value={showCustomCodeInput ? 'custom' : newStudentData.partnerCode}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setShowCustomCodeInput(true);
                                            setNewStudentData({ ...newStudentData, partnerCode: '' });
                                        } else {
                                            setShowCustomCodeInput(false);
                                            setNewStudentData({ ...newStudentData, partnerCode: e.target.value, customCode: '' });
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="" disabled>Select an affiliation code</option>
                                    {partnerCodes.map(c => (
                                        <option key={c._id} value={c.code}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} off)</option>
                                    ))}
                                    <option value="custom">Custom Code</option>
                                </select>
                                {showCustomCodeInput && (
                                    <input
                                        type="text"
                                        value={newStudentData.customCode}
                                        onChange={(e) => setNewStudentData({ ...newStudentData, customCode: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary mt-2"
                                        placeholder="Enter custom affiliation code"
                                        required
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <ModernButton
                                variant="secondary"
                                onClick={() => {
                                    setShowRegisterStudentModal(false);
                                    setShowCustomCodeInput(false);
                                    setNewStudentData({ 
                                        name: '', 
                                        email: '', 
                                        phone: '', 
                                        password: '', 
                                        course: '', 
                                        courseFee: '',
                                        university: '',
                                        partnerCode: partnerCodes.length > 0 ? partnerCodes[0].code : '',
                                        customCode: ''
                                    });
                                }}
                                className="flex-1 border !border-white/10"
                            >
                                Cancel
                            </ModernButton>
                            <ModernButton onClick={handleRegisterStudent} className="flex-1">
                                Register
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Student Documents Modal */}
            <AnimatePresence>
                {selectedStudentForDocs && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStudentForDocs(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[85vh] bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="text-primary" /> Documents: {selectedStudentForDocs.name}
                                    </h3>
                                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">Student ID: {selectedStudentForDocs._id || selectedStudentForDocs.id}</p>
                                </div>
                                <button onClick={() => setSelectedStudentForDocs(null)} className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                {assetsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                        <p className="text-white/40 text-sm">Loading documents...</p>
                                    </div>
                                ) : studentDocs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {studentDocs.map((doc, idx) => (
                                            <div key={doc._id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-primary/30 transition-all">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                                        <FileText className="text-primary" size={20} />
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
                                                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest mt-0.5">
                                                            {doc.type} • {new Date(doc.created_at || doc.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {(doc.file_url || doc.fileUrl) && (
                                                        <button
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    {doc.status === 'submitted' && (
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={() => handleDocumentReview(doc.id || doc._id, 'approved')}
                                                                className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const reason = prompt('Reason for rejection:');
                                                                    if (reason) handleDocumentReview(doc.id || doc._id, 'rejected', reason);
                                                                }}
                                                                className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <a
                                                        href={`/${doc.file_url || doc.fileUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-white/20">
                                        <FileText size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-bold">No documents uploaded yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Student Certificates Modal */}
            <AnimatePresence>
                {selectedStudentForCerts && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStudentForCerts(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[85vh] bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy className="text-primary" /> Certificates: {selectedStudentForCerts.name}
                                    </h3>
                                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">Student ID: {selectedStudentForCerts._id || selectedStudentForCerts.id}</p>
                                </div>
                                <button onClick={() => setSelectedStudentForCerts(null)} className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                {assetsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                        <p className="text-white/40 text-sm">Loading certificates...</p>
                                    </div>
                                ) : studentCerts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {studentCerts.map((req, idx) => (
                                            <GlassCard key={req.id} className="p-4 flex flex-col border-white/5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white text-sm truncate">{req.course_title}</h4>
                                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                            req.status === 'ISSUED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 mb-4 text-[10px]">
                                                    <div className="flex justify-between text-white/30 uppercase font-black">
                                                        <span>Applied</span>
                                                        <span className="text-white/60">{new Date(req.apply_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white/30 uppercase font-black">
                                                        <span>University</span>
                                                        <span className="text-white/60 truncate ml-4">{req.university_name}</span>
                                                    </div>
                                                </div>
                                                {req.status === 'ISSUED' ? (
                                                    <button 
                                                        onClick={() => window.open(req.file_url, '_blank')}
                                                        className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Eye size={12} /> View Certificate
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-2 bg-white/5 text-white/30 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1.5">
                                                        <Clock size={12} /> Processing by Uni
                                                    </div>
                                                )}
                                            </GlassCard>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-white/20">
                                        <Trophy size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-bold">No certificates earned yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
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
                                            {previewDoc.type} • {selectedStudentForDocs?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={`/${previewDoc.file_url || previewDoc.fileUrl}`}
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
                                    src={`/${previewDoc.file_url || previewDoc.fileUrl}`} 
                                    className="w-full h-full border-none"
                                    title="Document Preview"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Assign Batch Modal */}
            {showAssignBatchModal && selectedStudentForBatch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Assign to Batch</h2>
                            <button onClick={() => setShowAssignBatchModal(false)} className="text-white/40 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-white/60 mb-1">Student</p>
                                <p className="text-lg font-bold text-white">{selectedStudentForBatch.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Select Course</label>
                                <select
                                    value={assignBatchData.courseId}
                                    onChange={async (e) => {
                                        const courseId = e.target.value;
                                        setAssignBatchData({ ...assignBatchData, courseId, batchId: '' });
                                        if (courseId) {
                                            try {
                                                const { data } = await axios.get(`/api/batches/course/${courseId}`, config);
                                                setBatchOptions(data);
                                            } catch (err) {
                                                console.error('Error fetching batches:', err);
                                                setBatchOptions([]);
                                            }
                                        } else {
                                            setBatchOptions([]);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select a course</option>
                                    {selectedStudentForBatch.enrollments?.map(en => (
                                        <option key={en.course_id} value={en.course_id}>
                                            {en.course_title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {assignBatchData.courseId && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">Select Batch</label>
                                    <select
                                        value={assignBatchData.batchId}
                                        onChange={(e) => setAssignBatchData({ ...assignBatchData, batchId: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="">No Batch (Global)</option>
                                        {batchOptions.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-3 mt-8">
                            <ModernButton
                                variant="secondary"
                                onClick={() => setShowAssignBatchModal(false)}
                                className="flex-1 border !border-white/10"
                            >
                                Cancel
                            </ModernButton>
                            <ModernButton onClick={handleAssignBatch} className="flex-1">
                                Update Batch
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PartnerStudentManagement;

