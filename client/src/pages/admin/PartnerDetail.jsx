import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Users,
    DollarSign,
    Ticket,
    Wallet,
    TrendingUp,
    Calendar,
    CheckCircle,
    XCircle,
    Award,
    FileText,
    Globe
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const PartnerDetail = () => {
    const { partnerId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [partner, setPartner] = useState(null);
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartnerDetails();
    }, [partnerId]);

    const fetchPartnerDetails = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch partner basic info
            const { data: partnerData } = await axios.get(`/api/admin/users/${partnerId}`, config);
            setPartner(partnerData);

            // Fetch partner stats
            const { data: statsData } = await axios.get(`/api/admin/partners/${partnerId}`, config);
            setStats(statsData.stats || {});

            // Fetch students registered by this partner
            const { data: studentsData } = await axios.get(`/api/admin/students?registeredBy=${partnerId}`, config);
            setStudents(studentsData || []);

            // Fetch partner discount codes
            const { data: discountsData } = await axios.get(`/api/admin/partners/${partnerId}/discounts`, config);
            setDiscounts(discountsData || []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching partner details:', error);
            showToast('Failed to load partner details', 'error');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-white/50 mb-4">Partner not found</p>
                <ModernButton onClick={() => navigate('/admin/b2b')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to B2B Management
                </ModernButton>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/b2b')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div>
                        <DashboardHeading title={partner.name} />
                        <p className="text-sm text-white/50 mt-1">B2B Partner Details & Analytics</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        partner.isVerified 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400'
                    }`}>
                        {partner.isVerified ? 'Active' : 'Pending'}
                    </span>
                </div>
            </div>

            {/* Partner Info Card */}
            <GlassCard className="p-6">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                        {partner.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{partner.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-white/70">
                                <Mail size={16} className="text-primary" />
                                <span className="text-sm">{partner.email}</span>
                            </div>
                            {partner.profile?.phone && (
                                <div className="flex items-center gap-2 text-white/70">
                                    <Phone size={16} className="text-primary" />
                                    <span className="text-sm">{partner.profile.phone}</span>
                                </div>
                            )}
                            {partner.profile?.location && (
                                <div className="flex items-center gap-2 text-white/70">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="text-sm">{partner.profile.location}</span>
                                </div>
                            )}
                            {partner.profile?.website && (
                                <div className="flex items-center gap-2 text-white/70">
                                    <Globe size={16} className="text-primary" />
                                    <a href={partner.profile.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                                        {partner.profile.website}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-white/70">
                                <Calendar size={16} className="text-primary" />
                                <span className="text-sm">Joined {new Date(partner.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <Award size={16} className="text-primary" />
                                <span className="text-sm">Discount Rate: {partner.discountRate || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl">
                            <Users size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Enrolled Students</p>
                            <p className="text-2xl font-bold text-white">{stats?.studentsCount || students.length || 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-500/20 rounded-xl">
                            <Ticket size={24} className="text-pink-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Discount Codes</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalCodes || discounts.length || 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <Wallet size={24} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Pending Payouts</p>
                            <p className="text-2xl font-bold text-amber-400">₹{stats?.pendingPayouts?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <DollarSign size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Total Earnings</p>
                            <p className="text-2xl font-bold text-emerald-400">₹{stats?.totalEarnings?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Registered Students */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Registered Students ({students.length})
                </h3>
                {students.length > 0 ? (
                    <div className="space-y-3">
                        {students.map((student) => (
                            <div key={student._id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {student.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{student.name}</p>
                                            <p className="text-xs text-white/50">{student.email}</p>
                                            {student.partnerCode && (
                                                <p className="text-xs text-amber-400 font-mono mt-1">Code: {student.partnerCode}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            student.isVerified 
                                                ? 'bg-emerald-500/20 text-emerald-400' 
                                                : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {student.isVerified ? 'Active' : 'Pending'}
                                        </span>
                                        <p className="text-xs text-white/40 mt-1">
                                            {new Date(student.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-white/50">
                        <Users className="mx-auto mb-2 opacity-50" size={32} />
                        <p>No students registered yet</p>
                    </div>
                )}
            </GlassCard>

            {/* Discount Codes */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Ticket size={20} className="text-primary" />
                    Discount Codes ({discounts.length})
                </h3>
                {discounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {discounts.map((discount) => (
                            <div key={discount._id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-bold font-mono">{discount.code}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        discount.isActive 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {discount.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-white/70">
                                    {discount.type === 'percentage' ? `${discount.value}% off` : `₹${discount.value} off`}
                                </p>
                                <p className="text-xs text-white/40 mt-2">
                                    Used: {discount.usageCount || 0} times
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-white/50">
                        <Ticket className="mx-auto mb-2 opacity-50" size={32} />
                        <p>No discount codes created yet</p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default PartnerDetail;
