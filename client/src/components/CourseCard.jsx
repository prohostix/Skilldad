import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star,
    PlayCircle,
    ArrowRight,
    Sparkles
} from 'lucide-react';

import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import EnrollEnquiryModal from './ui/EnrollEnquiryModal';
import { getMediaUrl } from '../utils/media';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const [showEnquiry, setShowEnquiry] = useState(false);

    const handleEnroll = () => setShowEnquiry(true);

    const thumbnailUrl = course.thumbnail ? getMediaUrl(course.thumbnail) : `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`;

    const isFeatured = Boolean(course.isFeatured || course.is_featured);

    return (
        <>
        <GlassCard
            lowBlur={true}
            className={`group overflow-hidden !p-0 h-full flex flex-col hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 gpu-accelerated ${
                isFeatured ? '!border-amber-500/40 hover:!border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''
            }`}
        >
            {/* Thumbnail Section */}
            <div
                className="relative aspect-video w-full overflow-hidden bg-white/5 cursor-pointer"
                onClick={() => navigate(`/course/${course._id}`)}
            >
                <img
                    src={thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-20"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-21"></div>

                {/* Featured Badge Right - Admin Controlled Only */}
                {isFeatured && (
                    <div className="absolute top-2 right-2 z-30">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 via-[#C026FF] to-amber-500 text-white text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-lg shadow-amber-500/30 flex items-center gap-1">
                            <Sparkles size={10} className="text-yellow-200 animate-pulse" />
                            <span>FEATURED COURSE</span>
                        </span>
                    </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100 transform transition-transform z-30">
                    <div className="w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/40 backdrop-blur-sm">
                        <PlayCircle size={24} />
                    </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center text-white z-30">
                    <div className="flex items-center space-x-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold">4.8</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3.5 flex-1 flex flex-col text-left">
                <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary overflow-hidden border border-primary/20 shrink-0">
                        {(course.instructorName || course.instructor?.name || 'I')[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.05em] text-white/60 truncate">
                            {course.instructorName || course.instructor?.name || 'Technical Instructor'}
                        </span>
                        {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                            <span className="text-[8px] font-black uppercase tracking-[0.05em] text-primary/80 truncate mt-0.5">
                                {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                            </span>
                        )}
                    </div>
                </div>

                <h3
                    className="text-sm font-black text-white font-space mb-1.5 line-clamp-2 leading-[1.3] cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/course/${course._id}`)}
                >
                    {course.title}
                </h3>

                <p className="text-[11px] font-inter text-white/50 line-clamp-2 mb-3 flex-1 leading-relaxed">
                    {course.description}
                </p>

                <div className="flex items-center justify-end pt-2.5 border-t border-white/5 mt-auto">
                    <ModernButton
                        onClick={handleEnroll}
                        className="!px-3.5 !py-1.5 font-black uppercase tracking-widest text-[8px] group/btn shadow-glow-purple"
                    >
                        <span className="mr-1">Enroll</span> <ArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform" />
                    </ModernButton>
                </div>

            </div>
        </GlassCard>
        {showEnquiry && (
            <EnrollEnquiryModal course={course} onClose={() => setShowEnquiry(false)} />
        )}
        </>
    );
};

export default CourseCard;
