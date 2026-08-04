import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, Search, Edit3, Trash2, CheckCircle, XCircle, 
    Clock, Briefcase, Trophy, Users, Building2, MapPin, 
    DollarSign, FileText, Upload, Image, ChevronRight, AlertCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';

const CareerManager = () => {
    const [activeTab, setActiveTab] = useState('vacancies');
    const [vacancies, setVacancies] = useState([]);
    const [applications, setApplications] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();
    const { socket } = useSocket();

    // Modal states
    const [showVacancyModal, setShowVacancyModal] = useState(false);
    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, id: null });
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    useEffect(() => {
        fetchData();
        
        if (socket) {
            socket.on('vacancyApplicationUpdate', (data) => {
                showToast(`New application received from ${data.student_name}!`, 'info');
                // Auto-refresh if currently viewing applications
                if (activeTab === 'applications') {
                    fetchData();
                }
            });
            return () => socket.off('vacancyApplicationUpdate');
        }
    }, [activeTab, socket]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'vacancies') {
                const { data } = await axios.get('/api/career/admin/vacancies', config);
                setVacancies(data.vacancies || []);
            } else if (activeTab === 'applications') {
                const { data } = await axios.get('/api/career/admin/applications', config);
                setApplications(data.applications || []);
            } else if (activeTab === 'placements') {
                const { data } = await axios.get('/api/career/placements'); // Public endpoint is fine for list
                setPlacements(data.placements || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpsertVacancy = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/career/admin/vacancies', formData, config);
            showToast(`Vacancy ${formData.id ? 'updated' : 'created'} successfully`, 'success');
            setShowVacancyModal(false);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handleDeleteVacancy = (id) => {
        setConfirmDelete({ open: true, type: 'vacancy', id });
    };

    const executeDeleteVacancy = async (id) => {
        try {
            await axios.delete(`/api/career/admin/vacancies/${id}`, config);
            showToast('Vacancy deleted', 'success');
            fetchData();
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    };

    const handleUpdateAppStatus = async (id, status) => {
        const admin_remarks = window.prompt("Enter review remarks (optional):");
        try {
            await axios.put(`/api/career/admin/applications/${id}/status`, { status, admin_remarks }, config);
            showToast(`Application ${status}`, 'success');
            fetchData();
        } catch (error) {
            showToast('Update failed', 'error');
        }
    };

    const handleUpsertPlacement = async (e) => {
        e.preventDefault();
        const fData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'student_photo_file') fData.append(key, formData[key]);
        });
        if (formData.student_photo_file) fData.append('student_photo', formData.student_photo_file);

        try {
            await axios.post('/api/career/admin/placements', fData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            showToast('Placement entry saved', 'success');
            setShowPlacementModal(false);
            fetchData();
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    const handleDeletePlacement = (id) => {
        setConfirmDelete({ open: true, type: 'placement', id });
    };

    const executeDeletePlacement = async (id) => {
        try {
            await axios.delete(`/api/career/admin/placements/${id}`, config);
            showToast('Placement deleted', 'success');
            fetchData();
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDelete.type === 'vacancy') {
            executeDeleteVacancy(confirmDelete.id);
        } else if (confirmDelete.type === 'placement') {
            executeDeletePlacement(confirmDelete.id);
        }
        setConfirmDelete({ open: false, type: null, id: null });
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
            case 'shortlisted': return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
            case 'rejected': return 'text-rose-400 bg-rose-400/10 border-rose-500/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <DashboardHeading title="Career Center Management" />
                    <p className="text-white/40 text-sm font-medium mt-1">
                        Manage corporate vacancies, review student applications, and update the Hall of Fame.
                    </p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'vacancies' && (
                        <ModernButton onClick={() => { setFormData({ job_type: 'Job', status: 'open' }); setEditingItem(null); setShowVacancyModal(true); }}>
                            <Plus size={16} className="mr-2" /> Add Vacancy
                        </ModernButton>
                    )}
                    {activeTab === 'placements' && (
                        <ModernButton onClick={() => { setFormData({ placed_date: new Date().toISOString().split('T')[0] }); setEditingItem(null); setShowPlacementModal(true); }}>
                            <Plus size={16} className="mr-2" /> Add Placement
                        </ModernButton>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-xl">
                {[
                    { id: 'vacancies', label: 'Vacancies', icon: Briefcase },
                    { id: 'applications', label: 'Applications', icon: FileText },
                    { id: 'placements', label: 'Hall of Fame', icon: Trophy }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List Content */}
            <GlassCard className="!p-0 overflow-hidden border-white/10">
                <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-white/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left font-inter">
                            <thead className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                {activeTab === 'vacancies' && (
                                    <tr>
                                        <th className="px-6 py-4">Vacancy Details</th>
                                        <th className="px-6 py-4">Company & Location</th>
                                        <th className="px-6 py-4">Type & Salary</th>
                                        <th className="px-6 py-4">Deadline</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                )}
                                {activeTab === 'applications' && (
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Vacancy</th>
                                        <th className="px-6 py-4">Applied At</th>
                                        <th className="px-6 py-4">Resume</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Decision</th>
                                    </tr>
                                )}
                                {activeTab === 'placements' && (
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Designation</th>
                                        <th className="px-6 py-4">Placed Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {activeTab === 'vacancies' && vacancies.map(v => (
                                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white">{v.title}</div>
                                            <div className="text-[10px] text-white/30 font-medium uppercase mt-0.5 tracking-wider">ID: {v.id.split('-')[0]}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-white/80 font-semibold">{v.company}</span>
                                                <span className="text-white/40 text-xs flex items-center gap-1 mt-0.5"><MapPin size={12} /> {v.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${v.job_type === 'Job' ? 'text-blue-400' : 'text-purple-400'}`}>{v.job_type}</span>
                                                <span className="text-emerald-400 font-bold text-xs">{v.salary_range}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-white/60 font-medium">
                                            {new Date(v.deadline).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${v.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setFormData(v); setEditingItem(v); setShowVacancyModal(true); }} className="p-2 text-white/40 hover:text-primary transition-colors"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDeleteVacancy(v.id)} className="p-2 text-white/40 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'applications' && applications.map(a => (
                                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white">{a.student_name}</div>
                                            <div className="text-[10px] text-white/30 font-medium lowercase tracking-wider">{a.student_email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white/80">{a.vacancy_title}</div>
                                            <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">{a.vacancy_company}</div>
                                        </td>
                                        <td className="px-6 py-5 text-white/40 font-medium">
                                            {new Date(a.applied_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            {a.resume_url ? (
                                                <a href={a.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline font-bold text-xs">
                                                    <FileText size={14} /> VIEW PDF
                                                </a>
                                            ) : (
                                                <span className="text-white/20 text-xs italic">No Resume</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(a.status)}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleUpdateAppStatus(a.id, 'shortlisted')} className="px-2.5 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Shortlist</button>
                                                <button onClick={() => handleUpdateAppStatus(a.id, 'rejected')} className="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Reject</button>
                                                <button onClick={() => handleUpdateAppStatus(a.id, 'approved')} className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Direct Hired</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'placements' && placements.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                    <img src={p.student_photo || `https://i.pravatar.cc/100?u=${p.id}`} alt="" />
                                                </div>
                                                <div className="font-bold text-white">{p.student_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-white/80 font-bold">{p.company_name}</td>
                                        <td className="px-6 py-5 text-white/40 font-medium">{p.designation}</td>
                                        <td className="px-6 py-5 text-white/40 font-medium">{new Date(p.placed_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setFormData(p); setEditingItem(p); setShowPlacementModal(true); }} className="p-2 text-white/40 hover:text-primary transition-colors"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDeletePlacement(p.id)} className="p-2 text-white/40 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && (activeTab === 'vacancies' ? vacancies : activeTab === 'applications' ? applications : placements).length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="text-white/5" />
                            <p className="text-white/20 font-black uppercase tracking-[0.3em]">No entries found in this category</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Vacancy Modal */}
            {showVacancyModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowVacancyModal(false)} />
                    <GlassCard className="relative w-full max-w-2xl bg-slate-900 border-white/20 !p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{editingItem ? 'Edit Vacancy' : 'Create New Vacancy'}</h3>
                        <form onSubmit={handleUpsertVacancy} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Job Title</label>
                                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Company Name</label>
                                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Location</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" placeholder="e.g. Remote / Bangalore" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Job Type</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.job_type || 'Job'} onChange={e => setFormData({...formData, job_type: e.target.value})}>
                                        <option value="Job" className="bg-slate-900">Full-time Job</option>
                                        <option value="Internship" className="bg-slate-900">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Salary Range</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" placeholder="e.g. 5-8 LPA / 20k Stipend" value={formData.salary_range || ''} onChange={e => setFormData({...formData, salary_range: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Application Deadline</label>
                                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.deadline ? formData.deadline.split('T')[0] : ''} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Status</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.status || 'open'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="open" className="bg-slate-900 text-emerald-400">OPEN</option>
                                        <option value="closed" className="bg-slate-900 text-rose-500">CLOSED</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">About The Role (Short Description)</label>
                                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe the responsibilities and scope of this role..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Requirements</label>
                                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" value={formData.requirements || ''} onChange={e => setFormData({...formData, requirements: e.target.value})} placeholder="List requirements, expected skills, degrees, etc..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">About The Company</label>
                                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" value={formData.about_company || ''} onChange={e => setFormData({...formData, about_company: e.target.value})} placeholder="Company background, work culture, or perks..." />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <ModernButton variant="secondary" className="flex-1 !bg-white/5 border-white/10" onClick={() => setShowVacancyModal(false)}>CANCEL</ModernButton>
                                <ModernButton type="submit" className="flex-1">SAVE VACANCY</ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Placement Modal */}
            {showPlacementModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPlacementModal(false)} />
                    <GlassCard className="relative w-full max-w-lg bg-slate-900 border-white/20 !p-8">
                        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{editingItem ? 'Edit Success Story' : 'New Hall of Fame Entry'}</h3>
                        <form onSubmit={handleUpsertPlacement} className="space-y-5">
                            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10 border-dashed mb-4">
                                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                                    {(formData.student_photo_file || formData.student_photo) ? (
                                        <img src={formData.student_photo_file ? URL.createObjectURL(formData.student_photo_file) : formData.student_photo} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Users size={32} className="text-white/10" />
                                    )}
                                </div>
                                <input type="file" id="photo" className="hidden" accept="image/*" onChange={e => setFormData({...formData, student_photo_file: e.target.files[0]})} />
                                <label htmlFor="photo" className="cursor-pointer px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary transition-all hover:text-white">
                                    <Upload size={14} className="inline mr-2" /> Upload Photo
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">Student Name</label>
                                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.student_name || ''} onChange={e => setFormData({...formData, student_name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">Company</label>
                                        <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.company_name || ''} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">Designation</label>
                                        <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.designation || ''} onChange={e => setFormData({...formData, designation: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">Placement Date</label>
                                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" value={formData.placed_date ? formData.placed_date.split('T')[0] : ''} onChange={e => setFormData({...formData, placed_date: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <ModernButton variant="secondary" className="flex-1 !bg-white/5 border-white/10" onClick={() => setShowPlacementModal(false)}>CANCEL</ModernButton>
                                <ModernButton type="submit" className="flex-1">PUBLISH STORY</ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
            
            <ConfirmDialog 
                open={confirmDelete.open}
                title={confirmDelete.type === 'vacancy' ? "Delete this listing?" : "Remove from Hall of Fame?"}
                message={confirmDelete.type === 'vacancy' ? "This will permanently remove the vacancy." : "This will permanently remove this entry."}
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ open: false, type: null, id: null })}
                danger={true}
            />
        </div>
    );
};

export default CareerManager;
