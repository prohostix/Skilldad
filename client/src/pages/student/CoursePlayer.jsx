import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    ChevronRight,
    Play,
    FileText,
    MessageSquare,
    User,
    Layout,
    ArrowLeft,
    Clock,
    Unlock,
    Video,
    Calendar,
    Send,
    Download,
    HelpCircle,
    Lock,
    CheckSquare,
    Award,
    XCircle,
    ChevronDown,
    ChevronUp,
    Eye,
    RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import MeetingRecordingPlayer from '../../components/MeetingRecordingPlayer';
import CustomYoutubePlayer from '../../components/CustomYoutubePlayer';
import { getMediaUrl } from '../../utils/media';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [showExercise, setShowExercise] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [exerciseFeedback, setExerciseFeedback] = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState({ completedVideos: [], completedExercises: [], progress: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [liveSessions, setLiveSessions] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [showAnswerSheet, setShowAnswerSheet] = useState(true);
    const [showCourseCompletion, setShowCourseCompletion] = useState(false);
    const [isApplyingCertificate, setIsApplyingCertificate] = useState(false);
    const [certificateApplied, setCertificateApplied] = useState(false);

    useEffect(() => {
        const module = course?.modules?.[currentModuleIndex];
        if (module && (!module.videos || module.videos.length === 0) && module.quiz && !showQuiz) {
            setShowQuiz(true);
        }
    }, [currentModuleIndex, course, showQuiz]);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            try {
                const { data: courseData } = await axios.get(`/api/courses/${courseId}`);
                setCourse(courseData);

                // Fetch student progress for this course
                const { data: progData } = await axios.get('/api/enrollment/my-courses', config);
                const currentProg = progData.find(p => (p.course?._id || p.course_id) === courseId);
                if (currentProg) {
                    setUserProgress({
                        ...currentProg,
                        completedVideos: Array.isArray(currentProg.completedVideos) ? currentProg.completedVideos : (currentProg.completed_videos || []),
                        completedExercises: Array.isArray(currentProg.completedExercises) ? currentProg.completedExercises : (currentProg.completed_exercises || [])
                    });
                }

                // Fetch live sessions for this course
                try {
                    const { data: sessionsData } = await axios.get(`/api/sessions/course/${courseId}`, config);
                    setLiveSessions(sessionsData);
                } catch (sessionError) {
                    console.error('Error loading live sessions:', sessionError);
                    // Don't fail the whole page if live sessions fail to load
                }
                // Fetch discussions for current video
                const currentModule = courseData.modules?.[0];
                const currentVideo = currentModule?.videos?.[0];
                if (currentVideo?._id) {
                    try {
                        const { data: discData } = await axios.get(`/api/discussions/${courseId}/${currentVideo._id}`, config);
                        setDiscussions(discData);
                    } catch (err) {
                        console.error('Failed to fetch discussions', err);
                    }
                }
            } catch (error) {
                console.error('Error fetching course player data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndProgress();
    }, [courseId]);

    // Fetch discussions when video changes
    useEffect(() => {
        const fetchCurrentVideoDiscussions = async () => {
            const currentModule = course?.modules?.[currentModuleIndex];
            const currentVideo = currentModule?.videos?.[currentVideoIndex];

            if (currentVideo?._id) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: discData } = await axios.get(`/api/discussions/${courseId}/${currentVideo._id}`, config);
                    setDiscussions(discData);
                } catch (err) {
                    console.error('Failed to fetch discussions', err);
                }
            }
        };

        if (course) fetchCurrentVideoDiscussions();
    }, [currentModuleIndex, currentVideoIndex, course]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmittingComment) return;

        const currentModule = course.modules[currentModuleIndex];
        const currentVideo = currentModule.videos[currentVideoIndex];
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        setIsSubmittingComment(true);
        try {
            const { data } = await axios.post('/api/discussions', {
                courseId,
                videoId: currentVideo._id,
                content: newComment
            }, config);

            setDiscussions(prev => [data, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (!course) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const currentModule = course.modules?.[currentModuleIndex];
    const hasVideos = currentModule?.videos && currentModule.videos.length > 0;
    const hasQuiz = !!currentModule?.quiz;

    // Safety check if course has no modules
    if (!showCourseCompletion && (!currentModule || (!hasVideos && !hasQuiz))) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                <h2 className="text-xl font-bold mb-4">Content Unavailable</h2>
                <p className="text-gray-400 mb-6">This course doesn't have any published modules or videos yet.</p>
                <ModernButton onClick={() => navigate('/dashboard/my-courses')}>
                    Back to Dashboard
                </ModernButton>
            </div>
        );
    }

    if (!course.isEnrolled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                <div className="p-4 bg-rose-500/10 rounded-full mb-4">
                    <Unlock size={48} className="text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Content Locked</h2>
                <p className="text-gray-400 mb-6 text-center max-w-md">You do not have active access to this course. Your enrollment may be inactive or deactivated by your institution.</p>
                <ModernButton onClick={() => navigate('/dashboard/my-courses')}>
                    Back to Dashboard
                </ModernButton>
            </div>
        );
    }

    const currentVideo = hasVideos ? currentModule.videos[currentVideoIndex] : {};
    // Support exercises or quiz on lesson
    const currentExercise = currentVideo?.exercises?.[0] || (currentVideo?.quiz?.questions?.[0] ? {
        _id: currentVideo.quiz.questions[0]._id,
        question: currentVideo.quiz.questions[0].question,
        options: currentVideo.quiz.questions[0].options,
        correctAnswer: currentVideo.quiz.questions[0].options[currentVideo.quiz.questions[0].correctIndex],
        explanation: currentVideo.quiz.questions[0].explanation
    } : null);

    const handleVideoEnd = () => {
        if (currentExercise && !userProgress.completedExercises?.some(ex => ex.video === currentVideo._id)) {
            setShowExercise(true);
        } else {
            handleNext();
        }
    };

    const submitAnswer = async () => {
        if (selectedAnswer === currentExercise.correctAnswer) {
            setExerciseFeedback({ type: 'success', message: 'Correct! Progress saved.' });

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const vidId = currentVideo._id || currentVideo.id;
            try {
                await axios.put('/api/enrollment/progress', {
                    courseId,
                    videoId: vidId,
                    exerciseScore: 100
                }, config);
                setUserProgress(prev => ({
                    ...prev,
                    completedExercises: [...(prev.completedExercises || []), { video: vidId, score: 100 }]
                }));
            } catch (err) {
                console.error('Progress update failed', err);
            }

            setTimeout(() => {
                setExerciseFeedback(null);
                setShowExercise(false);
                setSelectedAnswer('');
                handleNext();
            }, 2000);
        } else {
            setExerciseFeedback({ type: 'error', message: 'Incorrect. Please try again.' });
        }
    };

    const advanceToNextValidContent = (startModuleIndex) => {
        for (let i = startModuleIndex; i < course.modules.length; i++) {
            const mod = course.modules[i];
            if (mod.videos && mod.videos.length > 0) {
                setCurrentModuleIndex(i);
                setCurrentVideoIndex(0);
                setShowQuiz(false);
                return;
            }
            if (mod.quiz) {
                setCurrentModuleIndex(i);
                setCurrentVideoIndex(0);
                setShowQuiz(true);
                return;
            }
        }
        setShowCourseCompletion(true);
    };

    const goToNextSection = () => {
        if (showQuiz) {
            advanceToNextValidContent(currentModuleIndex + 1);
            return;
        }

        if (currentModule && currentModule.videos && currentVideoIndex < currentModule.videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        } else if (currentModule && currentModule.quiz) {
            setShowQuiz(true);
        } else {
            advanceToNextValidContent(currentModuleIndex + 1);
        }
    };

    const handleNext = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        if (!showQuiz) {
            const vidId = currentVideo?._id || currentVideo?.id;
            if (vidId) {
                try {
                    const resp = await axios.put('/api/enrollment/progress', {
                        courseId,
                        videoId: vidId,
                    }, config);

                    setUserProgress(prev => ({
                        ...prev,
                        completedVideos: [...(prev.completedVideos || []), vidId],
                        progress: resp.data.progress
                    }));
                } catch (err) {
                    console.error('Video completion update failed:', err);
                    toast.error(`Progress Sync Error: ${err.response?.data?.message || err.message}`);
                }
            }
        }

        goToNextSection();
    };

    const handleApplyCertificate = async () => {
        setIsApplyingCertificate(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/certificates/apply', { courseId }, config);
            toast.success(data.message || 'Certificate application submitted! We will review it shortly.');
            setCertificateApplied(true);
        } catch (error) {
            const msg = error.response?.data?.message;
            if (msg === 'Certificate request already exists for this course') {
                toast.success('You have already applied for this certificate! We are processing it.');
                setCertificateApplied(true);
            } else {
                toast.error(msg || 'Failed to apply for certificate');
            }
        } finally {
            setIsApplyingCertificate(false);
        }
    };

    // Gather all valid video IDs that actually exist in this course
    const courseVideoIds = new Set();
    (course?.modules || []).forEach(m => {
        (m.videos || []).forEach(v => {
            const vid = v._id || v.id;
            if (vid) courseVideoIds.add(String(vid));
        });
    });

    const totalVideos = courseVideoIds.size;
    const completedVideosInCourse = (userProgress.completedVideos || []).filter(id => courseVideoIds.has(String(id)));
    const completedCount = completedVideosInCourse.length;

    let progressPercent = 0;
    if (totalVideos > 0) {
        progressPercent = Math.min(100, Math.max(0, Math.round((completedCount / totalVideos) * 100)));
    } else if (course?.modules?.length > 0) {
        progressPercent = Math.min(100, Math.max(0, Math.round(((userProgress.completedModules || 0) / course.modules.length) * 100)));
    } else {
        progressPercent = Math.min(100, Math.max(0, Math.round(Number(userProgress.progress || 0))));
    }

    const isVideoAccessible = (mIndex, vIndex) => {
        if (mIndex === 0 && vIndex === 0) return true;
        
        const video = course.modules[mIndex].videos[vIndex];
        if (userProgress.completedVideos?.includes(video._id)) return true;

        let prevVideoId = null;
        if (vIndex > 0) {
            prevVideoId = course.modules[mIndex].videos[vIndex - 1]._id;
        } else if (mIndex > 0) {
            const prevModuleVideos = course.modules[mIndex - 1].videos;
            if (prevModuleVideos && prevModuleVideos.length > 0) {
                prevVideoId = prevModuleVideos[prevModuleVideos.length - 1]._id;
            }
        }
        return prevVideoId ? userProgress.completedVideos?.includes(prevVideoId) : true;
    };
    
    const isQuizAccessible = (mIndex) => {
        const module = course.modules[mIndex];
        if (!module.videos || module.videos.length === 0) return true;
        return module.videos.every(v => userProgress.completedVideos?.includes(v._id));
    };

    // Discussion Hub is extracted so it can render full-width below the exercise/sidebar
    // row when the curriculum index is open (that row is too narrow otherwise), while
    // staying in its original spot alongside the sidebar when the index is hidden.
    const discussionHubBlock = (
        <div className="space-y-4">
            <h4 className="text-lg font-bold text-white font-poppins flex items-center">
                <MessageSquare size={18} className="mr-2 text-primary" /> Discussion Hub
            </h4>

            <GlassCard className="!p-4 bg-white/5 border-white/10">
                <form onSubmit={handleCommentSubmit} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your thought or question here..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none h-24"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCommentSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </GlassCard>

            <div className="space-y-4 pt-2">
                {discussions.length === 0 ? (
                    <p className="text-center text-white/30 text-sm py-4 italic">No discussions yet. Be the first to ask a question!</p>
                ) : (
                    discussions.map((msg) => (
                        <div key={msg._id} className="flex space-x-3 group">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                {msg.user_profile_image ? (
                                    <img src={msg.user_profile_image} alt="" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    msg.user_name[0]
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white">{msg.user_name}</span>
                                    <span className="text-[10px] text-white/40">{new Date(msg.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-white/70 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#050505] font-inter shadow-2xl relative">
            {/* Sidebar - Course Content */}
            <div className={`${isSidebarOpen ? 'w-full lg:w-96' : 'w-0 overflow-hidden'} transition-all duration-500 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-20 lg:sticky lg:top-0 lg:h-[calc(100vh-64px)]`}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/dashboard/my-courses')}
                            className="flex items-center text-slate-500 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest"
                        >
                            <ArrowLeft size={14} className="mr-2" /> Back
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                            title="Hide Curriculum"
                        >
                            <Layout size={16} />
                        </button>
                    </div>

                    <DashboardHeading
                        title={course.title}
                        className="!text-base font-semibold mb-4"
                    />
                    <div className="mt-6">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                            <span className="uppercase tracking-wider">Overall Completion</span>
                            <span className="text-primary">{Math.min(100, Math.max(0, progressPercent))}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Course Modules & Classes */}
                    <ul className="divide-y divide-white/5">
                        {course.modules.map((module, mIndex) => (
                            <li key={mIndex}>
                                <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] font-semibold text-slate-300 dark:text-[#B8C0FF] uppercase tracking-wider flex items-center">
                                        <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center mr-2 text-[9px] text-white">
                                            {mIndex + 1}
                                        </div>
                                        {module.title}
                                    </span>
                                </div>
                                <ul className="bg-black/20">
                                    {module.videos.map((video, vIndex) => {
                                        const accessible = isVideoAccessible(mIndex, vIndex);
                                        return (
                                        <li key={vIndex}>
                                            <button
                                                className={`w-full px-6 py-4 flex items-center justify-between transition-all group ${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz
                                                    ? 'bg-primary/5 text-primary border-l-4 border-primary'
                                                    : 'hover:bg-white/5 text-slate-400 border-l-4 border-transparent'
                                                    } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!accessible) return;
                                                    setCurrentModuleIndex(mIndex);
                                                    setCurrentVideoIndex(vIndex);
                                                    setShowExercise(false);
                                                    setShowQuiz(false);
                                                    setShowCourseCompletion(false);
                                                }}
                                            >
                                                <div className="flex items-center space-x-3 text-left">
                                                    <div className="relative">
                                                        {video.thumbnail ? (
                                                            <div className="w-12 h-8 rounded bg-black/40 overflow-hidden border border-white/10 shrink-0 relative flex items-center justify-center">
                                                                <img
                                                                    src={getMediaUrl(video.thumbnail)}
                                                                    alt=""
                                                                    className="w-full h-full object-cover opacity-60"
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                                <div className="absolute z-10 flex items-center justify-center">
                                                                    {!accessible ? (
                                                                        <Lock className="text-white/40 bg-black/50 rounded-full p-0.5" size={14} />
                                                                    ) : userProgress.completedVideos?.includes(video._id) ? (
                                                                        <CheckCircle className="text-emerald-500 bg-black/50 rounded-full" size={14} />
                                                                    ) : (
                                                                        <Play className={`${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz ? 'text-primary' : 'text-white/60'} bg-black/30 rounded-full`} size={14} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            !accessible ? (
                                                                <Lock className="text-slate-500/40" size={16} />
                                                            ) : userProgress.completedVideos?.includes(video._id) ? (
                                                                <CheckCircle className="text-emerald-500" size={16} />
                                                            ) : (video.contentType === 'document' || video.videoType === 'document') ? (
                                                                <FileText className={`${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz ? 'text-emerald-400' : 'text-emerald-400/50'}`} size={16} />
                                                            ) : (
                                                                <Play className={`${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz ? 'text-primary' : 'text-slate-500/40'}`} size={16} />
                                                            )
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-medium font-poppins line-clamp-1 ${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz ? 'text-primary' : 'text-slate-300'}`}>
                                                            {video.title}
                                                        </p>
                                                        {(video.duration || video.quiz?.questions?.length > 0 || video.exercises?.length > 0) && (
                                                            <p className="text-[9px] font-medium text-slate-500 flex items-center uppercase tracking-wider mt-1 gap-2">
                                                                {video.duration ? (
                                                                    <span className="flex items-center"><Clock size={8} className="mr-1" /> {video.duration}</span>
                                                                ) : null}
                                                                {(video.quiz?.questions?.length > 0 || video.exercises?.length > 0) && (
                                                                    <span className="text-blue-400 font-bold">• ASSESSMENT</span>
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${mIndex === currentModuleIndex && vIndex === currentVideoIndex && !showQuiz ? 'text-primary opacity-100' : 'text-slate-600'}`} />
                                            </button>
                                        </li>
                                    )})}

                                    {module.quiz && (() => {
                                        const quizAccessible = isQuizAccessible(mIndex);
                                        return (
                                        <li>
                                            <button
                                                className={`w-full px-6 py-4 flex items-center justify-between transition-all group ${mIndex === currentModuleIndex && showQuiz
                                                    ? 'bg-emerald-500/5 text-emerald-500 border-l-4 border-emerald-500'
                                                    : 'hover:bg-white/5 text-slate-400 border-l-4 border-transparent'
                                                    } ${!quizAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!quizAccessible) return;
                                                    setCurrentModuleIndex(mIndex);
                                                    setShowQuiz(true);
                                                    setQuizIndex(0);
                                                    setQuizAnswers({});
                                                    setQuizResult(null);
                                                    setShowCourseCompletion(false);
                                                }}
                                            >
                                                <div className="flex items-center space-x-3 text-left">
                                                    <div className="p-1 bg-emerald-500/10 rounded-lg">
                                                        {!quizAccessible ? (
                                                            <Lock className="text-slate-500/40" size={16} />
                                                        ) : (
                                                            <HelpCircle className={mIndex === currentModuleIndex && showQuiz ? 'text-emerald-500' : 'text-emerald-400/60'} size={16} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-semibold font-poppins line-clamp-1 ${mIndex === currentModuleIndex && showQuiz ? 'text-emerald-400' : 'text-slate-300'}`}>Assessment {mIndex + 1}</p>
                                                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Section Assessment</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    )})()}
                                </ul>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>

            {/* Main Content - Player */}
            <div className="flex-1 bg-transparent relative">
                {showCourseCompletion ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-white font-poppins mb-4">Course Completed!</h2>
                        <p className="text-slate-400 font-inter max-w-lg mx-auto mb-6">
                            Congratulations on reaching the end of {course.title}.
                        </p>

                        {Number(userProgress.progress || 0) < 100 && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 max-w-lg mx-auto text-sm font-bold">
                                ⚠️ Your overall progress is only {Number(userProgress.progress || 0)}%. You must complete all videos and quizzes to unlock your certificate.
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center w-full">
                            {certificateApplied ? (
                                <div className="flex items-center space-x-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-lg rounded-xl">
                                    <CheckCircle size={24} />
                                    <span>Certificate Applied!</span>
                                </div>
                            ) : (
                                <ModernButton
                                    onClick={handleApplyCertificate}
                                    disabled={isApplyingCertificate || Number(userProgress.progress || 0) < 100}
                                    className={`!px-8 !py-4 !text-lg shadow-xl ${Number(userProgress.progress || 0) < 100
                                            ? '!bg-slate-600 !text-slate-400 !shadow-none opacity-50 cursor-not-allowed'
                                            : '!bg-emerald-500 shadow-emerald-500/20'
                                        }`}
                                >
                                    {isApplyingCertificate
                                        ? 'Submitting...'
                                        : Number(userProgress.progress || 0) >= 100
                                            ? '🎓 Apply for Certificate'
                                            : `Complete Course to Apply (${Number(userProgress.progress || 0)}%)`
                                    }
                                </ModernButton>
                            )}
                            <button
                                onClick={() => navigate('/dashboard/my-courses')}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto animate-in fade-in duration-1000">
                        <div className="flex items-center justify-between bg-white/[0.02] p-4 lg:px-8 border-b border-white/5">
                            <div className="flex items-center space-x-4">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all group flex items-center shadow-xl shadow-primary/10"
                                        title="Show Curriculum"
                                    >
                                        <Layout size={18} />
                                    </button>
                                )}
                                <div className="space-y-0.5">
                                    <div className="inline-flex items-center space-x-1.5 text-primary font-medium text-[10px] uppercase tracking-wider">
                                        <span>Module {currentModuleIndex + 1}</span>
                                        <span className="text-slate-400 dark:text-slate-500">•</span>
                                        <span>{showQuiz ? 'Assessment' : `Lesson ${currentVideoIndex + 1}`}</span>
                                    </div>
                                    <h1 className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 font-poppins capitalize tracking-normal">{showQuiz ? `Assessment ${currentModuleIndex + 1}` : currentVideo.title}</h1>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="hidden lg:flex items-center px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary transition-all rounded-lg border border-white/10 font-bold text-[9px] uppercase tracking-widest"
                                    >
                                        <Layout size={12} className="mr-1.5" /> Hide Index
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-4 lg:p-6 space-y-4">
                            {showQuiz ? (
                                <div className="relative group w-full mx-auto max-w-[1600px]">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary-purple/20 rounded-3xl blur opacity-20 transition duration-1000"></div>
                                    <div className="relative aspect-video rounded-2xl bg-[#0a0a0a] shadow-2xl overflow-y-auto border border-white/10 flex flex-col justify-center p-6 sm:p-10 lg:p-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {quizResult ? (() => {
                                            const pct = Math.round((quizResult.score / quizResult.total) * 100);
                                            const passed = pct >= 40;
                                            let grade = 'F';
                                            if (pct >= 90) grade = 'A+';
                                            else if (pct >= 80) grade = 'A';
                                            else if (pct >= 70) grade = 'B+';
                                            else if (pct >= 60) grade = 'B';
                                            else if (pct >= 50) grade = 'C';
                                            else if (pct >= 40) grade = 'D';

                                            const gradeConfigs = {
                                                'A+': { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
                                                'A': { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
                                                'B+': { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
                                                'B': { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
                                                'C': { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
                                                'D': { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
                                                'F': { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
                                            };
                                            const currentGradeConfig = gradeConfigs[grade] || gradeConfigs['F'];

                                            return (
                                                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                                                    {/* ── Hero Status ── */}
                                                    <div className="text-center space-y-2 pt-2">
                                                        <div className="relative inline-flex items-center justify-center mx-auto mb-1">
                                                            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                                {passed
                                                                    ? <Award size={32} className="text-emerald-400" strokeWidth={1.5} />
                                                                    : <XCircle size={32} className="text-red-400" strokeWidth={1.5} />
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-0.5 ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {passed ? 'Assessment Passed' : 'Assessment Failed'}
                                                            </p>
                                                            <h2 className="text-2xl font-black text-white font-poppins">Quiz Results</h2>
                                                            <p className="text-slate-400 text-xs mt-0.5">{currentModule.title} • Section Assessment</p>
                                                        </div>
                                                    </div>

                                                    {/* ── Score Summary Cards (Exam Result Style) ── */}
                                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                                                            {/* Score */}
                                                            <div className="bg-[#0a0a0a] p-3.5 text-center space-y-1">
                                                                <p className="text-2xl font-black text-white font-poppins">
                                                                    {quizResult.score}
                                                                    <span className="text-base text-white/30 font-medium">/{quizResult.total}</span>
                                                                </p>
                                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Score</p>
                                                            </div>

                                                            {/* Percentage */}
                                                            <div className="bg-[#0a0a0a] p-3.5 text-center space-y-1">
                                                                <p className="text-2xl font-black text-primary font-poppins">
                                                                    {pct}
                                                                    <span className="text-base font-bold">%</span>
                                                                </p>
                                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Percentage</p>
                                                            </div>

                                                            {/* Grade */}
                                                            <div className="bg-[#0a0a0a] p-3.5 text-center space-y-1 flex flex-col items-center justify-center">
                                                                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 shadow-lg ${currentGradeConfig.bg} ${currentGradeConfig.border}`}>
                                                                    <span className={`text-lg font-black ${currentGradeConfig.color}`}>{grade}</span>
                                                                </div>
                                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Grade</p>
                                                            </div>

                                                            {/* Status */}
                                                            <div className="bg-[#0a0a0a] p-3.5 text-center space-y-1 flex flex-col items-center justify-center">
                                                                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${passed ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                                                                    {passed ? <CheckCircle size={14} fill="currentColor" className="opacity-70" /> : <XCircle size={14} fill="currentColor" className="opacity-70" />}
                                                                    <span className="font-black text-[11px] uppercase">{passed ? 'Passed' : 'Failed'}</span>
                                                                </div>
                                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Status</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── Answer Sheet / Breakdown (Exam Result Style) ── */}
                                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden text-left">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAnswerSheet(prev => !prev)}
                                                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-all"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <Eye size={16} className="text-primary" />
                                                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Answer Sheet Breakdown</h3>
                                                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/50">
                                                                    {currentModule.quiz.questions.length} Questions
                                                                </span>
                                                            </div>
                                                            <div className={`p-1 rounded-lg transition-all ${showAnswerSheet ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/40'}`}>
                                                                {showAnswerSheet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                            </div>
                                                        </button>

                                                        {showAnswerSheet && (
                                                            <div className="p-4 space-y-3 border-t border-white/5 max-h-96 overflow-y-auto">
                                                                {currentModule.quiz.questions.map((q, idx) => {
                                                                    const userAns = quizAnswers[idx];
                                                                    const correctAns = q.options[q.correctIndex];
                                                                    const isCorrect = userAns === correctAns;

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`p-3.5 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}
                                                                        >
                                                                            <div className="flex items-start justify-between mb-2 gap-2">
                                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[10px] font-black">
                                                                                        Q{idx + 1}
                                                                                    </span>
                                                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className={`flex-shrink-0 p-1 rounded-md ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                                    {isCorrect ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                                                                </div>
                                                                            </div>

                                                                            <p className="text-white text-xs font-semibold mb-2.5 leading-relaxed font-poppins">
                                                                                {q.question}
                                                                            </p>

                                                                            <div className="space-y-1 text-xs">
                                                                                <div className="flex items-start gap-2">
                                                                                    <span className="text-white/40 font-bold w-24 shrink-0 text-[11px]">Your Answer:</span>
                                                                                    <span className={`font-bold text-[11px] ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                                        {userAns || 'Not answered'}
                                                                                    </span>
                                                                                </div>
                                                                                {!isCorrect && (
                                                                                    <div className="flex items-start gap-2">
                                                                                        <span className="text-white/40 font-bold w-24 shrink-0 text-[11px]">Correct Answer:</span>
                                                                                        <span className="font-bold text-emerald-400 text-[11px]">
                                                                                            {correctAns || 'N/A'}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {q.explanation && (
                                                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                                                        <p className="text-[9px] text-primary/70 font-black uppercase tracking-widest mb-0.5">Explanation</p>
                                                                                        <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg text-white/70 text-[11px] leading-relaxed">
                                                                                            {q.explanation}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ── Action Buttons ── */}
                                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setQuizIndex(0);
                                                                setQuizAnswers({});
                                                                setQuizResult(null);
                                                            }}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-white/10 transition-all text-xs"
                                                        >
                                                            <RotateCcw size={14} /> Retake Assessment
                                                        </button>

                                                        <ModernButton
                                                            onClick={handleNext}
                                                            className="!px-8 !py-2.5 !text-xs shadow-lg shadow-primary/20"
                                                        >
                                                            {currentModuleIndex < course.modules.length - 1 ? 'Continue to Next Section' : 'Finish Course'}
                                                        </ModernButton>
                                                    </div>
                                                </div>
                                            );
                                        })() : (
                                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                                <div className="flex items-center justify-between mb-3.5">
                                                    <div className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                                        Question {quizIndex + 1} of {currentModule.quiz.questions.length}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {currentModule.quiz.questions.map((_, i) => (
                                                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === quizIndex ? 'w-5 bg-emerald-500' : 'w-2.5 bg-white/10'}`}></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3.5 font-poppins leading-snug">
                                                    {currentModule.quiz.questions[quizIndex].question}
                                                </h3>

                                                <div className="space-y-2 mb-4">
                                                    {currentModule.quiz.questions[quizIndex].options.map((opt, i) => {
                                                        const isSelected = quizAnswers[quizIndex] === opt;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => setQuizAnswers(prev => ({ ...prev, [quizIndex]: opt }))}
                                                                className={`w-full group relative flex items-center px-3.5 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 text-left font-medium text-xs sm:text-sm ${isSelected
                                                                    ? 'border-emerald-500/70 bg-emerald-500/10 text-slate-900 dark:text-white shadow-md shadow-emerald-500/10 font-bold'
                                                                    : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'}`}
                                                            >
                                                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center mr-3 shrink-0 transition-all font-mono text-[11px] font-bold ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white group-hover:border-slate-400 dark:group-hover:border-white/30'}`}>
                                                                    <span>{String.fromCharCode(65 + i)}</span>
                                                                </div>
                                                                <span className="flex-1 leading-snug">{opt}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex justify-between items-center bg-black/5 dark:bg-white/[0.02] px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                                                    <button
                                                        disabled={quizIndex === 0}
                                                        onClick={() => setQuizIndex(prev => prev - 1)}
                                                        className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white disabled:opacity-0 transition-all"
                                                    >
                                                        Previous
                                                    </button>

                                                    {quizIndex === currentModule.quiz.questions.length - 1 ? (
                                                        <ModernButton
                                                            disabled={!quizAnswers[quizIndex]}
                                                            onClick={() => {
                                                                const score = currentModule.quiz.questions.reduce((acc, q, i) => {
                                                                    return acc + (quizAnswers[i] === q.options[q.correctIndex] ? 1 : 0);
                                                                }, 0);
                                                                setQuizResult({ score, total: currentModule.quiz.questions.length });
                                                            }}
                                                            className="!px-5 !py-1.5 !text-xs shadow-md shadow-emerald-500/20 !bg-emerald-500"
                                                        >
                                                            Finish Assessment
                                                        </ModernButton>
                                                    ) : (
                                                        <ModernButton
                                                            disabled={!quizAnswers[quizIndex]}
                                                            onClick={() => setQuizIndex(prev => prev + 1)}
                                                            className="!px-5 !py-1.5 !text-xs"
                                                        >
                                                            Next Question
                                                        </ModernButton>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group w-full mx-auto max-w-[1600px]">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary-purple/20 rounded-3xl blur opacity-20 transition duration-1000"></div>
                                    <div className="relative aspect-video rounded-2xl bg-black shadow-2xl overflow-hidden border border-white/10">
                                        {/* Render based on video type or document contentType */}
                                        {(currentVideo.videoType === 'document' || currentVideo.contentType === 'document') ? (
                                            <div className="w-full h-full bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center">
                                                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/5">
                                                    <FileText size={40} className="text-emerald-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{currentVideo.title}</h3>
                                                <p className="text-slate-400 mb-6 max-w-md text-xs leading-relaxed">
                                                    This lesson is a document learning resource. Read or download the material below, then complete the class assessment when ready.
                                                </p>
                                                <div className="flex flex-wrap items-center justify-center gap-3">
                                                    <ModernButton
                                                        onClick={() => window.open(getMediaUrl(currentVideo.url), '_blank')}
                                                        className="!bg-emerald-500 hover:!bg-emerald-400"
                                                    >
                                                        View Document
                                                    </ModernButton>
                                                    <a href={getMediaUrl(currentVideo.url)} download className="flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all text-xs">
                                                        <Download size={16} className="mr-2" /> Download
                                                    </a>
                                                    {currentExercise && (
                                                        <ModernButton
                                                            onClick={() => setShowExercise(true)}
                                                            className="!bg-blue-600 hover:!bg-blue-500"
                                                        >
                                                            <CheckSquare size={16} className="mr-1.5 inline" /> Attend Class Assessment
                                                        </ModernButton>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (currentVideo.videoType === 'zoom-recording' || currentVideo.videoType === 'live-recording') && (currentVideo.zoomRecording?.playUrl || currentVideo.recordingUrl) ? (
                                            <MeetingRecordingPlayer
                                                recordingUrl={currentVideo.recordingUrl || currentVideo.zoomRecording?.playUrl}
                                                sessionId={currentVideo.zoomSession || currentVideo.sessionId}
                                                title={currentVideo.title}
                                                onEnded={handleVideoEnd}
                                                onError={(error) => console.error('Recording playback error:', error)}
                                            />
                                        ) : (currentVideo.url && (currentVideo.url.endsWith('.mp4') || currentVideo.url.endsWith('.webm') || currentVideo.url.endsWith('.ogg') || currentVideo.url.endsWith('.mov') || currentVideo.url.includes('/mp4') || currentVideo.url.includes('.mp4?') || currentVideo.url.includes('/uploads/'))) ? (
                                            <video
                                                src={getMediaUrl(currentVideo.url)}
                                                poster={currentVideo.thumbnail ? getMediaUrl(currentVideo.thumbnail) : undefined}
                                                controls
                                                className="w-full h-full"
                                                onEnded={handleVideoEnd}
                                                onError={(e) => {
                                                    console.error('Video playback error:', e);
                                                    toast.error('Unable to load video file. The file may be missing from the server.');
                                                }}
                                                controlsList="nodownload"
                                            />
                                        ) : (
                                            <CustomYoutubePlayer
                                                url={currentVideo.url}
                                                title={currentVideo.title}
                                                thumbnail={currentVideo.thumbnail}
                                                onEnded={handleVideoEnd}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-8 w-full mx-auto max-w-6xl">
                                <div className="flex-1 space-y-8">
                                    {showExercise && currentExercise && (
                                        <GlassCard className="animate-in slide-in-from-bottom-6 duration-700 bg-black/40 shadow-xl border-emerald-500/20">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                                    <Unlock size={20} />
                                                </div>
                                                <h3 className="text-xl font-extrabold text-white font-poppins tracking-tight">Knowledge Check</h3>
                                            </div>
                                            <p className="text-[#B8C0FF] font-bold font-inter mb-6">{currentExercise.question}</p>

                                            <div className="space-y-3 mb-8">
                                                {currentExercise.options.map((opt, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedAnswer(opt)}
                                                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-bold ${selectedAnswer === opt
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-white/10 hover:border-white/20 text-white/70'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>

                                            {exerciseFeedback && (
                                                <div className={`p-4 rounded-xl mb-6 font-bold text-sm animate-in fade-in duration-300 ${exerciseFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {exerciseFeedback.message}
                                                </div>
                                            )}

                                            <ModernButton onClick={submitAnswer} className="w-full !py-4 font-bold tracking-wide">
                                                Validate Answer
                                            </ModernButton>
                                        </GlassCard>
                                    )}

                                    {/* Discussion Hub renders here only when the curriculum index sidebar is
                                hidden; when it's open, the row is too narrow so it moves below (see
                                after this flex row) and spans full width instead. */}
                                    {!isSidebarOpen && discussionHubBlock}
                                </div>

                                {/* Instructor Card - full width below video, matching player width */}
                                <div className="w-full mx-auto max-w-6xl">
                                    <GlassCard className="bg-primary/5 border-primary/10 !py-2 !px-3.5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                                                {(course.instructorName || course.instructor?.name || 'I')[0]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline space-x-2">
                                                    <p className="font-bold text-white font-poppins text-xs">
                                                        {course.instructorName || course.instructor?.name || 'Academic facilitator'}
                                                    </p>
                                                    {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) &&
                                                        (course.universityName || course.instructor?.profile?.universityName || course.instructor?.name) !== (course.instructorName || course.instructor?.name) && (
                                                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider truncate">
                                                                • {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                                            </span>
                                                        )}
                                                </div>
                                                <p className="text-[10px] text-[#B8C0FF]/80 font-inter leading-snug mt-0.5 line-clamp-1">
                                                    {course.instructor?.profile?.bio || 'Experienced academic facilitator dedicated to your success in this course track.'}
                                                </p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            </div>

                            {/* Curriculum index is open - row above is too narrow for the discussion
                        box, so it takes the full width below instead. */}
                            {isSidebarOpen && (
                                <div className="w-full">
                                    {discussionHubBlock}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursePlayer;
