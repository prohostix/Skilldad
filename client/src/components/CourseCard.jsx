import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star,
    PlayCircle,
    ArrowRight,
    Sparkles,
    GraduationCap,
    Briefcase,
    IndianRupee,
    TrendingUp
} from 'lucide-react';

import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import EnrollEnquiryModal from './ui/EnrollEnquiryModal';
import { getMediaUrl } from '../utils/media';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const [showEnquiry, setShowEnquiry] = useState(false);

    const handleEnroll = (e) => {
        if (e) {
            e.stopPropagation();
        }
        setShowEnquiry(true);
    };

    const thumbnailUrl = course.thumbnail ? getMediaUrl(course.thumbnail) : `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`;

    const isFeatured = Boolean(course.isFeatured || course.is_featured);

    const programType = course.programType || course.program_type || 'course';
    const isSpecialCategory = programType === 'degree_programme' || programType === 'wbl_abroad' || programType === 'wbl_domestic';

    if (isSpecialCategory) {
        return (
            <>
                <GlassCard
                    noHover={true}
                    lowBlur={true}
                    className={`overflow-hidden !p-0 h-full flex flex-col transition-all duration-500 gpu-accelerated bg-[#0A0714] !border-primary/30 hover:!border-primary/60 hover:shadow-glow-purple cursor-pointer group/card`}
                    onClick={() => navigate(`/course/${course._id}`)}
                >
                    {/* Thumbnail Section */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
                        <img
                            src={thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover relative z-20 group-hover/card:scale-105 transition-transform duration-700"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0714] via-transparent to-transparent z-21"></div>

                        {/* Featured Badge Left - per reference */}
                        {isFeatured && (
                            <div className="absolute top-2 left-2 z-30">
                                <span className="px-2.5 py-1 bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark text-white text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-lg shadow-primary/30 flex items-center gap-1">
                                    <Star size={10} className="text-white fill-white" />
                                    <span className='text-white!'>FEATURED COURSE</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col text-left bg-[#0A0714]">
                        <div className="flex items-center space-x-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden border border-primary/20 shrink-0">
                                {(course.instructorName || course.instructor?.name || 'I')[0]}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.05em] text-white/60 truncate">
                                    {course.instructorName || course.instructor?.name || 'Technical Instructor'}
                                </span>
                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.05em] text-primary/90 truncate mt-0.5">
                                        {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 className="text-base font-bold text-white font-inter mb-2 line-clamp-2 leading-tight group-hover/card:text-primary transition-colors">
                            {course.title}
                        </h3>

                        <p className="text-[11px] font-inter text-white/60 line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {course.description}
                        </p>

                        {/* Special Features Grid */}
                        <div className="grid grid-cols-4 gap-1 pt-3 pb-4 border-t border-white/10 mt-auto">
                            <div className="flex flex-col items-center text-center">
                                <GraduationCap className="w-4 h-4 text-primary mb-1.5" />
                                <span className="text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Degree</span>
                                <span className="text-[7px] text-white/50 leading-tight">Earn your<br/>UG Degree</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Briefcase className="w-4 h-4 text-primary mb-1.5" />
                                <span className="text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Work</span>
                                <span className="text-[7px] text-white/50 leading-tight">Work while<br/>you learn</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <IndianRupee className="w-4 h-4 text-primary mb-1.5" />
                                <span className="text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Earn</span>
                                <span className="text-[7px] text-white/50 leading-tight">Earn through<br/>work</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="w-4 h-4 text-primary mb-1.5" />
                                <span className="text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Experience</span>
                                <span className="text-[7px] text-white/50 leading-tight">Build real<br/>experience</span>
                            </div>
                        </div>

                        {/* Left Aligned Enroll Button */}
                        <div className="flex items-center justify-start mt-1">
                            <ModernButton
                                onClick={handleEnroll}
                                className="!px-3 !py-0 !min-h-[26px] !h-[26px] !text-[9px] font-black uppercase tracking-widest group/btn shadow-glow-purple !rounded-lg"
                            >
                                <span className="mr-1">Enroll</span> <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                            </ModernButton>
                        </div>
                    </div>
                </GlassCard>
                {showEnquiry && (
                    <EnrollEnquiryModal course={course} onClose={() => setShowEnquiry(false)} />
                )}
            </>
        );
    }

    return (
        <>
            <GlassCard
                noHover={true}
                lowBlur={true}
                className={`overflow-hidden !p-0 h-full flex flex-col transition-all duration-500 gpu-accelerated ${isFeatured ? '!border-primary/40 shadow-[0_0_20px_rgba(192,38,255,0.15)]' : ''
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
                        className="w-full h-full object-cover relative z-20"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-21"></div>

                    {/* Featured Badge Right - Admin Controlled Only */}
                    {isFeatured && (
                        <div className="absolute top-2 right-2 z-30">
                            <span className="px-2.5 py-1 bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark text-white text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-lg shadow-primary/30 flex items-center gap-1">
                                <Sparkles size={10} className="text-purple-200 animate-pulse" />
                                <span className='text-white!'>FEATURED COURSE</span>
                            </span>
                        </div>
                    )}
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
                            className="!px-2.5 !py-0 !min-h-[24px] !h-[24px] !text-[8px] font-black uppercase tracking-widest group/btn shadow-glow-purple"
                        >
                            <span className="mr-1">Enroll</span> <ArrowRight size={9} className="group-hover/btn:translate-x-1 transition-transform" />
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
