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
        <div className="min-h-screen bg-[#050505] flex flex-col">
            {/* Immersive Header */}
            <div className="bg-gradient-to-b from-black/80 to-transparent p-6 z-20">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-0.5 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] text-white rounded-md text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                LIVE BROADCAST
                            </span>
                            {session.course?.title && (
                                <span className="text-primary/80 text-[10px] font-black tracking-widest uppercase italic">
                                    {session.course.title}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{session.topic}</h1>
                        <p className="text-white/40 text-xs font-medium mt-1">
                            {session.instructor?.name && `In Studio with ${session.instructor.name}`}
                        </p>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6">
                         <div className="text-right">
                            <p className="text-white/20 text-[9px] font-black tracking-widest uppercase">Audience</p>
                            <p className="text-white font-bold text-sm tracking-wide">{session.enrolledStudents?.length || 0} Viewers</p>
                         </div>
                         <div className="w-px h-8 bg-white/10"></div>
                         <button 
                            onClick={() => navigate('/dashboard/live-classes')}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-[10px] font-black tracking-widest uppercase transition-all"
                         >
                            Exit Studio
                         </button>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 lg:pt-0 max-w-[1800px] mx-auto w-full">
                {/* Video Theater */}
                <div className="flex-[3] relative bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.4)] border border-white/5 group">
                    <ZoomMeeting
                        sessionId={id}
                        meetingNumber={session.zoomMeetingId}
                        role={0} // 0 = Participant
                        userName={user?.name || 'Student'}
                        onLeave={() => navigate('/dashboard/live-classes')}
                    />
                </div>

                {/* Sidebar Info & Interaction */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
                        <h3 className="text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-4 border-b border-primary/20 pb-2">Session Insight</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <p className="text-white/20 text-[9px] font-black tracking-widest uppercase mb-1">Duration & Schedule</p>
                                <p className="text-white text-sm font-bold tracking-wide">{session.duration} Minutes Special Broadcast</p>
                            </div>

                            {session.description && (
                                <div>
                                    <p className="text-white/20 text-[9px] font-black tracking-widest uppercase mb-1">About this Session</p>
                                    <p className="text-white/60 text-xs leading-relaxed font-medium">
                                        {session.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                       <svg size={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                    </div>
                                    <div>
                                        <p className="text-white text-[10px] font-bold">Interactive Mode</p>
                                        <p className="text-white/40 text-[9px]">Use the sidebar chat to engage with the studio</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Support / Resources */}
                    <div className="mt-auto bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-2xl border border-primary/20">
                        <p className="text-white text-xs font-bold mb-1">Need Technical Help?</p>
                        <p className="text-white/40 text-[10px] mb-3 leading-tight">If the stream is lagging, try refreshing or checking your connection.</p>
                        <button className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-black tracking-widest uppercase rounded-lg transition-all">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchStream;
