import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Users,
    BookOpen,
    TrendingUp,
    Calendar,
    MoreVertical,
    CheckCircle2,
    Activity,
    Search,
    Download,
    Bell,
    ChevronRight,
    Trophy,
    Clock,
    FileText,
    Video,
    BarChart3,
    Filter,
    Eye,
    Edit,
    Plus,
    Upload,
    Mail,
    Phone,
    MapPin,
    Star,
    AlertCircle,
    PlayCircle,
    X,
    Trash2,
    Share2,
    Sparkles,
    ShieldCheck,
    Image as ImageIcon
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import CountingNumber from '../../components/ui/CountingNumber';
import DashboardHeading from '../../components/ui/DashboardHeading';
import LiveSessionsTab from './LiveSessionsTab';
import CertificateRequestsTab from './CertificateRequestsTab';
import { getMediaUrl } from '../../utils/media';


const UniversityDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({ studentCount: 0, groupCount: 0, liveSessions: 0, avgScore: 0 });
    const [students, setStudents] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('all');
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [newStudentData, setNewStudentData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        batch_id: ''
    });
    const [availableBatches, setAvailableBatches] = useState([]);
    const [receivedDocuments, setReceivedDocuments] = useState([]);
    const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
    const [selectedStudentForView, setSelectedStudentForView] = useState(null);

    useEffect(() => {
        if (location.pathname.includes('analytics')) {
            setActiveTab('analytics');
        } else if (location.pathname.includes('certificates')) {
            setActiveTab('certificates');
        } else if (location.pathname.includes('courses')) {
            setActiveTab('courses');
        } else {
            setActiveTab('students');
        }
    }, [location.pathname]);
    const [filterCourse, setFilterCourse] = useState('all');

    // Mock Data
    const mockStudents = [
        { id: '1', name: 'Alice Johnson', email: 'alice@uni.edu', course: 'Computer Science', progress: 75, enrollmentDate: '2023-09-01', phone: '+1 234 567 890', documents: ['Transcript', 'ID'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        { id: '2', name: 'Bob Smith', email: 'bob@uni.edu', course: 'Business', progress: 45, enrollmentDate: '2023-09-15', phone: '+1 234 567 891', documents: ['ID'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { id: '3', name: 'Charlie Brown', email: 'charlie@uni.edu', course: 'Computer Science', progress: 90, enrollmentDate: '2023-08-20', phone: '+1 234 567 892', documents: ['Certificate'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
        { id: '4', name: 'Dana White', email: 'dana@uni.edu', course: 'Engineering', progress: 60, enrollmentDate: '2023-10-05', phone: '+1 234 567 893', documents: [], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana' },
        { id: '5', name: 'Edward Norton', email: 'edward@uni.edu', course: 'Data Science', progress: 82, enrollmentDate: '2023-09-10', phone: '+1 234 567 894', documents: ['ID'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edward' },
        { id: '6', name: 'Fiona Apple', email: 'fiona@uni.edu', course: 'Design', progress: 30, enrollmentDate: '2023-11-01', phone: '+1 234 567 895', documents: ['Portfolio'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona' },
        { id: '7', name: 'George Miller', email: 'george@uni.edu', course: 'Computer Science', progress: 55, enrollmentDate: '2023-09-20', phone: '+1 234 567 896', documents: [], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George' },
        { id: '8', name: 'Hannah Baker', email: 'hannah@uni.edu', course: 'Business', progress: 95, enrollmentDate: '2023-08-15', phone: '+1 234 567 897', documents: ['Transcript'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah' }
    ];


    const mockLiveSessions = [
        { id: 1, title: 'Intro to React Hooks', course: 'Computer Science', status: 'scheduled', date: '2023-11-20', time: '10:00 AM', duration: '1h', instructor: 'Dr. Smith', enrolledStudents: 45, description: 'Learn the essentials of React hooks including useState and useEffect.' },
        { id: 2, title: 'Market Analysis', course: 'Business', status: 'completed', date: '2023-11-18', time: '2:00 PM', duration: '1.5h', instructor: 'Prof. Jones', enrolledStudents: 30, description: 'A deep dive into current market trends and competitive analysis.' },
        { id: 3, title: 'Design Principles', course: 'Design', status: 'scheduled', date: '2023-11-25', time: '1:00 PM', duration: '1h', instructor: 'Prof. Sarah', enrolledStudents: 40, description: 'Understanding visual hierarchy, contrast, and balance in modern UI.' },
        { id: 4, title: 'Advanced Data Structures', course: 'Computer Science', status: 'scheduled', date: '2023-11-21', time: '11:30 AM', duration: '2h', instructor: 'Dr. Chen', enrolledStudents: 55, description: 'Algorithms and execution complexity for trees, graphs, and heaps.' },
        { id: 5, title: 'Strategic Management', course: 'Business', status: 'scheduled', date: '2023-11-22', time: '09:00 AM', duration: '1h', instructor: 'Prof. Brown', enrolledStudents: 25, description: 'Executive decision making and long-term organizational planning.' },
        { id: 6, title: 'UI/UX Workshop', course: 'Design', status: 'completed', date: '2023-11-15', time: '3:00 PM', duration: '3h', instructor: 'Alex Rivera', enrolledStudents: 60, description: 'Hands-on session building accessible interfaces from scratch.' },
        { id: 7, title: 'Basic JavaScript', course: 'Computer Science', status: 'completed', date: '2023-11-10', time: '10:00 AM', duration: '2h', instructor: 'Dr. Smith', enrolledStudents: 50, description: 'Introduction to variables, loops, and functions in JS.' }
    ];

    const mockAnalytics = {
        courseProgress: [
            { course: 'Computer Science', progress: 78, students: 120 },
            { course: 'Business', progress: 65, students: 85 },
            { course: 'Engineering', progress: 72, students: 95 }
        ],
        exerciseResults: [
            { exercise: 'React Basics Quiz', avgScore: 85, submissions: 115 },
            { exercise: 'Market Research 101', avgScore: 72, submissions: 80 },
            { exercise: 'Thermodynamics Lab', avgScore: 78, submissions: 90 }
        ],
        projectSubmissions: [
            { project: 'E-commerce Website', submitted: 45, pending: 5, total: 50 },
            { project: 'Business Plan', submitted: 30, pending: 10, total: 40 },
            { project: 'Bridge Design', submitted: 35, pending: 5, total: 40 }
        ],
        studentSpecific: {
            '1': {
                name: 'Alice Johnson',
                progress: [
                    { course: 'Computer Science', progress: 95 },
                    { course: 'Web Development', progress: 100 }
                ],
                exercises: [
                    { name: 'React Hooks', score: 98 },
                    { name: 'CSS Grid', score: 92 },
                    { name: 'Node.js Auth', score: 88 }
                ],
                projects: [
                    { name: 'Portfolio Site', status: 'Graded', score: 95 },
                    { name: 'Task Manager', status: 'Submitted', score: null }
                ]
            },
            '2': {
                name: 'Bob Smith',
                progress: [
                    { course: 'Business', progress: 45 }
                ],
                exercises: [
                    { name: 'Market Analysis', score: 75 },
                    { name: 'Finance 101', score: 68 }
                ],
                projects: [
                    { name: 'Biz Model', status: 'Graded', score: 82 }
                ]
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                const [statsRes, studentsRes, sessionsRes, docsRes, coursesRes] = await Promise.all([
                    axios.get('/api/university/stats', config).catch(() => ({ data: { studentCount: 0, groupCount: 0, liveSessions: 0, avgScore: 0 } })),
                    axios.get('/api/users', { ...config, params: { role: 'student', universityId: userInfo._id || userInfo.id } }).catch(() => ({ data: mockStudents })),
                    axios.get('/api/sessions', config).catch(() => ({ data: mockLiveSessions })),
                    axios.get('/api/documents', config).catch(() => ({ data: [] })),
                    axios.get('/api/university/courses', config).catch(() => ({ data: [] }))
                ]);

                setStats(statsRes.data || { studentCount: 0, groupCount: 0, liveSessions: 0, avgScore: 0 });
                const studentData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                setStudents(studentData.length > 0 ? studentData : mockStudents);
                const sessionData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
                setLiveSessions(sessionData.length > 0 ? sessionData : mockLiveSessions);
                setReceivedDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);

                // Align course fetching with ScheduleClass.jsx for robustness
                const courseData = coursesRes.data;
                if (Array.isArray(courseData)) {
                    setCourses(courseData);
                } else if (courseData && Array.isArray(courseData.courses)) {
                    setCourses(courseData.courses);
                } else {
                    setCourses([]);
                }

                setAnalytics(mockAnalytics);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = students.filter(student => {
        const name = student.name || '';
        const email = student.email || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Multi-course support: check if filterCourse is in student.courses array
        const studentCourses = student.courses || (student.course ? [student.course] : []);
        const matchesCourse = filterCourse === 'all' || studentCourses.includes(filterCourse);
        return matchesSearch && matchesCourse;
    });

    const handleExportCSV = () => {
        let exportData = [];
        let filename = 'analytics_report.csv';

        if (selectedStudentId === 'all') {
            exportData = analytics.courseProgress?.map(c => ({
                Course: c.course,
                Progress: `${c.progress}%`,
                StudentsEnrolled: c.students
            })) || [];
        } else {
            const student = analytics.studentSpecific?.[selectedStudentId];
            if (!student) return;
            filename = `${student.name.replace(/\s+/g, '_')}_report.csv`;

            // Collect all student metrics
            student.progress.forEach(p => {
                exportData.push({ Metric: 'Course Progress', Title: p.course, Result: `${p.progress}%` });
            });
            student.exercises.forEach(e => {
                exportData.push({ Metric: 'Exercise', Title: e.name, Result: `${e.score}%` });
            });
            student.projects.forEach(p => {
                exportData.push({ Metric: 'Project', Title: p.name, Result: p.status + (p.score ? ` (${p.score}%)` : '') });
            });
        }

        if (exportData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = Object.keys(exportData[0]);
        const csvRows = [
            headers.join(','),
            ...exportData.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.click();
    };

    const handleExportPDF = () => {
        alert("Preparing PDF report... (Using system print dialog)");
        window.print();
    };

    const handleAddStudent = () => {
        setEditingStudent(null);
        setNewStudentData({
            name: '',
            email: '',
            phone: '',
            course: '',
            enrollmentDate: new Date().toISOString().split('T')[0]
        });
        setShowStudentModal(true);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setNewStudentData({
            name: student.name,
            email: student.email,
            phone: student.phone,
            course: student.course,
            enrollmentDate: student.enrollmentDate,
            batch_id: student.batch_id || ''
        });
        setShowStudentModal(true);
    };

    const handleCourseChange = async (courseName) => {
        const selectedCourse = courses.find(c => (c.title || c) === courseName);
        setNewStudentData(prev => ({
            ...prev,
            course: courseName,
            batch_id: '' // Reset batch when course changes
        }));

        if (selectedCourse && selectedCourse._id) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`/api/batches/course/${selectedCourse._id}`, config);
                setAvailableBatches(data);
            } catch (err) {
                console.error('Error fetching batches:', err);
                setAvailableBatches([]);
            }
        } else {
            setAvailableBatches([]);
        }
    };

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            if (editingStudent) {
                // For editing, we might need a different endpoint, but for now we follow the same pattern
                // as before for UI consistency, or we could implement updateStudentByUniversity
                setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...newStudentData } : s));
                alert("Student details updated successfully! (Local Update)");
            } else {
                // Call the new backend API I created
                const { data } = await axios.post('/api/university/register-student', {
                    name: newStudentData.name,
                    email: newStudentData.email,
                    phone: newStudentData.phone,
                    password: 'Student@' + Math.random().toString(36).slice(-6), // Generate default password
                    courseId: courses.find(c => (c.title || c) === newStudentData.course)?._id,
                    batchId: newStudentData.batch_id
                }, config);

                alert(data.message || "New student registered successfully!");

                // Refresh students list from server
                const studentsRes = await axios.get('/api/users', { ...config, params: { role: 'student', universityId: userInfo._id || userInfo.id } });
                setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            }
            setShowStudentModal(false);
        } catch (error) {
            console.error('Error saving student:', error);
            alert(error.response?.data?.message || 'Failed to save student');
        }
    };

    const handleCreateCourse = async (courseData) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post('/api/courses', courseData, config);
            alert("Course created successfully! It will appear in your list once approved by SkillDad Admin.");
            
            // Refresh courses
            const coursesRes = await axios.get('/api/university/courses', config);
            if (Array.isArray(coursesRes.data)) {
                setCourses(coursesRes.data);
            } else if (coursesRes.data && Array.isArray(coursesRes.data.courses)) {
                setCourses(coursesRes.data.courses);
            }
            
            setShowCreateCourseModal(false);
        } catch (error) {
            console.error('Error creating course:', error);
            alert(error.response?.data?.message || 'Failed to create course');
        }
    };

    const handleDeleteStudent = (id) => {
        if (window.confirm("Are you sure you want to remove this student?")) {
            setStudents(students.filter(s => (s._id || s.id) !== id));
        }
    };

    const formatJoinedDate = (student) => {
        const rawDate = student?.created_at || student?.createdAt || student?.enrollmentDate || student?.enrollment_date;
        if (!rawDate) return 'N/A';
        const date = new Date(rawDate);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleViewStudent = (student) => {
        setSelectedStudentForView(student);
    };

    const isMainDashboard = location.pathname.endsWith('/dashboard') || location.pathname === '/university' || location.pathname === '/university/';

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            {isMainDashboard && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <DashboardHeading title="University Dashboard" />
                        <p className="text-white/50 mt-1 text-sm">Manage your institution, students, and sessions.</p>
                    </div>
                    <div className="flex gap-3">
                        <ModernButton variant="secondary" onClick={() => { }}>
                            <Bell size={18} />
                        </ModernButton>
                    </div>
                </div>
            )}

            {!isMainDashboard && location.pathname.includes('certificates') && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <DashboardHeading title="Certificates Management" />
                        <p className="text-white/50 mt-1 text-sm">Review, approve, and issue student certificates.</p>
                    </div>
                </div>
            )}

            {!isMainDashboard && location.pathname.includes('courses') && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <DashboardHeading title="Course Management" />
                        <p className="text-white/50 mt-1 text-sm">Manage your university's course catalog and syllabus.</p>
                    </div>
                </div>
            )}

            {/* Dashboard Stats Overview */}
            {isMainDashboard && (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {[
                        { label: 'Total Students', value: stats.studentCount || 0, icon: Users, color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
                        { label: 'Active Sessions', value: stats.liveSessions || 0, icon: Video, color: 'from-primary/20 to-primary-dark/20', border: 'border-primary/30', text: 'text-primary' },
                        { label: 'Learning Groups', value: stats.groupCount || 0, icon: BookOpen, color: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30', text: 'text-amber-400' },
                        { label: 'Avg. Performance', value: `${stats.avgScore || 0}%`, icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard className={`p-3 sm:p-4 border-b-2 ${stat.border} group hover:scale-[1.02] transition-all duration-300`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <div className="text-2xl font-black text-white">
                                            <CountingNumber value={parseInt(stat.value) || 0} suffix={stat.value.toString().includes('%') ? '%' : ''} />
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} ${stat.text} shadow-inner`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                                <div className="mt-2.5 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-400">+12%</span>
                                    <span className="text-[10px] text-white/20 uppercase tracking-tighter">vs last month</span>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Tab Navigation */}
            {isMainDashboard && (
                <div className="flex justify-center mb-8 mt-6">
                    <div className="flex space-x-1 bg-white/5 p-1 rounded-full w-fit mx-auto backdrop-blur-md border border-white/10 flex-wrap justify-center">
                        {[
                            { id: 'students', label: 'Student Management', icon: Users },
                            { id: 'courses', label: 'Our Courses', icon: BookOpen },
                            { id: 'sessions', label: 'Live Sessions', icon: Video },
                            { id: 'assets', label: 'Secure Assets', icon: ShieldCheck }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 sm:px-6 py-2 rounded-full text-[11px] sm:text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <tab.icon size={window.innerWidth < 640 ? 14 : 16} className="mr-1.5 sm:mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="text-white/50 text-center py-20">
                        Select a tab to view details
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <CertificateRequestsTab />
                )}

                {activeTab === 'students' && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterCourse}
                                    onChange={(e) => setFilterCourse(e.target.value)}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary max-w-[200px]"
                                >
                                    <option value="all" className="bg-[#0B0F1A] text-white">All Courses</option>
                                    {courses.map(course => (
                                        <option key={course._id || course} value={course.title || course} className="bg-[#0B0F1A] text-white">{course.title || course}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="grid gap-4">
                            {filteredStudents.map(student => (
                                <GlassCard key={student._id || student.id} className="p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                {student.profileImage || student.avatar ? (
                                                    <img
                                                        src={student.profileImage || student.avatar}
                                                        alt={student.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    student.name?.charAt(0) || 'S'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{student.name}</h3>
                                                <p className="text-sm text-white/50">
                                                    {Array.isArray(student.courses) && student.courses.length > 0 
                                                        ? student.courses.join(', ') 
                                                        : student.course || 'Enrolled Student'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {student.email}
                                                    </span>
                                                    {student.phone || student.profile?.phone ? (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} />
                                                            {student.phone || student.profile?.phone}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-white">Progress: {student.progress || 0}%</div>
                                                <div className="w-24 bg-white/10 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${student.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-white/50 mt-1">
                                                    Joined: {formatJoinedDate(student)}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewStudent(student)}
                                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/50">Documents:</span>
                                            <div className="flex gap-2">
                                                {(student.documents || []).map((doc, index) => (
                                                    <span key={index} className="px-2 py-1 bg-white/5 text-xs text-white/70 rounded">
                                                        {doc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Courses We Provide</h2>
                                <p className="text-white/40 text-sm">Manage courses assigned to your institution and view enrolled students.</p>
                            </div>
                            <ModernButton 
                                onClick={() => setShowCreateCourseModal(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create New Course
                            </ModernButton>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {courses.length > 0 ? courses.map((course) => (
                                <GlassCard
                                    key={course._id || course}
                                    className="p-5 flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-all"
                                    onClick={() => navigate(`/university/courses/${course._id}`)}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform overflow-hidden">
                                                {course.thumbnail ? (
                                                    <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }} />
                                                ) : <BookOpen size={24} />}
                                            </div>
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/50 tracking-wider">
                                                {course.category || 'Course'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{course.title || course}</h3>
                                        <p className="text-sm text-white/50 line-clamp-2 mb-4">
                                            {course.description || 'Click to manage course content, modules, and videos.'}
                                        </p>
                                    </div>
                                    <div className="pt-4 mt-auto border-t border-white/10 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Users size={16} />
                                            <span className="text-sm font-medium">
                                                {students.filter(s => {
                                                    const courses = s.courses || (s.course ? [s.course] : []);
                                                    return courses.includes(course.title);
                                                }).length} Enrolled
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFilterCourse(course.title || course);
                                                setActiveTab('students');
                                            }}
                                            className="px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            View Students
                                        </button>
                                    </div>
                                </GlassCard>
                            )) : (
                                <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-white/10">
                                    <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                                    <h3 className="text-lg font-bold text-white/70 mb-2">No Courses Assigned</h3>
                                    <p className="text-white/40 text-sm max-w-md mx-auto">
                                        Your institution has not been assigned any courses yet. Please contact the SkillDad administration.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <LiveSessionsTab students={students} />
                )}


                {activeTab === 'analytics' && (

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Student Performance Analytics</h2>
                                <p className="text-white/40 text-sm">View aggregate or individual student reports.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary appearance-none text-sm min-w-[200px]"
                                    >
                                        <option value="all" className="bg-black text-white">All Students (Aggregate)</option>
                                        {students.map(s => (
                                            <option key={s._id || s.id} value={s._id || s.id} className="bg-black text-white">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <ModernButton variant="secondary" onClick={handleExportCSV}>
                                    <Download size={16} className="mr-2" />
                                    Export CSV
                                </ModernButton>
                                <ModernButton variant="secondary" onClick={handleExportPDF}>
                                    <FileText size={16} className="mr-2" />
                                    Export PDF
                                </ModernButton>
                            </div>
                        </div>

                        {selectedStudentId === 'all' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Course Progress */}
                                <GlassCard className="p-5">
                                    <h3 className="text-base font-semibold text-white mb-4">Course Progress</h3>
                                    <div className="space-y-4">
                                        {analytics.courseProgress?.map((course, index) => (
                                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <h4 className="font-medium text-white text-sm">{course.course}</h4>
                                                    <span className="text-primary font-medium text-xs">{course.progress}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5 mb-1.5">
                                                    <div
                                                        className="bg-primary h-1.5 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-white/50">{course.students} students enrolled</p>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Exercise Results */}
                                <GlassCard className="p-5">
                                    <h3 className="text-base font-semibold text-white mb-4">Exercise Results</h3>
                                    <div className="space-y-4">
                                        {analytics.exerciseResults?.map((exercise, index) => (
                                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                                <h4 className="font-medium text-white mb-2 text-sm">{exercise.exercise}</h4>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-white/50">Avg. Score</p>
                                                        <p className="text-base font-semibold text-emerald-400">{exercise.avgScore}%</p>
                                                    </div>
                                                    <span className="text-xs text-white/40">{exercise.submissions} submissions</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Project Submissions */}
                                <GlassCard className="p-5">
                                    <h3 className="text-base font-semibold text-white mb-4">Project Submissions</h3>
                                    <div className="space-y-4">
                                        {analytics.projectSubmissions?.map((project, index) => (
                                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                                <h4 className="font-medium text-white mb-2 text-sm">{project.project}</h4>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-white/50">Submission Rate</span>
                                                    <span className="text-xs text-white font-medium">{Math.round((project.submitted / project.total) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                    <div
                                                        className="bg-purple-500 h-1.5 rounded-full"
                                                        style={{ width: `${(project.submitted / project.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] text-white/40">
                                                    <span>{project.submitted} Submitted</span>
                                                    <span>{project.pending} Pending</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {analytics.studentSpecific?.[selectedStudentId] ? (
                                    <>
                                        {/* Individual Course Progress */}
                                        <GlassCard className="p-5">
                                            <h3 className="text-base font-semibold text-white mb-4">Personal Course Progress</h3>
                                            <div className="space-y-4">
                                                {analytics.studentSpecific[selectedStudentId].progress.map((p, i) => (
                                                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <h4 className="font-medium text-white text-sm">{p.course}</h4>
                                                            <span className="text-primary font-medium text-xs">{p.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-1.5">
                                                            <div
                                                                className="bg-primary h-1.5 rounded-full"
                                                                style={{ width: `${p.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* Individual Exercise Scores */}
                                        <GlassCard className="p-5">
                                            <h3 className="text-base font-semibold text-white mb-4">Exercise Scores</h3>
                                            <div className="space-y-4">
                                                {analytics.studentSpecific[selectedStudentId].exercises.map((e, i) => (
                                                    <div key={i} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                                                        <span className="text-sm text-white">{e.name}</span>
                                                        <span className="text-base font-bold text-emerald-400">{e.score}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* Individual Project Status */}
                                        <GlassCard className="p-5">
                                            <h3 className="text-base font-semibold text-white mb-4">Project Portfolio</h3>
                                            <div className="space-y-4">
                                                {analytics.studentSpecific[selectedStudentId].projects.map((p, i) => (
                                                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="text-sm font-medium text-white">{p.name}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] ${p.status === 'Graded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                                                                {p.status}
                                                            </span>
                                                        </div>
                                                        {p.score !== null && (
                                                            <div className="text-xs text-white/50">Score: <span className="text-white font-semibold">{p.score}%</span></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    </>
                                ) : (
                                    <div className="col-span-3 py-20 text-center text-white/30 bg-white/5 rounded-2xl border border-white/10">
                                        No detailed data available for this student.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Official Exam Assets</h2>
                                <p className="text-white/40 text-sm">Securely transmitted question papers and answer sheets from SkillDad Admin.</p>
                            </div>
                        </div>

                        {receivedDocuments.filter(d => ['exam_paper', 'answer_sheet'].includes(d.type)).length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {receivedDocuments
                                    .filter(d => ['exam_paper', 'answer_sheet'].includes(d.type))
                                    .map((doc) => (
                                        <GlassCard key={doc._id} className="group hover:border-indigo-500/40 transition-all p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <FileText size={24} />
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${doc.type === 'exam_paper' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {doc.type.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors uppercase tracking-tight text-sm">
                                                {doc.title}
                                            </h4>
                                            <p className="text-xs text-white/40 mb-4 line-clamp-1">{doc.fileName}</p>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="text-[10px] text-white/30">
                                                    <p>Received: {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                    <p>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • {doc.format}</p>
                                                </div>
                                                <a
                                                    href={`/${doc.fileUrl}`}
                                                    download={doc.fileName}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-white/5 hover:bg-indigo-500 text-white rounded-lg transition-all"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        </GlassCard>
                                    ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10">
                                <ShieldCheck size={48} className="mx-auto text-white/10 mb-4" />
                                <h3 className="text-white/60 font-medium">No secure assets found</h3>
                                <p className="text-white/30 text-sm mt-1">Official exam materials will appear here once sent by Admin.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Student Modal */}
            {
                showStudentModal && (
                    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-20 overflow-y-auto">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowStudentModal(false)} />
                        <GlassCard className="relative w-full max-w-lg p-6 animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    {editingStudent ? 'Edit Student Details' : 'Add New Student'}
                                </h3>
                                <button onClick={() => setShowStudentModal(false)} className="text-white/40 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudentData.name}
                                        onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                        placeholder="Enter student name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={newStudentData.email}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                            placeholder="email@university.edu"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-1.5">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newStudentData.phone}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Course Enrolled</label>
                                    <select
                                        value={newStudentData.course}
                                        onChange={(e) => handleCourseChange(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="" className="bg-[#0B0F1A] text-white">Select Course</option>
                                        {courses.length > 0 ? (
                                            courses.map(course => (
                                                <option key={course._id || course} value={course.title || course} className="bg-[#0B0F1A] text-white">
                                                    {course.title || course}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled className="bg-[#0B0F1A] text-white/50">No courses assigned to your institution</option>
                                        )}
                                    </select>
                                    {courses.length === 0 && (
                                        <p className="text-[10px] text-amber-400/70 mt-1 ml-1">
                                            ⚠️ Contact SkillDad Admin to assign courses to your institution.
                                        </p>
                                    )}
                                </div>
                                {availableBatches.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-1.5">Assigned Batch</label>
                                        <select
                                            value={newStudentData.batch_id}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, batch_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none"
                                        >
                                            <option value="" className="bg-[#0B0F1A] text-white">No Batch (Global)</option>
                                            {availableBatches.map(batch => (
                                                <option key={batch.id} value={batch.id} className="bg-[#0B0F1A] text-white">
                                                    {batch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Enrollment Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newStudentData.enrollmentDate}
                                        onChange={(e) => setNewStudentData({ ...newStudentData, enrollmentDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <ModernButton type="submit" className="flex-1 justify-center">
                                        {editingStudent ? 'Update Details' : 'Add Student'}
                                    </ModernButton>
                                    <ModernButton variant="secondary" type="button" onClick={() => setShowStudentModal(false)} className="flex-1 justify-center">
                                        Cancel
                                    </ModernButton>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                )
            }

            {/* Create Course Modal */}
            {showCreateCourseModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateCourseModal(false)}
                    onSave={handleCreateCourse}
                />
            )}

            {/* Student Details View Modal */}
            <AnimatePresence>
                {selectedStudentForView && (
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedStudentForView(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                            {/* Modal Header */}
                            <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-600/30 border border-primary/40 flex items-center justify-center text-xl font-black text-white shadow-lg overflow-hidden shrink-0">
                                        {selectedStudentForView.avatar ? (
                                            <img src={selectedStudentForView.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            selectedStudentForView.name?.charAt(0) || 'S'
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-xl font-bold text-white truncate">{selectedStudentForView.name}</h3>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                                Enrolled Student
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40 mt-1 font-mono truncate">ID: {selectedStudentForView._id || selectedStudentForView.id || 'N/A'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStudentForView(null)}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all shrink-0"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-4">
                                {/* Enrolled Course */}
                                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Enrolled Course(s)</p>
                                    <p className="text-sm font-bold text-white">
                                        {Array.isArray(selectedStudentForView.courses) && selectedStudentForView.courses.length > 0
                                            ? selectedStudentForView.courses.join(', ')
                                            : selectedStudentForView.course || 'General Student'}
                                    </p>
                                </div>

                                {/* Contact Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                                            <Mail size={11} className="text-primary" /> Email Address
                                        </p>
                                        <p className="text-xs font-semibold text-white truncate">{selectedStudentForView.email || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                                            <Phone size={11} className="text-primary" /> Phone Number
                                        </p>
                                        <p className="text-xs font-semibold text-white">{selectedStudentForView.phone || selectedStudentForView.profile?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-white/70">Course Learning Progress</span>
                                        <span className="text-sm font-black text-primary">{selectedStudentForView.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${selectedStudentForView.progress || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Documents List */}
                                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">Documents</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedStudentForView.documents && selectedStudentForView.documents.length > 0) ? (
                                            selectedStudentForView.documents.map((doc, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-white/10 text-xs font-semibold text-white/80 rounded-lg border border-white/10">
                                                    {typeof doc === 'string' ? doc : doc.title || 'Document'}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-white/30 italic">No documents uploaded yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Joined Date & Verification */}
                                <div className="flex items-center justify-between text-xs text-white/40 px-1 pt-1">
                                    <span>Joined: <strong className="text-white/70">{formatJoinedDate(selectedStudentForView)}</strong></span>
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Active Student
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                                <ModernButton
                                    variant="primary"
                                    onClick={() => setSelectedStudentForView(null)}
                                    className="w-full justify-center text-sm font-bold py-2.5"
                                >
                                    Close Details
                                </ModernButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

// Create Course Modal Component
const CreateCourseModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        level: 'Beginner',
        thumbnail: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('thumbnail', file);
        setUploading(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            
            // Note: Since we don't have a course ID yet, we can't use the standard upload endpoint
            // unless the backend supports temporary uploads or generic uploads.
            // For now, I'll recommend the user to save first or use a URL.
            // OR I can check if the backend has a generic upload endpoint.
            // Given the current implementation, I'll stick to URL or alert that upload is available after creation.
            
            alert("File upload is available after the course is created. For now, please provide a direct image URL or leave it blank to add later.");
            setUploading(false);
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            alert('Failed to upload thumbnail');
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, price: Number(formData.price) });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <GlassCard className="w-full max-w-2xl max-h-[85vh] p-6 relative animate-in zoom-in duration-300 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">Create New Course</h3>
                        <p className="text-white/40 text-xs mt-1">Submit your course proposal for review.</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto pr-1 space-y-4">
                    {/* Thumbnail Preview */}
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-4">
                        <div className="w-40 h-24 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group">
                            {formData.thumbnail ? (
                                <img src={getMediaUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <ImageIcon size={28} className="text-white/10" />
                            )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em]">Course Thumbnail URL</label>
                            <input
                                type="text"
                                placeholder="https://images.unsplash.com/your-image.jpg"
                                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-all"
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                            />
                            <p className="text-[10px] text-white/30 italic">Tip: You can upload local files after the course is created.</p>
                        </div>
                    </div>

                    <form id="university-create-course-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-white/80 text-sm font-medium mb-1.5">Course Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="e.g., Master UX/UI Design Fundamentals"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-white/80 text-sm font-medium mb-1.5">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all resize-none"
                                    rows="2"
                                    placeholder="What will students learn in this course?"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-1.5">Category *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="e.g., Design, Programming"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-1.5">Level *</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full px-4 py-[11px] bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all appearance-none"
                                >
                                    <option value="Beginner" className="bg-black">Beginner</option>
                                    <option value="Intermediate" className="bg-black">Intermediate</option>
                                    <option value="Advanced" className="bg-black">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-1.5">Price (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="e.g., 4999"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <ModernButton type="submit" className="flex-1 justify-center py-3 text-base font-bold">
                                Submit Course for Approval
                            </ModernButton>
                            <ModernButton type="button" variant="secondary" onClick={onClose} className="px-8">
                                Cancel
                            </ModernButton>
                        </div>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
};

export default UniversityDashboard;
