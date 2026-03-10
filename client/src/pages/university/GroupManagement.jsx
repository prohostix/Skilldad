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
    const [loading, setLoading] = useState(true);
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        name: '',
        email: '',
        phone: '',
        course: 'Computer Science'
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
            setGroups(data);
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

    useEffect(() => {
        fetchGroups();
        fetchStudents();
    }, []);

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

            const { data } = await axios.post('/api/university/register-student', {
                name: newStudentData.name,
                email: newStudentData.email,
                phone: newStudentData.phone,
                // courseId is optional, we could add a course selector to the modal if needed
            }, config);

            alert(data.message || 'Student registered successfully!');
            setShowRegisterStudentModal(false);
            setNewStudentData({ name: '', email: '', phone: '', course: 'Computer Science' });

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

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
        return matchesSearch && matchesCourse;
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
                                        <p className="text-sm text-white/50">{student.course}</p>
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
                                        onClick={() => setSelectedStudent(student)}
                                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
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

                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                    <FileText size={18} className="mr-2 text-primary" /> Documents
                                </h3>
                                <div className="space-y-2">
                                    {selectedStudent.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-sm text-white">{doc}</span>
                                            <button className="p-1 text-primary hover:bg-primary/10 rounded">
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    ))}
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
                                <input
                                    type="text"
                                    value={newStudentData.course}
                                    onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    placeholder="e.g. Computer Science"
                                />
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
        </div>
    );
};

export default GroupManagement;
