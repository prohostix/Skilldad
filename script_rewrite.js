const fs = require('fs');

let content = fs.readFileSync('client/src/pages/admin/UniversityManagement.jsx', 'utf8');

// 1. Add editModalTab state
content = content.replace(
    /const \[openEdit, setOpenEdit\] = useState\(false\);/,
    "const [openEdit, setOpenEdit] = useState(false);\n    const [editModalTab, setEditModalTab] = useState('basic');"
);

// 2. Expand handleEditPartner
const handleEditPartnerOriginal = `    const handleEditPartner = (partner) => {
        setSelectedPartner(partner);
        setNewRate(partner.discountRate || 0);
        setEditData({
            bio: partner.bio || '',
            password: '',
            profileImage: partner.profileImage || partner.profile_image || '',
            achievements: (partner.profile?.achievements && partner.profile.achievements.length > 0) ? partner.profile.achievements : [...DEFAULT_ACHIEVEMENTS],
            videos: partner.profile?.videos || []
        });
        setOpenEdit(true);
    };`;

const handleEditPartnerNew = `    const handleEditPartner = (partner) => {
        setSelectedPartner(partner);
        setNewRate(partner.discountRate || 0);
        setEditModalTab('basic');
        setEditData({
            name: partner.name || '',
            email: partner.email || '',
            role: partner.role || 'partner',
            bio: partner.bio || partner.profile?.description || '',
            password: '',
            profileImage: partner.profileImage || partner.profile_image || partner.profile?.profileImage || '',
            coverImage: partner.profile?.coverImage || partner.profile?.cover_image || '',
            location: partner.profile?.location || '',
            website: partner.profile?.website || '',
            phone: partner.profile?.phone || '',
            youtubeUrl: partner.profile?.youtubeUrl || partner.profile?.youtube_url || '',
            achievements: (partner.profile?.achievements && partner.profile.achievements.length > 0) ? partner.profile.achievements : [...DEFAULT_ACHIEVEMENTS],
            videos: partner.profile?.videos || [],
            gallery: partner.profile?.gallery || [],
            certificates: partner.profile?.certificates || [],
            foundedYear: partner.profile?.foundedYear || partner.profile?.foundation_year || ''
        });
        setOpenEdit(true);
    };`;

content = content.replace(handleEditPartnerOriginal, handleEditPartnerNew);
if (!content.includes(handleEditPartnerNew)) {
    // try a more loose replacement
    const idx = content.indexOf('const handleEditPartner = (partner) => {');
    const endIdx = content.indexOf('setOpenEdit(true);\n    };', idx) + 'setOpenEdit(true);\n    };'.length;
    if (idx !== -1 && endIdx > idx) {
        content = content.substring(0, idx) + handleEditPartnerNew + content.substring(endIdx);
    }
}

// 3. Update handleUpdatePartner to call both endpoints
const updateOriginal = `            console.log('[B2B] Updating entity', selectedPartner._id, payload);

            const { data } = await axios.put(
                \`/api/admin/entities/\${selectedPartner._id}\`,
                payload,
                config
            );`;

const updateNew = `            console.log('[B2B] Updating entity', selectedPartner._id, payload);

            // 1. Update basic entity fields (role, discount, email, name, password)
            const { data } = await axios.put(
                \`/api/admin/entities/\${selectedPartner._id}\`,
                payload,
                config
            );
            
            // 2. Update rich profile fields
            const profilePayload = {
                bio: payload.bio,
                location: editData.location,
                website: editData.website,
                phone: editData.phone,
                youtubeUrl: editData.youtubeUrl,
                achievements: editData.achievements,
                videos: editData.videos,
                certificates: editData.certificates,
                gallery: editData.gallery,
                profileImage: editData.profileImage,
                coverImage: editData.coverImage,
                foundedYear: editData.foundedYear
            };
            
            await axios.put(
                \`/api/admin/universities/\${selectedPartner._id}/profile\`,
                profilePayload,
                config
            );`;
content = content.replace(updateOriginal, updateNew);


// 4. Rewrite the modal UI
const modalStartIdx = content.indexOf('{/* Edit Partner Modal */}');
const modalEndIdx = content.indexOf('{/* Onboard New Entity Dialog */}');

