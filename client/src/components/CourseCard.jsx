import React, { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star,
    PlayCircle,
    ArrowRight,
    Sparkles,
    GraduationCap,
    Briefcase,
    IndianRupee,
    TrendingUp,
    Clock
} from 'lucide-react';

import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import EnrollEnquiryModal from './ui/EnrollEnquiryModal';
import { getMediaUrl } from '../utils/media';
import { useUser } from '../context/UserContext';

const CourseCard = memo(({ course, isWBLView = false, horizontal = false, forceStandardLayout = false, variant = 'standard' }) => {
    const navigate = useNavigate();
    const titleRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showEnquiry, setShowEnquiry] = useState(false);
    const [titleIsTwoLines, setTitleIsTwoLines] = useState(false);

    let userContext;
    try {
        userContext = useUser();
    } catch (e) {
        userContext = null;
    }
    const isEnrolled = userContext?.enrolledCourseIds?.includes(course._id) || false;

    useEffect(() => {
        if (titleRef.current) {
            // A typical single line title is around 20-24px. 
            // If it's more than 30px, it's taking at least 2 lines.
            setTitleIsTwoLines(titleRef.current.offsetHeight > 30);
        }
    }, [course.title]);

    const handleEnroll = (e) => {
        if (e) {
            e.stopPropagation();
        }
        setShowEnquiry(true);
    };

    const thumbnailUrl = course.thumbnail ? getMediaUrl(course.thumbnail) : `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`;

    const isFeatured = Boolean(course.isFeatured || course.is_featured);

    const programType = course.programType || course.program_type || 'course';
    const isSpecialCategory = isWBLView || programType === 'wbl_abroad' || programType === 'wbl_domestic';
    const isSIDPOrWBL = programType === 'degree_programme' || programType.startsWith('wbl');

    // Catalog Modern Card Layout (Efficient, Clean & Cohesive)
    if (variant === 'catalog') {
        const getBadgeText = () => {
            if (isFeatured) return 'Most Popular';
            return null;
        };

        const badgeText = getBadgeText();
        const displayLevel = course.level || null;
        const cleanDescription = course.shortDescription || course.description?.replace(/<[^>]*>?/gm, '').trim() || '';

        return (
            <>
                <div
                    onClick={() => navigate(`/course/${course._id}`)}
                    className={`bg-[#0E091D] border border-white/10 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/10 [.light-mode_&]:!bg-white [.light-mode_&]:!border-slate-200/90 [.light-mode_&]:hover:!border-purple-300 [.light-mode_&]:hover:!shadow-lg [.light-mode_&]:hover:!shadow-purple-100/60 rounded-2xl transition-all duration-300 flex h-full ${
                        horizontal ? 'flex-col sm:flex-row' : 'flex-col'
                    } overflow-hidden group cursor-pointer relative hover:-translate-y-1`}
                >
                    {/* Thumbnail Section */}
                    <div className={`relative ${horizontal ? 'sm:w-64 aspect-[16/10] sm:aspect-auto shrink-0' : 'w-full aspect-[16/10]'} overflow-hidden bg-slate-900 [.light-mode_&]:!bg-slate-100`}>
                        <img
                            src={thumbnailUrl}
                            alt={course.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Top-Left Category Badge */}
                        {badgeText && (
                            <div className="absolute top-2.5 left-2.5 z-20">
                                <span className="px-2.5 py-1 bg-purple-600/90 [.light-mode_&]:!bg-purple-700/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md shadow-sm">
                                    {badgeText}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 pb-3 flex flex-col flex-1 min-w-0">
                        <div>
                            {/* University / Provider Tag */}
                            {(course.universityName || course.instructor?.profile?.universityName) && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C026FF] [.light-mode_&]:!text-purple-600 truncate block mb-1">
                                    {course.universityName || course.instructor?.profile?.universityName}
                                </span>
                            )}

                            {/* Course Title */}
                            <h3 ref={titleRef} className="font-bold text-white group-hover:text-[#C026FF] [.light-mode_&]:!text-slate-900 [.light-mode_&]:!group-hover:text-purple-600 text-sm sm:text-[15px] font-sans line-clamp-2 leading-snug transition-colors mb-1">
                                {course.title}
                            </h3>

                            {/* Course Description - only 1 line when the title already took 2, so cards with long titles stay the same height as the rest */}
                            {cleanDescription && (
                                <p className={`text-[11px] leading-[1.4] text-white/45 [.light-mode_&]:!text-slate-500 mb-1.5 ${titleIsTwoLines ? 'line-clamp-1' : 'line-clamp-2'}`}>
                                    {cleanDescription}
                                </p>
                            )}

                            {/* Optional Level Meta (if present) */}
                            {displayLevel && (
                                <div className="flex items-center gap-1.5 text-[11px] text-white/50 [.light-mode_&]:!text-slate-500 font-medium mb-1">
                                    <GraduationCap size={12} className="text-[#C026FF] [.light-mode_&]:!text-purple-600" />
                                    <span>{displayLevel}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Link - pinned to the bottom so it lines up across cards regardless of title/description length */}
                        <div className="flex items-center justify-end mt-auto pt-1.5">
                            {isEnrolled ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/course/${course._id}`);
                                    }}
                                    className="text-xs font-semibold text-[#C026FF] hover:text-purple-300 [.light-mode_&]:!text-purple-700 [.light-mode_&]:!hover:text-purple-900 underline underline-offset-4 decoration-purple-500/60 hover:decoration-purple-500 flex items-center gap-1 transition-all group/link cursor-pointer"
                                >
                                    <span>Go to Course</span>
                                    <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/course/${course._id}`);
                                    }}
                                    className="text-xs font-semibold text-[#C026FF] hover:text-purple-300 [.light-mode_&]:!text-purple-700 [.light-mode_&]:!hover:text-purple-900 underline underline-offset-4 decoration-purple-500/60 hover:decoration-purple-500 flex items-center gap-1 transition-all group/link cursor-pointer"
                                >
                                    <span>View Details</span>
                                    <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {showEnquiry && (
                    <EnrollEnquiryModal course={course} onClose={() => setShowEnquiry(false)} />
                )}
            </>
        );
    }

    if (isSpecialCategory && !forceStandardLayout) {
        return (
            <>
                <GlassCard
                    noHover={true}
                    lowBlur={true}
                    className={`overflow-hidden !p-0 h-full min-h-[200px] md:min-h-[230px] transition-all duration-500 gpu-accelerated bg-[#0A0714] cursor-pointer group/card flex flex-col ${
                        isFeatured 
                            ? '!border-primary/80 shadow-[0_0_30px_rgba(192,38,255,0.3)] hover:!border-primary hover:shadow-[0_0_40px_rgba(192,38,255,0.5)]' 
                            : '!border-primary/30 hover:!border-primary/60 hover:shadow-glow-purple'
                    }`}
                    contentClassName="flex flex-col flex-1 h-full w-full"
                    onClick={() => navigate(`/course/${course._id}`)}
                >
                  <div className={`flex flex-1 w-full ${horizontal ? 'flex-col md:flex-row' : 'flex-col'}`}>
                    {/* Thumbnail Section */}
                    <div className={`relative ${horizontal ? 'w-full aspect-[16/9] md:aspect-auto md:w-[45%] lg:w-[40%] shrink-0' : 'w-full md:aspect-[16/10] aspect-[3/2]'} overflow-hidden bg-white/5`}>
                        <img
                            src={thumbnailUrl}
                            alt={course.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover z-20 group-hover/card:scale-105 transition-transform duration-700"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0714] via-transparent to-transparent z-21 pointer-events-none"></div>

                        {/* Featured Badge Right - Admin Controlled Only */}
                        {isFeatured && (
                            <div className="absolute top-2 right-2 z-30">
                                <span className="px-2.5 py-1 bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark text-[#fff] text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-lg shadow-primary/30 flex items-center gap-1">
                                    <Sparkles size={10} className="text-purple-200 animate-pulse" />
                                    <span className='text-[#fff]'>FEATURED COURSE</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className={`p-3 md:p-4 flex flex-col text-left bg-[#0A0714] flex-1 min-w-0`}>
                        <div className="flex items-center space-x-2 mb-1.5 md:mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden border border-primary/20 shrink-0">
                                {(course.instructorName || course.instructor?.name || 'I')[0]}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.05em] text-white/60 truncate">
                                    {course.instructorName || course.instructor?.name || 'Academic Instructor'}
                                </span>
                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.05em] text-primary/90 truncate mt-0.5">
                                        {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}{isSIDPOrWBL ? ' + SkillDad' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 
                            ref={titleRef}
                            className="text-sm md:text-base font-bold text-white font-inter mb-1.5 md:mb-2 line-clamp-2 leading-tight group-hover/card:text-primary transition-colors"
                        >
                            {course.title}
                        </h3>

                        {/* Short Description */}
                        <p className={`text-xs text-white/50 mb-3 md:mb-4 line-clamp-2 ${horizontal ? 'md:line-clamp-3' : ''}`}>
                            {course.shortDescription || course.description?.replace(/<[^>]*>?/gm, '') || 'No description available'}
                        </p>

                        {/* Special Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-1 md:gap-1 pt-2 md:pt-3 pb-2 md:pb-4 border-t border-white/10 mt-auto">
                            <div className="flex flex-col items-center text-center">
                                <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-primary mb-1 md:mb-1.5" />
                                <span className="text-[7px] md:text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Degree</span>
                                <span className="text-[6px] md:text-[7px] text-white/50 leading-tight">Earn your<br/>UG Degree</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-primary mb-1 md:mb-1.5" />
                                <span className="text-[7px] md:text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Work</span>
                                <span className="text-[6px] md:text-[7px] text-white/50 leading-tight">Work while<br/>you learn</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <IndianRupee className="w-3 h-3 md:w-4 md:h-4 text-primary mb-1 md:mb-1.5" />
                                <span className="text-[7px] md:text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Earn</span>
                                <span className="text-[6px] md:text-[7px] text-white/50 leading-tight">Earn through<br/>work</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary mb-1 md:mb-1.5" />
                                <span className="text-[7px] md:text-[8px] font-black text-white uppercase mb-0.5 tracking-wider">Experience</span>
                                <span className="text-[6px] md:text-[7px] text-white/50 leading-tight">Build real<br/>experience</span>
                            </div>
                        </div>

                        {/* Left Aligned Enroll Button */}
                        <div className="flex items-center justify-start mt-1">
                            {isEnrolled ? (
                                <ModernButton
                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/course/${course._id}`); }}
                                    className="!px-3 md:!px-4 !py-1 md:!py-1.5 !min-h-[26px] md:!min-h-[30px] !h-[26px] md:!h-[30px] !text-[8px] md:!text-[10px] font-black uppercase tracking-widest group/btn shadow-glow-purple !rounded-lg"
                                >
                                    <span className="mr-1">Go to Course</span> <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </ModernButton>
                            ) : (
                                <ModernButton
                                    onClick={handleEnroll}
                                    className="!px-3 md:!px-4 !py-1 md:!py-1.5 !min-h-[26px] md:!min-h-[30px] !h-[26px] md:!h-[30px] !text-[8px] md:!text-[10px] font-black uppercase tracking-widest group/btn shadow-glow-purple !rounded-lg"
                                >
                                    <span className="mr-1">Enroll</span> <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </ModernButton>
                            )}
                        </div>
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
                className={`overflow-hidden !p-0 h-full min-h-[200px] md:min-h-[230px] transition-all duration-500 gpu-accelerated flex flex-col ${
                    isFeatured 
                        ? '!border-primary/80 shadow-[0_0_30px_rgba(192,38,255,0.3)] hover:!border-primary hover:shadow-[0_0_40px_rgba(192,38,255,0.5)]' 
                        : ''
                }`}
                contentClassName="flex flex-col flex-1 h-full w-full"
            >
              <div className={`flex flex-1 w-full ${horizontal ? 'flex-col md:flex-row' : 'flex-col'}`}>
                {/* Thumbnail Section */}
                <div
                    className={`relative ${horizontal ? 'w-full aspect-[16/9] md:aspect-auto md:w-[45%] lg:w-[40%] shrink-0' : 'w-full md:aspect-video aspect-[3/2]'} overflow-hidden bg-white/5 cursor-pointer`}
                    onClick={() => navigate(`/course/${course._id}`)}
                >
                    <img
                        src={thumbnailUrl}
                        alt={course.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover z-20"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-21 pointer-events-none"></div>

                    {/* Featured Badge Right - Admin Controlled Only */}
                    {isFeatured && (
                        <div className="absolute top-2 right-2 z-30">
                            <span className="px-2.5 py-1 bg-gradient-to-r from-primary via-[#C026FF] to-primary-dark text-[#fff] text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-lg shadow-primary/30 flex items-center gap-1">
                                <Sparkles size={10} className="text-purple-200 animate-pulse" />
                                <span className='text-[#fff]'>FEATURED COURSE</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className={`p-4 md:p-5 flex flex-col text-left flex-1 min-w-0`}>
                    <div className="flex items-center space-x-2 mb-1 md:mb-1.5">
                        <div className="w-4.5 h-4.5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary overflow-hidden border border-primary/20 shrink-0">
                            {(course.instructorName || course.instructor?.name || 'I')[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-[0.05em] text-white/60 truncate">
                                {course.instructorName || course.instructor?.name || 'Academic Instructor'}
                            </span>
                            {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                <span className="text-[8px] font-black uppercase tracking-[0.05em] text-primary/80 truncate mt-0.5">
                                    {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}{isSIDPOrWBL ? ' + SkillDad' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <h3
                        ref={titleRef}
                        className="text-xs md:text-sm font-black text-white font-space mb-1 md:mb-1.5 line-clamp-2 leading-[1.3] cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/course/${course._id}`)}
                    >
                        {course.title}
                    </h3>

                    <p className={`text-[10px] md:text-[11px] font-inter text-white/50 mb-1.5 md:mb-3 leading-relaxed ${horizontal ? 'line-clamp-3' : (titleIsTwoLines ? 'line-clamp-1' : 'line-clamp-2')}`}>
                        {course.description}
                    </p>

                    <div className="flex items-center justify-end pt-1.5 md:pt-2.5 border-t border-white/5 mt-auto">
                        {isEnrolled ? (
                            <ModernButton
                                onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/course/${course._id}`); }}
                                className="!px-3 md:!px-4 !py-1 md:!py-1.5 !min-h-[26px] md:!min-h-[30px] !h-[26px] md:!h-[30px] !text-[8px] md:!text-[10px] font-black uppercase tracking-widest group/btn shadow-glow-purple"
                            >
                                <span className="mr-1">Go to Course</span> <ArrowRight className="w-2 h-2 md:w-2.5 md:h-2.5 group-hover/btn:translate-x-1 transition-transform" />
                            </ModernButton>
                        ) : (
                            <ModernButton
                                onClick={handleEnroll}
                                className="!px-3 md:!px-4 !py-1 md:!py-1.5 !min-h-[26px] md:!min-h-[30px] !h-[26px] md:!h-[30px] !text-[8px] md:!text-[10px] font-black uppercase tracking-widest group/btn shadow-glow-purple"
                            >
                                <span className="mr-1">Enroll</span> <ArrowRight className="w-2 h-2 md:w-2.5 md:h-2.5 group-hover/btn:translate-x-1 transition-transform" />
                            </ModernButton>
                        )}
                    </div>

                </div>
              </div>
            </GlassCard>
            {showEnquiry && (
                <EnrollEnquiryModal course={course} onClose={() => setShowEnquiry(false)} />
            )}
        </>
    );
});

export default CourseCard;
