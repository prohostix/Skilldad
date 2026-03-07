import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZoomMeeting from '../../components/ZoomMeeting';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import DashboardHeading from '../../components/ui/DashboardHeading';

const WatchStream = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                const { data } = await axios.get(`/api/sessions/${id}`, config);

                if (data.status !== 'live') {
                    setError('This session is not currently live');
                } else {
                    setSession(data);
                }
            } catch (err) {
                console.error('Error fetching session:', err);
                setError(err.response?.data?.message || 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Loading session...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Join Session</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60">Session not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-6">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <DashboardHeading title={session.topic} />
                        <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-xs font-bold uppercase flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                    <p className="text-white/60 text-sm">
                        {session.instructor?.name && `Instructor: ${session.instructor.name}`}
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 aspect-video min-h-[500px] lg:min-h-[750px]">
                    <ZoomMeeting
                        sessionId={id}
                        meetingNumber={session.zoomMeetingId}
                        userName={user?.name || 'Student'}
                    />
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-sm font-bold text-white mb-2">Session Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-white/40">Duration</p>
                            <p className="text-white">{session.duration} minutes</p>
                        </div>
                        <div>
                            <p className="text-white/40">Participants</p>
                            <p className="text-white">{session.enrolledStudents?.length || 0} students</p>
                        </div>
                    </div>
                    {session.description && (
                        <div className="mt-3">
                            <p className="text-white/40 text-xs mb-1">Description</p>
                            <p className="text-white/80 text-sm">{session.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WatchStream;
