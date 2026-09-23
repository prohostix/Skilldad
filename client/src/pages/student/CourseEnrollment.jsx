import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    Users,
    Star,
    Award,
    CheckCircle,
    PlayCircle,
    BookOpen,
    Calendar,
    Globe,
    Download,
    ArrowLeft,
    User,
    Target,
    TrendingUp,
    FileText,
    Video,
    ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import ModernButton from '../../components/ui/ModernButton';
import { getMediaUrl } from '../../utils/media';

const CourseEnrollment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    // Mock course data with comprehensive details
    const mockCourse = {
        _id: courseId,
        title: "Complete React Development Bootcamp",
        description: "Master React from fundamentals to advanced concepts including hooks, context, Redux, and modern development practices.",
        longDescription: "This comprehensive React development course takes you from beginner to advanced level. You'll learn everything from basic components to complex state management, routing, testing, and deployment. Perfect for developers looking to master modern React development.",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        instructor: {
            name: "Sarah Johnson",
            bio: "Senior React Developer with 8+ years of experience at top tech companies",
            avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff",
            rating: 4.9,
            students: 15420,
            courses: 12
        },
        price: 199,
        originalPrice: 299,
        discount: 33,
        rating: 4.8,
        studentsEnrolled: 8547,
        duration: "42 hours",
        level: "Beginner to Advanced",
        language: "English",
        lastUpdated: "2024-02-15",
        certificate: true,
        prerequisites: [
            "Basic HTML and CSS knowledge",
            "JavaScript fundamentals",
            "Understanding of ES6+ features"
        ],
        whatYouWillLearn: [
            "Build modern React applications from scratch",
            "Master React Hooks and functional components",
            "Implement state management with Redux and Context API",
            "Create responsive and interactive user interfaces",
            "Handle API integration and data fetching",
            "Implement routing with React Router",
            "Write unit and integration tests",
            "Deploy React applications to production",
            "Optimize performance and bundle size",
            "Follow React best practices and patterns"
        ],
        syllabus: [
            {
                title: "React Fundamentals",
                duration: "8 hours",
                lessons: 12,
                topics: [
                    "Introduction to React and JSX",
                    "Components and Props",
                    "State and Event Handling",
                    "Conditional Rendering and Lists"
                ]
            },
            {
                title: "Advanced React Concepts",
                duration: "10 hours",
                lessons: 15,
                topics: [
                    "React Hooks (useState, useEffect, useContext)",
                    "Custom Hooks",
                    "Component Lifecycle",
                    "Error Boundaries"
                ]
            },
            {
                title: "State Management",
                duration: "8 hours",
                lessons: 10,
                topics: [
                    "Context API",
                    "Redux Fundamentals",
                    "Redux Toolkit",
                    "Async Actions with Redux Thunk"
                ]
            },
            {
                title: "Routing and Navigation",
                duration: "6 hours",
                lessons: 8,
                topics: [
                    "React Router Setup",
                    "Dynamic Routing",
                    "Protected Routes",
                    "Navigation Guards"
                ]
            }
        ],
        features: [
            "42 hours of on-demand video",
            "15 coding exercises",
            "8 real-world projects",
            "Downloadable resources",
            "Certificate of completion",
            "Lifetime access",
            "30-day money-back guarantee",
            "Mobile and TV access"
        ],
        reviews: [
            {
                id: 1,
                user: "Michael Chen",
                avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff",
                rating: 5,
                date: "2024-02-10",
                comment: "Excellent course! Sarah explains complex concepts in a very clear and understandable way. The projects are practical and helped me build a strong portfolio."
            },
            {
                id: 2,
                user: "Emily Rodriguez",
                avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=f59e0b&color=fff",
                rating: 5,
                date: "2024-02-08",
                comment: "This course exceeded my expectations. The content is up-to-date and covers everything you need to know about modern React development."
            },
            {
                id: 3,
                user: "David Kim",
                avatar: "https://ui-avatars.com/api/?name=David+Kim&background=ef4444&color=fff",
                rating: 4,
                date: "2024-02-05",
                comment: "Great course with lots of practical examples. The instructor is knowledgeable and the pace is perfect for beginners."
            }
        ]
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                let config = {};
                if (userInfo && userInfo.token) {
                    config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                }

                const { data } = await axios.get(`/api/courses/${courseId}`, config);
                const mergedInstructor = (typeof data.instructor === 'object' && data.instructor !== null)
                    ? { ...mockCourse.instructor, ...data.instructor }
                    : mockCourse.instructor;
                setCourse({ ...mockCourse, ...data, instructor: mergedInstructor });
                setIsEnrolled(data.isEnrolled || false);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleEnrollment = () => {
        navigate(`/dashboard/payment/${courseId}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#4C1D95]/20 border-t-[#4C1D95] rounded-full animate-spin"></div>
        </div>
    );

    if (!course) return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Course Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">The course you're looking for doesn't exist or has been moved.</p>
            <button
                onClick={() => navigate('/courses')}
                className="px-6 py-2.5 bg-[#4C1D95] hover:bg-[#3b1675] text-white text-sm font-bold rounded-xl transition-all"
            >
                Browse Courses
            </button>
        </div>
    );

    const features = course.features || mockCourse.features;
    const whatYouWillLearn = course.whatYouWillLearn || mockCourse.whatYouWillLearn;
    const syllabus = course.syllabus || mockCourse.syllabus;
    const prerequisites = course.prerequisites || mockCourse.prerequisites;
    const reviews = course.reviews || mockCourse.reviews;

    return (
        <div className="min-h-screen pb-16 font-inter text-slate-900 dark:text-white">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#4C1D95] dark:text-slate-400 dark:hover:text-purple-300 mb-6 transition-colors group"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Back to Courses</span>
            </button>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-50/80 via-[#FAF8FF] to-white dark:from-[#1F1235] dark:via-[#160B28] dark:to-[#0D051A] rounded-[24px] p-6 sm:p-8 border border-purple-100 dark:border-purple-900/30 shadow-sm mb-8">
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Course Main Details */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1 bg-purple-100/70 dark:bg-purple-950/60 text-[#4C1D95] dark:text-purple-300 font-bold rounded-full border border-purple-200/50 dark:border-purple-800/40">
                                {course.level}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{course.language}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Updated {new Date(course.lastUpdated).toLocaleDateString()}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            {course.title}
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            {course.description}
                        </p>

                        {/* Rating, students & metrics */}
                        <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={15}
                                            className={i < Math.floor(course.rating || 4.8) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">{course.rating || 4.8}</span>
                                <span className="text-slate-400">({((course.instructor?.students ?? course.studentsEnrolled) || 0).toLocaleString()} students)</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Clock size={15} className="text-[#4C1D95] dark:text-purple-400" />
                                <span>{course.duration || 'Self-paced'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Globe size={15} className="text-[#4C1D95] dark:text-purple-400" />
                                <span>{course.language || 'English'}</span>
                            </div>
                        </div>

                        {/* Instructor Profile Card */}
                        <div className="bg-white dark:bg-[#150d2a] rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-white/10 shadow-sm flex items-center gap-4 mt-6">
                            <img
                                src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName || course.instructor?.name || 'Instructor')}&background=6366f1&color=fff`}
                                alt={course.instructor?.name || course.instructorName || 'Instructor'}
                                className="w-14 h-14 rounded-full object-cover border border-purple-100 dark:border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    {course.instructorName || course.instructor?.name || 'Course Instructor'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 line-clamp-1">
                                    {course.instructor?.bio || 'Experienced educator and industry professional'}
                                </p>
                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                    <p className="text-[#4C1D95] dark:text-purple-400 text-[11px] font-bold uppercase tracking-wider">
                                        {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Enrollment Card (Right) */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-[#150d2a] rounded-[24px] p-5 sm:p-6 border border-purple-100 dark:border-purple-900/30 shadow-xl space-y-5 md:sticky md:top-6">
                            {/* Course Preview */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/10 shadow-inner group">
                                <img
                                    src={course.thumbnail ? getMediaUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'; }}
                                />
                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                        <PlayCircle size={28} className="text-[#4C1D95] ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Action / Enrollment Button */}
                            <div className="space-y-3">
                                {isEnrolled ? (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
                                            <CheckCircle size={18} className="shrink-0" />
                                            <span>You are enrolled in this course</span>
                                        </div>
                                        <button
                                            className="w-full py-3 px-5 rounded-xl bg-[#4C1D95] hover:bg-[#3b1675] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                                            onClick={() => navigate(`/dashboard/course/${courseId}`)}
                                        >
                                            Start Learning
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="w-full py-3.5 px-5 rounded-xl bg-[#4C1D95] hover:bg-[#3b1675] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 transition-all active:scale-[0.99]"
                                        onClick={handleEnrollment}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                )}

                                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>30-day money-back guarantee</span>
                                </div>
                            </div>

                            {/* Course Features */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                    This course includes:
                                </h4>
                                <div className="space-y-2">
                                    {features.slice(0, 6).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                                            <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Details Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* What You'll Learn */}
                    <div className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5">
                            What you'll learn
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3.5">
                            {whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex items-start gap-2.5">
                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Syllabus */}
                    <div className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5">
                            Course Content
                        </h2>
                        <div className="space-y-3">
                            {syllabus.map((module, index) => (
                                <div key={index} className="border border-slate-100 dark:border-white/5 rounded-xl p-4 bg-slate-50/50 dark:bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{module.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Video size={13} />
                                                {module.lessons} lessons
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} />
                                                {module.duration}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 pl-1">
                                        {module.topics.map((topic, topicIndex) => (
                                            <div key={topicIndex} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                                <PlayCircle size={13} className="text-[#4C1D95] dark:text-purple-400 shrink-0" />
                                                <span>{topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Prerequisites
                        </h2>
                        <div className="space-y-2.5">
                            {prerequisites.map((prereq, index) => (
                                <div key={index} className="flex items-start gap-2.5">
                                    <Target size={15} className="text-[#4C1D95] dark:text-purple-400 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{prereq}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5">
                            Student Reviews
                        </h2>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-start gap-3.5">
                                    <img
                                        src={review.avatar}
                                        alt={review.user}
                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{review.user}</h4>
                                            <span className="text-[11px] text-slate-400">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-amber-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={13}
                                                    className={i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats Widget */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 space-y-4 sticky top-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                            Course Statistics
                        </h3>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-slate-500 dark:text-slate-400">Enrolled Students</span>
                                <span className="font-bold text-slate-900 dark:text-white">{((course.instructor?.students ?? course.studentsEnrolled) || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-slate-500 dark:text-slate-400">Rating</span>
                                <span className="font-bold text-slate-900 dark:text-white">{course.rating || 4.8} / 5.0</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-slate-500 dark:text-slate-400">Total Duration</span>
                                <span className="font-bold text-slate-900 dark:text-white">{course.duration || 'Self-paced'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-slate-500 dark:text-slate-400">Certificate</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {course.certificate ? 'Included' : 'Not Included'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollment;
