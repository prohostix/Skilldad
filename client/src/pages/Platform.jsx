import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    GraduationCap,
    Users,
    BookOpen,
    MapPin,
    Calendar,
    TrendingUp,
    Globe,
    Star
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import { getMediaUrl } from '../utils/media';

const Platform = () => {
    const navigate = useNavigate();
    const [dynamicUnis, setDynamicUnis] = React.useState([]);
    const [dynamicSkillDadUnis, setDynamicSkillDadUnis] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUnis = async () => {
            try {
                const [unisRes, skillDadUnisRes] = await Promise.all([
                    axios.get('/api/public/universities'),
                    axios.get('/api/public/skilldad-universities')
                ]);
                setDynamicUnis(unisRes.data);
                setDynamicSkillDadUnis(skillDadUnisRes.data);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnis();
    }, []);

    const fallbackImg = `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800`;

    const universities = dynamicUnis.map(u => {
        // Build best-available image: profile.coverImage > Unsplash fallback (DO NOT fallback to logo)
        const coverImg = u.profile?.coverImage;
        const resolvedImage = coverImg
                ? getMediaUrl(coverImg)
                : fallbackImg;

        return {
            id: u._id,
            name: u.name,
            location: u.profile?.location || 'Global',
            students: u.studentCount > 0 ? `${u.studentCount}+` : '100+',
            programs: u.courseCount > 0 ? `${u.courseCount}+` : '10+',
            established: u.profile?.foundedYear || u.profile?.established || '2020',
            rating: 4.8,
            image: resolvedImage,
            fallbackImage: fallbackImg,
            specialties: u.profile?.specialties || ["Neural Learning", "Strategic Matrix", "Global Sync"],
            description: u.bio || "Leading institutional partner synchronizing with the SkillDad high-fidelity learning matrix."
        };
    });

    // SkillDad-owned universities are display-only (no login/dashboard) — always shown after partner universities
    const skillDadUniversities = dynamicSkillDadUnis.map(u => ({
        id: `sd-${u.id}`,
        name: u.name,
        location: u.location || 'Global',
        students: '100+',
        programs: '10+',
        established: '2020',
        rating: 4.8,
        image: u.cover_image ? getMediaUrl(u.cover_image) : (u.profile_image ? getMediaUrl(u.profile_image) : fallbackImg),
        fallbackImage: fallbackImg,
        specialties: ["Neural Learning", "Strategic Matrix", "Global Sync"],
        description: u.description || "Leading institutional partner synchronizing with the SkillDad high-fidelity learning matrix."
    }));

    const allUniversities = [...universities, ...skillDadUniversities];

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
                            <span className="opacity-40">University</span>{' '}
                            <span className="premium-gradient-text">
                                Platform
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto font-inter px-4">
                            Connect with world-class institutions and access premium educational content from leading universities globally.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                        {allUniversities.map((university, index) => (
                            <motion.div
                                key={university.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group cursor-pointer"
                                onClick={() => {
                                    // SkillDad Universities have no login account — admins manage
                                    // their logo/cover/gallery from the admin edit page instead.
                                    if (String(university.id).startsWith('sd-')) {
                                        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
                                        if (userInfo?.role === 'admin') {
                                            navigate(`/admin/skilldad-universities/${String(university.id).replace('sd-', '')}`);
                                            return;
                                        }
                                    }
                                    navigate(`/university-profile/${encodeURIComponent(university.name)}`, { state: { university } });
                                }}
                            >
                                <GlassCard className="overflow-hidden h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 !p-0">
                                    {/* University Image */}
                                    <div className="relative h-40 md:h-48 overflow-hidden">
                                        <img
                                            src={university.image}
                                            alt={university.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = university.fallbackImage || `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800`;
                                            }}
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
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Platform;
