import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquare,
    Search,
    Filter,
    CheckCircle,
    Clock,
    AlertCircle,
    Send,
    User,
    Mail,
    ChevronRight,
    X
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const SupportManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const fetchTickets = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/support', config);
            setTickets(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            showToast('Failed to load tickets', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdateTicket = async (ticketId, newStatus, adminResponse = null) => {
        try {
            setIsSubmitting(true);
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const updateData = { status: newStatus };
            if (adminResponse !== null) {
                updateData.adminResponse = adminResponse;
            }

            await axios.put(`/api/support/${ticketId}`, updateData, config);

            showToast(`Ticket ${newStatus.toLowerCase()} successfully`, 'success');
            fetchTickets();
            if (selectedTicket && selectedTicket._id === ticketId) {
                setSelectedTicket(prev => ({ ...prev, status: newStatus, adminResponse: adminResponse || prev.adminResponse }));
            }
            setResponse('');
            setIsSubmitting(false);
        } catch (error) {
            console.error('Update ticket error:', error);
            showToast('Failed to update ticket', 'error');
            setIsSubmitting(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Open': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'In Progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-primary/20 text-primary border-primary/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle size={14} />;
            case 'In Progress': return <Clock size={14} />;
            case 'Resolved': return <CheckCircle size={14} />;
            default: return <MessageSquare size={14} />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="Support Management" />
                    <p className="text-white/50 text-xs">Manage and respond to student inquiries</p>
                </div>
                <div className="flex items-center space-x-2">
                    {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${statusFilter === status
                                ? 'bg-primary text-white border-primary border-primary shadow-lg shadow-primary/20'
                                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-1 space-y-4 h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="relative sticky top-0 z-10 bg-[#0B0F1A]/80 backdrop-blur-md pb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-white/30 text-sm">No tickets found</p>
                        </div>
                    ) : (
                        filteredTickets.map(ticket => (
                            <motion.div
                                key={ticket._id}
                                layout
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setResponse(ticket.adminResponse || '');
                                }}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group hover:border-primary/50 ${selectedTicket?._id === ticket._id
                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5 ${getStatusStyles(ticket.status)}`}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status}
                                    </span>
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                <p className="text-xs text-white/50 mb-3 line-clamp-2">{ticket.message}</p>
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 border border-white/10">
                                            {ticket.name.charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-medium text-white/70">{ticket.name}</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-white/20 group-hover:text-primary transition-all ${selectedTicket?._id === ticket._id ? 'rotate-90 translate-x-1' : ''}`} />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Ticket Detail Overlay/View */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <GlassCard className="h-full flex flex-col !p-0 overflow-hidden">
                                    {/* Header */}
                                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                        <div className="text-left">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-2 ${getStatusStyles(selectedTicket.status)}`}>
                                                    {getStatusIcon(selectedTicket.status)}
                                                    {selectedTicket.status}
                                                </span>
                                                <span className="text-xs text-white/50 font-medium">#{selectedTicket._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-white font-inter">{selectedTicket.subject}</h2>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTicket(null)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/50 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                        {/* User Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                                    <User className="text-primary" size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Sender Name</p>
                                                    <p className="text-sm font-bold text-white">{selectedTicket.name}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                    <Mail className="text-emerald-400" size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Contact Email</p>
                                                    <p className="text-sm font-bold text-white">{selectedTicket.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Original Message */}
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-primary rounded-full" />
                                                Student Inquiry
                                            </p>
                                            <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <MessageSquare size={100} />
                                                </div>
                                                <p className="text-white/80 text-sm leading-relaxed relative z-10 text-left">
                                                    {selectedTicket.message}
                                                </p>
                                                <p className="mt-4 text-[10px] text-white/30 font-medium italic">
                                                    Submitted on {new Date(selectedTicket.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Admin Feedback Section */}
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                Official Response
                                            </p>

                                            <div className="space-y-4">
                                                <textarea
                                                    rows="4"
                                                    value={response}
                                                    onChange={(e) => setResponse(e.target.value)}
                                                    placeholder="Type your official response here..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                                />
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2">
                                                        {['In Progress', 'Resolved', 'Closed'].map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleUpdateTicket(selectedTicket._id, status, response)}
                                                                disabled={isSubmitting}
                                                                className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase transition-all border ${selectedTicket.status === status
                                                                    ? 'bg-white/10 text-white border-white/20'
                                                                    : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20 hover:text-white'
                                                                    }`}
                                                            >
                                                                Set {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <ModernButton
                                                        onClick={() => handleUpdateTicket(selectedTicket._id, selectedTicket.status, response)}
                                                        disabled={isSubmitting || !response}
                                                        className="!py-2.5 !px-6"
                                                    >
                                                        <Send size={16} className="mr-2" />
                                                        Update Response
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                    <MessageSquare className="text-primary" size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Select an Inquiry</h2>
                                <p className="text-white/50 text-sm max-w-sm">
                                    Choose a ticket from the sidebar to view full details and provide a response to the student.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SupportManagement;
