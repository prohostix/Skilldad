import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Mail,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    RefreshCcw,
    Smartphone,
    Activity,
    AlertTriangle,
    Bell
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const CommunicationHub = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState(null);
    const [testPhone, setTestPhone] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [logsRes, statusRes] = await Promise.all([
                axios.get('/api/notifications/logs', config),
                axios.get('/api/notifications/status', config)
            ]);

            setLogs(logsRes.data);
            setStatus(statusRes.data);
        } catch (error) {
            showToast('Failed to sync Communication Hub', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testPhone) return showToast('Please enter a phone number', 'warning');

        setSendingTest(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/notifications/test-whatsapp', { phone: testPhone }, config);
            showToast('Simulated WhatsApp pulse sent!', 'success');
            fetchData();
        } catch (error) {
            showToast('Gateway test failed', 'error');
        } finally {
            setSendingTest(false);
        }
    };

    const getStatusIcon = (state) => {
        switch (state) {
            case 'sent': return <CheckCircle size={14} className="text-emerald-400" />;
            case 'simulated': return <Activity size={14} className="text-indigo-400" />;
            case 'failed': return <XCircle size={14} className="text-red-400" />;
            case 'skipped': return <Clock size={14} className="text-white/20" />;
            default: return <Clock size={14} className="text-amber-400" />;
        }
    };

    if (loading && !status) return <div className="h-96 flex items-center justify-center text-white/20">Initializing Secure Channels...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Communication Hub" />
                    <p className="text-white/40 mt-1">Multi-channel notification engine monitoring and management.</p>
                </div>
                <ModernButton onClick={fetchData} variant="secondary">
                    <RefreshCcw size={18} className="mr-2" /> Refresh
                </ModernButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Channel Status: WhatsApp */}
                <GlassCard className="p-6 border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                            <MessageSquare size={24} />
                        </div>
                        <div className={`px-2 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest ${status?.whatsapp?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {status?.whatsapp?.enabled ? 'Production' : 'Simulation'}
                        </div>
                    </div>
                    <h3 className="text-white font-black uppercase tracking-tighter mb-1">WhatsApp Pipeline</h3>
                    <p className="text-xs text-white/40 mb-4">{status?.whatsapp?.provider} API Gateway</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-white/30 uppercase font-black">
                            <span>Integration</span>
                            <span className="text-white/60">{status?.whatsapp?.enabled ? 'Active' : 'Offline'}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${status?.whatsapp?.enabled ? 'bg-emerald-500' : 'bg-amber-500 opacity-30'} w-full`}></div>
                        </div>
                    </div>
                </GlassCard>

                {/* Channel Status: Email */}
                <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                            <Mail size={24} />
                        </div>
                        <div className="px-2 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400">
                            Active
                        </div>
                    </div>
                    <h3 className="text-white font-black uppercase tracking-tighter mb-1">Email Terminal</h3>
                    <p className="text-xs text-white/40 mb-4">{status?.email?.provider}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-white/30 uppercase font-black">
                            <span>Smtp Status</span>
                            <span className="text-white/60">Connected</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full"></div>
                        </div>
                    </div>
                </GlassCard>

                {/* Test Console */}
                <GlassCard className="p-6 border-white/10 group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/5 text-white/40 rounded-lg group-hover:text-white transition-colors">
                            <Send size={18} />
                        </div>
                        <h3 className="text-white font-bold text-sm">Pulse Test</h3>
                    </div>
                    <form onSubmit={handleSendTest} className="space-y-3">
                        <input
                            type="text"
                            placeholder="+91 Phone Number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                            value={testPhone}
                            onChange={e => setTestPhone(e.target.value)}
                        />
                        <ModernButton className="w-full !py-2 text-[10px] font-black uppercase tracking-widest" disabled={sendingTest}>
                            {sendingTest ? 'Sending...' : 'Trigger WhatsApp Pulse'}
                        </ModernButton>
                    </form>
                </GlassCard>
            </div>

            {/* Logs Table */}
            <GlassCard className="overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-white/40">
                            <Bell size={18} />
                        </div>
                        <h2 className="text-white font-bold">Transmission Logs</h2>
                    </div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                        Showing last 100 events
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                <th className="px-6 py-4 text-left font-black">Timestamp</th>
                                <th className="px-6 py-4 text-left font-black">Recipient</th>
                                <th className="px-6 py-4 text-left font-black">Type</th>
                                <th className="px-6 py-4 text-center font-black">WhatsApp</th>
                                <th className="px-6 py-4 text-center font-black">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-inter">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-white/40 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-white/20" />
                                            {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium group-hover:text-indigo-400 transition-colors capitalize">{log.recipientName}</div>
                                        <div className="text-[10px] text-white/30 font-mono mt-0.5">{log.recipientEmail || log.recipientPhone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-white/60">
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {getStatusIcon(log.status.whatsapp.state)}
                                            <span className={`text-[10px] font-black uppercase ${log.status.whatsapp.state === 'failed' ? 'text-red-400' : 'text-white/40'}`}>
                                                {log.status.whatsapp.state}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {getStatusIcon(log.status.email.state)}
                                            <span className={`text-[10px] font-black uppercase ${log.status.email.state === 'failed' ? 'text-red-400' : 'text-white/40'}`}>
                                                {log.status.email.state}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && (
                    <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest text-sm">
                        No transmission events recorded
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default CommunicationHub;
