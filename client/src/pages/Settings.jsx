import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, Upload } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const SettingsTab = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 w-full md:w-auto font-bold text-sm ${active
            ? 'bg-[#7C3AED]/20 text-white border border-[#7C3AED]/50 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
            : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
    >
        <Icon size={16} />
        <span>{label}</span>
    </button>
);

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { updateUser } = useUser();

    // Profile form data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        name: '', // For single name (University/Partner)
        email: '',
        bio: '',
        website: '',
        location: '',
        phone: '',
        contactPerson: ''
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailDigests: true,
        courseUpdates: true,
        newComments: false,
        promotionalOffers: false,
    });

    // Security settings
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Load user data on mount
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo) {
            setProfileData({
                firstName: userInfo.name?.split(' ')[0] || '',
                lastName: userInfo.name?.split(' ')[1] || '',
                name: userInfo.name || '',
                email: userInfo.email || '',
                bio: userInfo.bio || '',
                website: userInfo.profile?.website || '',
                location: userInfo.profile?.location || '',
                phone: userInfo.profile?.phone || '',
                contactPerson: userInfo.profile?.contactPerson || ''
            });
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!profileImage) {
            showToast('Please select an image to upload.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('profileImage', profileImage);

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.post('/api/users/upload-profile-image', formData, config);

            // Update user context and localStorage
            const updatedUser = { ...userInfo, profileImage: data.profileImage };
            updateUser(updatedUser);

            showToast('Profile image updated successfully!', 'success');
            setImagePreview(null); // Clear preview after upload
            setProfileImage(null); // Clear selected file
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to upload profile image', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const isOrg = userInfo.role === 'university' || userInfo.role === 'partner';

            const updateData = {
                name: isOrg ? profileData.name : `${profileData.firstName} ${profileData.lastName}`,
                email: profileData.email,
                bio: profileData.bio,
                profile: {
                    website: profileData.website,
                    location: profileData.location,
                    phone: profileData.phone,
                    contactPerson: profileData.contactPerson
                }
            };

            const { data } = await axios.put('/api/users/profile', updateData, config);

            // Update user context and localStorage
            const updatedUser = { ...userInfo, ...data };
            updateUser(updatedUser); // Update context instantly

            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of handlers)

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isOrganization = userInfo.role === 'university' || userInfo.role === 'partner';

    const handleNotificationsSave = () => {
        localStorage.setItem('notificationSettings', JSON.stringify(notifications));
        showToast('Notification preferences saved!', 'success');
    };

    const handleSecuritySave = async () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (securityData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            await axios.put('/api/users/password', {
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            }, config);

            showToast('Password updated successfully!', 'success');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (activeTab === 'profile') {
            handleProfileSave();
        } else if (activeTab === 'notifications') {
            handleNotificationsSave();
        } else if (activeTab === 'security') {
            handleSecuritySave();
        }
    };

    return (
        <div className="min-h-screen text-white selection:bg-primary/30 font-inter">
            <div className="pt-2 pb-12 px-6 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-base font-bold text-white font-inter tracking-tight">Account Settings</h1>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:w-48 space-y-1.5">
                        <SettingsTab
                            active={activeTab === 'profile'}
                            label="Profile"
                            icon={User}
                            onClick={() => setActiveTab('profile')}
                        />
                        <SettingsTab
                            active={activeTab === 'notifications'}
                            label="Notifications"
                            icon={Bell}
                            onClick={() => setActiveTab('notifications')}
                        />
                        <SettingsTab
                            active={activeTab === 'security'}
                            label="Security"
                            icon={Shield}
                            onClick={() => setActiveTab('security')}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <GlassCard className="p-4">
                            {activeTab === 'profile' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                        <h2 className="text-base font-semibold text-white">Profile Information</h2>
                                        <span className="text-xs text-white/40">Update your personal details</span>
                                    </div>

                                    <div className="flex items-start space-x-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="relative group flex-shrink-0">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile"
                                                    className="w-16 h-16 rounded-lg object-cover border-2 border-primary/30"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-base font-bold border-2 border-primary/30">
                                                    {profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'}
                                                    {profileData.lastName ? profileData.lastName.charAt(0).toUpperCase() : ''}
                                                </div>
                                            )}
                                            <label
                                                htmlFor="profile-upload"
                                                className="absolute inset-0 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                            >
                                                <Upload size={14} className="text-white" />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="profile-upload"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="profile-upload"
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg cursor-pointer transition-all"
                                                onClick={(e) => {
                                                    // Only trigger upload if file selected, otherwise standard label behavior opens dialog
                                                    if (profileImage) {
                                                        e.preventDefault();
                                                        handleImageUpload();
                                                    }
                                                }}
                                            >
                                                <Upload size={12} className="mr-1.5" />
                                                {profileImage ? 'Upload New Photo' : 'Select Photo'}
                                            </label>
                                            {profileImage && (
                                                <button
                                                    onClick={handleImageUpload}
                                                    className="ml-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-all"
                                                >
                                                    Confirm Upload
                                                </button>
                                            )}
                                            <p className="text-[10px] text-white/40 mt-1">JPG, PNG or GIF. Max 800KB</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        {isOrganization ? (
                                            <>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                                                        {userInfo.role === 'university' ? 'University Name' : 'Organization Name'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Official Email</label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.contactPerson}
                                                        onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                        placeholder="Name of contact"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Website</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.website}
                                                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                        placeholder="https://example.edu"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Location / Address</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.location}
                                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">About {userInfo.role === 'university' ? 'University' : 'Organization'}</label>
                                                    <textarea
                                                        rows="3"
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors resize-none"
                                                        placeholder="Brief description..."
                                                    ></textarea>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Bio</label>
                                                    <textarea
                                                        rows="2"
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors resize-none"
                                                        placeholder="Tell us about yourself..."
                                                    ></textarea>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notifications' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <h2 className="text-lg font-bold mb-3">Notification Preferences</h2>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'emailDigests', label: 'Email Digests' },
                                            { key: 'courseUpdates', label: 'Course Updates' },
                                            { key: 'newComments', label: 'New Comments' },
                                            { key: 'promotionalOffers', label: 'Promotional Offers' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#7C3AED]/30 transition-colors">
                                                <span className="font-medium text-sm">{item.label}</span>
                                                <button
                                                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                                    className={`relative inline-block w-11 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${notifications[item.key] ? 'bg-[#7C3AED]' : 'bg-white/20'}`}
                                                >
                                                    <span className={`absolute inline-block w-5 h-5 top-0.5 left-0.5 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <h2 className="text-lg font-bold mb-3">Security Settings</h2>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">Current Password</label>
                                            <input
                                                type="password"
                                                value={securityData.currentPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                className="w-full bg-[#020005]/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">New Password</label>
                                            <input
                                                type="password"
                                                value={securityData.newPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                className="w-full bg-[#020005]/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={securityData.confirmPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                className="w-full bg-[#020005]/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                                <ModernButton
                                    className="text-sm py-2"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    <Save size={16} className="mr-2" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </ModernButton>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
