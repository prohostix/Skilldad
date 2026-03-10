import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Link as LinkIcon, X, Check, Calendar, Clock, HardDrive } from 'lucide-react';
import axios from 'axios';
import ModernButton from '../../components/ui/ModernButton';
import GlassCard from '../../components/ui/GlassCard';

const LinkZoomRecording = () => {
    const { courseId, moduleIndex, videoIndex } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            // Fetch course details
            const { data: courseData } = await axios.get(`/api/courses/${courseId}`, config);
            setCourse(courseData);

            // Fetch available Zoom recordings
            const { data: recordingsData } = await axios.get('/api/courses/zoom-recordings/available', config);
            setRecordings(recordingsData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleLinkRecording = async () => {
        if (!selectedRecording) return;

        setLinking(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.post(
                `/api/courses/${courseId}/modules/${moduleIndex}/videos/${videoIndex}/link-zoom-recording`,
                { sessionId: selectedRecording.sessionId },
                config
            );

            alert('Zoom recording linked successfully!');
            navigate(`/dashboard/courses/${courseId}/edit`);
        } catch (error) {
            console.error('Error linking recording:', error);
            alert(error.response?.data?.message || 'Failed to link recording');
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentVideo = course?.modules[moduleIndex]?.videos[videoIndex];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Link Zoom Recording</h1>
                    <p className="text-white/60">
                        Select a Zoom recording to link to: <span className="text-primary font-semibold">{currentVideo?.title}</span>
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6 text-white/60" />
                </button>
            </div>

            {/* Available Recordings */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Available Zoom Recordings ({recordings.length})
                </h2>

                {recordings.length === 0 ? (
                    <GlassCard className="text-center py-12">
                        <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60 mb-2">No Zoom recordings available</p>
                        <p className="text-white/40 text-sm">
                            Record a live session first, then link it to your course videos
                        </p>
                    </GlassCard>
                ) : (
                    <div className="grid gap-4">
                        {recordings.map((recording) => (
                            <GlassCard
                                key={recording.sessionId}
                                className={`cursor-pointer transition-all ${
                                    selectedRecording?.sessionId === recording.sessionId
                                        ? 'border-primary bg-primary/5'
                                        : 'hover:border-white/20'
                                }`}
                                onClick={() => setSelectedRecording(recording)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                selectedRecording?.sessionId === recording.sessionId
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-white/60'
                                            }`}>
                                                {selectedRecording?.sessionId === recording.sessionId ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <Video className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{recording.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(recording.recordedAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {recording.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive className="w-3 h-3" />
                                                        {recording.fileSize}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <ModernButton
                    onClick={handleLinkRecording}
                    disabled={!selectedRecording || linking}
                    className="flex-1"
                >
                    {linking ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                            Linking...
                        </>
                    ) : (
                        <>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link Selected Recording
                        </>
                    )}
                </ModernButton>
                <ModernButton
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="px-8"
                >
                    Cancel
                </ModernButton>
            </div>
        </div>
    );
};

export default LinkZoomRecording;
