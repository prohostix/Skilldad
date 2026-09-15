import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, BookOpen, Building2, Calendar, Search, Download, MessageSquare } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

// Wraps a CSV field in quotes and escapes any quotes inside it, so commas/newlines
// in free-text fields (like the enquiry message) don't break the file's columns.
const csvField = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

const STATUS_LABELS = {
    new: 'Pending',
    contacted: 'Contacted',
    closed: 'Closed'
};

const STATUS_STYLES = {
    new: 'bg-primary/20 text-primary border-primary/30',
    contacted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    closed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
};

const CourseEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { showToast } = useToast();

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchEnquiries = async () => {
        try {
            const { data } = await axios.get('/api/enquiries', getAuthConfig());
            setEnquiries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            showToast('Error fetching enquiries', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`/api/enquiries/${id}`, { status }, getAuthConfig());
            setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        } catch (error) {
            showToast('Error updating status', 'error');
        }
    };

    const statusCounts = {
        all: enquiries.length,
        new: enquiries.filter(e => (e.status || 'new') === 'new').length,
        contacted: enquiries.filter(e => e.status === 'contacted').length,
        closed: enquiries.filter(e => e.status === 'closed').length
    };

    const filteredEnquiries = enquiries.filter(e => {
        const matchesSearch =
            e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.university_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDownload = () => {
        if (filteredEnquiries.length === 0) {
            showToast('No enquiries to download', 'error');
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Course', 'University', 'Status', 'Submitted At', 'Message'];
        const rows = filteredEnquiries.map(e => [
            e.name,
            e.email,
            e.phone,
            e.course_name || '',
            e.university_name || '',
            e.status || 'new',
            new Date(e.created_at).toLocaleString(),
            e.message || ''
        ]);

        const csvContent = [headers, ...rows].map(row => row.map(csvField).join(',')).join('\r\n');
        const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `course-enquiries_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <DashboardHeading title="Course Enquiries" uniform />
                    <p className="text-white/50 text-xs mt-1">Students who submitted the Enroll form, waiting for a counsellor follow-up</p>
                </div>
                <button 
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white/70 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
                >
                    <Download size={13} />
                    <span>Download {statusFilter !== 'all' ? `(${STATUS_LABELS[statusFilter]})` : 'All'}</span>
                </button>
            </div>

            <div className="bg-white/90 dark:bg-[#0E0B1A]/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" size={13} />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, course, or university..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-inter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-100/90 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/80 dark:border-white/10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                    {['all', ...STATUS_OPTIONS].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all ${statusFilter === status ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {status === 'all' ? 'All' : STATUS_LABELS[status]} ({statusCounts[status]})
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : filteredEnquiries.length === 0 ? (
                <div className="text-center py-20">
                    <Mail size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/30 text-sm">No enquiries found.</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {filteredEnquiries.map((enquiry) => (
                        <GlassCard key={enquiry.id} className="!p-2 sm:!p-2.5 hover:bg-white/[0.03] transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <div className="min-w-0 sm:w-44 flex-shrink-0 space-y-0.5">
                                    <h3 className="text-white font-semibold text-xs truncate leading-tight">{enquiry.name}</h3>
                                    {enquiry.course_name && (
                                        <div className="flex items-center gap-1 text-primary text-[11px] font-semibold min-w-0">
                                            <BookOpen size={11} className="flex-shrink-0" />
                                            <span className="truncate">{enquiry.course_name}</span>
                                        </div>
                                    )}
                                    {enquiry.university_name && (
                                        <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase tracking-wider min-w-0">
                                            <Building2 size={10} className="flex-shrink-0" />
                                            <span className="truncate">{enquiry.university_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 sm:w-48 flex-shrink-0 space-y-0.5 text-[11px] sm:border-l sm:border-white/5 sm:pl-3">
                                    <a
                                        href={`mailto:${enquiry.email}`}
                                        className="flex items-center gap-1.5 text-white/60 hover:text-primary transition-colors min-w-0 group"
                                    >
                                        <Mail size={11} className="flex-shrink-0 text-white/30 group-hover:text-primary transition-colors" />
                                        <span className="truncate">{enquiry.email}</span>
                                    </a>
                                    <a
                                        href={`tel:${enquiry.phone}`}
                                        className="flex items-center gap-1.5 text-white/60 hover:text-primary transition-colors min-w-0 group"
                                    >
                                        <Phone size={11} className="flex-shrink-0 text-white/30 group-hover:text-primary transition-colors" />
                                        <span className="truncate">{enquiry.phone}</span>
                                    </a>
                                </div>

                                <div className="min-w-0 flex-1 sm:border-l sm:border-white/5 sm:pl-3">
                                    {enquiry.message ? (
                                        <div className="flex items-start gap-1 text-white/40 text-[11px] italic">
                                            <MessageSquare size={11} className="flex-shrink-0 mt-0.5 text-white/25" />
                                            <p className="line-clamp-1">{enquiry.message}</p>
                                        </div>
                                    ) : (
                                        <span className="text-white/20 text-[11px] italic">No message</span>
                                    )}
                                </div>

                                <div className="flex items-center text-white/40 text-[11px] flex-shrink-0 sm:w-32 sm:border-l sm:border-white/5 sm:pl-3">
                                    <Calendar size={11} className="mr-1 flex-shrink-0 text-white/30" />
                                    <span className="truncate">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                                </div>

                                <select
                                    value={enquiry.status || 'new'}
                                    onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                                    className={`flex-shrink-0 self-start sm:self-center text-[10px] font-bold uppercase px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${STATUS_STYLES[enquiry.status] || STATUS_STYLES.new}`}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s} className="bg-black text-white">{STATUS_LABELS[s]}</option>
                                    ))}
                                </select>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseEnquiries;
