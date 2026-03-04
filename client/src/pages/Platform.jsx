import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    GraduationCap,
    Users,
    BookOpen,
    Award,
    MapPin,
    Calendar,
    TrendingUp,
    Globe,
    Star,
    Building
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';

const Platform = () => {
    const navigate = useNavigate();
    const [dynamicUnis, setDynamicUnis] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUnis = async () => {
            try {
                const { data } = await axios.get('/api/public/universities');
                setDynamicUnis(data);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnis();
    }, []);

    const staticUniversities = [
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

    const universities = dynamicUnis.length > 0
        ? dynamicUnis.map(u => ({
            id: u._id,
            name: u.name,
            location: u.profile?.location || 'Global',
            students: u.studentCount > 0 ? `${u.studentCount}+` : '100+',
            programs: u.courseCount > 0 ? `${u.courseCount}+` : '10+',
            established: u.profile?.established || '2020',
            rating: 4.8,
            image: u.profileImage || `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800`,
            specialties: ["Neural Learning", "Strategic Matrix", "Global Sync"],
            description: u.bio || "Leading institutional partner synchronizing with the SkillDad high-fidelity learning matrix."
        }))
        : staticUniversities;

    const platformStats = [
        { label: "Partner Universities", value: "150+", icon: Building, color: "purple" },
        { label: "Active Students", value: "2.5M+", icon: Users, color: "purple" },
        { label: "Course Programs", value: "5,000+", icon: BookOpen, color: "purple" },
        { label: "Certificates Issued", value: "850K+", icon: Award, color: "purple" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A]">
            <Navbar />

            {/* Main Content Section */}
            <section className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-10 md:mb-16"
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 font-space">
                            <span className="text-gray-400">University</span>{' '}
                            <span className="text-white">
                                Platform
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto font-inter px-4">
                            Connect with world-class institutions and access premium educational content from leading universities globally.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                        {universities.map((university, index) => (
                            <motion.div
                                key={university.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group cursor-pointer"
                                onClick={() => navigate(`/university-profile/${encodeURIComponent(university.name)}`, { state: { university } })}
                            >
                                <GlassCard className="overflow-hidden h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 !p-0">
                                    {/* University Image */}
                                    <div className="relative h-40 md:h-48 overflow-hidden">
                                        <img
                                            src={university.image}
                                            alt={university.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 md:px-3 py-1">
                                            <Star className="text-yellow-400" size={12} />
                                            <span className="text-white text-xs md:text-sm font-bold">{university.rating}</span>
                                        </div>
                                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-white">
                                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-primary/80 rounded-md">
                                                Est. {university.established}
                                            </span>
                                        </div>
                                    </div>

                                    {/* University Details */}
                                    <div className="p-5">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-space">
                                            {university.name}
                                        </h3>

                                        <div className="flex items-center text-gray-400 mb-3">
                                            <MapPin size={14} className="mr-2 flex-shrink-0" />
                                            <span className="text-sm">{university.location}</span>
                                        </div>

                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                            {university.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center mb-1">
                                                    <Users size={16} className="text-primary mr-1" />
                                                </div>
                                                <p className="text-white font-bold text-sm">{university.students}</p>
                                                <p className="text-gray-400 text-xs">Students</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center mb-1">
                                                    <BookOpen size={16} className="text-emerald-400 mr-1" />
                                                </div>
                                                <p className="text-white font-bold text-sm">{university.programs}</p>
                                                <p className="text-gray-400 text-xs">Programs</p>
                                            </div>
                                        </div>

                                        {/* Specialties */}
                                        <div className="flex flex-wrap gap-2">
                                            {university.specialties.slice(0, 3).map((specialty, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                            {university.specialties.length > 3 && (
                                                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                                    +{university.specialties.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Platform Stats - Moved to bottom */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {platformStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="text-center p-4 md:p-6 border-white/5 hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <stat.icon className="text-purple-500" size={20} />
                                    </div>
                                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 font-space">{stat.value}</h3>
                                    <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">{stat.label}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Platform;
