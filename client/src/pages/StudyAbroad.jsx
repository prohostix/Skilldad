import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, 
    School, 
    BookOpen, 
    ArrowRight, 
    Search, 
    MapPin, 
    DollarSign, 
    Clock, 
    FileText, 
    ChevronLeft,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import ModernButton from '../components/ui/ModernButton';
import { toast } from 'react-hot-toast';

const StudyAbroad = () => {
    const [view, setView] = useState('countries'); // countries, universities, course-details
    const [loading, setLoading] = useState(false);
    
    // Data State
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/study-abroad/countries');
            setCountries(data.filter(c => c.is_active));
        } catch (error) {
            toast.error('Failed to load countries');
        } finally {
            setLoading(false);
        }
    };

    const handleCountryClick = async (country) => {
        setLoading(true);
        setSelectedCountry(country);
        try {
            const { data } = await axios.get(`/api/study-abroad/countries/${country.id}/universities`);
            setUniversities(data);
            setView('universities');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load universities');
        } finally {
            setLoading(false);
        }
    };

    const handleUniversityClick = async (uni) => {
        setLoading(true);
        setSelectedUniversity(uni);
        try {
            const { data } = await axios.get(`/api/study-abroad/universities/${uni.id}/courses`);
            setCourses(data.filter(c => c.is_active));
            // We stay in 'universities' view but show courses under the university if preferred, 
            // OR transition to a courses view. Let's transition to show courses clearly.
            setView('courses');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = async (course) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/study-abroad/courses/${course.id}`);
            setSelectedCourse(data);
            setView('course-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (view === 'course-detail') setView('courses');
        else if (view === 'courses') setView('universities');
        else if (view === 'universities') setView('countries');
    };

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050514] text-white selection:bg-primary/30">
            <Navbar />
            
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Breadcrumbs / Back Navigation */}
                    {view !== 'countries' && (
                        <motion.button 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={goBack}
                            className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors group"
                        >
                            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20">
                                <ChevronLeft size={20} />
                            </div>
                            <span className="font-medium">Back to {view === 'course-detail' ? 'Courses' : view === 'courses' ? 'Universities' : 'Countries'}</span>
                        </motion.button>
                    )}

                    <AnimatePresence mode="wait">
                        {view === 'countries' && (
                            <motion.div 
                                key="countries"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <div className="text-center space-y-4">
                                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Boundless</span> Opportunities
                                    </h1>
                                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                        Discover world-class education across the globe. Choose your destination and start your journey today.
                                    </p>
                                    
                                    <div className="max-w-xl mx-auto relative group mt-8">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
                                        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-all">
                                            <Search className="ml-4 text-gray-400 shrink-0" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by country (e.g. Canada, UK...)"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="!bg-transparent border-none outline-none ring-0 focus:ring-0 w-full ml-3 px-4 py-3 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {loading && countries.length === 0 ? (
                                        [1,2,3].map(i => (
                                            <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                                        ))
                                    ) : (
                                        filteredCountries.map((country, index) => (
                                            <motion.div
                                                key={country.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => handleCountryClick(country)}
                                                className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-700"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 rounded-3xl"></div>
                                                <img 
                                                    src={country.image_url || `https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1974&auto=format&fit=crop`} 
                                                    alt={country.name}
                                                    className="w-full h-96 object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-2">
                                                    <h3 className="text-3xl font-bold force-white">{country.name}</h3>
                                                    <p className="force-white-60 line-clamp-2 text-sm">{country.description}</p>
                                                    <div className="pt-4 flex items-center force-primary font-bold gap-2 group-hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                                        Explore Universities <ArrowRight size={14} />
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 right-6 z-20">
                                                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                        <ArrowUpRight size={20} className="force-white" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {view === 'universities' && (
                            <motion.div 
                                key="universities"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-12"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <Globe className="text-primary" size={24} />
                                        </div>
                                        <h2 className="text-4xl font-bold">Top Universities in {selectedCountry?.name}</h2>
                                    </div>
                                    <p className="text-white/40 max-w-2xl">
                                        Choose from the most prestigious institutions recognized globally for excellence in education and research.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {universities.map((uni, index) => (
                                        <motion.div
                                            key={uni.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleUniversityClick(uni)}
                                            className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/30 hover:bg-white/[0.08] transition-all group cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="relative z-10 flex flex-col md:flex-row gap-6">
                                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors shrink-0 overflow-hidden">
                                                    {uni.logo_url ? <img src={uni.logo_url} className="w-full h-full object-cover" /> : <School size={32} className="text-white/20" />}
                                                </div>
                                                <div className="space-y-3 flex-1">
                                                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{uni.name}</h3>
                                                    <div className="flex items-center gap-2 text-white/40 text-sm">
                                                        <MapPin size={14} /> {uni.location}
                                                    </div>
                                                    <p className="text-white/40 text-sm line-clamp-2">{uni.description}</p>
                                                    <div className="pt-2 flex items-center gap-4">
                                                        {uni.website_url && (
                                                            <a href={uni.website_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest" onClick={(e) => e.stopPropagation()}>
                                                                <Globe size={14} /> Website
                                                            </a>
                                                        )}
                                                        <button className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                                            View Courses <ArrowRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] rounded-full"></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'courses' && (
                            <motion.div 
                                key="courses"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-12"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                            <School size={14}/> {selectedUniversity?.name}
                                        </div>
                                        <h2 className="text-4xl font-bold">Programs & Courses</h2>
                                    </div>
                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                        <MapPin className="text-white/20" size={18}/>
                                        <span className="text-white/60">{selectedUniversity?.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {courses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleCourseClick(course)}
                                            className="group p-1 bg-gradient-to-r from-transparent hover:from-primary/20 to-transparent rounded-[2rem] transition-all duration-500"
                                        >
                                            <div className="bg-[#0B0F1A] p-8 rounded-[1.9rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/5 group-hover:border-primary/30 transition-all cursor-pointer">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-white/10 text-white/60 text-[10px] font-black rounded-lg uppercase tracking-tighter">{course.level}</span>
                                                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{course.name}</h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Duration</p>
                                                            <p className="flex items-center gap-2 text-white/60"><Clock size={14} className="text-primary"/> {course.duration}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Yearly Fees</p>
                                                            <p className="flex items-center gap-2 text-white/60"><DollarSign size={14} className="text-emerald-500"/> {course.fees}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Intakes</p>
                                                            <p className="flex items-center gap-2 text-white/60"><Calendar size={14} className="text-blue-500"/> {course.intakes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    <ModernButton className="group-hover:scale-105 transition-transform" variant="secondary">
                                                        View Details <ArrowUpRight size={18} className="ml-2"/>
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'course-detail' && selectedCourse && (
                            <motion.div 
                                key="course-detail"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                            >
                                {/* Left Side - Main Info */}
                                <div className="lg:col-span-8 space-y-12">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest">
                                            <BookOpen size={14}/> {selectedCourse.level} Program
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold">{selectedCourse.name}</h1>
                                        
                                        <div className="flex flex-wrap items-center gap-12 pt-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {selectedCourse.universityLogo ? <img src={selectedCourse.universityLogo} className="w-full h-full object-cover"/> : <School className="text-white/20" size={24}/>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Awarding University</p>
                                                    <h3 className="font-bold text-lg">{selectedCourse.universityName}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <Globe className="text-primary" size={24}/>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Location</p>
                                                    <h3 className="font-bold text-lg">{selectedCourse.universityLocation}, {selectedCourse.countryName}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><FileText className="text-primary"/> Course Overview</h3>
                                            <p className="text-white/60 leading-relaxed text-lg italic whitespace-pre-wrap">
                                                "{selectedCourse.description || 'Discover a comprehensive curriculum designed to prepare you for global success in this field.'}"
                                            </p>
                                        </div>

                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><BookOpen className="text-emerald-500"/> Admission Requirements</h3>
                                            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                                                <p className="text-white/60 leading-relaxed whitespace-pre-wrap">{selectedCourse.requirements || 'Contact our counselors for detailed entry requirements.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Sidebar / Actions */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="p-8 bg-gradient-to-br from-primary/10 via-[#0B0F1A] to-[#0B0F1A] border border-white/10 rounded-[2.5rem] sticky top-32">
                                        <h3 className="text-xl font-bold mb-8">Summary & Enrollment</h3>
                                        
                                        <div className="space-y-6 mb-8">
                                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                                <span className="text-white/40">Duration</span>
                                                <span className="font-bold">{selectedCourse.duration}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                                <span className="text-white/40">Tuition Fees</span>
                                                <span className="font-bold text-emerald-400">{selectedCourse.fees}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                                <span className="text-white/40">Intakes</span>
                                                <span className="font-bold">{selectedCourse.intakes}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/40">Status</span>
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">Applications Open</span>
                                            </div>
                                        </div>

                                        <ModernButton className="w-full py-4 text-base" onClick={() => toast.success("Counselor will contact you soon!")}>
                                            Inquire & Apply Now
                                        </ModernButton>
                                        
                                        <p className="mt-6 text-center text-xs text-white/20">
                                            Apply through SkillDad to get guaranteed scholarship assistance and free visa counseling.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudyAbroad;
