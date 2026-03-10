import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, Send, CheckCircle, AlertCircle, Loader2, Bell, Zap, History, ShieldCheck, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationDemo = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'welcome'
    });
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [activeLog, setActiveLog] = useState(null);

    // Fetch initial logs and set up polling for "real-time" feel
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await axios.get('/api/public/notification-logs');
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error('Name is required for the identity matrix');
        if (!formData.email && !formData.phone) return toast.error('At least one communication node (Email/WhatsApp) required');

        setLoading(true);
        setActiveLog(null);

        try {
            const { data } = await axios.post('/api/public/demo-notification', formData);
            setActiveLog(data.log);
            fetchLogs();
            toast.success('Transmission Initiated Successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync Failure: Check Network Logs');
        } finally {
            setLoading(false);
        }
    };

    const notificationTypes = [
        { id: 'welcome', label: 'Welcome Onboarding', desc: 'New user integration protocol', icon: <Bell className="w-5 h-5" /> },
        { id: 'liveSession', label: 'Live Session Alert', desc: 'Real-time synchronization for classes', icon: <Zap className="w-5 h-5" /> },
        { id: 'exam', label: 'Exam Scheduled', desc: 'Critical assessment notification', icon: <AlertCircle className="w-5 h-5" /> },
    ];

    return (
        <div className="relative min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Background Orbs - Layered behind everything */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6D28FF]/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 py-12 px-4 pointer-events-auto">

                {/* Top Navbar Demo Decorator */}
                <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black tracking-tighter text-xl">SKILLDAD <span className="text-primary">CORE</span></h4>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Notification Gateway v2.4.0</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-green-500" /> GLOBAL UPTIME: 99.99%</span>
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> LATENCY: 42ms</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Control Panel */}
                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black mb-2">Broadcast Command Center</h2>
                                <p className="text-slate-400">Configure parameters for the target recipient and initiate multi-channel sync.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary">Target Identity</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Full Name"
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-lg font-medium placeholder:text-slate-700"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Email Node</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                                <input
                                                    type="email"
                                                    placeholder="user@skilldad.com"
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-lg font-medium placeholder:text-slate-700"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">WhatsApp Uplink</label>
                                            <div className="relative">
                                                <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                                <input
                                                    type="tel"
                                                    placeholder="+91..."
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-lg font-medium placeholder:text-slate-700"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Transmission Protocol</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {notificationTypes.map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: t.id })}
                                                className={`flex flex-col gap-3 p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${formData.type === t.id
                                                    ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(124,58,237,0.1)]'
                                                    : 'bg-slate-950/30 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg w-fit ${formData.type === t.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                    {t.icon}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${formData.type === t.id ? 'text-white' : 'text-slate-300'}`}>{t.label}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                                                </div>
                                                {formData.type === t.id && (
                                                    <motion.div layoutId="active-bg" className="absolute top-2 right-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-6 bg-primary hover:bg-primary-hover rounded-2xl font-black text-xl tracking-tighter shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-7 h-7 animate-spin" />
                                                SYNCING PROTOCOLS...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-7 h-7 fill-current transition-transform group-hover:scale-125" />
                                                INITIATE BROADCAST
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[10px] font-bold text-slate-600 mt-4 uppercase tracking-[0.2em]">Authorized for Enterprise Administrator Level 4</p>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Audit Trail & Live Feed */}
                    <div className="lg:col-span-5 space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl h-full flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <History className="w-6 h-6 text-primary" />
                                    Synaptic Audit Trail
                                </h3>
                                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                    Live Feed
                                </div>
                            </div>

                            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-20 opacity-20">
                                            <Zap className="w-20 h-20 mx-auto mb-4" />
                                            <p className="font-bold text-sm uppercase tracking-widest">Awaiting Initial Transmission</p>
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <motion.div
                                                key={log._id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`p-6 rounded-2xl border transition-all ${activeLog?._id === log._id ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-slate-800/30 border-white/5'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-bold text-sm">{log.recipientName}</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    <span className={`text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest ${log.type === 'welcome' ? 'bg-blue-500/10 text-blue-400' :
                                                        log.type === 'liveSession' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {log.type}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <div className={`flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border ${log.status.email.state === 'sent' ? 'border-green-500/20 text-green-400' :
                                                        log.status.email.state === 'failed' ? 'border-red-500/20 text-red-400' :
                                                            'border-white/5 text-slate-600'
                                                        }`}>
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase">{log.status.email.state}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border ${log.status.whatsapp.state === 'sent' ? 'border-green-500/20 text-green-400' :
                                                        log.status.whatsapp.state === 'failed' ? 'border-red-500/20 text-red-400' :
                                                            'border-white/5 text-slate-600'
                                                        }`}>
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase">{log.status.whatsapp.state}</span>
                                                    </div>
                                                </div>

                                                {/* Error info if failed */}
                                                {(log.status.email.error || log.status.whatsapp.error) && (
                                                    <div className="mt-3 text-[9px] text-red-400/80 bg-red-400/5 p-2 rounded-md border border-red-500/10 italic">
                                                        {log.status.email.error || log.status.whatsapp.error}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 text-[10px] text-slate-500 font-medium flex justify-between items-center">
                                <span>Total Managed Transmissions: {logs.length}</span>
                                <button onClick={fetchLogs} className="hover:text-primary transition-colors flex items-center gap-1">
                                    <History className="w-3 h-3" /> REFRESH NODE
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

        </div>
    );
};


export default NotificationDemo;
