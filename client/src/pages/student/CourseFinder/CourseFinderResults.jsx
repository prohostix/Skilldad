import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Award,
    Check,
    Lock,
    ArrowRight,
    RotateCcw,
    Compass,
    GraduationCap,
    Sparkles,
    BookOpen,
    Lightbulb,
    Bookmark,
    Rocket,
    Target,
    Briefcase,
    GitBranch
} from 'lucide-react';
import { getMediaUrl } from '../../../utils/media';

const fallbackThumbnails = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
];

const CourseFinderResults = ({ result, interestAreas = [], onRetake }) => {
    const navigate = useNavigate();
    const [bookmarked, setBookmarked] = useState({});
    const [additionalCourses, setAdditionalCourses] = useState([]);

    const top = result?.recommendations?.[0];
    const others = result?.recommendations?.slice(1) || [];

    // Toggle bookmark helper
    const toggleBookmark = (id, e) => {
        if (e) e.stopPropagation();
        setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // If fewer than 2 additional recommendations exist, fetch from /api/courses so all 3 cards in Recommended Courses are filled
    useEffect(() => {
        if (others.length < 2) {
            axios.get('/api/courses')
                .then((res) => {
                    const list = (res.data || []).filter(
                        (c) => (c._id || c.id) !== top?.course?.id && !others.some((o) => (o.course?.id || o.course?._id) === (c._id || c.id))
                    );
                    setAdditionalCourses(list.slice(0, 2 - others.length));
                })
                .catch(() => {});
        }
    }, [others, top?.course?.id]);

    if (!top) {
        return (
            <div className="min-h-[calc(100vh-64px)] px-4 py-10 bg-[#F8F9FD]">
                <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
                    <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-100">
                        <Compass className="w-7 h-7 text-[#6D28D9]" />
                    </div>
                    <h1 className="!text-lg !font-semibold !text-slate-900 mb-2">We're still finding the right path for you.</h1>
                    <p className="text-xs text-slate-500 mb-5">Based on what you've shared, here are broader areas worth exploring.</p>
                    {interestAreas.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {interestAreas.map((area) => (
                                <span key={area} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-[#4C1D95]">
                                    {area}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/courses')} className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#4C1D95] hover:bg-[#3B0764] transition-colors">
                            Explore Courses
                        </button>
                        <button onClick={onRetake} className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                            Retake Finder
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare skills list
    const skillsList = (top.course?.skillsDeveloped && top.course.skillsDeveloped.length > 0)
        ? top.course.skillsDeveloped
        : [
            'Healthcare Management',
            'Hospital Operations',
            'Communication',
            'HR Management',
            'Healthcare Technology',
            'Data Analysis',
            'Patient Administration'
        ];

    // Prepare learning path steps (7 steps as in reference)
    const rawModules = top.course?.modulePreview || [];
    const stepTitles = [
        rawModules[0] || 'Healthcare Fundamentals',
        rawModules[1] || 'Hospital Administration',
        rawModules[2] || 'Healthcare Operations',
        rawModules[3] || 'Hospital HR & Finance',
        rawModules[4] || 'Industry Project',
        'Resume & Interview Prep',
        'Job Opportunities'
    ];

    const learningSteps = stepTitles.map((title, idx) => {
        let status = 'locked';
        let statusLabel = 'Locked';
        if (idx === 0 || idx === 1) {
            status = 'completed';
            statusLabel = 'Completed';
        } else if (idx === 2) {
            status = 'in_progress';
            statusLabel = 'In Progress';
        }
        return {
            num: idx + 1,
            title: `${idx + 1}. ${title}`,
            status,
            statusLabel
        };
    });

    // Prepare Recommended Courses (up to 3 cards)
    const cardItems = [];

    // Card 1: Top match
    if (top.course) {
        cardItems.push({
            id: top.course.id,
            title: top.course.title || 'Hospital Administration',
            level: 'Beginner',
            duration: top.course.durationWeeks ? `${top.course.durationWeeks} weeks` : '8 weeks',
            hasCertificate: true,
            hasPlacement: top.course.hasPlacementSupport ?? true,
            score: top.score,
            isTopMatch: true,
            thumbnail: top.course.thumbnail ? getMediaUrl(top.course.thumbnail) : fallbackThumbnails[0]
        });
    }

    // Card 2 & 3: Other recommendations or additional courses
    others.forEach((rec, idx) => {
        if (rec.course && cardItems.length < 3) {
            cardItems.push({
                id: rec.course.id,
                title: rec.course.title,
                level: idx % 2 === 0 ? 'Intermediate' : 'Beginner',
                duration: rec.course.durationWeeks ? `${rec.course.durationWeeks} weeks` : (idx === 0 ? '12 weeks' : '10 weeks'),
                hasCertificate: true,
                hasPlacement: rec.course.hasPlacementSupport ?? true,
                score: rec.score,
                isTopMatch: false,
                thumbnail: rec.course.thumbnail ? getMediaUrl(rec.course.thumbnail) : fallbackThumbnails[(idx + 1) % fallbackThumbnails.length]
            });
        }
    });

    // If still less than 3, fill from additionalCourses
    additionalCourses.forEach((c, idx) => {
        if (cardItems.length < 3) {
            cardItems.push({
                id: c._id || c.id,
                title: c.title,
                level: 'Intermediate',
                duration: c.duration_weeks ? `${c.duration_weeks} weeks` : '10 weeks',
                hasCertificate: true,
                hasPlacement: true,
                score: Math.max(45, (top.score || 85) - (cardItems.length * 15)),
                isTopMatch: false,
                thumbnail: c.thumbnail ? getMediaUrl(c.thumbnail) : fallbackThumbnails[cardItems.length % fallbackThumbnails.length]
            });
        }
    });

    // Why this matches you items
    const matchReasons = (top.reasons && top.reasons.length > 0) ? top.reasons : [
        'Matches your career goal',
        'Fits your education level',
        'Builds relevant skills',
        'Supports your preferred learning style',
        'Certificate available',
        'Placement support available'
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#F8F9FD]">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* ============================================================ */}
                    {/* LEFT MAIN COLUMN (8 cols)                                   */}
                    {/* ============================================================ */}
                    <div className="lg:col-span-9 xl:col-span-8 space-y-6">

                        {/* 1. HERO CAREER MATCH BANNER */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="bg-gradient-to-r from-[#F4EEFE] via-[#ECE3FD] to-[#E5D7FA] rounded-[28px] p-6 sm:p-8 border border-[#E4D5F8] shadow-xs relative overflow-hidden"
                        >
                            {/* Top row: Content on Left, Image on Right */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 mb-6">
                                
                                {/* Left Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Pill Badge */}
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/90 text-[#6D28D9] border border-purple-200/60 shadow-xs mb-2.5">
                                        <Sparkles className="w-3 h-3 text-[#6D28D9]" />
                                        <span>Your Career Match</span>
                                    </div>

                                    {/* Role Title */}
                                    <h1 className="!text-xl sm:!text-2xl xl:!text-[26px] !font-semibold !text-slate-900 tracking-tight mb-1.5 !leading-snug">
                                        {top.careerRole || 'Hospital Administrator'}
                                    </h1>
                                    <p className="text-xs sm:text-[13px] text-slate-500 mb-4">
                                        Based on your goals, education, interests and current skills.
                                    </p>

                                    {/* Score Circular Progress & Label */}
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative w-16 h-16 shrink-0">
                                            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                                <circle cx="40" cy="40" r="33" fill="none" stroke="#E9D5FF" strokeWidth="6.5" />
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="33"
                                                    fill="none"
                                                    stroke="#4C1D95"
                                                    strokeWidth="6.5"
                                                    strokeLinecap="round"
                                                    strokeDasharray={2 * Math.PI * 33}
                                                    strokeDashoffset={2 * Math.PI * 33 - (Math.min(100, Math.max(0, top.score || 86)) / 100) * 2 * Math.PI * 33}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-lg sm:text-xl font-semibold text-slate-900">{top.score}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">Career</div>
                                            <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">Match</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Student Illustration */}
                                <div className="hidden md:block w-56 xl:w-64 shrink-0">
                                    <div className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-white/80 aspect-[4/3]">
                                        <img
                                            src="/career_hero_student.jpg"
                                            alt="Career Match Student"
                                            className="w-full h-full object-cover object-top"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 via-transparent to-transparent pointer-events-none" />
                                    </div>
                                </div>

                            </div>

                            {/* Bottom row: 3 Pillars spanning the FULL width of the card */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-purple-200/60 relative z-10">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <Target className="w-4 h-4 text-[#6D28D9]" />
                                    </div>
                                    <div className="text-xs text-slate-700 leading-tight">
                                        <div className="font-semibold text-slate-800 text-xs">Career-Aligned</div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">Course Recommendations</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <GitBranch className="w-4 h-4 text-[#6D28D9]" />
                                    </div>
                                    <div className="text-xs text-slate-700 leading-tight">
                                        <div className="font-semibold text-slate-800 text-xs">Personalized</div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">Learning Path</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-4 h-4 text-[#6D28D9]" />
                                    </div>
                                    <div className="text-xs text-slate-700 leading-tight">
                                        <div className="font-semibold text-slate-800 text-xs">Job-Oriented</div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">Opportunities</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                        {/* 2. YOUR LEARNING PATH CARD */}
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs p-6 sm:p-7">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5 text-[#6D28D9]" />
                                    </div>
                                    <div>
                                        <h2 className="!text-sm sm:!text-[15px] !font-semibold !text-slate-900 leading-tight">Your Learning Path</h2>
                                        <p className="text-[11.5px] text-slate-500">A step-by-step path to help you achieve your career goal.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D28D9] hover:text-[#4C1D95] transition-colors shrink-0"
                                >
                                    View Full Path <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Horizontal Roadmap Stepper */}
                            <div className="overflow-x-auto pb-3 pt-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-300">
                                <div className="flex items-center min-w-max gap-3 sm:gap-4">
                                    {learningSteps.map((step, idx) => (
                                        <React.Fragment key={step.num}>
                                            <div className="flex flex-col items-center text-center w-28 sm:w-32 shrink-0">
                                                
                                                {/* Icon node */}
                                                <div className="mb-2.5">
                                                    {step.status === 'completed' && (
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                                            <Check className="w-5 h-5 stroke-[2.5]" />
                                                        </div>
                                                    )}
                                                    {step.status === 'in_progress' && (
                                                        <div className="w-10 h-10 rounded-full border-2 border-[#6D28D9] bg-purple-50 text-[#4C1D95] flex items-center justify-center font-semibold text-xs shadow-xs">
                                                            {step.num}
                                                        </div>
                                                    )}
                                                    {step.status === 'locked' && (
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/60">
                                                            <Lock className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Step Title */}
                                                <div className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-snug mb-0.5">
                                                    {step.title}
                                                </div>

                                                {/* Status Label */}
                                                <div className={`text-[10px] font-medium ${
                                                    step.status === 'completed'
                                                        ? 'text-emerald-600'
                                                        : step.status === 'in_progress'
                                                        ? 'text-[#6D28D9]'
                                                        : 'text-slate-400'
                                                }`}>
                                                    {step.statusLabel}
                                                </div>
                                            </div>

                                            {/* Connector Arrow */}
                                            {idx < learningSteps.length - 1 && (
                                                 <div className="text-slate-300 shrink-0 -mt-6">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>


                        {/* 3. SKILLS YOU'LL BUILD CARD */}
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs p-6 sm:p-7">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-5 h-5 text-[#6D28D9]" />
                                </div>
                                <div>
                                    <h2 className="!text-sm sm:!text-[15px] !font-semibold !text-slate-900 leading-tight">Skills You'll Build</h2>
                                    <p className="text-[11.5px] text-slate-500">These skills will help you excel in your career.</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {skillsList.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F0FE] text-[#4C1D95] border border-purple-200/70 hover:bg-purple-100 transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>


                        {/* 4. RECOMMENDED COURSES SECTION */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-5 h-5 text-[#6D28D9]" />
                                    </div>
                                    <div>
                                        <h2 className="!text-sm sm:!text-[15px] !font-semibold !text-slate-900 leading-tight">Recommended Courses</h2>
                                        <p className="text-[11.5px] text-slate-500">Based on your profile, here are the best-matching courses for you.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D28D9] hover:text-[#4C1D95] transition-colors shrink-0"
                                >
                                    View All Courses <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* 3-Card Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {cardItems.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                                    >
                                        {/* Image banner */}
                                        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {course.isTopMatch && (
                                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#4C1D95] text-white shadow-xs">
                                                    Top Match
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => toggleBookmark(course.id, e)}
                                                className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
                                                    bookmarked[course.id]
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-white/80 text-slate-600 hover:bg-white hover:text-[#6D28D9]'
                                                }`}
                                            >
                                                <Bookmark className={`w-4 h-4 ${bookmarked[course.id] ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                            <div>
                                                <h3 className="!text-[13px] !font-semibold !text-slate-800 line-clamp-1 mb-1 group-hover:text-[#6D28D9] transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{course.level} · {course.duration}</span>
                                                </p>

                                                {/* Feature tags */}
                                                <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-normal text-slate-600">
                                                    {course.hasCertificate && (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600">
                                                             <Check className="w-3 h-3 stroke-[2.5]" /> Certificate
                                                        </span>
                                                    )}
                                                    {course.hasPlacement && (
                                                        <span className="inline-flex items-center gap-1 text-[#6D28D9]">
                                                            <GraduationCap className="w-3.5 h-3.5" /> Placement Support
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer with Score & Explore Button */}
                                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                                <span className="text-[10.5px] font-semibold text-[#4C1D95] shrink-0">
                                                    {course.score}% Match
                                                </span>
                                                <button
                                                    onClick={() => navigate(`/course/${course.id}`)}
                                                    className="inline-flex items-center justify-center gap-1 px-2 py-0.5 !min-h-0 !min-w-0 rounded-md text-[10px] font-medium text-white bg-[#4C1D95] hover:bg-[#3B0764] transition-all shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                                                >
                                                    Explore Course <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>


                    {/* ============================================================ */}
                    {/* RIGHT SIDEBAR COLUMN (4 cols)                                */}
                    {/* ============================================================ */}
                    <div className="lg:col-span-3 xl:col-span-4 space-y-6">

                        {/* 1. WHY THIS MATCHES YOU */}
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                    <Target className="w-5 h-5 text-[#6D28D9]" />
                                </div>
                                <h2 className="!text-sm sm:!text-[15px] !font-semibold !text-slate-900 leading-tight">Why this matches you</h2>
                            </div>
                            <p className="text-[11.5px] text-slate-500 mb-4 leading-relaxed">
                                We analyzed your answers to find the best courses and career path for you.
                            </p>

                            <div className="space-y-3">
                                {matchReasons.map((reason) => (
                                    <div key={reason} className="flex items-start gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                        </div>
                                        <span className="text-xs font-normal text-slate-600 leading-snug">
                                            {reason}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* 2. YOUR TOP SKILLS */}
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs p-6">
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-[#6D28D9]" />
                                    </div>
                                    <h2 className="!text-xs sm:!text-[13px] !font-semibold !text-slate-900 leading-tight">Your Top Skills</h2>
                                </div>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="text-[11px] font-medium text-[#6D28D9] hover:text-[#4C1D95] transition-colors"
                                >
                                    View All →
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {skillsList.slice(0, 5).map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F0FE] text-[#4C1D95] border border-purple-200/60"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>


                        {/* 3. READY TO BUILD YOUR FUTURE? BANNER */}
                        <div className="bg-gradient-to-br from-[#F5EEFD] to-[#EDE4FC] border border-[#E4D5F8] rounded-[24px] p-6 text-center shadow-xs">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#6D28D9] mx-auto mb-3">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h3 className="!text-sm sm:!text-[15px] !font-semibold !text-slate-900 mb-1">Ready to build your future?</h3>
                            <p className="text-[11.5px] text-slate-500 mb-3.5">Skill up. Get certified. Get hired.</p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="inline-flex items-center justify-center gap-1.5 py-2 px-5 max-w-[210px] mx-auto rounded-xl text-xs font-medium text-white bg-[#4C1D95] hover:bg-[#3B0764] transition-colors shadow-xs active:scale-[0.98]"
                            >
                                Explore More Courses <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>


                        {/* 4. NOT THE RIGHT MATCH? RETAKE */}
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs p-6 text-center">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto mb-2">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <h3 className="!text-xs sm:!text-[13px] !font-semibold !text-slate-900 mb-1">Not the right match?</h3>
                            <p className="text-[11.5px] text-slate-500 mb-3.5 leading-relaxed">
                                You can retake the course finder anytime and get new recommendations.
                            </p>
                            <button
                                onClick={onRetake}
                                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-[#4C1D95] border border-purple-300 hover:bg-purple-50 transition-colors inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Retake Finder →
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default CourseFinderResults;
