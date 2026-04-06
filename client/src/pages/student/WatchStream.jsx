import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JitsiMeeting from '../../components/JitsiMeeting';
import axios from 'axios';

const WatchStream = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const handleLeave = React.useCallback(() => {
        navigate('/dashboard/live-classes');
    }, [navigate]);

    return (
        <div className="fixed inset-0 bg-black">
            <JitsiMeeting
                sessionId={id}
                isHost={false}
                onLeave={handleLeave}
                onError={(err) => {
                    console.error('Jitsi error:', err);
                    setError(err);
                }}
            />
        </div>
    );
};

export default WatchStream;
