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
    Video
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

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
            },
            {
                title: "Testing and Deployment",
                duration: "10 hours",
                lessons: 12,
                topics: [
                    "Unit Testing with Jest",
                    "Component Testing with React Testing Library",
                    "Integration Testing",
                    "Deployment Strategies"
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
                const { data } = await axios.get(`/api/courses/${courseId}`);
                // Merge real data with mock defaults to preserve UI layout
                setCourse({ ...mockCourse, ...data });
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
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (!course) return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
            <p className="text-slate-400 mb-6">The course you're looking for doesn't exist.</p>
            <ModernButton onClick={() => navigate('/courses')}>
                Browse Courses
            </ModernButton>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 -mx-6 -mt-10">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%236366f1%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Courses
                    </button>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Course Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                                        {course.level}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-400">{course.language}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-400">Updated {new Date(course.lastUpdated).toLocaleDateString()}</span>
                                </div>

                                <DashboardHeading
                                    title={course.title}
                                    className="!text-2xl lg:!text-3xl"
                                />

                                <p className="text-xl text-slate-300 leading-relaxed">
                                    {course.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={`${i < Math.floor(course.rating)
                                                        ? 'text-amber-400 fill-current'
                                                        : 'text-slate-400'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{course.rating}</span>
                                        <span className="text-slate-400">({course.studentsEnrolled.toLocaleString()} students)</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={16} />
                                        <span>{course.duration}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Globe size={16} />
                                        <span>{course.language}</span>
                                    </div>
                                </div>

                                {/* Instructor */}
                                <div className="flex items-center gap-4 p-6 bg-slate-800/50 rounded-xl">
                                    <img
                                        src={course.instructor.avatar}
                                        alt={course.instructor.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{course.instructorName || course.instructor?.name}</h3>
                                        <p className="text-slate-400 text-sm mb-1">{course.instructor.bio}</p>
                                        {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                                {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-400" />
                                                {course.instructor.rating}
                                            </span>
                                            <span>{course.instructor.students.toLocaleString()} students</span>
                                            <span>{course.instructor.courses} courses</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <GlassCard className="p-6 space-y-6">
                                    {/* Course Preview */}
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800">
                                        <img
                                            src={course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                <PlayCircle size={32} className="text-white ml-1" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-bold text-white">₹{course.price}</span>
                                            <span className="text-lg text-slate-400 line-through">₹{course.originalPrice}</span>
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded">
                                                {course.discount}% off
                                            </span>
                                        </div>

                                        {isEnrolled ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/20 p-3 rounded-lg">
                                                    <CheckCircle size={20} />
                                                    <span className="font-medium">Successfully Enrolled!</span>
                                                </div>
                                                <ModernButton
                                                    className="w-full"
                                                    onClick={() => navigate(`/dashboard/course/${courseId}`)}
                                                >
                                                    Start Learning
                                                </ModernButton>
                                            </div>
                                        ) : (
                                            <ModernButton
                                                className="w-full"
                                                onClick={handleEnrollment}
                                                disabled={enrolling}
                                            >
                                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                            </ModernButton>
                                        )}

                                        <p className="text-center text-sm text-slate-400">
                                            30-day money-back guarantee
                                        </p>
                                    </div>

                                    {/* Course Features */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-white">This course includes:</h3>
                                        <div className="space-y-2">
                                            {course.features.slice(0, 6).map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* What You'll Learn */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
                            <GlassCard className="p-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.whatYouWillLearn.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                                            <span className="text-slate-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </section>

                        {/* Course Syllabus */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Course content</h2>
                            <div className="space-y-4">
                                {course.syllabus.map((module, index) => (
                                    <GlassCard key={index} className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Video size={14} />
                                                    {module.lessons} lessons
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {module.duration}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {module.topics.map((topic, topicIndex) => (
                                                <div key={topicIndex} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <PlayCircle size={14} className="text-slate-400" />
                                                    <span>{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </section>

                        {/* Prerequisites */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Prerequisites</h2>
                            <GlassCard className="p-6">
                                <div className="space-y-3">
                                    {course.prerequisites.map((prereq, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Target size={16} className="text-primary mt-1 flex-shrink-0" />
                                            <span className="text-slate-300">{prereq}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </section>

                        {/* Reviews */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Student reviews</h2>
                            <div className="space-y-4">
                                {course.reviews.map((review) => (
                                    <GlassCard key={review.id} className="p-6">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={review.avatar}
                                                alt={review.user}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-white">{review.user}</h4>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={`${i < review.rating
                                                                    ? 'text-amber-400 fill-current'
                                                                    : 'text-slate-400'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-slate-400">
                                                        {new Date(review.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Course Stats */}
                            <GlassCard className="p-6">
                                <h3 className="font-semibold text-white mb-4">Course Statistics</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Students enrolled</span>
                                        <span className="text-white font-medium">{course.studentsEnrolled.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Course rating</span>
                                        <span className="text-white font-medium">{course.rating}/5</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Total duration</span>
                                        <span className="text-white font-medium">{course.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Certificate</span>
                                        <span className="text-emerald-400 font-medium">
                                            {course.certificate ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollment;
