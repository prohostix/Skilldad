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

    // SkillDad-owned universities are display-only (no login/dashboard) - always shown after partner universities
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
        <div className="min-h-screen platform-page bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A]">
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
                            <span className="premium-gradient-text">
                                University Partners
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

                                    </div>

                                    {/* University Details */}
                                    <div className="p-4 md:p-5">
                                        <h3 className="text-base md:text-lg font-bold text-white mb-1.5 font-space">
                                            {university.name}
                                        </h3>

                                        <div className="flex items-center text-gray-400 mb-2.5">
                                            <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                                            <span className="text-xs">{university.location}</span>
                                        </div>

                                        <p className="text-gray-300 text-xs mb-3.5 line-clamp-2 leading-relaxed">
                                            {university.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex items-center text-gray-400 mb-2">
                                            <BookOpen size={12} className="text-emerald-400 mr-1.5 flex-shrink-0" />
                                            <span className="text-xs">
                                                <strong className="text-white">{university.programs}</strong> Programs Available
                                            </span>
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
