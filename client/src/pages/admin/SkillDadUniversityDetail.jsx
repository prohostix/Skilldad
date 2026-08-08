import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    ArrowLeft,
    Edit3,
    Camera,
    Save,
    X,
    Globe,
    Phone,
    MapPin,
    Mail,
    Youtube,
    CheckCircle,
    Award,
    BookOpen
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/media';

const SkillDadUniversityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [university, setUniversity] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        location: '',
        website: '',
        phone: '',
        email: '',
        description: '',
        badge: '',
        foundation_year: '',
        total_scholars: '',
        specialized_courses: '',
        quality_rating: '',
        career_success: '',
        global_network: '',
        youtubeUrl: '',
        achievements: [],
        assignedCourses: [],
        certificates: []
    });

    const [uploading, setUploading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [uploadingCertificates, setUploadingCertificates] = useState(false);
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const certificatesInputRef = useRef(null);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return { headers: { Authorization: `Bearer ${userInfo.token}` } };
    };

    const fetchDetails = async () => {
        try {
            const { data } = await axios.get(`/api/admin/skilldad-universities/${id}`, getAuthConfig());
            setUniversity(data);
            setEditData({
                name: data.name || '',
                location: data.location || '',
                website: data.website || '',
                phone: data.phone || '',
                email: data.email || '',
                description: data.description || '',
                badge: data.badge || '',
                foundation_year: data.foundation_year || '',
                total_scholars: data.total_scholars || '',
                specialized_courses: data.specialized_courses || '',
                quality_rating: data.quality_rating || '',
                career_success: data.career_success || '',
                global_network: data.global_network || '',
                youtubeUrl: data.youtube_url || '',
                achievements: typeof data.achievements === 'string' ? JSON.parse(data.achievements) : (data.achievements || []),
                assignedCourses: typeof data.assigned_courses === 'string' ? JSON.parse(data.assigned_courses) : (data.assigned_courses || []),
                certificates: typeof data.certificates === 'string' ? JSON.parse(data.certificates) : (data.certificates || [])
            });
        } catch (error) {
            console.error('Error fetching SkillDad university details:', error);
            showToast('Failed to load university details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses/admin', getAuthConfig());
            setAllCourses(data.courses || data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchAllCourses();
    }, [id]);

    const handleSaveProfile = async () => {
        try {
            await axios.put(`/api/admin/skilldad-universities/${id}`, editData, getAuthConfig());
            showToast('Profile updated successfully', 'success');
            setIsEditing(false);
            fetchDetails();
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            const config = { ...getAuthConfig(), headers: { ...getAuthConfig().headers, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`/api/admin/skilldad-universities/${id}/upload-image`, formData, config);
            showToast('Image uploaded successfully', 'success');
            fetchDetails();
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast(error.response?.data?.message || 'Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('coverImage', file);

        setUploadingCover(true);
        try {
            const config = { ...getAuthConfig(), headers: { ...getAuthConfig().headers, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`/api/admin/skilldad-universities/${id}/upload-cover`, formData, config);
            showToast('Cover image uploaded successfully', 'success');
            fetchDetails();
        } catch (error) {
            console.error('Error uploading cover image:', error);
            showToast(error.response?.data?.message || 'Failed to upload cover image', 'error');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('galleryImages', file));

        setUploadingGallery(true);
        try {
            const config = { ...getAuthConfig(), headers: { ...getAuthConfig().headers, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`/api/admin/skilldad-universities/${id}/upload-gallery`, formData, config);
            showToast(`${files.length} images added to gallery`, 'success');
            fetchDetails();
        } catch (error) {
            console.error('Error uploading gallery images:', error);
            showToast(error.response?.data?.message || 'Failed to upload gallery images', 'error');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleCertificatesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('certificateImages', file));

        setUploadingCertificates(true);
        try {
            const config = { ...getAuthConfig(), headers: { ...getAuthConfig().headers, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`/api/admin/skilldad-universities/${id}/upload-certificates`, formData, config);
            showToast(`${files.length} certificates added`, 'success');
            fetchDetails();
        } catch (error) {
            console.error('Error uploading certificates:', error);
            showToast(error.response?.data?.message || 'Failed to upload certificates', 'error');
        } finally {
            setUploadingCertificates(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!university) {
        return (
            <div className="text-center py-12 space-y-4">
                <p className="text-white/50">University not found.</p>
                <ModernButton onClick={() => navigate('/admin/skilldad-universities')}>
                    Back to List
                </ModernButton>
            </div>
        );
    }

    const gallery = university.gallery || [];
    const certificates = university.certificates || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/skilldad-universities')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-left">
                        <DashboardHeading title={university.name} />
                        <p className="text-white/40 text-sm font-inter">Institution Intelligence Hub</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton
                        variant={isEditing ? 'danger' : 'secondary'}
                        onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                    >
                        {isEditing ? <><X size={18} className="mr-2" /> Cancel</> : <><Edit3 size={18} className="mr-2" /> Edit Profile</>}
                    </ModernButton>
                    {isEditing && (
                        <ModernButton onClick={handleSaveProfile}>
                            <Save size={18} className="mr-2" /> Save Changes
                        </ModernButton>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Info Card */}
                <GlassCard className="lg:col-span-1 space-y-6">
                    <div className="flex flex-col items-center py-6 border-b border-white/10 relative group">
                        <div
                            className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-2xl shadow-primary/20 overflow-hidden relative cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {university.profile_image ? (
                                <img
                                    src={getMediaUrl(university.profile_image)}
                                    alt={university.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Building2 size={48} />
                            )}

                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <h3 className="text-xl font-bold text-white text-center mt-3">{university.name}</h3>
                        <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">University Logo</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        {isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">University Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3 text-white/30" size={16} />
                                        <input
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Email</span>
                                <span className="text-white text-sm font-semibold truncate ml-2">{university.email || '—'}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Status</span>
                            <div className="flex items-center space-x-1.5">
                                <span className={`w-2 h-2 rounded-full ${university.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                <span className={`text-xs font-bold ${university.is_active ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {university.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Cover Image Card */}
                <GlassCard className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-semibold text-white font-inter flex items-center">
                        <Camera size={16} className="mr-2 text-primary" /> Cover Image
                    </h3>
                    <div
                        className="w-full h-32 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => coverInputRef.current.click()}
                    >
                        {university.cover_image ? (
                            <img
                                src={getMediaUrl(university.cover_image)}
                                alt="Cover"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="text-center text-white/40 group-hover:text-primary transition-colors">
                                <Camera size={24} className="mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Upload Cover</p>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-bold uppercase tracking-widest">Change Cover</p>
                        </div>

                        {uploadingCover && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={coverInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                    />
                </GlassCard>

                {/* Gallery Card */}
                <GlassCard className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-semibold text-white font-inter flex items-center">
                        <Camera size={16} className="mr-2 text-primary" /> Photo Gallery
                    </h3>
                    <div className="space-y-4">
                        <label
                            className="w-full py-3 bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/20 transition-all group"
                            onClick={() => galleryInputRef.current.click()}
                        >
                            {uploadingGallery ? (
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Camera size={20} className="text-primary mb-1 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase text-primary">Upload Campus Photos</span>
                                </>
                            )}
                        </label>
                        <input
                            type="file"
                            ref={galleryInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                        />

                        <div className="py-2 border-b border-white/5 mb-2">
                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                                {gallery.length} Campus Photos Saved
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {gallery.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                    <img src={getMediaUrl(img)} className="w-full h-full object-cover" alt="Gallery" />
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* Certificates Card */}
                <GlassCard className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-semibold text-white font-inter flex items-center">
                        <Camera size={16} className="mr-2 text-primary" /> Certificates
                    </h3>
                    <div className="space-y-4">
                        <label
                            className="w-full py-3 bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/20 transition-all group"
                            onClick={() => certificatesInputRef.current.click()}
                        >
                            {uploadingCertificates ? (
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Camera size={20} className="text-primary mb-1 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase text-primary">Upload Certificates</span>
                                </>
                            )}
                        </label>
                        <input
                            type="file"
                            ref={certificatesInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleCertificatesUpload}
                        />

                        <div className="py-2 border-b border-white/5 mb-2">
                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                                {certificates.length} Certificates Saved
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {certificates.map((img, idx) => {
                                // For backward compatibility with images vs structured certs
                                if(typeof img === 'string') {
                                    return (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                            <img src={getMediaUrl(img)} className="w-full h-full object-cover" alt="Certificate" />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <Award size={20} className="mx-auto mb-2 text-amber-500" />
                                        <p className="text-white text-xs font-bold truncate">{img.title}</p>
                                        <p className="text-white/40 text-[9px] uppercase font-black truncate">{img.issuer}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Institutional Profile Details */}
            {isEditing && (
                <GlassCard className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                        <h3 className="text-base font-semibold text-white font-inter flex items-center">
                            <Edit3 size={18} className="mr-2 text-primary" /> Institutional Profile Details
                        </h3>
                        <p className="text-white/40 text-xs mt-1">Update settings and information for this university.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-primary transition-all resize-none min-h-[150px]"
                                placeholder="Describe the university..."
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Physical Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3 text-white/30" size={16} />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                    placeholder="City, Country"
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Official Website</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3 text-white/30" size={16} />
                                <input
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                    placeholder="https://university.edu"
                                    value={editData.website}
                                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Contact Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3 text-white/30" size={16} />
                                <input
                                    type="tel"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                    placeholder="+1 (555) 000-0000"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* New Highlights Fields */}
                    <div className="md:col-span-2 grid md:grid-cols-2 gap-6 pt-4 border-t border-white/10 mt-6">
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Badge (e.g. Global Academic Partner)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.badge}
                                onChange={(e) => setEditData({ ...editData, badge: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Foundation Year</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.foundation_year}
                                onChange={(e) => setEditData({ ...editData, foundation_year: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Total Scholars (e.g. 25K+ Users)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.total_scholars}
                                onChange={(e) => setEditData({ ...editData, total_scholars: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Specialized Courses (e.g. 4)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.specialized_courses}
                                onChange={(e) => setEditData({ ...editData, specialized_courses: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Quality Rating (e.g. A++ Triple Crown)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.quality_rating}
                                onChange={(e) => setEditData({ ...editData, quality_rating: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Career Success (e.g. 98% Placement)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.career_success}
                                onChange={(e) => setEditData({ ...editData, career_success: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Global Network (e.g. 120+ Alliances)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                value={editData.global_network}
                                onChange={(e) => setEditData({ ...editData, global_network: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6 space-y-6">
                        {/* YouTube URL */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Success Story YouTube URL</label>
                            <div className="relative">
                                <Youtube className="absolute left-4 top-3 text-white/30" size={16} />
                                <input
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={editData.youtubeUrl}
                                    onChange={(e) => setEditData({ ...editData, youtubeUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider">Achievements (Milestones)</label>
                                <button
                                    onClick={() => setEditData({...editData, achievements: [...editData.achievements, { title: '', desc: '' }]})}
                                    className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold uppercase"
                                >
                                    + Add
                                </button>
                            </div>
                            {editData.achievements.map((ach, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={ach.title || ach}
                                            onChange={(e) => {
                                                const newAch = [...editData.achievements];
                                                if (typeof newAch[idx] === 'object') newAch[idx].title = e.target.value;
                                                else newAch[idx] = e.target.value;
                                                setEditData({...editData, achievements: newAch});
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description (Optional)"
                                            value={ach.desc || ''}
                                            onChange={(e) => {
                                                const newAch = [...editData.achievements];
                                                if (typeof newAch[idx] === 'string') newAch[idx] = { title: newAch[idx], desc: e.target.value };
                                                else newAch[idx].desc = e.target.value;
                                                setEditData({...editData, achievements: newAch});
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                    </div>
                                    <button onClick={() => {
                                        const newAch = editData.achievements.filter((_, i) => i !== idx);
                                        setEditData({...editData, achievements: newAch});
                                    }} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"><X size={16}/></button>
                                </div>
                            ))}
                        </div>

                        {/* Certificates / Accreditations */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider">Accreditations (Structured)</label>
                                <button
                                    onClick={() => setEditData({...editData, certificates: [...editData.certificates, { title: '', issuer: '' }]})}
                                    className="px-3 py-1 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 rounded-lg text-xs font-bold uppercase"
                                >
                                    + Add
                                </button>
                            </div>
                            {editData.certificates.map((cert, idx) => {
                                if (typeof cert === 'string') return null; // Only show structured ones here
                                return (
                                <div key={idx} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Certificate Title (e.g. ISO 9001)"
                                            value={cert.title || ''}
                                            onChange={(e) => {
                                                const newCert = [...editData.certificates];
                                                newCert[idx].title = e.target.value;
                                                setEditData({...editData, certificates: newCert});
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Issuer (e.g. Quality Board)"
                                            value={cert.issuer || ''}
                                            onChange={(e) => {
                                                const newCert = [...editData.certificates];
                                                newCert[idx].issuer = e.target.value;
                                                setEditData({...editData, certificates: newCert});
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                    </div>
                                    <button onClick={() => {
                                        const newCert = editData.certificates.filter((_, i) => i !== idx);
                                        setEditData({...editData, certificates: newCert});
                                    }} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"><X size={16}/></button>
                                </div>
                            )})}
                        </div>

                        {/* Assigned Courses */}
                        <div className="space-y-3">
                            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider">Assigned Courses</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {(allCourses || []).map(course => {
                                    const isSelected = editData.assignedCourses.includes(course._id || course.id);
                                    return (
                                        <div 
                                            key={course._id || course.id} 
                                            onClick={() => {
                                                const id = course._id || course.id;
                                                let newAssigned;
                                                if (isSelected) {
                                                    newAssigned = editData.assignedCourses.filter(c => c !== id);
                                                } else {
                                                    newAssigned = [...editData.assignedCourses, id];
                                                }
                                                setEditData({...editData, assignedCourses: newAssigned});
                                            }}
                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-primary border-primary' : 'border-white/30'}`}>
                                                {isSelected && <CheckCircle size={12} className="text-[#05030B]" />}
                                            </div>
                                            <span className="text-sm font-semibold truncate flex-1">{course.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </GlassCard>
            )}

            {!isEditing && university.description && (
                <GlassCard>
                    <h3 className="text-sm font-semibold text-white font-inter mb-3">About</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{university.description}</p>
                    <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center text-white/60 text-sm">
                            <MapPin size={14} className="mr-2 flex-shrink-0 text-primary" />
                            {university.location || '—'}
                        </div>
                        <div className="flex items-center text-white/60 text-sm">
                            <Phone size={14} className="mr-2 flex-shrink-0 text-primary" />
                            {university.phone || '—'}
                        </div>
                        <div className="flex items-center text-white/60 text-sm truncate">
                            <Globe size={14} className="mr-2 flex-shrink-0 text-primary" />
                            {university.website ? (
                                <a href={university.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors">
                                    {university.website}
                                </a>
                            ) : '—'}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                        {university.badge && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Badge</span>
                                <span className="text-white text-sm font-semibold">{university.badge}</span>
                            </div>
                        )}
                        {university.foundation_year && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Foundation</span>
                                <span className="text-white text-sm font-semibold">{university.foundation_year}</span>
                            </div>
                        )}
                        {university.total_scholars && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Scholars</span>
                                <span className="text-white text-sm font-semibold">{university.total_scholars}</span>
                            </div>
                        )}
                        {university.specialized_courses && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Courses</span>
                                <span className="text-white text-sm font-semibold">{university.specialized_courses}</span>
                            </div>
                        )}
                        {university.quality_rating && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Rating</span>
                                <span className="text-white text-sm font-semibold">{university.quality_rating}</span>
                            </div>
                        )}
                        {university.career_success && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Career</span>
                                <span className="text-white text-sm font-semibold">{university.career_success}</span>
                            </div>
                        )}
                        {university.global_network && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Network</span>
                                <span className="text-white text-sm font-semibold">{university.global_network}</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default SkillDadUniversityDetail;
