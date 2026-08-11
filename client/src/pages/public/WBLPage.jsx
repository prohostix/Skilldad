import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Clock, DollarSign, ArrowUpRight, School } from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import ModernButton from '../../components/ui/ModernButton';

const WBLPage = () => {
    const [activeTab, setActiveTab] = useState('domestic');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/wbl/courses?category=${activeTab}`);
                setCourses(response.data);
            } catch (err) {
                setError('Failed to load courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#050514] text-white selection:bg-primary/30">
            <Navbar />
            
            <div className="pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            Work-Based <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Learning</span>
                        </h1>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-1 rounded-full flex gap-2 border border-white/10">
                            <button
                                onClick={() => setActiveTab('domestic')}
                                className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 ${activeTab === 'domestic'
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                Domestic
                            </button>
                            <button
                                onClick={() => setActiveTab('abroad')}
                                className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 ${activeTab === 'abroad'
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                Abroad
                            </button>
                        </div>
                    </div>

                    {/* Course List */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loading ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-40 rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-400 py-10 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>
                            ) : courses.length === 0 ? (
                                <div className="text-center text-gray-500 py-20 bg-white/5 rounded-[2rem] border border-white/10">
                                    No {activeTab} courses available at the moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {courses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group p-1 bg-gradient-to-r from-transparent hover:from-primary/20 to-transparent rounded-[2rem] transition-all duration-500"
                                        >
                                            <div className="bg-[#0B0F1A] p-8 rounded-[1.9rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/5 group-hover:border-primary/30 transition-all cursor-pointer">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-white/10 text-white/60 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                                                            {course.category}
                                                        </span>
                                                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{course.title}</h3>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                                        <School size={14}/> {course.university_name}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                        {course.location && (
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Location</p>
                                                                <p className="flex items-center gap-2 text-white/60"><MapPin size={14} className="text-gray-400"/> {course.location}</p>
                                                            </div>
                                                        )}
                                                        {course.duration && (
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Duration</p>
                                                                <p className="flex items-center gap-2 text-white/60"><Clock size={14} className="text-primary"/> {course.duration}</p>
                                                            </div>
                                                        )}
                                                        {course.fees && (
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Fees</p>
                                                                <p className="flex items-center gap-2 text-white/60"><DollarSign size={14} className="text-emerald-500"/> {course.fees}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {course.description && (
                                                        <p className="text-white/40 text-sm line-clamp-2 pt-2 border-t border-white/5 mt-4">
                                                            {course.description}
                                                        </p>
                                                    )}
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
