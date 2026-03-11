import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    Layers,
    Sparkles,
    SearchX,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import CourseCard from '../components/CourseCard';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const CourseCatalog = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedUniversity, setSelectedUniversity] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [universityName, setUniversityName] = useState('');

    useEffect(() => {
        // Server health check (same-origin)
        axios.get('/health').catch(() => { });

        const fetchCourses = async () => {
            try {
                // Check if logged-in user is a university — if so, show only their courses
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
                let url = '/api/courses';

                if (userInfo && userInfo.role === 'university' && userInfo._id) {
                    // Filter courses by this university's instructor ID
                    url = `/api/courses?university=${userInfo._id}`;
                    setUniversityName(userInfo.profile?.universityName || userInfo.name || 'Your University');
                }

                const { data } = await axios.get(url);
                if (data && Array.isArray(data) && data.length > 0) {
                    setCourses(data);
                } else {
                    setCourses([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setCourses([]);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const searchText = filter.toLowerCase();

            const matchesSearch =
                course.title?.toLowerCase().includes(searchText) ||
                course.category?.toLowerCase().includes(searchText) ||
                (course.instructorName || course.instructor?.name || '').toLowerCase().includes(searchText) ||
                (course.universityName || course.instructor?.profile?.universityName || '').toLowerCase().includes(searchText);

            const courseUniversity = course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad';
            const matchesUniversity = selectedUniversity === 'All' || courseUniversity === selectedUniversity;

            return matchesSearch && matchesUniversity && (category === 'All' || course.category === category);
        });
    }, [courses, filter, category, selectedUniversity]);

    const categories = useMemo(() => ['All', ...new Set(courses.map(c => c.category))], [courses]);

    // Check if the user is already filtering uniquely by backend so we hide the filter
    const isFixedUniversity = !!universityName;

    const universities = useMemo(() => {
        if (isFixedUniversity) return []; // No need to show filter if pinned
        const allUnis = courses.map(course => course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || 'SkillDad');
        return ['All', ...new Set(allUnis.filter(Boolean))];
    }, [courses, isFixedUniversity]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] relative overflow-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none gpu-accelerated" />
            <div className="absolute top-1/2 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary-dark/2 blur-[150px] rounded-full pointer-events-none gpu-accelerated" />

            {/* Main Content Sections */}
            <main className="pt-16 md:pt-20 pb-20 px-4 md:px-6 lg:px-12 relative z-10">
                {/* Hero Header */}
                <div className="max-w-[1300px] mx-auto text-center mb-6 md:mb-8 space-y-4 px-4">
                    {/* Back Button */}
                    <div className="flex justify-start mb-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-sm font-medium">Go Back</span>
                        </button>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-space tracking-[-0.04em] leading-none"
                    >
                        {universityName ? (
                            <><span className="text-gray-400">Courses by</span> <span className="text-white">{universityName}</span></>
                        ) : (
                            <><span className="text-gray-400">Expand Your</span> <span className="text-white">Horizon</span></>
                        )}
                    </motion.h1>
                    {universityName && (
                        <p className="text-white/40 text-sm mt-2">Showing all courses provided by your university</p>
                    )}
                </div>

                {/* Controls Section */}
                <div className="max-w-[1300px] mx-auto mb-6 px-4">
                    <div className="flex flex-col gap-4 items-stretch">
                        {/* Search Bar */}
                        <div className={`relative group transition-all duration-500 ${isSearchFocused ? 'scale-[1.01]' : 'scale-100'} w-full`}>
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary transition-colors">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by tech, track, or instructor..."
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white/[0.03] backdrop-blur-xl shadow-xl rounded-2xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all font-inter text-white placeholder:text-white/20 font-medium text-sm md:text-base"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>

                        {/* Category Filter and View Toggle Row */}
                        <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                            {/* Category Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar scroll-smooth flex-1 min-w-0">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-black font-inter text-[8px] md:text-[9px] uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 border ${category === cat
                                            ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                            : 'bg-white/5 text-white/50 border-white/5 hover:border-primary/30 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Actions Right */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {/* University Filter */}
                                {!isFixedUniversity && universities.length > 2 && (
                                    <div className="relative group/univ hidden md:block">
                                        <select
                                            value={selectedUniversity}
                                            onChange={(e) => setSelectedUniversity(e.target.value)}
                                            className="bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl pl-4 pr-10 py-2.5 text-white/80 focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer font-inter text-xs md:text-sm shadow-xl min-w-[140px] max-w-[200px] truncate"
                                        >
                                            <option value="All" className="bg-[#050514]">All Providers</option>
                                            {universities.filter(u => u !== 'All').map(uni => (
                                                <option key={uni} value={uni} className="bg-[#050514]">{uni}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover/univ:text-primary transition-colors">
                                            <Filter size={14} />
                                        </div>
                                    </div>
                                )}

                                {/* View Toggle */}
                                <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
                                    <button className="p-2 md:p-2 bg-primary text-white rounded-lg shadow-glow-purple"><LayoutGrid size={14} /></button>
                                    <button className="p-2 md:p-2 text-white/30 hover:text-white transition-colors"><List size={14} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile University Filter (displays on small screens if needed) */}
                        {!isFixedUniversity && universities.length > 2 && (
                            <div className="relative group/univ md:hidden mt-2">
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white/80 focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer font-inter text-sm shadow-xl"
                                >
                                    <option value="All" className="bg-[#050514]">All Providers (Universities)</option>
                                    {universities.filter(u => u !== 'All').map(uni => (
                                        <option key={uni} value={uni} className="bg-[#050514]">{uni}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover/univ:text-primary transition-colors">
                                    <Filter size={16} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Section */}
                <div className="max-w-[1300px] mx-auto px-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 md:py-40 space-y-8">
                            <div className="relative">
                                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[8px] md:text-[10px]">Syncing Knowledge Base</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center space-y-8 bg-white/[0.02] rounded-[40px] border border-white/5"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/10">
                                <SearchX size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white font-space">No matches found</h3>
                                <p className="text-text-muted font-inter max-w-sm mx-auto text-lg leading-relaxed">Try adjusting your search or filters to find what you're looking for.</p>
                            </div>
                            <ModernButton variant="secondary" onClick={() => { setFilter(''); setCategory('All'); }} className="!px-10 !py-5 uppercase tracking-widest font-black text-xs">
                                Reset Filters
                            </ModernButton>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 gpu-accelerated">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Enquiry & FAQ Section */}
                <div className="max-w-[1400px] mx-auto mt-40 grid lg:grid-cols-2 gap-24">
                    <div className="space-y-16">
                        <div className="text-left space-y-6">
                            <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent mb-8"></div>
                            <h2 className="text-5xl font-black text-white font-space leading-tight">Course Intelligence</h2>
                            <p className="text-text-muted text-xl leading-relaxed font-inter max-w-xl">
                                Have questions about our certification protocols or curriculum architecture? Our expert advisors are ready to sync with your learning goals.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/5 hover:border-primary/40 transition-all duration-500 group shadow-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(110,40,255,0.4)] transition-all">
                                    <Sparkles size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-space">Academic Sync</h3>
                                <p className="text-sm text-text-muted leading-relaxed font-inter">Direct connection with our curriculum design team for custom track enquiries.</p>
                            </div>
                            <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/5 hover:border-primary/40 transition-all duration-500 group shadow-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(109,40,255,0.4)] transition-all">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-space">Institutional Core</h3>
                                <p className="text-sm text-text-muted leading-relaxed font-inter">Enterprise-grade solutions for universities and corporate learning clusters.</p>
                            </div>
                        </div>
                    </div>

                    <GlassCard className="!p-6 md:!p-8 border-white/10 shadow-glow-purple relative overflow-hidden group">
                        {/* Interior Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/15 transition-colors" />

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white font-inter uppercase tracking-widest">Initialise Enquiry</h3>
                                <p className="text-text-muted text-sm font-inter">Average response time: &lt; 24 hours</p>
                            </div>

                            <form className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Identity Name</label>
                                        <input type="text" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Auth Email</label>
                                        <input type="email" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="email@nexus.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Selection Matrix</label>
                                    <div className="relative group/select">
                                        <select className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-3.5 text-white/80 focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer font-inter text-sm">
                                            <option className="bg-[#050514]">General Course Enquiry</option>
                                            <option className="bg-[#050514]">Technical Support</option>
                                            <option className="bg-[#050514]">Corporate Training</option>
                                            <option className="bg-[#050514]">University Integration</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover/select:text-primary transition-colors">
                                            <Layers size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Message Detail</label>
                                    <textarea rows="3" className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-white/10 font-inter text-sm" placeholder="Structure your requirements here..."></textarea>
                                </div>
                                <ModernButton className="w-full !py-4 shadow-glow-gradient font-black uppercase tracking-[0.3em] text-[10px]">Transmit Protocol</ModernButton>
                            </form>
                        </div>
                    </GlassCard>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CourseCatalog;
