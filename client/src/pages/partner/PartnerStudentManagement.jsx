import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Users,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Mail,
    Phone,
    BookOpen,
    FileText,
    Download,
    UserPlus,
    Trash2
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
        customCode: ''
    });
    const [showCustomCodeInput, setShowCustomCodeInput] = useState(false);
    const [partnerCodes, setPartnerCodes] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableUniversities, setAvailableUniversities] = useState([]);
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
            setPartnerCodes(data);
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

    const handleCourseChange = (courseId) => {
        const selectedCourse = availableCourses.find(c => c._id === courseId);
        setNewStudentData(prev => ({
            ...prev,
            course: courseId,
            courseFee: selectedCourse ? selectedCourse.price : ''
        }));
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
                partnerCode: codeToUse
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

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
        return matchesSearch && matchesCourse;
    });

    const courses = [...new Set(students.map(s => s.course).filter(Boolean))];

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
                <div className="flex gap-3">
                    <ModernButton variant="primary" onClick={() => setShowRegisterStudentModal(true)}>
                        <UserPlus size={16} className="mr-2" /> Register Student
                    </ModernButton>
                </div>
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
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    )}
                </div>
            </GlassCard>

            {/* Students List */}
            <GlassCard className="p-4">
                <h2 className="text-xl font-bold text-white mb-4">My Network Students</h2>
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
                                            <h3 className="font-bold text-white">{student.name}</h3>
                                            <p className="text-sm text-white/50">{student.course || 'Unassigned'}</p>
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
                                        console.log('University selected:', e.target.value);
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
                                {availableUniversities.length === 0 && (
                                    <p className="text-xs text-white/40 mt-1">No approved universities found</p>
                                )}
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
                                        <option key={c._id} value={c.code}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} off)</option>
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
        </div>
    );
};

export default PartnerStudentManagement;
