import React, { useState, useEffect, useRef } from 'react';
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
    RotateCcw,
    FileCheck,
    ArrowRight,
    Building2,
    Target,
    Lightbulb,
    Heart,
    CornerDownRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
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
    // Which top-level comment currently has its inline reply box open, and its draft text.
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [likeInFlight, setLikeInFlight] = useState({});
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState({ completedVideos: [], completedExercises: [], progress: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // Which modules are expanded in the curriculum list - only tracks explicit user
    // toggles; a module with no entry here defaults open only if it's the active one.
    const [expandedModules, setExpandedModules] = useState({});
    const [liveSessions, setLiveSessions] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    // Distinguishes which quiz the shared quiz UI is currently showing - a section-level
    // assessment (module.quiz) or a single lesson's own assessment (video.quiz) - since
    // both are rendered by the same block below, keyed off `activeQuiz`.
    const [quizSource, setQuizSource] = useState('module');
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [showAnswerSheet, setShowAnswerSheet] = useState(true);
    const [showCourseCompletion, setShowCourseCompletion] = useState(false);
    const [isApplyingCertificate, setIsApplyingCertificate] = useState(false);
    const [certificateApplied, setCertificateApplied] = useState(false);
    const [autoPlayVideo, setAutoPlayVideo] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const module = course?.modules?.[currentModuleIndex];
        if (module && (!module.videos || module.videos.length === 0) && module.quiz && !showQuiz) {
            setQuizSource('module');
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

    useEffect(() => {
        if (autoPlayVideo && videoRef.current) {
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch((e) => console.log('Autoplay error:', e));
                    }
                });
            }
        }
    }, [autoPlayVideo, currentModuleIndex, currentVideoIndex, showQuiz]);

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

    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        if (!replyText.trim() || isSubmittingReply) return;

        const currentModule = course.modules[currentModuleIndex];
        const currentVideo = currentModule.videos[currentVideoIndex];
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        setIsSubmittingReply(true);
        try {
            const { data } = await axios.post('/api/discussions', {
                courseId,
                videoId: currentVideo._id,
                content: replyText,
                parentId
            }, config);

            setDiscussions(prev => [data, ...prev]);
            setReplyText('');
            setReplyingToId(null);
        } catch (err) {
            console.error('Failed to post reply', err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleToggleLike = async (discussionId) => {
        if (likeInFlight[discussionId]) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const userId = userInfo.id || userInfo._id;
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        setLikeInFlight(prev => ({ ...prev, [discussionId]: true }));
        // Optimistic update so the like feels instant.
        setDiscussions(prev => prev.map(d => {
            if (d._id !== discussionId) return d;
            const likedBy = Array.isArray(d.liked_by) ? d.liked_by : [];
            const updated = likedBy.includes(userId) ? likedBy.filter(uid => uid !== userId) : [...likedBy, userId];
            return { ...d, liked_by: updated };
        }));

        try {
            const { data } = await axios.put(`/api/discussions/${discussionId}/like`, {}, config);
            setDiscussions(prev => prev.map(d => d._id === discussionId ? { ...d, liked_by: data.likedBy } : d));
        } catch (err) {
            console.error('Failed to toggle like', err);
        } finally {
            setLikeInFlight(prev => ({ ...prev, [discussionId]: false }));
        }
    };

    if (!course) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const currentModule = course.modules?.[currentModuleIndex];
    const hasVideos = currentModule?.videos && currentModule.videos.length > 0;
    const hasQuiz = (currentModule?.quiz?.questions?.length || 0) > 0;

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
    // A lesson's own multi-question assessment (video.quiz), when it has one - rendered
    // through the same full quiz UI as the section-level assessment (see activeQuiz below).
    const hasLessonQuiz = currentVideo?.quiz?.questions?.length > 0;
    // Legacy single-question exercise format - only used as a fallback for lessons that
    // predate the quiz.questions structure and only ever set a bare `exercises` array.
    const currentExercise = !hasLessonQuiz ? (currentVideo?.exercises?.[0] || null) : null;
    // The shared quiz-taking UI below reads from whichever quiz is currently active -
    // the section's module.quiz, or the single lesson's own video.quiz.
    const activeQuiz = quizSource === 'lesson' ? currentVideo?.quiz : currentModule?.quiz;

    const openLessonQuiz = () => {
        setQuizSource('lesson');
        setQuizIndex(0);
        setQuizAnswers({});
        setQuizResult(null);
        setShowQuiz(true);
    };

    const handleDownloadFile = async (e, mediaUrl, filename) => {
        if (!mediaUrl) return;
        try {
            e.preventDefault();
            const fullUrl = getMediaUrl(mediaUrl);
            const res = await fetch(fullUrl);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            const ext = fullUrl.split('.').pop()?.split('?')[0] || 'pdf';
            link.download = filename ? `${filename.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}` : `document.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (_) {
            window.open(getMediaUrl(mediaUrl), '_blank');
        }
    };

    const handleVideoEnd = () => {
        if (hasLessonQuiz && !userProgress.completedExercises?.some(ex => ex.video === currentVideo._id)) {
            openLessonQuiz();
        } else if (currentExercise && !userProgress.completedExercises?.some(ex => ex.video === currentVideo._id)) {
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
            if (mod.quiz && (mod.quiz.questions?.length || 0) > 0) {
                setCurrentModuleIndex(i);
                setCurrentVideoIndex(0);
                setQuizSource('module');
                setQuizIndex(0);
                setQuizAnswers({});
                setQuizResult(null);
                setShowQuiz(true);
                return;
            }
        }
        setShowCourseCompletion(true);
    };

    const goToNextSection = () => {
        // Finishing a lesson's own assessment advances like finishing that lesson's
        // video would - only a section-level (module) assessment jumps to the next module.
        if (showQuiz && quizSource === 'module') {
            advanceToNextValidContent(currentModuleIndex + 1);
            return;
        }

        setShowQuiz(false);

        if (currentModule && currentModule.videos && currentVideoIndex < currentModule.videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        } else if (currentModule && (currentModule.quiz?.questions?.length || 0) > 0) {
            setQuizSource('module');
            setQuizIndex(0);
            setQuizAnswers({});
            setQuizResult(null);
            setShowQuiz(true);
        } else {
            advanceToNextValidContent(currentModuleIndex + 1);
        }
    };

    const handleRewatchPreviousSession = () => {
        setQuizIndex(0);
        setQuizAnswers({});
        setQuizResult(null);
        setShowQuiz(false);
        setShowExercise(false);
        setShowCourseCompletion(false);

        let targetModIndex = currentModuleIndex;
        let targetVidIndex = currentVideoIndex;

        if (quizSource === 'lesson') {
            targetModIndex = currentModuleIndex;
            targetVidIndex = currentVideoIndex;
        } else {
            const currMod = course?.modules?.[currentModuleIndex];
            if (currMod?.videos && currMod.videos.length > 0) {
                targetVidIndex = (currentVideoIndex >= 0 && currentVideoIndex < currMod.videos.length)
                    ? currentVideoIndex
                    : currMod.videos.length - 1;
            } else {
                for (let i = currentModuleIndex - 1; i >= 0; i--) {
                    const prevMod = course?.modules?.[i];
                    if (prevMod?.videos && prevMod.videos.length > 0) {
                        targetModIndex = i;
                        targetVidIndex = prevMod.videos.length - 1;
                        break;
                    }
                }
            }
        }

        setCurrentModuleIndex(targetModIndex);
        setCurrentVideoIndex(targetVidIndex);
        setAutoPlayVideo(true);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // A lesson-quiz finish (like a plain video finish) marks that lesson's video
        // complete; only a section-level (module) quiz finish skips this.
        if (!showQuiz || quizSource === 'lesson') {
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
                        completedExercises: (showQuiz && quizSource === 'lesson' && quizResult)
                            ? [...(prev.completedExercises || []), { video: vidId, score: Math.round((quizResult.score / quizResult.total) * 100) }]
                            : prev.completedExercises,
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
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (userInfo.role === 'admin') return true;
        } catch (_) {}

        if (mIndex === 0 && vIndex === 0) return true;
        
        const video = course.modules[mIndex]?.videos?.[vIndex];
        if (!video) return false;
        if (userProgress.completedVideos?.includes(video._id)) return true;

        let prevVideoId = null;
        if (vIndex > 0) {
            prevVideoId = course.modules[mIndex]?.videos?.[vIndex - 1]?._id;
        } else if (mIndex > 0) {
            const prevModuleVideos = course.modules[mIndex - 1]?.videos;
            if (prevModuleVideos && prevModuleVideos.length > 0) {
                prevVideoId = prevModuleVideos[prevModuleVideos.length - 1]?._id;
            }
        }
        return prevVideoId ? userProgress.completedVideos?.includes(prevVideoId) : true;
    };
    
    const isQuizAccessible = (mIndex) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (userInfo.role === 'admin') return true;
        } catch (_) {}

        const module = course.modules[mIndex];
        if (!module.videos || module.videos.length === 0) return true;
        return module.videos.every(v => userProgress.completedVideos?.includes(v._id));
    };

    // Discussion Hub is extracted so it can render full-width below the exercise/sidebar
    // row when the curriculum index is open (that row is too narrow otherwise), while
    // staying in its original spot alongside the sidebar when the index is hidden.
    const discussionHubBlock = (
        <div className="space-y-3">
            <div className="flex items-center gap-2.5 bg-primary/5 dark:bg-white/[0.03] border border-primary/10 dark:border-white/10 rounded-lg px-3.5 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-primary dark:text-purple-300 flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare size={14} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Module {currentModuleIndex + 1} • Discussion Hub
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {showQuiz ? (quizSource === 'lesson' ? currentVideo.title : `Assessment ${currentModuleIndex + 1}`) : currentVideo.title}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-2 bg-primary/5 dark:bg-white/[0.03] border border-primary/10 dark:border-white/10 rounded-lg px-3.5 py-2.5">
                <Lightbulb size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    Discuss with your peers, ask questions, and share your thoughts about this topic.
                </p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg p-3.5">
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 shadow-sm">
                        {(() => {
                            try {
                                const name = JSON.parse(localStorage.getItem('userInfo'))?.name;
                                return name ? name[0].toUpperCase() : 'U';
                            } catch {
                                return 'U';
                            }
                        })()}
                    </div>
                    <div className="flex-1 relative min-w-0">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your thought or question here..."
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 pr-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-primary/50 transition-all resize-none h-16 block"
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
                            title="Send comment"
                            className="absolute bottom-2 right-2 w-8 h-8 !min-h-0 !min-w-0 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-light transition-all shadow-sm disabled:opacity-35 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
                        >
                            <Send size={16} strokeWidth={2.2} className="translate-x-[1px]" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-2.5">
                {discussions.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-4 italic">No discussions yet. Be the first to ask a question!</p>
                ) : (
                    (() => {
                        const currentUserId = (() => {
                            try {
                                const u = JSON.parse(localStorage.getItem('userInfo'));
                                return u?.id || u?._id;
                            } catch { return null; }
                        })();
                        const topLevel = discussions.filter(d => !d.parent_id);
                        const repliesOf = (id) => discussions
                            .filter(d => d.parent_id === id)
                            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                        const CommentRow = ({ msg, isReply }) => {
                            const likedBy = Array.isArray(msg.liked_by) ? msg.liked_by : [];
                            const isLiked = currentUserId && likedBy.includes(currentUserId);
                            return (
                                <div className={`flex gap-2.5 ${isReply ? '' : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg p-3'}`}>
                                    <div className={`${isReply ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-purple-300 flex-shrink-0 flex items-center justify-center font-bold`}>
                                        {msg.user_profile_image ? (
                                            <img src={msg.user_profile_image} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            msg.user_name[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{msg.user_name}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 break-words">
                                            {msg.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleLike(msg._id)}
                                                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${isLiked ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
                                            >
                                                <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                                                {likedBy.length > 0 ? likedBy.length : 'Like'}
                                            </button>
                                            {!isReply && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setReplyingToId(replyingToId === msg._id ? null : msg._id);
                                                        setReplyText('');
                                                    }}
                                                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-primary transition-colors"
                                                >
                                                    <CornerDownRight size={12} />
                                                    Reply
                                                </button>
                                            )}
                                        </div>

                                        {!isReply && replyingToId === msg._id && (
                                            <form onSubmit={(e) => handleReplySubmit(e, msg._id)} className="flex items-center gap-2 mt-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[11px] focus:outline-none focus:border-primary/50 transition-all"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!replyText.trim() || isSubmittingReply}
                                                    title="Send reply"
                                                    className="w-7 h-7 !min-h-0 !min-w-0 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                                >
                                                    <Send size={14} strokeWidth={2.2} className="translate-x-[0.5px]" />
                                                </button>
                                            </form>
                                        )}

                                        {!isReply && repliesOf(msg._id).length > 0 && (
                                            <div className="mt-2.5 space-y-2.5 pl-3 border-l-2 border-slate-100 dark:border-white/10">
                                                {repliesOf(msg._id).map((reply) => (
                                                    <CommentRow key={reply._id} msg={reply} isReply />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        };

                        return topLevel.map((msg) => <CommentRow key={msg._id} msg={msg} isReply={false} />);
                    })()
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-transparent font-inter relative w-full max-w-full overflow-x-hidden">
            {/* Sidebar - Course Content. Below lg, this stacks BELOW the video/lesson content
                (order-2) instead of pushing it down the page, since on phone/tablet widths the
                curriculum list can be long; at lg+ it returns to its natural position beside the
                player (order-1). Width is narrower at lg and widens at xl so it doesn't crowd the
                video out in the 1024-1280px zone, where the persistent dashboard nav sidebar is
                also taking up space. */}
            <div className={`${isSidebarOpen ? 'w-full lg:w-72 xl:w-80' : 'w-0 overflow-hidden'} order-2 lg:order-1 shrink-0 transition-all duration-500 bg-white dark:bg-[#070114]/95 dark:backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col z-20`}>
                <div className="px-5 pt-2 pb-5 border-b-2 border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/dashboard/my-courses')}
                            className="flex items-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-semibold text-xs"
                        >
                            <ArrowLeft size={14} className="mr-1.5" /> Back to Courses
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                            title="Hide Curriculum"
                        >
                            <Layout size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                        </div>
                        <h1 className="!text-xs !font-bold !text-slate-900 dark:!text-white !leading-snug !tracking-normal !font-inter line-clamp-2">{course.title}</h1>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>{Math.min(100, Math.max(0, progressPercent))}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-3">
                    <p className="px-5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Course Content</p>
                    <ul className="px-3">
                        {course.modules.map((module, mIndex) => {
                            const isExpanded = expandedModules[mIndex] !== undefined ? expandedModules[mIndex] : mIndex === currentModuleIndex;
                            const isLast = mIndex === course.modules.length - 1;
                            return (
                            <li key={mIndex} className="pt-1 pb-2">
                                <button
                                    onClick={() => setExpandedModules(prev => ({ ...prev, [mIndex]: !isExpanded }))}
                                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                        Module {mIndex + 1} <span className="text-slate-300 dark:text-white/20">•</span> <span className="font-semibold text-slate-600 dark:text-slate-300">{module.title}</span>
                                    </span>
                                    <ChevronDown size={13} className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && (
                                <ul className="mt-0.5 space-y-0.5">
                                    {module.videos.map((video, vIndex) => {
                                        const accessible = isVideoAccessible(mIndex, vIndex);
                                        const isActive = mIndex === currentModuleIndex && vIndex === currentVideoIndex && (!showQuiz || quizSource === 'lesson');
                                        const isDone = userProgress.completedVideos?.includes(video._id);
                                        const hasAssessment = video.quiz?.questions?.length > 0 || video.exercises?.length > 0;
                                        const isStudyMaterial = video.contentType === 'document' || 
                                                                video.videoType === 'document' || 
                                                                video.type === 'document' || 
                                                                video.type === 'pdf' || 
                                                                video.type === 'note' || 
                                                                Boolean(video.title && /study\s*material|notes?|reading|document/i.test(video.title));
                                        return (
                                        <li key={vIndex}>
                                            <button
                                                style={{
                                                    borderRadius: '14px',
                                                }}
                                                className={`w-full pl-8 pr-2.5 py-2.5 flex items-center justify-between transition-all group border-2 ${isActive
                                                    ? 'border-[#4C1D95] dark:border-primary bg-[#4C1D95]/[0.08] dark:bg-primary/20 text-[#4C1D95] dark:text-purple-300'
                                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                                                    } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!accessible) return;
                                                    setCurrentModuleIndex(mIndex);
                                                    setCurrentVideoIndex(vIndex);
                                                    setShowExercise(false);
                                                    setSelectedAnswer('');
                                                    setExerciseFeedback(null);
                                                    setShowQuiz(false);
                                                    setShowCourseCompletion(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-2.5 text-left min-w-0">
                                                    {isStudyMaterial ? (
                                                        !accessible ? (
                                                            <Lock size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                                        ) : isDone ? (
                                                            <div className="relative shrink-0 flex items-center justify-center">
                                                                <FileText size={16} className="text-emerald-500" />
                                                                <CheckCircle size={8} className="text-emerald-600 absolute -bottom-0.5 -right-1 bg-white dark:bg-[#070114] rounded-full" />
                                                            </div>
                                                        ) : isActive ? (
                                                            <FileText size={16} className="text-[#4C1D95] dark:text-purple-300 shrink-0" />
                                                        ) : (
                                                            <FileText size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                                        )
                                                    ) : (
                                                        !accessible ? (
                                                            <Lock size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                                        ) : isDone ? (
                                                            <CheckCircle size={16} className="text-emerald-500 shrink-0" fill="currentColor" fillOpacity={0.15} />
                                                        ) : isActive ? (
                                                            <div className="w-4 h-4 rounded-full border-[3px] border-[#4C1D95] dark:border-primary shrink-0" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-white/20 shrink-0" />
                                                        )
                                                    )}
                                                    <span className={`text-xs font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                                                        {video.title}
                                                        {hasAssessment && (
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!accessible) return;
                                                                    setCurrentModuleIndex(mIndex);
                                                                    setCurrentVideoIndex(vIndex);
                                                                    setShowExercise(false);
                                                                    setSelectedAnswer('');
                                                                    setExerciseFeedback(null);
                                                                    setShowCourseCompletion(false);
                                                                    if (video.quiz?.questions?.length > 0) {
                                                                        setQuizSource('lesson');
                                                                        setQuizIndex(0);
                                                                        setQuizAnswers({});
                                                                        setQuizResult(null);
                                                                        setShowQuiz(true);
                                                                    } else {
                                                                        setShowQuiz(false);
                                                                        setShowExercise(true);
                                                                    }
                                                                }}
                                                                className="text-slate-400 font-normal hover:text-primary hover:underline transition-colors cursor-pointer"
                                                            >
                                                                {' '}• Assessment
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    )})}

                                    {module.quiz && (module.quiz.questions?.length > 0) && (() => {
                                        const quizAccessible = isQuizAccessible(mIndex);
                                        const isModuleQuizActive = mIndex === currentModuleIndex && showQuiz && quizSource === 'module';
                                        return (
                                        <li>
                                            <button
                                                style={{
                                                    borderRadius: '14px',
                                                }}
                                                className={`w-full pl-8 pr-2.5 py-2.5 flex items-center gap-2.5 transition-all border-2 ${isModuleQuizActive
                                                    ? 'border-[#4C1D95] dark:border-primary bg-[#4C1D95]/[0.08] dark:bg-primary/20 text-[#4C1D95] dark:text-purple-300'
                                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                                                    } ${!quizAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!quizAccessible) return;
                                                    setCurrentModuleIndex(mIndex);
                                                    setQuizSource('module');
                                                    setShowQuiz(true);
                                                    setQuizIndex(0);
                                                    setQuizAnswers({});
                                                    setQuizResult(null);
                                                    setShowCourseCompletion(false);
                                                }}
                                            >
                                                {!quizAccessible ? (
                                                    <Lock size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                                ) : (
                                                    <FileCheck size={16} className={`shrink-0 ${isModuleQuizActive ? 'text-[#4C1D95] dark:text-purple-300' : 'text-slate-400 dark:text-slate-500'}`} />
                                                )}
                                                <span className={`text-xs font-medium truncate ${isModuleQuizActive ? 'font-bold' : ''}`}>Module {mIndex + 1} • Final Assessment</span>
                                            </button>
                                        </li>
                                    )})()}
                                </ul>
                                )}
                                {!isLast && <div className="h-px bg-slate-200 dark:bg-white/10 mx-2 mt-2" />}
                            </li>
                        )})}
                    </ul>
                </div>
            </div>

            {/* Main Content - Player. order-1 on mobile/tablet so the video/lesson shows first,
                above the curriculum list (see sidebar comment above). */}
            <div className="flex-1 order-1 lg:order-2 bg-transparent relative min-w-0 w-full max-w-full overflow-x-hidden">
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
                    <div className="mx-auto animate-in fade-in duration-1000 px-2.5 sm:px-4 lg:px-6 pt-1 pb-4 lg:pb-6 space-y-2 w-full max-w-full box-border">
                        <div className="flex items-center justify-between gap-3 bg-primary/5 dark:bg-white/[0.03] border border-primary/10 dark:border-white/10 rounded-lg px-3.5 py-2.5 sm:px-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-1.5 bg-white dark:bg-white/10 text-primary dark:text-purple-300 border border-primary/20 dark:border-white/15 rounded-lg hover:bg-primary hover:text-white transition-all flex items-center shadow-sm shrink-0"
                                        title="Show Curriculum"
                                    >
                                        <Layout size={14} />
                                    </button>
                                )}
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-primary dark:text-purple-300 flex items-center justify-center shrink-0 shadow-sm">
                                    {showQuiz ? <FileCheck size={14} /> : <Play size={14} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        Module {currentModuleIndex + 1} • {showQuiz ? (quizSource === 'lesson' ? 'Assessment' : 'Section Assessment') : `Lesson ${currentVideoIndex + 1}`}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                        {showQuiz
                                            ? (quizSource === 'lesson' ? `${currentVideo.title} • ${currentModule.title}` : `Assessment ${currentModuleIndex + 1} • ${currentModule.title}`)
                                            : currentVideo.title}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {showQuiz && !quizResult && (activeQuiz?.questions?.length > 0) && (
                                    <div className="hidden sm:flex items-center gap-2.5">
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Question {quizIndex + 1} of {activeQuiz.questions.length}</span>
                                        <div className="flex items-center">
                                            {activeQuiz.questions.map((_, i) => (
                                                <React.Fragment key={i}>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${i <= quizIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-white/20'}`} />
                                                    {i < activeQuiz.questions.length - 1 && (
                                                        <div className={`w-2.5 h-px shrink-0 transition-colors ${i < quizIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-white/20'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="hidden lg:flex items-center px-2.5 py-1.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-all rounded-lg border border-slate-200 dark:border-white/10 font-semibold text-[11px] shadow-sm"
                                    >
                                        <Layout size={12} className="mr-1" /> Hide Index
                                    </button>
                                )}
                            </div>
                        </div>

                        {showQuiz && !quizResult && (activeQuiz?.questions?.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                    <FileCheck size={14} className="text-primary shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{activeQuiz.questions.length} Questions</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Target size={14} className="text-primary shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Passing Score 40%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <RotateCcw size={14} className="text-primary shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Unlimited Attempts</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {showQuiz ? (
                                <div className="w-full mx-auto max-w-[1600px]">
                                    {(!activeQuiz?.questions || activeQuiz.questions.length === 0) ? (
                                        <div className="relative rounded-lg bg-white dark:bg-white/[0.03] shadow-sm border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center py-12 px-6 text-center">
                                            <FileCheck size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
                                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">No Assessment Questions Available</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm">This section does not have any quiz questions configured. You can safely proceed to the next module.</p>
                                            <ModernButton
                                                onClick={() => {
                                                    setShowQuiz(false);
                                                    advanceToNextValidContent(currentModuleIndex + 1);
                                                }}
                                                className="!px-6 !py-2.5 !text-xs !font-bold"
                                            >
                                                Continue to Next Section
                                            </ModernButton>
                                        </div>
                                    ) : (
                                    <div className="relative rounded-lg bg-white dark:bg-white/[0.03] shadow-sm overflow-y-auto border border-slate-200 dark:border-white/10 flex flex-col justify-start py-4 sm:py-5 px-4 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                                                'A+': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/15', border: 'border-emerald-300 dark:border-emerald-500/30' },
                                                'A': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/15', border: 'border-emerald-300 dark:border-emerald-500/30' },
                                                'B+': { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/15', border: 'border-blue-300 dark:border-blue-500/30' },
                                                'B': { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/15', border: 'border-blue-300 dark:border-blue-500/30' },
                                                'C': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/15', border: 'border-amber-300 dark:border-amber-500/30' },
                                                'D': { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/15', border: 'border-orange-300 dark:border-orange-500/30' },
                                                'F': { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/15', border: 'border-rose-300 dark:border-rose-500/30' },
                                            };
                                            const currentGradeConfig = gradeConfigs[grade] || gradeConfigs['F'];

                                            return (
                                                <div className="space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-500 font-inter w-full max-w-2xl mx-auto">
                                                    {/* ── Hero Status ── */}
                                                    <div className="text-center space-y-2 pt-1">
                                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm ${passed ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'}`}>
                                                            {passed
                                                                ? <Award size={22} strokeWidth={2} />
                                                                : <XCircle size={22} strokeWidth={2} />
                                                            }
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-inter border ${passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                                                                {passed ? 'Assessment Passed' : 'Assessment Needs Review'}
                                                            </span>
                                                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-inter tracking-tight">Quiz Results</h2>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">{quizSource === 'lesson' ? `${currentVideo.title} • Class Assessment` : `${currentModule.title} • Section Assessment`}</p>
                                                        </div>
                                                    </div>

                                                    {/* ── Metric Summary Cards ── */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                                                        {/* Score */}
                                                        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 rounded-xl py-2 px-3 sm:py-2.5 sm:px-3 text-center shadow-sm flex flex-col items-center justify-center min-h-[64px] sm:min-h-[68px] transition-all hover:border-slate-300 dark:hover:border-white/20">
                                                            <div className="flex items-baseline justify-center">
                                                                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-inter tracking-tight">{quizResult.score}</span>
                                                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-inter ml-0.5">/{quizResult.total}</span>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-inter">Score</p>
                                                        </div>

                                                        {/* Percentage */}
                                                        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 rounded-xl py-2 px-3 sm:py-2.5 sm:px-3 text-center shadow-sm flex flex-col items-center justify-center min-h-[64px] sm:min-h-[68px] transition-all hover:border-slate-300 dark:hover:border-white/20">
                                                            <div className="text-xl sm:text-2xl font-extrabold text-primary font-inter tracking-tight">
                                                                {pct}<span className="text-sm font-bold ml-0.5">%</span>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-inter">Percentage</p>
                                                        </div>

                                                        {/* Grade */}
                                                        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 rounded-xl py-2 px-3 sm:py-2.5 sm:px-3 text-center shadow-sm flex flex-col items-center justify-center min-h-[64px] sm:min-h-[68px] transition-all hover:border-slate-300 dark:hover:border-white/20">
                                                            <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-base sm:text-lg font-extrabold font-inter border ${currentGradeConfig.bg} ${currentGradeConfig.border} ${currentGradeConfig.color}`}>
                                                                {grade}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-inter">Grade</p>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 rounded-xl py-2 px-3 sm:py-2.5 sm:px-3 text-center shadow-sm flex flex-col items-center justify-center min-h-[64px] sm:min-h-[68px] transition-all hover:border-slate-300 dark:hover:border-white/20">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-inter border ${passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                                {passed ? 'Passed' : 'Failed'}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-inter">Status</p>
                                                        </div>
                                                    </div>

                                                    {/* ── Answer Sheet / Breakdown ── */}
                                                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-xl overflow-hidden text-left shadow-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAnswerSheet(prev => !prev)}
                                                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <FileCheck size={16} className="text-primary shrink-0" />
                                                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-inter">Answer Sheet Breakdown</h3>
                                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 font-inter">
                                                                    {activeQuiz.questions?.length || 0} Questions
                                                                </span>
                                                            </div>
                                                            <div className={`p-1 rounded-lg transition-all ${showAnswerSheet ? 'bg-primary/10 text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                {showAnswerSheet ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                            </div>
                                                        </button>

                                                        {showAnswerSheet && (
                                                            <div className="p-4 sm:p-5 space-y-3.5 border-t border-slate-200/80 dark:border-white/5 max-h-96 overflow-y-auto">
                                                                {(activeQuiz.questions || []).map((q, idx) => {
                                                                    const userAns = quizAnswers[idx];
                                                                    const correctAns = q.options?.[q.correctIndex];
                                                                    const isCorrect = userAns === correctAns;

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`p-4 rounded-xl border transition-all ${isCorrect ? 'bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-200/80 dark:border-emerald-500/20' : 'bg-rose-50/40 dark:bg-rose-500/5 border-rose-200/80 dark:border-rose-500/20'}`}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="px-2 py-0.5 bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded text-[10px] font-bold font-inter tracking-wide">
                                                                                        Question {idx + 1}
                                                                                    </span>
                                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-inter ${isCorrect ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30' : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/30'}`}>
                                                                                        {isCorrect ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed font-inter mb-3">
                                                                                {q.question}
                                                                            </p>

                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white/90 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 rounded-lg p-3 text-xs font-inter">
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Your Answer</p>
                                                                                    <p className={`font-semibold text-xs ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                                                        {userAns || 'Not answered'}
                                                                                    </p>
                                                                                </div>
                                                                                {!isCorrect && (
                                                                                    <div>
                                                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Correct Answer</p>
                                                                                        <p className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                                                                                            {correctAns || 'N/A'}
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {q.explanation && (
                                                                                <div className="mt-2.5 p-3 bg-primary/5 border border-primary/15 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-inter leading-relaxed">
                                                                                    <span className="font-bold text-primary mr-1 text-[10px] uppercase tracking-wider">Explanation:</span>
                                                                                    {q.explanation}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ── Action Buttons ── */}
                                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                                        <ModernButton
                                                            variant="secondary"
                                                            onClick={handleRewatchPreviousSession}
                                                            className="!px-6 !py-2.5 !text-xs !font-bold font-inter !border !border-slate-300 dark:!border-white/15 !text-slate-800 dark:!text-white hover:!border-primary/50 hover:!text-primary transition-all"
                                                        >
                                                            <ArrowLeft size={13} className="mr-1.5" /> Previous Session
                                                        </ModernButton>

                                                        <ModernButton
                                                            onClick={handleNext}
                                                            className="!px-8 !py-2.5 !text-xs !font-bold font-inter shadow-lg shadow-primary/20"
                                                        >
                                                            {currentModuleIndex < course.modules.length - 1 ? 'Continue to Next Section' : 'Finish Course'}
                                                        </ModernButton>
                                                    </div>
                                                </div>
                                            );
                                        })() : (
                                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full max-w-2xl mx-auto">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                                        Question {quizIndex + 1} of {activeQuiz?.questions?.length || 0}
                                                    </div>
                                                </div>

                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 font-inter leading-snug">
                                                    {activeQuiz?.questions?.[quizIndex]?.question || 'Question'}
                                                </h3>

                                                <div className="space-y-2 mb-4">
                                                    {(activeQuiz?.questions?.[quizIndex]?.options || []).map((opt, i) => {
                                                        const isSelected = quizAnswers[quizIndex] === opt;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => setQuizAnswers(prev => ({ ...prev, [quizIndex]: opt }))}
                                                                className={`w-full group relative flex items-center px-3 py-2.5 rounded-lg border transition-all duration-200 text-left font-medium text-xs ${isSelected
                                                                    ? 'border-primary bg-primary/5 dark:bg-primary/20 text-primary dark:text-purple-300 font-bold shadow-sm'
                                                                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 dark:border-white/10 dark:hover:border-white/20 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:text-slate-200 dark:hover:text-white'}`}
                                                            >
                                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-2.5 shrink-0 transition-all text-[11px] font-bold ${isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-slate-50 text-slate-500 group-hover:border-slate-400 dark:border-white/20 dark:bg-white/5 dark:text-slate-400 dark:group-hover:border-white/30'}`}>
                                                                    <span>{String.fromCharCode(65 + i)}</span>
                                                                </div>
                                                                <span className="flex-1 leading-snug">{opt}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                                                    <ModernButton
                                                        variant="secondary"
                                                        disabled={quizIndex === 0}
                                                        onClick={() => setQuizIndex(prev => Math.max(0, prev - 1))}
                                                        className="!px-4 !py-2 !text-xs !font-bold !border !border-primary/30 !text-primary hover:!bg-primary/5 disabled:!opacity-0"
                                                    >
                                                        <ArrowLeft size={13} className="mr-1" /> Previous
                                                    </ModernButton>

                                                    {quizIndex >= (activeQuiz?.questions?.length || 1) - 1 ? (
                                                        <ModernButton
                                                            disabled={!quizAnswers[quizIndex]}
                                                            onClick={() => {
                                                                const score = (activeQuiz?.questions || []).reduce((acc, q, i) => {
                                                                    return acc + (quizAnswers[i] === q?.options?.[q?.correctIndex] ? 1 : 0);
                                                                }, 0);
                                                                setQuizResult({ score, total: activeQuiz?.questions?.length || 0 });
                                                            }}
                                                            className="!px-5 !py-2 !text-xs !font-bold shadow-md shadow-primary/20"
                                                        >
                                                            Finish Assessment <ArrowRight size={13} className="ml-1" />
                                                        </ModernButton>
                                                    ) : (
                                                        <ModernButton
                                                            disabled={!quizAnswers[quizIndex]}
                                                            onClick={() => setQuizIndex(prev => prev + 1)}
                                                            className="!px-5 !py-2 !text-xs !font-bold shadow-md shadow-primary/20"
                                                        >
                                                            Next Question <ArrowRight size={13} className="ml-1" />
                                                        </ModernButton>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative group w-full mx-auto max-w-[1600px] overflow-hidden rounded-2xl">
                                    {/* This video stage must always look like a dark video player, regardless of
                                        site theme. A global light-mode rule force-converts any bg-[#0../bg-[#1..
                                        and text-white/slate/emerald element to light-theme colors, which was
                                        silently turning this box invisible (white bg + dark text on dark text,
                                        or white-on-white) - scoped, higher-specificity overrides below win back
                                        the intended dark styling for everything inside #lesson-video-stage. */}
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                            #lesson-video-stage { background-color: #0d1117 !important; }
                                            #lesson-video-stage [class*="bg-[#0d1117"] { background-color: #0d1117 !important; }
                                            #lesson-video-stage .text-white { color: #ffffff !important; }
                                            #lesson-video-stage .text-slate-400 { color: #94a3b8 !important; }
                                            #lesson-video-stage .text-emerald-400 { color: #34d399 !important; }
                                        `
                                    }} />
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary-purple/10 rounded-2xl blur-sm opacity-10 transition duration-1000"></div>
                                    <div id="lesson-video-stage" className="relative aspect-video rounded-2xl bg-black shadow-md overflow-hidden border border-white/10 w-full max-w-full">
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
                                                        className="!bg-emerald-600 hover:!bg-emerald-500 !text-white shadow-md shadow-emerald-900/20 !px-6 !py-3"
                                                    >
                                                        <Eye size={15} className="mr-1.5 inline !text-white" />
                                                        <span className="!text-white font-bold">View Document</span>
                                                    </ModernButton>
                                                    <ModernButton
                                                        onClick={(e) => handleDownloadFile(e, currentVideo.url, currentVideo.title)}
                                                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                                                        className="!bg-blue-600 hover:!bg-blue-500 !text-white shadow-md shadow-blue-900/20 !px-6 !py-3 transition-all"
                                                    >
                                                        <Download size={15} className="mr-1.5 inline !text-white" />
                                                        <span className="!text-white font-bold">Download</span>
                                                    </ModernButton>
                                                    {hasLessonQuiz && (
                                                        <ModernButton
                                                            onClick={openLessonQuiz}
                                                            className="!bg-[#4C1D95] hover:!bg-[#6D28FF] text-white shadow-md shadow-purple-950/20 transition-all duration-300"
                                                        >
                                                            <CheckSquare size={16} className="mr-1.5 inline" /> Attend Class Assessment
                                                        </ModernButton>
                                                    )}
                                                    {!hasLessonQuiz && currentExercise && (
                                                        <ModernButton
                                                            onClick={() => setShowExercise(true)}
                                                            className="!bg-[#4C1D95] hover:!bg-[#6D28FF] text-white shadow-md shadow-purple-950/20 transition-all duration-300"
                                                        >
                                                            <CheckSquare size={16} className="mr-1.5 inline" /> Attend Class Assessment
                                                        </ModernButton>
                                                    )}
                                                    <ModernButton
                                                        onClick={handleNext}
                                                        className="!bg-primary hover:!bg-primary/90 text-white shadow-md shadow-primary/20 transition-all duration-300"
                                                    >
                                                        <CheckCircle size={16} className="mr-1.5 inline" /> {userProgress.completedVideos?.includes(currentVideo._id) ? 'Next Lesson' : 'Mark as Completed & Continue'}
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        ) : (currentVideo.videoType === 'zoom-recording' || currentVideo.videoType === 'live-recording') && (currentVideo.zoomRecording?.playUrl || currentVideo.recordingUrl) ? (
                                            <MeetingRecordingPlayer
                                                key={`rec-${currentModuleIndex}-${currentVideoIndex}-${autoPlayVideo ? 'autoplay' : 'normal'}`}
                                                recordingUrl={currentVideo.recordingUrl || currentVideo.zoomRecording?.playUrl}
                                                sessionId={currentVideo.zoomSession || currentVideo.sessionId}
                                                title={currentVideo.title}
                                                onEnded={handleVideoEnd}
                                                onError={(error) => console.error('Recording playback error:', error)}
                                                autoPlay={autoPlayVideo}
                                            />
                                        ) : (currentVideo.url && (currentVideo.url.endsWith('.mp4') || currentVideo.url.endsWith('.webm') || currentVideo.url.endsWith('.ogg') || currentVideo.url.endsWith('.mov') || currentVideo.url.includes('/mp4') || currentVideo.url.includes('.mp4?') || currentVideo.url.includes('/uploads/'))) ? (
                                            <video
                                                ref={videoRef}
                                                key={`video-${currentModuleIndex}-${currentVideoIndex}-${autoPlayVideo ? 'autoplay' : 'normal'}`}
                                                src={getMediaUrl(currentVideo.url)}
                                                poster={currentVideo.thumbnail ? getMediaUrl(currentVideo.thumbnail) : undefined}
                                                controls
                                                autoPlay={autoPlayVideo}
                                                className="w-full h-full"
                                                onEnded={handleVideoEnd}
                                                onError={(e) => {
                                                    console.error('Video playback error:', e);
                                                    toast.error('Unable to load video file. The file may be missing from the server.');
                                                }}
                                                controlsList="nodownload"
                                            />
                                        ) : !currentVideo.url ? (
                                            // Lesson was created with just a title and has no video link
                                            // attached yet (see Edit Lesson in the course editor) - show
                                            // a clear placeholder instead of a blank, confusing black box.
                                            <div className="w-full h-full bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center">
                                                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                                                    <Video size={36} className="text-white/30" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{currentVideo.title}</h3>
                                                <p className="text-slate-400 max-w-md text-xs leading-relaxed flex items-center justify-center gap-1.5">
                                                    <Clock size={14} /> Video not available yet - check back soon.
                                                </p>
                                            </div>
                                        ) : (
                                            <CustomYoutubePlayer
                                                key={`yt-${currentModuleIndex}-${currentVideoIndex}-${autoPlayVideo ? 'autoplay' : 'normal'}`}
                                                url={currentVideo.url}
                                                title={currentVideo.title}
                                                thumbnail={currentVideo.thumbnail}
                                                onEnded={handleVideoEnd}
                                                autoPlay={autoPlayVideo}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Exercise / Assessment block only when active */}
                            {((currentVideo.contentType !== 'document' && currentVideo.videoType !== 'document' && (hasLessonQuiz || currentExercise) && !showExercise && !(showQuiz && quizSource === 'lesson')) || (showExercise && currentExercise)) && (
                                <div className="space-y-2 w-full mx-auto max-w-[1600px]">
                                    {currentVideo.contentType !== 'document' && currentVideo.videoType !== 'document' && (hasLessonQuiz || currentExercise) && !showExercise && !(showQuiz && quizSource === 'lesson') && (
                                        <ModernButton
                                            onClick={() => {
                                                if (hasLessonQuiz) {
                                                    openLessonQuiz();
                                                } else {
                                                    setSelectedAnswer('');
                                                    setExerciseFeedback(null);
                                                    setShowExercise(true);
                                                }
                                            }}
                                            className="!bg-[#4C1D95] hover:!bg-[#6D28FF] text-white shadow-md shadow-purple-950/20 transition-all duration-300"
                                        >
                                            <CheckSquare size={16} className="mr-1.5 inline" />
                                            {userProgress.completedExercises?.some(ex => ex.video === (currentVideo._id || currentVideo.id))
                                                ? 'Review Class Assessment'
                                                : 'Attend Class Assessment'}
                                        </ModernButton>
                                    )}

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
                                </div>
                            )}

                            {/* Instructor Card - styled identically to the Discussion Hub card */}
                            <div className="w-full">
                                <div className="flex items-center gap-2.5 bg-primary/5 dark:bg-white/[0.03] border border-primary/10 dark:border-white/10 rounded-lg px-3.5 py-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-primary dark:text-purple-300 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs overflow-hidden">
                                        {course.instructor?.profileImage ? (
                                            <img src={getMediaUrl(course.instructor.profileImage)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {course.instructorName || course.instructor?.name || 'SkillDad'}
                                            </p>
                                            {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) &&
                                                (course.universityName || course.instructor?.profile?.universityName || course.instructor?.name) !== (course.instructorName || course.instructor?.name) && (
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                                                        • {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                                    </span>
                                                )}
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                            {course.instructor?.profile?.bio || 'Experienced academic facilitator dedicated to your success in this course track.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Discussion Hub - always below the instructor card */}
                            <div className="w-full">
                                {discussionHubBlock}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursePlayer;
