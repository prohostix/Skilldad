import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquare,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    Send,
    User,
    Mail,
    ChevronRight,
    ChevronLeft,
    X,
    Check,
    Copy,
    RefreshCw,
    Sparkles,
    Inbox,
    Shield,
    ExternalLink
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeading from '../../components/ui/DashboardHeading';

const formatFullDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CANNED_REPLIES = [
    { label: 'Under Review', text: 'Thank you for reaching out. We have received your inquiry and our academic/support team is currently reviewing it. We will update you shortly.' },
    { label: 'Payment Verified', text: 'Your payment details have been verified and your course access has been manually activated. You can now access your learning materials in My Courses.' },
    { label: 'Login Assistance', text: 'We have verified your account credentials. Please use the Forgot Password link to reset your password, or use the temporary login instructions sent to your email.' },
    { label: 'Issue Resolved', text: 'This issue has been addressed and resolved. If you have any further questions, please do not hesitate to reply or raise a new ticket.' }
];

const SupportManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const { showToast } = useToast();

    const fetchTickets = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsRefreshing(true);

            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/support', config);
            const list = Array.isArray(data) ? data : [];
            setTickets(list);

            // Keep selected ticket in sync if open
            if (selectedTicket) {
                const updatedSelected = list.find(t => (t._id || t.id) === (selectedTicket._id || selectedTicket.id));
                if (updatedSelected) {
                    setSelectedTicket(updatedSelected);
                }
            } else if (list.length > 0 && window.innerWidth >= 1024) {
                // Auto-select first ticket on desktop
                setSelectedTicket(list[0]);
                setResponse(list[0].admin_response || list[0].adminResponse || '');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            showToast('Failed to load tickets', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
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

            showToast(`Ticket status updated to ${newStatus}`, 'success');
            await fetchTickets(true);

            if (selectedTicket && ((selectedTicket._id || selectedTicket.id) === ticketId)) {
                setSelectedTicket(prev => ({
                    ...prev,
                    status: newStatus,
                    admin_response: adminResponse !== null ? adminResponse : (prev.admin_response || prev.adminResponse),
                    adminResponse: adminResponse !== null ? adminResponse : (prev.admin_response || prev.adminResponse)
                }));
            }
        } catch (error) {
            console.error('Update ticket error:', error);
            showToast('Failed to update ticket', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyEmail = (email) => {
        if (!email) return;
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const counts = {
        all: tickets.length,
        open: tickets.filter(t => (t.status || '').toLowerCase() === 'open').length,
        inProgress: tickets.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s === 'in progress' || s === 'in_progress';
        }).length,
        resolved: tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length,
        closed: tickets.filter(t => (t.status || '').toLowerCase() === 'closed').length
    };

    const filteredTickets = tickets.filter(ticket => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q ||
            (ticket.name || '').toLowerCase().includes(q) ||
            (ticket.email || '').toLowerCase().includes(q) ||
            (ticket.subject || '').toLowerCase().includes(q) ||
            (ticket.message || '').toLowerCase().includes(q) ||
            (ticket.admin_response || ticket.adminResponse || '').toLowerCase().includes(q);

        const currentStatus = (ticket.status || 'open').toLowerCase();
        let matchesStatus = true;
        if (statusFilter === 'Open') matchesStatus = currentStatus === 'open';
        else if (statusFilter === 'In Progress') matchesStatus = currentStatus === 'in progress' || currentStatus === 'in_progress';
        else if (statusFilter === 'Resolved') matchesStatus = currentStatus === 'resolved';
        else if (statusFilter === 'Closed') matchesStatus = currentStatus === 'closed';

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'open':
                return {
                    badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                    dot: 'bg-rose-500',
                    icon: <AlertCircle size={12} className="shrink-0" />,
                    label: 'Open'
                };
            case 'in progress':
            case 'in_progress':
                return {
                    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                    dot: 'bg-amber-500',
                    icon: <Clock size={12} className="shrink-0" />,
                    label: 'In Progress'
                };
            case 'resolved':
                return {
                    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                    dot: 'bg-emerald-500',
                    icon: <CheckCircle2 size={12} className="shrink-0" />,
                    label: 'Resolved'
                };
            case 'closed':
                return {
                    badge: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
                    dot: 'bg-slate-400',
                    icon: <CheckCircle2 size={12} className="shrink-0" />,
                    label: 'Closed'
                };
            default:
                return {
                    badge: 'bg-purple-50 dark:bg-primary/10 text-purple-700 dark:text-primary border-purple-200 dark:border-primary/20',
                    dot: 'bg-primary',
                    icon: <MessageSquare size={12} className="shrink-0" />,
                    label: status || 'Pending'
                };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold tracking-wide">Loading support inquiries...</p>
        </div>
    );

    return (
        <div className="space-y-3 animate-in fade-in duration-300 pb-8 font-inter">
            {/* Header & Integrated Mini Stat Ribbon */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
                <div>
                    <DashboardHeading title="Support Management" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Compact KPI Mini Badges - Replaces huge cards with sleek inline chips */}
                    <div className="flex items-center flex-wrap gap-1 bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 text-[11px] font-inter">
                        <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5 shadow-xs">
                            <span className="text-slate-400">Total</span>
                            <span className="text-primary font-bold">{counts.all}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Open</span>
                            <span className="font-bold">{counts.open}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>In Progress</span>
                            <span className="font-bold">{counts.inProgress}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Resolved</span>
                            <span className="font-bold">{counts.resolved}</span>
                        </span>
                    </div>

                    <button
                        onClick={() => fetchTickets(true)}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:border-primary/30 transition-all shadow-xs"
                        title="Refresh tickets"
                    >
                        <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Dual-Pane Desk Layout - Compact, snugly aligned, taking full visible height without large blank gaps.
                Below lg, only one pane shows at a time (list or detail) - a master-detail / inbox pattern -
                since both panes stacked full-height at once doesn't work on a phone screen. */}
            <div className="grid lg:grid-cols-12 gap-3 h-[calc(100vh-170px)] min-h-[500px]">
                {/* Left Column: Inbox List */}
                <div className={`${selectedTicket ? 'hidden lg:flex' : 'flex'} flex-col lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#0e0924]/80 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs overflow-hidden backdrop-blur-md`}>
                    {/* Inbox Header & Search */}
                    <div className="p-2.5 border-b border-slate-100 dark:border-white/10 space-y-2 shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="relative flex items-center">
                            <Search size={13} className="absolute left-2.5 text-slate-400 dark:text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search student, email, subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-inter text-slate-800 dark:text-white focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                            {[
                                { key: 'All', label: 'All', count: counts.all },
                                { key: 'Open', label: 'Open', count: counts.open },
                                { key: 'In Progress', label: 'In Progress', count: counts.inProgress },
                                { key: 'Resolved', label: 'Resolved', count: counts.resolved },
                                { key: 'Closed', label: 'Closed', count: counts.closed }
                            ].map(item => {
                                const isActive = statusFilter === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setStatusFilter(item.key)}
                                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 border ${
                                            isActive
                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                                            isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300'
                                        }`}>
                                            {item.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ticket List Scrollable */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {filteredTickets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                                    <Inbox size={18} />
                                </div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-inter">No tickets found</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 max-w-[180px] font-inter">
                                    Try adjusting your search query or selecting a different status.
                                </p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket, idx) => {
                                const isSelected = (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id);
                                const badge = getStatusBadge(ticket.status);
                                const dateDisplay = formatRelativeTime(ticket.created_at || ticket.createdAt);
                                const hasAdminReplied = Boolean(ticket.admin_response || ticket.adminResponse);

                                return (
                                    <div
                                        key={ticket._id || ticket.id || `tkt-${idx}`}
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setResponse(ticket.admin_response || ticket.adminResponse || '');
                                        }}
                                        className={`p-2.5 sm:p-3 cursor-pointer transition-all border-l-3 text-left ${
                                            isSelected
                                                ? 'bg-primary/5 dark:bg-primary/10 border-l-primary'
                                                : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase border flex items-center gap-1 ${badge.badge}`}>
                                                <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                                                {badge.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                                                {dateDisplay}
                                            </span>
                                        </div>

                                        <h3 
                                            className="!text-xs !font-medium !text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary font-inter !m-0"
                                            style={{ fontSize: '12px', fontWeight: 500 }}
                                        >
                                            {ticket.subject || 'No Subject'}
                                        </h3>

                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug font-inter">
                                            {ticket.message || 'No inquiry content provided.'}
                                        </p>

                                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-4.5 h-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-semibold shrink-0">
                                                    {(ticket.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[10px] font-normal text-slate-600 dark:text-slate-300 truncate max-w-[130px] font-inter">
                                                    {ticket.name || 'Anonymous Student'}
                                                </span>
                                            </div>

                                            {hasAdminReplied && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                                                    <Check size={10} strokeWidth={2.5} /> Responded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Ticket Detail & Resolution Console */}
                <div className={`${selectedTicket ? 'flex' : 'hidden lg:flex'} flex-col lg:col-span-7 xl:col-span-8 bg-white dark:bg-[#0e0924]/80 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs overflow-hidden backdrop-blur-md`}>
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket._id || selectedTicket.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.15 }}
                                className="h-full flex flex-col"
                            >
                                {/* Top Ticket Header - Tight, neat, no awkward blank gaps */}
                                <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col gap-2 shrink-0">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-primary -mb-0.5"
                                    >
                                        <ChevronLeft size={14} /> Back to tickets
                                    </button>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const badge = getStatusBadge(selectedTicket.status);
                                                return (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border flex items-center gap-1.5 ${badge.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}
                                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 font-medium">
                                                #{(selectedTicket._id || selectedTicket.id || '').toString().slice(-6).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Quick Status Setter Buttons */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Status:</span>
                                            {['In Progress', 'Resolved', 'Closed'].map(status => {
                                                const isCurrent = (selectedTicket.status || '').toLowerCase() === status.toLowerCase();
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleUpdateTicket(selectedTicket._id || selectedTicket.id, status, response)}
                                                        disabled={isSubmitting}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                                                            isCurrent
                                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary'
                                                        }`}
                                                    >
                                                        {status}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setSelectedTicket(null)}
                                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition-colors ml-0.5"
                                                title="Close panel"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Career & Placements / Subject Heading - Compact font size & standard clean weight */}
                                    <div className="text-left">
                                        <h2 
                                            className="!text-[14px] sm:!text-[15px] !font-medium !text-slate-800 dark:!text-slate-100 break-words !leading-snug font-inter !m-0 !p-0"
                                            style={{ fontSize: '15px', fontWeight: 500 }}
                                        >
                                            {selectedTicket.subject || 'Support Ticket'}
                                        </h2>
                                    </div>
                                </div>

                                {/* Body Content Area */}
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
                                    {/* Student Metadata Strip - Consolidated single-row card */}
                                    <div className="p-2 px-3 bg-slate-50/80 dark:bg-white/[0.02] rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-[11px] shrink-0">
                                                <User size={13} />
                                            </div>
                                            <div className="text-left min-w-0 flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-inter">
                                                    {selectedTicket.name || 'Anonymous Student'}
                                                </span>
                                                <span className="text-slate-300 dark:text-white/20 hidden sm:inline">•</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    {selectedTicket.email || 'No email'}
                                                </span>
                                                {selectedTicket.email && (
                                                    <div className="inline-flex items-center gap-0.5 shrink-0">
                                                        <button
                                                            onClick={() => handleCopyEmail(selectedTicket.email)}
                                                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                                                            title="Copy email"
                                                        >
                                                            {copiedEmail ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                                        </button>
                                                        <a
                                                            href={`mailto:${selectedTicket.email}?subject=Regarding your SkillDad Support Ticket: ${selectedTicket.subject || ''}`}
                                                            className="p-1 rounded text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                                                            title="Send direct email"
                                                        >
                                                            <ExternalLink size={11} />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium font-inter">
                                            Submitted {formatFullDateTime(selectedTicket.created_at || selectedTicket.createdAt)}
                                        </div>
                                    </div>

                                    {/* Student Inquiry Message */}
                                    <div className="space-y-1 text-left">
                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-inter">
                                            <MessageSquare size={11} className="text-primary" />
                                            Student Inquiry
                                        </p>

                                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-inter">
                                            {selectedTicket.message || 'No inquiry text provided.'}
                                        </div>
                                    </div>

                                    {/* Existing Official Response Display (If already answered) */}
                                    {(selectedTicket.admin_response || selectedTicket.adminResponse) && (
                                        <div className="space-y-1 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-inter">
                                                    <CheckCircle2 size={11} />
                                                    Current Official Resolution
                                                </p>
                                                {selectedTicket.updated_at && (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium font-inter">
                                                        Updated {formatRelativeTime(selectedTicket.updated_at)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-inter">
                                                {selectedTicket.admin_response || selectedTicket.adminResponse}
                                            </div>
                                        </div>
                                    )}

                                    {/* Official Response Composer */}
                                    <div className="space-y-2 text-left pt-2 border-t border-slate-100 dark:border-white/10">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-inter">
                                                <Send size={11} className="text-primary" />
                                                Compose Official Response
                                            </label>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-inter">
                                                Emailed directly to student
                                            </span>
                                        </div>

                                        {/* Canned replies pill bar */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 shrink-0 font-inter">Templates:</span>
                                            {CANNED_REPLIES.map((canned, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setResponse(canned.text)}
                                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-white border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors shrink-0 font-inter"
                                                >
                                                    {canned.label}
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            rows="3"
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            placeholder="Write your official answer or resolution here... (Student will be notified immediately)"
                                            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400 font-inter leading-relaxed"
                                        />

                                        {/* Action Bar */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleUpdateTicket(selectedTicket._id || selectedTicket.id, 'In Progress', response)}
                                                    disabled={isSubmitting || !response.trim()}
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-50 transition-all font-inter"
                                                >
                                                    Save as In Progress
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateTicket(selectedTicket._id || selectedTicket.id, 'Resolved', response)}
                                                    disabled={isSubmitting || !response.trim()}
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1 font-inter"
                                                >
                                                    <Check size={12} strokeWidth={2.5} /> Save & Resolve
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleUpdateTicket(selectedTicket._id || selectedTicket.id, selectedTicket.status, response)}
                                                disabled={isSubmitting || !response.trim()}
                                                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary hover:bg-primary-dark text-white shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 font-inter"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <RefreshCw size={12} className="animate-spin" />
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={12} />
                                                        <span>Update Response</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
                                    <Inbox size={22} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white font-inter">No Inquiry Selected</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-sm leading-relaxed font-inter">
                                    Select a ticket from the left inbox to view the complete student inquiry, contact information, and send an official response.
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
