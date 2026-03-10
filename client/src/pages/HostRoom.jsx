import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZoomMeeting from '../components/ZoomMeeting';
import axios from 'axios';

const HostRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                if (!userInfo.token) {
                    setError('Please log in to host the session');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                const { data } = await axios.get(`/api/sessions/${id}`, config);
                setSession(data);
            } catch (err) {
                console.error('Error fetching session:', err);
                setError(err.response?.data?.message || 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [id]);

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
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Load Session</h2>
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
        <div className="fixed inset-0 bg-black flex flex-col">
            {/* Header Bar */}
            <div className="flex-shrink-0 bg-black/90 border-b border-white/10 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-white">{session.topic}</h1>
                        <p className="text-white/40 text-xs">Host Room • {session.status}</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>

            {/* Zoom Meeting - Full Height */}
            <div className="flex-1 overflow-hidden">
                <ZoomMeeting
                    sessionId={id}
                    isHost={true}
                    onLeave={() => navigate('/dashboard')}
                    onError={(error) => {
                        console.error('Zoom meeting error:', error);
                        setError(error);
                    }}
                />
            </div>
        </div>
    );
};

export default HostRoom;
