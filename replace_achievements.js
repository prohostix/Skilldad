const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin/UniversityDetail.jsx', 'utf8');

const oldAchBtn = 'onClick={() => setEditData({\n                                        ...editData,\n                                        achievements: [...editData.achievements, { title: \'\' }]\n                                    })}';
const newAchBtn = 'onClick={() => setEditData({\n                                        ...editData,\n                                        achievements: [...editData.achievements, { title: \'\', desc: \'\', image: \'\' }]\n                                    })}';
content = content.replace(oldAchBtn, newAchBtn);

const oldAchMap = `                                        <div key={ach.id || \`ach-edit-\${idx}\`} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Achievement Description" 
                                                value={ach.title || ach}
                                                onChange={(e) => {
                                                    const updated = [...editData.achievements];
                                                    if (typeof updated[idx] === 'object') {
                                                        updated[idx].title = e.target.value;
                                                    } else {
                                                        updated[idx] = e.target.value;
                                                    }
                                                    setEditData({ ...editData, achievements: updated });
                                                }}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const updated = editData.achievements.filter((_, i) => i !== idx);
                                                    setEditData({ ...editData, achievements: updated });
                                                }}
                                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>`;
const newAchMap = `                                        <div key={ach.id || \`ach-edit-\${idx}\`} className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                                            <button 
                                                onClick={() => {
                                                    const updated = editData.achievements.filter((_, i) => i !== idx);
                                                    setEditData({ ...editData, achievements: updated });
                                                }}
                                                className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="space-y-2 pr-6">
                                                <input 
                                                    type="text" 
                                                    placeholder="Achievement Title" 
                                                    value={typeof ach === 'object' ? ach.title : ach}
                                                    onChange={(e) => {
                                                        const updated = [...editData.achievements];
                                                        if (typeof updated[idx] === 'object') {
                                                            updated[idx].title = e.target.value;
                                                        } else {
                                                            updated[idx] = { title: e.target.value, desc: '', image: '' };
                                                        }
                                                        setEditData({ ...editData, achievements: updated });
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                />
                                                <textarea 
                                                    placeholder="Description" 
                                                    value={typeof ach === 'object' ? (ach.desc || '') : ''}
                                                    onChange={(e) => {
                                                        const updated = [...editData.achievements];
                                                        if (typeof updated[idx] === 'object') {
                                                            updated[idx].desc = e.target.value;
                                                        } else {
                                                            updated[idx] = { title: ach, desc: e.target.value, image: '' };
                                                        }
                                                        setEditData({ ...editData, achievements: updated });
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none h-16"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={typeof ach === 'object' ? (ach.image || '') : ''}
                                                        onChange={(e) => {
                                                            const updated = [...editData.achievements];
                                                            if (typeof updated[idx] === 'object') {
                                                                updated[idx].image = e.target.value;
                                                            } else {
                                                                updated[idx] = { title: ach, desc: '', image: e.target.value };
                                                            }
                                                            setEditData({ ...editData, achievements: updated });
                                                        }}
                                                        placeholder="Image/PDF/Video URL (optional)"
                                                        className="flex-1 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                                                    />
                                                    <label className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
                                                        Upload
                                                        <input 
                                                            type="file" 
                                                            accept="image/*,application/pdf,video/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                if(e.target.files && e.target.files[0]) {
                                                                    const url = await handleMediaUpload(e.target.files[0]);
                                                                    if(url) {
                                                                        const updated = [...editData.achievements];
                                                                        if (typeof updated[idx] === 'object') {
                                                                            updated[idx].image = url;
                                                                        } else {
                                                                            updated[idx] = { title: ach, desc: '', image: url };
                                                                        }
                                                                        setEditData({ ...editData, achievements: updated });
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>`;

content = content.replace(oldAchMap, newAchMap);

if (content.includes('Upload')) {
  console.log('Success! Writing to file...');
  fs.writeFileSync('client/src/pages/admin/UniversityDetail.jsx', content);
} else {
  console.log('Failed to find replacement target');
}
