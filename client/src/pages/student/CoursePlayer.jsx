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
    Calendar
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import ZoomRecordingPlayer from '../../components/ZoomRecordingPlayer';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [showExercise, setShowExercise] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [exerciseFeedback, setExerciseFeedback] = useState(null);
    const [userProgress, setUserProgress] = useState({ completedVideos: [], completedExercises: [] });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [liveSessions, setLiveSessions] = useState([]);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            try {
                const { data: courseData } = await axios.get(`/api/courses/${courseId}`);
                setCourse(courseData);

                // Fetch student progress for this course
                const { data: progData } = await axios.get('/api/enrollment/my-courses', config);
                const currentProg = progData.find(p => p.course._id === courseId);
                if (currentProg) setUserProgress(currentProg);

                // Fetch live sessions for this course
                try {
                    const { data: sessionsData } = await axios.get(`/api/sessions/course/${courseId}`, config);
                    setLiveSessions(sessionsData);
                } catch (sessionError) {
                    console.error('Error loading live sessions:', sessionError);
                    // Don't fail the whole page if live sessions fail to load
                }
            } catch (error) {
                console.error('Error loading course/progress:', error);
            }
        };
        fetchCourseAndProgress();
    }, [courseId]);

    if (!course) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const currentModule = course.modules?.[currentModuleIndex];

    // Safety check if course has no modules or videos yet
    if (!currentModule || !currentModule.videos || currentModule.videos.length === 0) {
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

    const currentVideo = currentModule.videos[currentVideoIndex];
    const currentExercise = currentVideo?.exercises?.[0];

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
            try {
                await axios.put('/api/enrollment/progress', {
                    courseId,
                    videoId: currentVideo._id,
                    exerciseScore: 100
                }, config);
                setUserProgress(prev => ({
                    ...prev,
                    completedExercises: [...prev.completedExercises, { video: currentVideo._id, score: 100 }]
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

    const handleNext = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            await axios.put('/api/enrollment/progress', {
                courseId,
                videoId: currentVideo._id,
            }, config);
            setUserProgress(prev => ({
                ...prev,
                completedVideos: [...prev.completedVideos, currentVideo._id]
            }));
        } catch (err) {
            console.error('Video completion update failed', err);
        }

        if (currentVideoIndex < currentModule.videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        } else if (currentModuleIndex < course.modules.length - 1) {
            setCurrentModuleIndex(prev => prev + 1);
            setCurrentVideoIndex(0);
        } else {
            alert('Course Completed!');
        }
    };

    const totalVideos = course.modules?.reduce((acc, m) => acc + (m.videos?.length || 0), 0) || 1;
    const completedCount = userProgress.completedVideos?.length || 0;
    const progressPercent = Math.round((completedCount / totalVideos) * 100) || 0;

    return (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-100px)] min-h-[calc(100vh-200px)] bg-[#050505] rounded-none lg:rounded-2xl border-0 lg:border border-white/10 overflow-hidden font-inter -mx-4 sm:-mx-6 lg:-mx-8 shadow-2xl">
            {/* Sidebar - Course Content */}
            <div className={`${isSidebarOpen ? 'w-full lg:w-96' : 'w-0 lg:hidden'} transition-all duration-500 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-20`}>
                <div className="p-6 border-b border-white/10">
                    <button
                        onClick={() => navigate('/dashboard/my-courses')}
                        className="flex items-center text-slate-500 hover:text-primary mb-4 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                    </button>
                    <DashboardHeading
                        title={course.title}
                        className="!text-lg font-extrabold"
                    />
                    <div className="mt-6">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                            <span className="uppercase tracking-wider">Overall Completion</span>
                            <span className="text-primary">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Live Sessions Section */}
                {liveSessions.length > 0 && (
                    <div className="px-6 py-4 bg-primary/5 border-b border-primary/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <Video size={16} className="text-primary" />
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Upcoming Live Sessions</h3>
                        </div>
                        <div className="space-y-2">
                            {liveSessions.slice(0, 3).map((session) => {
                                const sessionDate = new Date(session.startTime);
                                const isLive = session.status === 'live';
                                const isUpcoming = session.status === 'scheduled' && sessionDate > new Date();

                                return (
                                    <div
                                        key={session._id}
                                        className="p-3 bg-black/40 rounded-lg border border-white/10 hover:border-primary/30 transition-all cursor-pointer"
                                        onClick={() => navigate(`/dashboard/live-classes`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="text-sm font-bold text-white line-clamp-1">{session.topic}</p>
                                            {isLive && (
                                                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                                            <div className="flex items-center">
                                                <Calendar size={10} className="mr-1" />
                                                {sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock size={10} className="mr-1" />
                                                {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {session.instructor && (
                                            <p className="text-[10px] text-primary mt-1 font-bold">
                                                by {session.instructor.name}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {liveSessions.length > 3 && (
                            <button
                                onClick={() => navigate(`/dashboard/live-classes`)}
                                className="w-full mt-2 text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                            >
                                View all {liveSessions.length} sessions →
                            </button>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module, mIndex) => (
                        <div key={mIndex}>
                            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <span className="text-sm font-bold text-[#B8C0FF] uppercase tracking-wide flex items-center">
                                    <Layout size={14} className="mr-2 text-slate-400" /> {module.title}
                                </span>
                            </div>
                            <div>
                                {module.videos.map((video, vIndex) => (
                                    <button
                                        key={vIndex}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-all group ${mIndex === currentModuleIndex && vIndex === currentVideoIndex
                                            ? 'bg-primary/5 text-primary border-l-4 border-primary'
                                            : 'hover:bg-white/5 text-[#B8C0FF] border-l-4 border-transparent'
                                            }`}
                                        onClick={() => {
                                            setCurrentModuleIndex(mIndex);
                                            setCurrentVideoIndex(vIndex);
                                            setShowExercise(false);
                                        }}
                                    >
                                        <div className="flex items-center space-x-3 text-left">
                                            <div className="relative">
                                                {userProgress.completedVideos?.includes(video._id) ? (
                                                    <CheckCircle className="text-emerald-500" size={18} />
                                                ) : (
                                                    <Play className={`${mIndex === currentModuleIndex && vIndex === currentVideoIndex ? 'text-primary' : 'text-slate-300'}`} size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold font-poppins line-clamp-1">{video.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-widest mt-1">
                                                    <Clock size={10} className="mr-1" /> {video.duration}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${mIndex === currentModuleIndex && vIndex === currentVideoIndex ? 'text-primary opacity-100' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Player */}
            <div className="flex-1 overflow-y-auto bg-transparent p-6 lg:p-10 relative">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-lg shadow-sm">
                        <Layout size={20} className="text-primary" />
                    </button>
                    <span className="font-bold text-[#B8C0FF] font-poppins text-sm uppercase">Curriculum</span>
                </div>

                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-1000">
                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                            <span>Module {currentModuleIndex + 1}</span>
                            <span className="text-slate-300">•</span>
                            <span>Lesson {currentVideoIndex + 1}</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-white font-poppins">{currentVideo.title}</h1>
                    </div>

                    {/* Video Container with Glow */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary-purple rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative aspect-video rounded-2xl bg-black shadow-2xl overflow-hidden border border-white/20">
                            {/* Render based on video type */}
                            {currentVideo.videoType === 'zoom-recording' && currentVideo.zoomRecording?.playUrl ? (
                                <ZoomRecordingPlayer
                                    recordingUrl={currentVideo.zoomRecording.playUrl}
                                    sessionId={currentVideo.zoomSession}
                                    title={currentVideo.title}
                                    onEnded={handleVideoEnd}
                                    onError={(error) => console.error('Zoom recording error:', error)}
                                />
                            ) : (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={(() => {
                                        let url = currentVideo.url || '';
                                        // Convert YouTube watch URLs to embed format
                                        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                                        if (watchMatch) {
                                            url = `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
                                        }
                                        return url;
                                    })()}
                                    title={currentVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Control Panel & Exercise */}
                        <div className="flex-1 space-y-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <ModernButton onClick={handleVideoEnd} className="flex-1 !py-4 shadow-xl shadow-primary/20">
                                    Mark as Completed
                                </ModernButton>
                                <ModernButton variant="secondary" className="px-6 py-4 sm:py-2 border-white/10 flex items-center justify-center">
                                    <FileText size={20} className="text-slate-500 mr-2 sm:mr-0" />
                                    <span className="sm:hidden font-bold text-sm text-slate-500">Resources</span>
                                </ModernButton>
                            </div>

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

                            {/* Comments/Q&A Mockup */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-white font-poppins flex items-center">
                                    <MessageSquare size={18} className="mr-2 text-primary" /> Discussion Hub
                                </h4>
                                <GlassCard className="!p-4 bg-white/5 border-white/10">
                                    <div className="flex items-center space-x-3 text-white/40 italic font-inter text-sm">
                                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                                        <span>Write your thought or question here...</span>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* Sidebar Info Widgets */}
                        <div className="w-full lg:w-80 space-y-6">
                            <GlassCard className="bg-primary/5 border-primary/10">
                                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center">
                                    <User size={14} className="mr-2" /> Instructor
                                </h4>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl">
                                        {(course.instructorName || course.instructor?.name || 'I')[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white font-poppins">
                                            {course.instructorName || course.instructor?.name || 'Academic facilitator'}
                                        </p>
                                        {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-[#B8C0FF] font-inter leading-relaxed">
                                    {course.instructor?.profile?.bio || 'Experienced academic facilitator dedicated to your success in this course track.'}
                                </p>
                            </GlassCard>

                            <GlassCard className="border-white/10 overflow-hidden !p-0">
                                <div className="p-4 bg-white/5 border-b border-white/10">
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Resources</p>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center p-3 text-sm font-bold text-[#B8C0FF] hover:bg-white/5 transition-colors rounded-lg group">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                            <FileText size={16} />
                                        </div>
                                        Course_Notes_A1.pdf
                                    </button>
                                    <button className="w-full flex items-center p-3 text-sm font-bold text-white/70 hover:bg-white/5 transition-colors rounded-lg group">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                            <FileText size={16} />
                                        </div>
                                        Resource_Manifesto.csv
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
