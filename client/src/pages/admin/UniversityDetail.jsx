import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    Users,
    BookOpen,
    ArrowLeft,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Download,
    Edit3,
    Camera,
    Save,
    X,
    Globe,
    Phone,
    MapPin
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const UniversityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [university, setUniversity] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        bio: '',
        location: '',
        website: '',
        phone: '',
        youtubeUrl: '',
        gallery: [],
        personnel: []
    });
    const [uploading, setUploading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const fetchDetails = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/admin/universities/${id}`, config);
            setUniversity(data.university);
            setStudents(data.students);

            setEditData({
                bio: data.university.bio || '',
                location: data.university.profile?.location || '',
                website: data.university.profile?.website || '',
                phone: data.university.profile?.phone || '',
                youtubeUrl: data.university.profile?.youtubeUrl || '',
                gallery: data.university.profile?.gallery || [],
                personnel: data.university.profile?.personnel || []
            });
        } catch (error) {
            console.error('Error fetching university details:', error);
            showToast('Failed to load university details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleSaveProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.put(`/api/admin/universities/${id}/profile`, editData, config);

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
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post(`/api/admin/universities/${id}/upload-image`, formData, config);

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
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post(`/api/admin/universities/${id}/upload-cover`, formData, config);

            showToast('Cover image uploaded successfully', 'success');
            fetchDetails();
        } catch (error) {
            console.error('Error uploading cover image:', error);
            showToast(error.response?.data?.message || 'Failed to upload cover image', 'error');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleAddPersonnel = () => {
        setEditData({
            ...editData,
            personnel: [...editData.personnel, { name: '', role: '', image: '' }]
        });
    };

    const handleUpdatePersonnel = (index, field, value) => {
        const updated = [...editData.personnel];
        updated[index][field] = value;
        setEditData({ ...editData, personnel: updated });
    };

    const handleRemovePersonnel = (index) => {
        const updated = editData.personnel.filter((_, i) => i !== index);
        setEditData({ ...editData, personnel: updated });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!university) {
        return (
            <div className="text-center py-20">
                <p className="text-white/60 mb-4">University not found</p>
                <ModernButton onClick={() => navigate('/admin/university')}>
                    Back to List
                </ModernButton>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/university')}
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
                        variant={isEditing ? "danger" : "secondary"}
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
                            {university.profileImage ? (
                                <img
                                    src={university.profileImage}
                                    alt={university.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/128?text=UNI';
                                    }}
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
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">About / Bio</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary transition-all resize-none"
                                        rows="4"
                                        placeholder="Enter university description..."
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 text-white/30" size={14} />
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                            placeholder="City, Country"
                                            value={editData.location}
                                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 text-white/30" size={14} />
                                        <input
                                            type="url"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                            placeholder="https://university.edu"
                                            value={editData.website}
                                            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-white/30" size={14} />
                                        <input
                                            type="tel"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                            placeholder="+1 234 567 890"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">YouTube Video URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={editData.youtubeUrl}
                                        onChange={(e) => setEditData({ ...editData, youtubeUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {university.bio && (
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-white/60 text-xs leading-relaxed">{university.bio}</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Email</span>
                                    <span className="text-white text-sm font-semibold">{university.email}</span>
                                </div>
                                {university.profile?.location && (
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Location</span>
                                        <span className="text-white text-sm font-semibold">{university.profile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Discount Rate</span>
                                    <span className="text-emerald-400 text-sm font-bold">{university.discountRate || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Status</span>
                                    <div className="flex items-center space-x-1.5">
                                        <span className={`w-2 h-2 rounded-full ${university.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        <span className={`text-xs font-bold ${university.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {university.isVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center">
                                <p className="text-primary text-xl font-bold">{students.length}</p>
                                <p className="text-white/30 text-[10px] font-black uppercase">Students</p>
                            </div>
                            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-center">
                                <p className="text-indigo-400 text-xl font-bold">{university.assignedCourses?.length || 0}</p>
                                <p className="text-white/30 text-[10px] font-black uppercase">Courses</p>
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
                        {university.profile?.coverImage ? (
                            <img 
                                src={university.profile.coverImage} 
                                alt="Cover" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=COVER'; }}
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

                {/* Gallery Card (Admin Only) */}
                <GlassCard className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-semibold text-white font-inter flex items-center">
                        <Camera size={16} className="mr-2 text-primary" /> Photo Gallery
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Paste image URL..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                                id="gallery-input"
                            />
                            <button 
                                onClick={() => {
                                    const input = document.getElementById('gallery-input');
                                    if (input.value) {
                                        setEditData({ ...editData, gallery: [...editData.gallery, input.value] });
                                        input.value = '';
                                    }
                                }}
                                className="px-3 py-2 bg-primary/20 text-primary rounded-xl text-xs font-bold uppercase"
                            >
                                Add
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {editData.gallery.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                    <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                    <button 
                                        onClick={() => {
                                            const updated = editData.gallery.filter((_, i) => i !== idx);
                                            setEditData({ ...editData, gallery: updated });
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* Right Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Courses List */}
                    <GlassCard className="!p-0 border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white font-inter flex items-center">
                                <BookOpen size={18} className="mr-2 text-primary" /> Assigned Curriculums
                            </h3>
                            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase">
                                {university.assignedCourses?.length || 0} Total
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {university.assignedCourses?.length > 0 ? (
                                university.assignedCourses.map(course => (
                                    <div
                                        key={course._id}
                                        onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-primary/50 transition-all flex items-center space-x-4 cursor-pointer hover:bg-white/10"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate text-sm">{course.title}</p>
                                            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{course.category}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">No Courses Linked</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Students List */}
                    <GlassCard className="!p-0 border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white font-inter flex items-center">
                                <Users size={18} className="mr-2 text-emerald-400" /> Registered Learners
                            </h3>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase">
                                {students.length} Active
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Learner</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Enrolled Course</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Verification</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Joining Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {students.map(student => (
                                        <tr
                                            key={student._id}
                                            className="hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/admin/students`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs uppercase">
                                                        {student.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">{student.name}</p>
                                                        <p className="text-white/40 text-[10px]">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white text-xs font-semibold">{student.course || 'Enrolled'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.isVerified ? (
                                                    <span className="flex items-center text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <CheckCircle size={12} className="mr-1" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                                                        <XCircle size={12} className="mr-1" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-xs font-medium">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr key="no-students-row">
                                            <td colSpan="4" className="px-6 py-12 text-center text-white/20 text-xs font-black uppercase tracking-[0.3em]">
                                                No Students Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Personnel Manager */}
                    <GlassCard className="!p-0 border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white font-inter flex items-center">
                                <Users size={18} className="mr-2 text-purple-400" /> Key Personnel & Directors
                            </h3>
                            {isEditing && (
                                <button 
                                    onClick={handleAddPersonnel}
                                    className="px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold uppercase transition-colors"
                                >
                                    + Add Person
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            {!isEditing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {university.profile?.personnel?.length > 0 ? (
                                        university.profile.personnel.map((person, idx) => (
                                            <div key={idx} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/20">
                                                    {person.image ? (
                                                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-bold uppercase">
                                                            {person.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{person.name}</p>
                                                    <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{person.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-6 text-center text-white/30 text-xs font-black uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                                            No personnel added
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {editData.personnel.map((person, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                                            <div className="flex-1 space-y-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="Full Name" 
                                                    value={person.name}
                                                    onChange={(e) => handleUpdatePersonnel(idx, 'name', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Role / Title" 
                                                    value={person.role}
                                                    onChange={(e) => handleUpdatePersonnel(idx, 'role', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                />
                                                <input 
                                                    type="url" 
                                                    placeholder="Image URL (Optional)" 
                                                    value={person.image}
                                                    onChange={(e) => handleUpdatePersonnel(idx, 'image', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleRemovePersonnel(idx)}
                                                className="self-start sm:self-center p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {editData.personnel.length === 0 && (
                                        <div className="text-center py-6 text-white/30 text-xs font-black uppercase">Click 'Add Person' to build directory</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default UniversityDetail;
