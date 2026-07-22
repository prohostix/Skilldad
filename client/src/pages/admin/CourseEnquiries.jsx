import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, BookOpen, Building2, Calendar, Search, Download } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

// Wraps a CSV field in quotes and escapes any quotes inside it, so commas/newlines
// in free-text fields (like the enquiry message) don't break the file's columns.
const csvField = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="Course Enquiries" />
                    <p className="text-white/50 text-sm mt-2">Students who submitted the Enroll form, waiting for a counsellor follow-up</p>
                </div>
                <ModernButton variant="secondary" onClick={handleDownload}>
                    <Download size={16} className="mr-2" />
                    Download {statusFilter !== 'all' ? `(${statusFilter})` : 'All'}
                </ModernButton>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, course, or university..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {['all', ...STATUS_OPTIONS].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${statusFilter === status ? 'bg-primary text-white' : 'text-white/40 hover:text-white/70'}`}
                        >
                            {status}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnquiries.map((enquiry) => (
                        <GlassCard key={enquiry.id} className="!p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-white font-semibold text-base">{enquiry.name}</h3>
                                    {enquiry.course_name && (
                                        <div className="flex items-center gap-1.5 text-primary text-xs font-bold mt-1">
                                            <BookOpen size={12} />
                                            <span>{enquiry.course_name}</span>
                                        </div>
                                    )}
                                    {enquiry.university_name && (
                                        <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-bold uppercase tracking-wider mt-1">
                                            <Building2 size={12} />
                                            <span>{enquiry.university_name}</span>
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={enquiry.status || 'new'}
                                    onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                                    className={`text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${STATUS_STYLES[enquiry.status] || STATUS_STYLES.new}`}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s} className="bg-black text-white capitalize">{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-white/60">
                                    <Mail size={14} className="mr-2 flex-shrink-0" />
                                    <a href={`mailto:${enquiry.email}`} className="truncate hover:text-primary transition-colors">{enquiry.email}</a>
                                </div>
                                <div className="flex items-center text-white/60">
                                    <Phone size={14} className="mr-2 flex-shrink-0" />
                                    <a href={`tel:${enquiry.phone}`} className="hover:text-primary transition-colors">{enquiry.phone}</a>
                                </div>
                                <div className="flex items-center text-white/40 text-xs">
                                    <Calendar size={12} className="mr-2 flex-shrink-0" />
                                    <span>{new Date(enquiry.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {enquiry.message && (
                                <p className="text-white/50 text-xs pt-3 border-t border-white/5 line-clamp-3">{enquiry.message}</p>
                            )}
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseEnquiries;
