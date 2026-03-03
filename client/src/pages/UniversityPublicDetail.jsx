import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    MapPin,
    Users,
    BookOpen,
    Star,
    ArrowLeft,
    Globe,
    Calendar,
    Award
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import CourseCard from '../components/CourseCard';
import ModernButton from '../components/ui/ModernButton';

// Fallback data in case page is refreshed and state is lost
const fallbackUniversities = [
    {
        id: 1,
        name: "Harvard University",
        location: "Cambridge, MA",
        students: "23,000+",
        programs: "350+",
        established: "1636",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
        specialties: ["Business", "Medicine", "Law", "Engineering"],
        description: "World-renowned institution leading in research and innovation across multiple disciplines."
    },
    {
        id: 2,
        name: "Stanford University",
        location: "Stanford, CA",
        students: "17,000+",
        programs: "200+",
        established: "1885",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=800",
        specialties: ["Technology", "Business", "Medicine", "Engineering"],
        description: "Leading innovation hub in Silicon Valley, pioneering technology and entrepreneurship."
    },
    {
        id: 3,
        name: "MIT",
        location: "Cambridge, MA",
        students: "11,000+",
        programs: "180+",
        established: "1861",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800",
        specialties: ["Engineering", "Computer Science", "Physics", "Mathematics"],
        description: "World's premier technological institute, advancing science and engineering frontiers."
    },
    {
        id: 4,
        name: "Oxford University",
        location: "Oxford, UK",
        students: "24,000+",
        programs: "400+",
        established: "1096",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800",
        specialties: ["Liberal Arts", "Medicine", "Law", "Philosophy"],
        description: "Historic institution with nearly a millennium of academic excellence and tradition."
    },
    {
        id: 5,
        name: "University of Tokyo",
        location: "Tokyo, Japan",
        students: "28,000+",
        programs: "300+",
        established: "1877",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800",
        specialties: ["Engineering", "Science", "Medicine", "Economics"],
        description: "Japan's leading university, driving innovation in Asia and fostering global collaboration."
    },
    {
        id: 6,
        name: "ETH Zurich",
        location: "Zurich, Switzerland",
        students: "22,000+",
        programs: "160+",
        established: "1855",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800",
        specialties: ["Engineering", "Technology", "Natural Sciences", "Mathematics"],
        description: "Europe's premier science and technology university, known for cutting-edge research."
    }
];


const UniversityPublicDetail = () => {
    const { name } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const universityName = decodeURIComponent(name);

    // Get university details from location state or fallback
    const university = location.state?.university || fallbackUniversities.find(u => u.name === universityName);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch all public courses
                const { data } = await axios.get('/api/courses');
                if (data && Array.isArray(data)) {
                    // Filter courses that map to this university
                    // Based on our catalog logic, a course's university can be in course.universityName, 
                    // course.instructor.profile.universityName, or instructor name
                    const uniCourses = data.filter(course => {
                        const cUniv = course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad';
                        return cUniv === universityName;
                    });
                    setCourses(uniCourses);
                }
            } catch (error) {
                console.error("Error fetching university courses:", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [universityName]);

    if (!university) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] text-white flex flex-col pt-24 items-center">
                <Navbar />
                <h1 className="text-3xl font-black mt-20">University Not Found</h1>
                <ModernButton className="mt-8" onClick={() => navigate('/platform')}>Go Back</ModernButton>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A]">
            <Navbar />

            {/* Header Section */}
            <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={university.image} alt={university.name} className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080512] via-[#080512]/80 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <button
                        onClick={() => navigate('/platform')}
                        className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 mb-8"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Back to Universities</span>
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full md:w-1/3 aspect-video md:aspect-square max-w-sm rounded-[30px] overflow-hidden border-2 border-white/10 shadow-2xl shadow-primary/20 relative"
                        >
                            <img src={university.image} alt={university.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 flex items-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <Star className="text-yellow-400 mr-2" fill="currentColor" size={14} />
                                <span className="text-white font-bold text-sm">{university.rating}</span>
                            </div>
                        </motion.div>

                        <div className="flex-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-space mb-4 leading-tight">
                                    {university.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white/70 font-inter">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-primary" />
                                        <span>{university.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award size={18} className="text-primary" />
                                        <span>Est. {university.established}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-white/60 font-inter leading-relaxed max-w-3xl"
                            >
                                {university.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4"
                            >
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                    <Users size={24} className="text-primary mx-auto mb-2" />
                                    <h3 className="text-xl font-bold text-white mb-1">{university.students}</h3>
                                    <p className="text-xs text-white/40 uppercase tracking-widest font-black">Students</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                    <BookOpen size={24} className="text-emerald-400 mx-auto mb-2" />
                                    <h3 className="text-xl font-bold text-white mb-1">{university.programs}</h3>
                                    <p className="text-xs text-white/40 uppercase tracking-widest font-black">Programs</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="pt-4"
                            >
                                <h4 className="text-sm text-white/40 font-black uppercase tracking-widest mb-3">Specialties</h4>
                                <div className="flex flex-wrap gap-2">
                                    {university.specialties.map(spec => (
                                        <span key={spec} className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-xl">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-white font-space">
                        Courses <span className="text-primary">Offered</span>
                    </h2>
                    <ModernButton onClick={() => navigate('/courses')} variant="secondary" className="!px-6 !py-2.5 text-xs">
                        View All Platform Courses
                    </ModernButton>
                </div>

                {loadingCourses ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Loading Courses...</p>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10">
                        <BookOpen size={48} className="text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Courses Available</h3>
                        <p className="text-white/50">This university has not published any live courses yet.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default UniversityPublicDetail;
