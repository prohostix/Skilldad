import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    Trash2,
    Clock,
    X,
    ExternalLink
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { getMediaUrl } from '../../utils/media';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [studentEmail, setStudentEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [showAssignBatchModal, setShowAssignBatchModal] = useState(false);
    const [selectedStudentForBatch, setSelectedStudentForBatch] = useState(null);
    const [assignBatchData, setAssignBatchData] = useState({
        courseId: '',
        batchId: ''
    });
    const [batchOptions, setBatchOptions] = useState([]);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [universityCourses, setUniversityCourses] = useState([]);
    const [filterBatch, setFilterBatch] = useState('all');
    const [filterCourseBatches, setFilterCourseBatches] = useState([]);
    const navigate = useNavigate();
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        name: '',
        email: '',
        phone: '',
        course: ''
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    // Mock students data for demonstration
    const mockStudents = [
        {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice.j@university.edu',
            phone: '+1 (555) 123-4567',
            course: 'Computer Science',
            enrollmentDate: '2024-01-15',
            progress: 85,
            status: 'active',
            documents: ['ID Card', 'Transcript', 'Certificate']
        },
        {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob.s@university.edu',
            phone: '+1 (555) 234-5678',
            course: 'Data Science',
            enrollmentDate: '2024-02-01',
            progress: 72,
            status: 'active',
            documents: ['ID Card', 'Transcript']
        }
    ];

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get('/api/university/groups', config);
            setGroups(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/api/users', {
                ...config,
                params: { role: 'student', universityId: userInfo._id || userInfo.id }
            });
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents(mockStudents); // Fallback to mock if API fails
        }
    };

    const fetchUniversityCourses = async () => {
        try {
            const { data } = await axios.get('/api/university/courses', config);
            setUniversityCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching university courses:', error);
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

            const selectedCourse = universityCourses.find(c => c.title === filterCourse);
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
    }, [filterCourse, universityCourses]);

    useEffect(() => {
        fetchGroups();
        fetchStudents();
        fetchUniversityCourses();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchStudentDocuments(selectedStudent._id || selectedStudent.id);
        } else {
            setDocuments([]);
        }
    }, [selectedStudent]);

    const fetchStudentDocuments = async (studentId) => {
        try {
            const { data } = await axios.get(`/api/documents?student=${studentId}`, config);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching student documents:', error);
        }
    };

    const handleCreateGroup = async () => {
        try {
            if (!newGroupName.trim()) return alert('Group name is required');
            const { data } = await axios.post('/api/university/groups', {
                name: newGroupName,
                description: newGroupDescription
            }, config);

            setGroups([data, ...groups]);
            setOpenDialog(false);
            setNewGroupName('');
            setNewGroupDescription('');
            alert('Group created successfully!');
        } catch (error) {
            console.error('Error creating group:', error);
            alert(error.response?.data?.message || 'Failed to create group');
        }
    };

    const handleRegisterStudent = async () => {
        try {
            if (!newStudentData.name || !newStudentData.email || !newStudentData.phone) {
                return alert('Please fill in Name, Email and Phone');
            }

            const selectedCourse = universityCourses.find(c => c.title === newStudentData.course);

            const { data } = await axios.post('/api/university/register-student', {
                name: newStudentData.name,
                email: newStudentData.email,
                phone: newStudentData.phone,
                password: 'Student@' + Math.random().toString(36).slice(-6),
                courseId: selectedCourse?.id || selectedCourse?._id
            }, config);

            alert(data.message || 'Student registered successfully!');
            setShowRegisterStudentModal(false);
            setNewStudentData({ name: '', email: '', phone: '', course: '' });

            // Refresh students list
            fetchStudents();
        } catch (error) {
            console.error('Error registering student:', error);
            alert(error.response?.data?.message || 'Failed to register student');
        }
    };

    const handleAddStudentToGroup = async (groupId) => {
        const studentInSystem = students.find(s => s.email.toLowerCase() === studentEmail.toLowerCase());

        if (!studentInSystem) {
            alert('Student email not found in the system. Please ensure the student is registered.');
            return;
        }

        try {
            const { data } = await axios.post(`/api/university/groups/${groupId}/add-student`, {
                email: studentInSystem.email
            }, config);

            // Update local state with the returned populated group
            setGroups(groups.map(g => g._id === groupId ? data.group : g));

            setStudentEmail('');
            setOpenAddStudent(false);
            alert(`Student ${studentInSystem.name} added to group successfully!`);
        } catch (error) {
            console.error('Error adding student to group:', error);
            alert(error.response?.data?.message || 'Failed to add student to group');
        }
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            setGroups(groups.filter(g => g._id !== groupId));
            alert('Group deleted.');
        }
    };

    const handleDeleteStudent = (studentId) => {
        if (window.confirm('Are you sure you want to remove this student from the system?')) {
            setStudents(students.filter(s => s._id !== studentId));
        }
    };

    const handleAssignBatch = async () => {
        try {
            if (!assignBatchData.courseId) {
                alert('Please select a course');
                return;
            }
            await axios.put('/api/enrollment/assign-batch', {
                studentId: selectedStudentForBatch._id || selectedStudentForBatch.id,
                courseId: assignBatchData.courseId,
                batchId: assignBatchData.batchId
            }, config);
            
            // Re-fetch students to update the UI
            fetchStudents();
            setShowAssignBatchModal(false);
            alert('Batch assigned successfully');
        } catch (error) {
            console.error('Error assigning batch:', error);
            alert(error.response?.data?.message || 'Failed to assign batch');
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Match course - check if any enrollment matches the filterCourse title
        const matchesCourse = filterCourse === 'all' || 
            (student.enrollments && student.enrollments.some(e => e.courseTitle === filterCourse)) ||
            student.course === filterCourse;

        // Match batch
        let matchesBatch = filterBatch === 'all';
        if (filterBatch !== 'all' && student.enrollments) {
            matchesBatch = student.enrollments.some(e => 
                (filterCourse === 'all' || e.courseTitle === filterCourse) && 
                e.batchId === filterBatch
            );
        }

        return matchesSearch && matchesCourse && matchesBatch;
    });

    const courses = [...new Set(students.map(s => s.course))];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Student Management" />
                </div>
                <div className="flex gap-3">
                    <ModernButton variant="primary" onClick={() => setShowRegisterStudentModal(true)}>
                        <UserPlus size={16} className="mr-2" /> Register Student
                    </ModernButton>
                    <ModernButton onClick={() => setOpenDialog(true)}>
                        <Plus size={16} className="mr-2" /> Create Group
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
                    <ModernButton variant="primary" onClick={() => { }} className="!py-2 !px-4 text-sm">
                        <Filter size={16} className="mr-2" />
                        More Filters
                    </ModernButton>
                </div>
            </GlassCard>

            {/* Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                    <GlassCard key={group._id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-white">{group.name}</h3>
                                <p className="text-xs text-white/50">{group.description}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteGroup(group._id)}
                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mb-3 p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/50 mb-1">Students</p>
                            <p className="text-2xl font-bold text-white">{group.students?.length || 0}</p>
                        </div>

                        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {group.students?.map(student => (
                                <div key={student._id || student.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                                        {student.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{student.name}</p>
                                        <p className="text-xs text-white/40 truncate">{student.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <ModernButton
                            variant="primary"
                            className="w-full text-xs py-2"
                            onClick={() => {
                                setSelectedGroup(group);
                                setOpenAddStudent(true);
                            }}
                        >
                            <UserPlus size={14} className="mr-2" /> Add Student
                        </ModernButton>
                    </GlassCard>
                ))}
            </div>

            {/* Students List */}
            <GlassCard className="p-4">
                <h2 className="text-xl font-bold text-white mb-4">All Students</h2>
                <div className="space-y-3">
                    {filteredStudents.map(student => (
                        <div key={student._id || student.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{student.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(student.enrollments && student.enrollments.length > 0) ? (
                                                student.enrollments.map((en, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                                                        <span className="text-xs font-medium text-white/70">{en.courseTitle}</span>
                                                        {en.batchName && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                                <span className="text-[10px] font-bold text-primary uppercase">{en.batchName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-white/50">{student.course || 'Unassigned'}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                                            <span className="flex items-center gap-1">
                                                <Mail size={12} />
                                                {student.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={12} />
                                                {student.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">Progress: {student.progress}%</p>
                                        <div className="w-24 bg-white/10 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                    </div>
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
                                        onClick={() => setSelectedStudent(student)}
                                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Create Group Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Create New Group</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Group Name</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="Enter group name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Description</label>
                                <textarea
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="Enter description"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setOpenDialog(false)}
                                className="flex-1 py-2 text-white/70 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <ModernButton onClick={handleCreateGroup} className="flex-1">
                                Create
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Student Dialog */}
            {openAddStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Add Student to {selectedGroup?.name}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Student Email</label>
                                <input
                                    type="email"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="student@university.edu"
                                />
                                <p className="text-xs text-white/40 mt-1">
                                    The student must already be registered in the system.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <ModernButton
                                variant="secondary"
                                onClick={() => {
                                    setOpenAddStudent(false);
                                    setStudentEmail('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </ModernButton>
                            <ModernButton onClick={() => handleAddStudentToGroup(selectedGroup._id)} className="flex-1">
                                Add Student to Group
                            </ModernButton>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Student Details</h2>
                            <ModernButton
                                variant="secondary"
                                onClick={() => setSelectedStudent(null)}
                                className="!p-2 !rounded-lg"
                            >
                                ✕
                            </ModernButton>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                    <Users size={18} className="mr-2 text-primary" /> Profile Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-white/50">Name</p>
                                        <p className="font-bold text-white">{selectedStudent.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/50">Email</p>
                                        <p className="font-bold text-white">{selectedStudent.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/50">Phone</p>
                                        <p className="font-bold text-white">{selectedStudent.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/50">Course</p>
                                        <p className="font-bold text-white">{selectedStudent.course}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText size={18} className="mr-2 text-primary" /> Documents ({documents.length})
                                    </div>
                                    <button 
                                        onClick={() => navigate('/university/student-documents')}
                                        className="text-[10px] font-black uppercase text-primary hover:underline"
                                    >
                                        Go to Review Hub
                                    </button>
                                </h3>
                                <div className="space-y-3">
                                    {documents.length > 0 ? documents.map((doc) => (
                                        <div key={doc._id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center group">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <FileText size={16} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-white">{doc.title}</p>
                                                        <span className={`px-1 py-0.5 text-[8px] font-black uppercase rounded border ${
                                                            doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            doc.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                        }`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-white/30 font-medium">
                                                        {doc.type} • {new Date(doc.created_at || doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {(doc.file_url || doc.fileUrl) && (
                                                    <button
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="p-1.5 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                                        title="Preview"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                )}
                                                {doc.status === 'submitted' && (
                                                    <button
                                                        onClick={() => navigate('/university/student-documents')}
                                                        className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                                                        title="Review"
                                                    >
                                                        <Clock size={12} />
                                                    </button>
                                                )}
                                                <a
                                                    href={getMediaUrl(doc.file_url || doc.fileUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                                            <FileText className="mx-auto text-white/10 mb-2" size={24} />
                                            <p className="text-xs text-white/30">No documents found for this student.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Register New Student Modal */}
            {showRegisterStudentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] flex items-start justify-center p-4 pt-20 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Register New Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={newStudentData.name}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="Enter student's full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={newStudentData.email}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="student@university.edu"
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
                                <label className="block text-sm font-bold text-white/70 mb-2">Course</label>
                                <select
                                    value={newStudentData.course}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value="" className="bg-[#0B0F1A]">Select Course</option>
                                    {universityCourses.map(course => (
                                        <option key={course.id || course._id} value={course.title} className="bg-[#0B0F1A]">
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                {universityCourses.length === 0 && (
                                    <p className="text-[10px] text-amber-400 mt-1">
                                        No courses assigned. Contact Admin.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <ModernButton
                                variant="secondary"
                                onClick={() => setShowRegisterStudentModal(false)}
                                className="flex-1"
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
                                        <option key={en.courseId} value={en.courseId}>
                                            {en.courseTitle}
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

export default GroupManagement;
