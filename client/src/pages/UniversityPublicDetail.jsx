import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    MapPin,
    Users,
    BookOpen,
    Star,
    Award,
    Youtube,
    Image as ImageIcon,
    Info,
    Mail,
    Phone,
    Globe,
    Rocket
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import CourseCard from '../components/CourseCard';
import ModernButton from '../components/ui/ModernButton';
import GlassCard from '../components/ui/GlassCard';

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
    const [university, setUniversity] = useState(location.state?.university || null);
    const [loadingProfile, setLoadingProfile] = useState(!location.state?.university);

    const universityName = decodeURIComponent(name);

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const { data } = await axios.get(`/api/public/universities/profile/${encodeURIComponent(universityName)}`);
                setUniversity(data);
            } catch (error) {
                console.error("Error fetching university profile:", error);
                if (!university) {
                    const fallback = fallbackUniversities.find(u => u.name === universityName);
                    if (fallback) setUniversity(fallback);
                }
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchCourses = async () => {
            try {
                const { data } = await axios.get(`/api/public/universities/${encodeURIComponent(universityName)}/courses`);
                setCourses(data || []);
            } catch (error) {
                console.error("Error fetching university courses:", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchProfile();
        fetchCourses();
    }, [universityName]);

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-[#05030B] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!university) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] text-white flex flex-col pt-24 items-center">
                <Navbar />
                <div className="text-center mt-20">
                    <h1 className="text-3xl font-black mb-4">University Not Found</h1>
                    <p className="text-white/40 mb-8 font-inter">We couldn't find the institution you're looking for.</p>
                    <ModernButton onClick={() => navigate('/platform')}>Explore Universities</ModernButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05030B] selection:bg-primary/30 selection:text-white">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 2 }}
                        src={university.profile?.coverImage || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=2000'}
                        alt="University Cover"
                        className="w-full h-full object-cover grayscale-[20%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05030B]/40 via-[#05030B]/80 to-[#05030B]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05030B] via-transparent to-[#05030B]/20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-32">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-8"
                            >
                                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary-accent text-[12px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl">
                                    <Award size={18} className="text-primary-accent" />
                                    <span>Global Academic Partner</span>
                                </div>
                                
                                <h1 className="text-6xl md:text-[100px] font-black text-white font-jakarta tracking-tighter leading-[0.85] py-2">
                                    {university.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-10 pt-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 group-hover:text-primary transition-colors">Global Campus</p>
                                        <div className="flex items-center gap-3 text-white font-bold text-lg">
                                            <MapPin size={20} className="text-primary" /> 
                                            {university.profile?.location || university.location || 'Excellence Hub'}
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                                    <div className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 group-hover:text-amber-400 transition-colors">Global Accreditation</p>
                                        <div className="flex items-center gap-3 text-white font-bold text-lg">
                                            <Star size={20} className="text-amber-400" /> Top {Math.floor(Math.random() * 50) + 1} Elite
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                                    <div className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 group-hover:text-emerald-400 transition-colors">Total Scholars</p>
                                        <div className="flex items-center gap-3 text-white font-bold text-lg">
                                            <Users size={20} className="text-emerald-400" /> {university.students || '25k+ Users'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-4 hidden lg:block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                                className="relative group p-4 bg-white/5 border border-white/10 rounded-[64px] backdrop-blur-xl"
                            >
                                <div className="aspect-square rounded-[48px] overflow-hidden border border-white/20">
                                    <img
                                        src={university.profileImage || university.profile?.profileImage || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=400'}
                                        alt={university.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#05030B]/60 to-transparent"></div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Intelligence Matrix */}
            <section className="relative -mt-20 z-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Specialized Courses', val: courses.length || university.courseCount || '45+', icon: BookOpen, color: 'text-primary' },
                        { label: 'Quality Rating', val: 'A++ Triple Crown', icon: Award, color: 'text-amber-400' },
                        { label: 'Career Success', val: '98% Placement', icon: Rocket, color: 'text-emerald-400' },
                        { label: 'Global Network', val: '120+ Alliances', icon: Globe, color: 'text-blue-400' }
                    ].map((stat, i) => (
                        <div key={i} className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <GlassCard className="relative !p-8 flex flex-col justify-between h-full border-white/5 hover:border-primary/20 transition-all">
                                <stat.icon className={`${stat.color} mb-6`} size={32} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
                                    <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">{stat.val}</p>
                                </div>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-32 space-y-32">
                
                {/* Institutional Identity */}
                <div className="grid lg:grid-cols-12 gap-20 items-start">
                    <div className="lg:col-span-8 space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-white/10"></div>
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Institutional Overview</span>
                                <div className="h-px flex-1 bg-white/10"></div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white font-jakarta tracking-tight">
                                Pioneering Knowledge & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 italic font-medium">Innovation</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed font-inter font-medium">
                                {university.bio || university.profile?.bio || university.description || "As a premier global knowledge hub, our institution is dedicated to fostering an environment of intellectual rigor, creative innovation, and cross-cultural leadership."}
                            </p>
                        </section>

                        {/* Achievements Grid */}
                        <section className="space-y-12">
                            <h3 className="text-2xl font-black text-white font-jakarta uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-2 h-8 bg-primary rounded-full"></div>
                                National & Global Milestones
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {(university.profile?.achievements || [
                                    { title: "Academic Excellence 2024", desc: "Ranked #1 for regional innovation and research quality." },
                                    { title: "Industry Integration Leader", desc: "Strategic partnerships with 100+ Fortune 500 companies." }
                                ]).map((ach, i) => (
                                    <div key={i} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                            <Award size={28} />
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-3 tracking-tight">{ach.title || ach}</h4>
                                        <p className="text-white/40 leading-relaxed text-sm font-medium">{ach.desc || "Outstanding contribution to the higher education ecosystem and research excellence."}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="lg:col-span-4 space-y-8">
                        <section className="p-10 rounded-[48px] bg-white/[0.03] border border-white/5 space-y-10 sticky top-32">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white font-jakarta">Connect</h3>
                                <p className="text-xs text-white/30 uppercase tracking-widest font-black">Institutional Directory</p>
                            </div>

                            <div className="space-y-6">
                                <a href={university.profile?.website || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/40 transition-all group/link">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/link:scale-110 transition-transform">
                                        <Globe size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Official Portal</p>
                                        <p className="text-white font-bold text-sm truncate">{university.profile?.website?.replace(/https?:\/\//, '') || 'portal.edu'}</p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-5 p-5 bg-black/40 border border-white/5 rounded-3xl group/link">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover/link:scale-110 transition-transform">
                                        <Mail size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Inquiries</p>
                                        <p className="text-white font-bold text-sm truncate">{university.email || 'info@university.edu'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 p-5 bg-black/40 border border-white/5 rounded-3xl group/link">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/link:scale-110 transition-transform">
                                        <Phone size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Tele-Support</p>
                                        <p className="text-white font-bold text-sm truncate">{university.profile?.phone || 'Helpline Available'}</p>
                                    </div>
                                </div>
                            </div>

                            <ModernButton 
                                variant="primary" 
                                className="w-full justify-center !py-6 shadow-glow-purple/20 group/btn"
                                onClick={() => {
                                    const section = document.getElementById('programs-section');
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Enroll in Curriculums <Rocket size={20} className="ml-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </ModernButton>
                            <p className="text-[9px] text-center font-black uppercase tracking-[0.2em] text-white/20 mt-4">University verification code: {university.profile?.uvc || university.id?.slice(-8).toUpperCase()}</p>
                        </section>
                    </aside>
                </div>

                {/* Media Spotlights */}
                <div className="grid lg:grid-cols-2 gap-10">
                    {university.profile?.youtubeUrl && (
                        <section className="space-y-10">
                            <h3 className="text-2xl font-black text-white font-jakarta uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                                Direct Experience
                            </h3>
                            <div className="relative aspect-video rounded-[48px] overflow-hidden border border-white/10 bg-black group shadow-3xl">
                                <iframe
                                    className="w-full h-full grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(university.profile.youtubeUrl)}?autoplay=0&controls=1`}
                                    title="Experience Spotlight"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </section>
                    ) || <div className="lg:col-span-1 p-12 bg-white/[0.02] border border-white/5 rounded-[48px] flex items-center justify-center text-white/20 italic">No Media Spotlight Available</div>}

                    {/* Elite Accreditations Section */}
                    <section className="space-y-10">
                        <h3 className="text-2xl font-black text-white font-jakarta uppercase tracking-tighter flex items-center gap-4">
                            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                            Institutional Accreditations
                        </h3>
                        <div className="grid grid-cols-2 gap-6 h-full content-start">
                            {(university.profile?.certificates || [
                                { title: "ISO 9001:2015 Certified", issuer: "Quality Board" },
                                { title: "Global Innovation Shield", issuer: "World Tech Forum" }
                            ]).slice(0, 4).map((cert, i) => (
                                <div key={i} className="p-8 pb-10 rounded-[40px] bg-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/40 transition-all group flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:rotate-12 transition-transform">
                                        <Award size={28} />
                                    </div>
                                    <h4 className="text-md font-black text-white mb-2 leading-tight uppercase tracking-tight">{cert.title || cert}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">{cert.issuer || 'Official SkillDad Verification'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Campus Gallery */}
                {university.profile?.gallery && university.profile.gallery.length > 0 && (
                    <section className="space-y-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                            <div className="space-y-4">
                                <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Campus Atmosphere</p>
                                <h2 className="text-4xl font-black text-white font-jakarta">Explore Academic <span className="text-primary italic">Life</span></h2>
                            </div>
                            <ModernButton variant="secondary" className="!px-10">View Virtual Tour</ModernButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {university.profile.gallery.slice(0, 4).map((img, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className={`relative rounded-[40px] overflow-hidden border border-white/5 shadow-2xl group cursor-pointer ${
                                        i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
                                    }`}
                                >
                                    <img src={img} alt={`Campus Spot ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                        <ImageIcon className="text-white" size={32} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Programs Showcase - THE CORE REQUEST */}
                <section id="programs-section" className="space-y-12 pt-10">
                    <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
                        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Curriculum Catalog</p>
                        <h2 className="text-5xl font-black text-white font-jakarta">Programs Provided by <span className="text-primary italic"> {university.name.split(' ')[0]}</span></h2>
                        <p className="text-white/40 font-medium">Explore professional certifications and academic curricula directly accredited by this institution.</p>
                    </div>

                    {loadingCourses ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-[400px] w-full bg-white/5 rounded-[48px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <CourseCard key={course.id || course._id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[48px] space-y-4">
                            <BookOpen size={48} className="text-white/10 mx-auto" />
                            <p className="text-white/30 font-black uppercase tracking-widest">No Active Enrollment Programs Shared Publicly</p>
                            <ModernButton variant="secondary" onClick={() => navigate('/courses')}>Explore Global Catalog</ModernButton>
                        </div>
                    )}
                </section>

                {/* Academic Leadership */}
                {university.profile?.personnel && university.profile.personnel.length > 0 && (
                    <section className="space-y-12">
                         <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                            <Users size={16} /> Academic Leadership
                        </div>
                        <h2 className="text-4xl font-black text-white font-jakarta mb-16">Distinguished <span className="text-primary italic">Directory</span></h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            {university.profile.personnel.map((person, i) => (
                                <div key={i} className="group text-center space-y-6">
                                    <div className="relative mx-auto w-48 h-48">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-purple-600 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition duration-500"></div>
                                        <div className="relative w-48 h-48 rounded-[40px] overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
                                            <img
                                                src={person.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=101010&color=fff&bold=true`}
                                                alt={person.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white tracking-tight">{person.name}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{person.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            <Footer />
        </div>
    );
};

export default UniversityPublicDetail;
