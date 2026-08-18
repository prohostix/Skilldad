import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import CourseCard from '../../components/CourseCard';
import ModernButton from '../../components/ui/ModernButton';

const WBLPage = () => {
    const [activeTab, setActiveTab] = useState('domestic');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('/api/courses');
                if (data && Array.isArray(data)) {
                    setCourses(data);
                }
            } catch (err) {
                setError('Failed to load courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const programType = course.programType || course.program_type || 'course';
            if (activeTab === 'domestic') {
                return programType === 'degree_programme';
            } else if (activeTab === 'abroad') {
                return programType === 'wbl_abroad';
            }
            return false;
        });
    }, [courses, activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] text-white selection:bg-primary/30 relative overflow-hidden">
            <Navbar />
            
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none gpu-accelerated" />
            <div className="absolute top-1/2 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary-dark/2 blur-[150px] rounded-full pointer-events-none gpu-accelerated" />

            <div className="pt-20 pb-20 px-6 relative z-10">
                <div className="max-w-[1300px] mx-auto space-y-8">
                    
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight font-space leading-tight">
                            Work-Based <span className="premium-gradient-text">Learning</span>
                        </h1>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl flex-wrap justify-center shadow-2xl">
                            <button
                                onClick={() => setActiveTab('domestic')}
                                className={`px-6 py-2.5 rounded-xl font-black font-inter text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'domestic'
                                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                Domestic Programmes
                            </button>
                            <button
                                onClick={() => setActiveTab('abroad')}
                                className={`px-6 py-2.5 rounded-xl font-black font-inter text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'abroad'
                                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(110,40,255,0.3)]'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                Study Abroad
                            </button>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                                    </div>
                                    <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px]">Syncing Knowledge Base</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-400 py-10 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>
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
                                        <h3 className="text-3xl font-black text-white font-space">No programmes found</h3>
                                        <p className="text-text-muted font-inter max-w-sm mx-auto text-lg leading-relaxed">There are currently no {activeTab} programmes available.</p>
                                    </div>
                                    <ModernButton variant="secondary" onClick={() => setActiveTab(activeTab === 'domestic' ? 'abroad' : 'domestic')} className="!px-10 !py-5 uppercase tracking-widest font-black text-xs">
                                        View {activeTab === 'domestic' ? 'Abroad' : 'Domestic'} Programmes
                                    </ModernButton>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 gpu-accelerated">
                                    {filteredCourses.map((course) => (
                                        <CourseCard key={course._id} course={course} isWBLView={true} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default WBLPage;