const newModal = `{/* Edit Partner Modal */}
            {openEdit && (
                <div
                    className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpenEdit(false); }}
                >
                    <div
                        className="w-full max-w-2xl bg-black/95 rounded-[24px] p-5 sm:p-6 border-2 border-primary/20 my-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white font-inter mb-4">Edit Entity Profile</h3>
                        
                        <div className="flex space-x-2 mb-6 overflow-x-auto custom-scrollbar pb-2">
                            {['basic', 'details', 'media', 'achievements'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setEditModalTab(tab)}
                                    className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap \${editModalTab === tab ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}\`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {editModalTab === 'basic' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex flex-col items-center mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 relative group">
                                    <div
                                        className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-lg overflow-hidden relative cursor-pointer"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        {editData.profileImage ? (
                                            <img
                                                src={getMediaUrl(editData.profileImage)}
                                                alt={editData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Building2 size={32} />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={16} className="text-white" />
                                        </div>
                                        {logoUploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Update Profile Logo</p>
                                    <div className="w-full mt-2 px-2">
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30"
                                            placeholder="Or paste image URL"
                                            value={editData.profileImage}
                                            onChange={e => setEditData(prev => ({ ...prev, profileImage: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Entity Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.name}
                                            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.email}
                                            onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Role</label>
                                        <select
                                            className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.role}
                                            onChange={e => setEditData(prev => ({ ...prev, role: e.target.value }))}
                                        >
                                            <option value="partner">Partner</option>
                                            <option value="university">University</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Discount Rate (%)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary"
                                            value={newRate}
                                            onChange={e => setNewRate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        placeholder="Leave blank to keep current"
                                        value={editData.password}
                                        onChange={e => setEditData(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {editModalTab === 'details' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Description / Bio</label>
                                    <textarea
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary h-24 resize-none"
                                        value={editData.bio}
                                        placeholder="Brief description..."
                                        onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Location</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.location}
                                            onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Foundation Year</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.foundedYear}
                                            onChange={e => setEditData(prev => ({ ...prev, foundedYear: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Website</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.website}
                                            onChange={e => setEditData(prev => ({ ...prev, website: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.phone}
                                            onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {editModalTab === 'media' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Cover Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        value={editData.coverImage}
                                        placeholder="https://..."
                                        onChange={e => setEditData(prev => ({ ...prev, coverImage: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">YouTube Video URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        value={editData.youtubeUrl}
                                        placeholder="https://youtube.com/..."
                                        onChange={e => setEditData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                                    />
                                </div>
                                
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <label className="block text-xs font-bold text-white/90 uppercase tracking-widest mb-2">Gallery Upload</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setSelectedGalleryImages(Array.from(e.target.files))}
                                        className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    />
                                    {selectedGalleryImages.length > 0 && (
                                        <p className="text-xs text-white/50 mt-2">{selectedGalleryImages.length} file(s) selected</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {editModalTab === 'achievements' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Milestones & Achievements</label>
                                    <button 
                                        type="button"
                                        onClick={() => setEditData(prev => ({ ...prev, achievements: [...prev.achievements, { title: '', desc: '', image: '' }] }))}
                                        className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors flex items-center"
                                    >
                                        <Plus size={14} className="mr-1"/> Add New
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {editData.achievements.map((ach, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newAch = [...editData.achievements];
                                                    newAch.splice(idx, 1);
                                                    setEditData(prev => ({ ...prev, achievements: newAch }));
                                                }}
                                                className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                            <div className="space-y-2 pr-6">
                                                <input 
                                                    type="text" 
                                                    placeholder="Title (e.g. 50+ Global Awards)"
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                                    value={ach.title}
                                                    onChange={(e) => {
                                                        const newAch = [...editData.achievements];
                                                        newAch[idx].title = e.target.value;
                                                        setEditData(prev => ({ ...prev, achievements: newAch }));
                                                    }}
                                                />
                                                <textarea 
                                                    placeholder="Short Description"
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white h-16 resize-none"
                                                    value={ach.desc}
                                                    onChange={(e) => {
                                                        const newAch = [...editData.achievements];
                                                        newAch[idx].desc = e.target.value;
                                                        setEditData(prev => ({ ...prev, achievements: newAch }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {editData.achievements.length === 0 && (
                                        <div className="text-center py-6 text-white/30 text-sm italic">No achievements added.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 mt-8">
                            <button
                                onClick={() => setOpenEdit(false)}
                                className="flex-1 py-2.5 text-sm font-bold text-white/70 hover:bg-white/5 rounded-xl transition-colors border border-white/10"
                            >
                                Cancel
                            </button>
                            <ModernButton
                                onClick={handleUpdatePartner}
                                className="flex-1 !py-2.5 text-sm font-bold tracking-wide"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Update Details'}
                            </ModernButton>
                        </div>
                    </div>
                </div>
            )}
            {/* Onboard New Entity Dialog */}`;

content = content.substring(0, modalStartIdx) + newModal + content.substring(modalEndIdx + '{/* Onboard New Entity Dialog */}'.length);

fs.writeFileSync('client/src/pages/admin/UniversityManagement.jsx', content);
console.log('Done rewriting UniversityManagement.jsx');
