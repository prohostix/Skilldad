import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, Building2, User as UserIcon,
    Image as ImageIcon, LayoutGrid, List, Heart
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';

const PartnerLogoManager = () => {
    const [activeTab, setActiveTab] = useState('corporate'); // 'corporate', 'university', 'directors'
    const [logos, setLogos] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkNames, setBulkNames] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', title: '', image: '', logo: '', location: '', students: '', programs: '', order: 0, type: 'corporate' });
    const { showToast } = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };
            const [logosRes, directorsRes] = await Promise.all([
                axios.get('/api/admin/partner-logos', config),
                axios.get('/api/admin/directors', config)
            ]);
            setLogos(logosRes.data);
            setDirectors(directorsRes.data);
            setLoading(false);
        } catch (error) {
            showToast('Failed to fetch data', 'error');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors' ? '/api/admin/directors' : '/api/admin/partner-logos';
            const payload = activeTab === 'directors' ? formData : { ...formData, type: activeTab };
            await axios.post(url, payload, config);

            showToast(`${activeTab === 'directors' ? 'Director' : 'Asset'} added successfully`, 'success');
            setShowAddModal(false);
            setFormData({ name: '', title: '', image: '', logo: '', location: '', students: '', programs: '', order: 0, type: activeTab });
            fetchAll();
        } catch (error) {
            showToast('Submission failed', 'error');
        }
    };

    const handleUpdate = async (id) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors'
                ? `/api/admin/directors/${id}`
                : `/api/admin/partner-logos/${id}`;

            await axios.put(url, editingItem, config);
            showToast('Updated successfully', 'success');
            setEditingItem(null);
            fetchAll();
        } catch (error) {
            showToast('Update failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors'
                ? `/api/admin/directors/${id}`
                : `/api/admin/partner-logos/${id}`;

            await axios.delete(url, config);
            showToast('Deleted successfully', 'success');
            fetchAll();
        } catch (error) {
            showToast('Deletion failed', 'error');
        }
    };

    const toggleActive = async (item) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const url = activeTab === 'directors'
                ? `/api/admin/directors/${item._id}`
                : `/api/admin/partner-logos/${item._id}`;

            await axios.put(url,
                { ...item, isActive: !item.isActive },
                config
            );
            showToast(`Status updated`, 'success');
            fetchAll();
        } catch (error) {
            showToast('Toggle failed', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <DashboardHeading title="Landing Page Assets" />
                    <p className="text-white/50 text-xs mt-1">Manage institutional leads and corporate partners</p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => { setActiveTab('corporate'); setEditingItem(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'corporate' ? 'bg-primary text-white shadow-glow-purple' : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <Building2 size={14} />
                        Hiring Banner
                    </button>
                    <button
                        onClick={() => { setActiveTab('university'); setEditingItem(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'university' ? 'bg-primary text-white shadow-glow-purple' : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={14} />
                        Uni Partners
                    </button>
                    <button
                        onClick={() => { setActiveTab('directors'); setEditingItem(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'directors' ? 'bg-primary text-white shadow-glow-purple' : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <UserIcon size={14} />
                        Directors
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center">
                {activeTab === 'directors' && directors.length === 0 && (
                    <button
                        onClick={async () => {
                            const defaults = [
                                { name: "Prof. Dr. Anastas Angjeli", title: "Honorary President", image: "/assets/directors/anastas.png", order: 1 },
                                { name: "Prof. Dr. Adrian Civici", title: "Rector", image: "/assets/directors/adrian.png", order: 2 },
                                { name: "Prof. Dr. Ramiz Zekaj", title: "President", image: "/assets/directors/ramiz.png", order: 3 },
                                { name: "Prof. Dr. Ismail Kocayusufoglu", title: "Rector", image: "/assets/directors/ismail.png", order: 4 }
                            ];
                            try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                                await Promise.all(defaults.map(d => axios.post('/api/admin/directors', d, config)));
                                showToast('Default leads restored', 'success');
                                fetchAll();
                            } catch (e) {
                                showToast('Failed to restore defaults', 'error');
                            }
                        }}
                        className="text-[10px] font-black uppercase text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                        <Heart size={12} /> Sync Default Leads
                    </button>
                ) || activeTab === 'partners' && logos.length === 0 && (
                    <button
                        onClick={async () => {
                            const defaults = [
                                'TCS', 'Infosys', 'Capgemini', 'Wipro', 'Accenture', 'Cognizant',
                                'HCL Technologies', 'Tech Mahindra', 'IBM', 'Deloitte',
                                'Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'JP Morgan',
                                'McKinsey', 'PwC', 'KPMG', 'Ernst & Young', 'Salesforce'
                            ];
                            try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                                await Promise.all(defaults.map((name, i) => axios.post('/api/admin/partner-logos', { name, order: i + 1 }, config)));
                                showToast('Default companies restored', 'success');
                                fetchAll();
                            } catch (e) {
                                showToast('Failed to restore defaults', 'error');
                            }
                        }}
                        className="text-[10px] font-black uppercase text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                        <Heart size={12} /> Sync Default Companies
                    </button>
                ) || activeTab === 'corporate' && logos.filter(l => l.type === 'corporate').length === 0 && (
                    <button
                        onClick={async () => {
                            const defaults = [
                                'TCS', 'Infosys', 'Capgemini', 'Wipro', 'Accenture', 'Cognizant',
                                'HCL Technologies', 'Tech Mahindra', 'IBM', 'Deloitte',
                                'Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'JP Morgan',
                                'McKinsey', 'PwC', 'KPMG', 'Ernst & Young', 'Salesforce'
                            ];
                            try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                                await Promise.all(defaults.map((name, i) => axios.post('/api/admin/partner-logos', { name, type: 'corporate', order: i + 1 }, config)));
                                showToast('Default companies restored', 'success');
                                fetchAll();
                            } catch (e) {
                                showToast('Failed to restore defaults', 'error');
                            }
                        }}
                        className="text-[10px] font-black uppercase text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                        <Heart size={12} /> Sync Default Banner
                    </button>
                ) || activeTab === 'university' && logos.filter(l => l.type === 'university').length === 0 && (
                    <button
                        onClick={async () => {
                            const defaults = [
                                { name: 'Oxford Digital', location: 'United Kingdom', students: '12K+', programs: '45+', order: 1 },
                                { name: 'MIT Horizon', location: 'United States', students: '18K+', programs: '60+', order: 2 },
                                { name: 'Stanford Online', location: 'United States', students: '15K+', programs: '52+', order: 3 },
                                { name: 'ETH Zurich', location: 'Switzerland', students: '10K+', programs: '38+', order: 4 }
                            ];
                            try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                                await Promise.all(defaults.map((d, i) => axios.post('/api/admin/partner-logos', { ...d, type: 'university' }, config)));
                                showToast('Default universities restored', 'success');
                                fetchAll();
                            } catch (e) {
                                showToast('Failed to restore defaults', 'error');
                            }
                        }}
                        className="text-[10px] font-black uppercase text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                    >
                        <Heart size={12} /> Sync Default Unis
                    </button>
                ) || <div></div>}

                <div className="flex items-center gap-3">
                    {activeTab === 'corporate' && (
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-primary/20"
                        >
                            <List size={16} />
                            Bulk Add Names
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-white text-slate-900 hover:bg-white/90 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl active:scale-95"
                    >
                        <Plus size={16} />
                        Add {activeTab === 'corporate' ? 'Company' : activeTab === 'university' ? 'University' : 'Lead'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab !== 'directors' ? (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Order</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Name</th>
                                        {activeTab === 'university' && (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Location</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Students</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Visibility</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logos.filter(l => l.type === activeTab).length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab === 'university' ? 6 : 4} className="px-6 py-12 text-center text-white/30 text-xs italic">
                                                No {activeTab} assets found. Deploy new assets to begin.
                                            </td>
                                        </tr>
                                    ) : (
                                        logos.filter(l => l.type === activeTab).map((item) => (
                                            <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    {editingItem?._id === item._id ? (
                                                        <input
                                                            type="number"
                                                            value={editingItem.order}
                                                            onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
                                                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                                                        />
                                                    ) : (
                                                        <span className="text-white/60 font-mono text-xs">{item.order}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingItem?._id === item._id ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editingItem.name}
                                                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                                className="w-full max-w-xs px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                                                                placeholder="Name"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editingItem.logo || ''}
                                                                onChange={(e) => setEditingItem({ ...editingItem, logo: e.target.value })}
                                                                className="w-full max-w-xs px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-[10px] focus:outline-none focus:border-primary"
                                                                placeholder="Logo URL (optional)"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                                                                {item.logo ? <img src={item.logo} alt="" className="w-full h-full object-contain" /> : <Building2 size={16} />}
                                                            </div>
                                                            <span className="text-white text-sm font-bold tracking-tight">{item.name}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                {activeTab === 'university' && (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            {editingItem?._id === item._id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingItem.location || ''}
                                                                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                                                                />
                                                            ) : (
                                                                <span className="text-white/40 text-xs">{item.location}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {editingItem?._id === item._id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingItem.students || ''}
                                                                    onChange={(e) => setEditingItem({ ...editingItem, students: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                                                                />
                                                            ) : (
                                                                <span className="text-emerald-400 font-bold text-xs">{item.students}</span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleActive(item)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${item.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
                                                            }`}
                                                    >
                                                        {item.isActive ? 'Active' : 'Hidden'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingItem?._id === item._id ? (
                                                            <>
                                                                <button onClick={() => handleUpdate(item._id)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"><Save size={14} /></button>
                                                                <button onClick={() => setEditingItem(null)} className="p-2 bg-white/10 text-white/50 rounded-lg hover:bg-white/20 transition-colors"><X size={14} /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => setEditingItem(item)} className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={14} /></button>
                                                                <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="directors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {directors.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[32px]">
                                <UserIcon size={48} className="mx-auto text-white/10 mb-4" />
                                <p className="text-white/50 text-sm">No institutional leads found. Deploy first lead profile.</p>
                            </div>
                        ) : (
                            directors.map((director) => (
                                <GlassCard key={director._id} className="relative group overflow-hidden flex flex-col items-center text-center p-6 !bg-white/[0.03] border-white/10 hover:border-primary/50 transition-all duration-300 rounded-[32px]">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => setEditingItem(director)} className="p-2 bg-primary/20 text-primary rounded-xl"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(director._id)} className="p-2 bg-red-500/20 text-red-400 rounded-xl"><Trash2 size={14} /></button>
                                    </div>

                                    <button
                                        onClick={() => toggleActive(director)}
                                        className={`absolute top-4 left-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${director.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'
                                            }`}
                                    >
                                        {director.isActive ? 'Active' : 'Inactive'}
                                    </button>

                                    <div className="relative mb-6 mt-4">
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all relative z-10">
                                            <img
                                                src={director.image}
                                                alt={director.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(director.name)}&size=128&background=5B5CFF&color=fff&bold=true`;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {editingItem?._id === director._id ? (
                                        <div className="w-full space-y-3">
                                            <input
                                                type="text"
                                                value={editingItem.name}
                                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs text-center focus:outline-none focus:border-primary"
                                                placeholder="Name"
                                            />
                                            <input
                                                type="text"
                                                value={editingItem.title}
                                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs text-center focus:outline-none focus:border-primary"
                                                placeholder="Title"
                                            />
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={() => handleUpdate(director._id)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase">Save</button>
                                                <button onClick={() => setEditingItem(null)} className="flex-1 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-base font-bold text-white mb-1 font-poppins">{director.name}</h3>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4">{director.title}</p>
                                            <div className="pt-4 border-t border-white/5 w-full">
                                                <p className="text-[9px] text-white/30 font-mono italic">Order Index: {director.order}</p>
                                            </div>
                                        </>
                                    )}
                                </GlassCard>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Universal Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[99999] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-[40px] w-full max-w-md relative shadow-2xl p-10 overflow-hidden"
                    >
                        {/* Visual background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white font-poppins">Add {activeTab} Asset</h2>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Landing Page Asset Deployment</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-1">
                                <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            {activeTab === 'directors' ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Image URL</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Logo URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.logo}
                                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                            className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    {activeTab === 'university' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Location</label>
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Students</label>
                                                    <input
                                                        type="text"
                                                        value={formData.students}
                                                        onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                                                        className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Programs</label>
                                                    <input
                                                        type="text"
                                                        value={formData.programs}
                                                        onChange={(e) => setFormData({ ...formData, programs: e.target.value })}
                                                        className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block ml-1">Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-6 py-3 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-[20px] text-white text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary hover:bg-primary-dark rounded-[20px] text-white text-xs font-black uppercase tracking-widest transition-all shadow-glow-purple"
                                >
                                    Deploy Asset
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Bulk Add Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[99999] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#0B0F1A] border border-white/10 rounded-[40px] w-full max-w-lg relative shadow-2xl p-10"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-white font-poppins">Bulk Add Company Names</h2>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Separate names by commas or new lines</p>
                            </div>
                            <button onClick={() => setShowBulkModal(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <textarea
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                                className="w-full h-48 px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-inter"
                                placeholder="Google, Microsoft, Amazon, etc..."
                            />

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-[20px] text-white text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        const names = bulkNames.split(/[,\n]/).map(n => n.trim()).filter(n => n.length > 0);
                                        if (names.length === 0) return showToast('No names entered', 'error');

                                        try {
                                            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                                            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                                            await Promise.all(names.map((name, i) => axios.post('/api/admin/partner-logos', { name, order: logos.length + i + 1 }, config)));
                                            showToast(`${names.length} companies added`, 'success');
                                            setShowBulkModal(false);
                                            setBulkNames('');
                                            fetchAll();
                                        } catch (e) {
                                            showToast('Bulk upload failed', 'error');
                                        }
                                    }}
                                    className="flex-1 py-4 bg-primary hover:bg-primary-dark rounded-[20px] text-white text-xs font-black uppercase tracking-widest transition-all shadow-glow-purple"
                                >
                                    Deploy All
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PartnerLogoManager;
