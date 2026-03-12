import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, BarChart2, Eye, MessageCircle, Save, X, Trash } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { useToast } from '../../context/ToastContext';

const FAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [analytics, setAnalytics] = useState({ mostViewed: [], topSearches: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        question: '', answer: '', category: 'Getting Started', help_link: '', demo_video_link: ''
    });

    const categories = [
        'Getting Started', 'Account & Login', 'Course Enrollment', 'Live Classes', 'Payments', 'Technical Issues', 'Certificates & Graduation', 'Refunds & Cancellations', 'Mobile & Compatibility', 'Universities', 'Courses'
    ];

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const faqsRes = await axios.get('/api/faqs');
            setFaqs(faqsRes.data);

            const analyticsRes = await axios.get('/api/faqs/analytics/stats', config);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error("Failed to fetch FAQ data", error);
            showToast("Failed to fetch FAQ data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (editingId) {
                await axios.put(`/api/faqs/${editingId}`, formData, config);
                showToast("FAQ updated successfully", "success");
            } else {
                await axios.post('/api/faqs', formData, config);
                showToast("FAQ created successfully", "success");
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ question: '', answer: '', category: 'Getting Started', help_link: '', demo_video_link: '' });
            fetchData();
        } catch (error) {
            showToast("Error saving FAQ", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/faqs/${id}`, config);
            showToast("FAQ deleted", "success");
            fetchData();
        } catch (error) {
            showToast("Error deleting FAQ", "error");
        }
    };

    const handleClearAnalytics = async () => {
        if (!window.confirm("Clear all search search analytics? This cannot be undone.")) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete('/api/faqs/analytics/clear', config);
            showToast("Analytics cleared", "success");
            fetchData();
        } catch (error) {
            showToast("Failed to clear analytics", "error");
        }
    };

    const openEdit = (faq) => {
        setEditingId(faq._id);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            help_link: faq.help_link || '',
            demo_video_link: faq.demo_video_link || ''
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({ question: '', answer: '', category: 'Getting Started', help_link: '', demo_video_link: '' });
        setShowModal(true);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chartData = analytics.topSearches.map(s => ({
        name: s._id,
        count: s.count
    }));

    const COLORS = ['#7C3AED', '#A78BFA', '#C026FF', '#E879F9', '#5B5CFF'];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-jakarta text-white">FAQ Management</h1>
                    <p className="text-white/50 text-sm">Manage Help Assistant content and track queries</p>
                </div>
                <div className="flex gap-3">
                    <ModernButton onClick={handleClearAnalytics} className="!py-2 !bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/25">
                        <Trash size={16} className="mr-2" /> Clear History
                    </ModernButton>
                    <ModernButton onClick={openCreate} className="!py-2">
                        <Plus size={16} className="mr-2" /> Add FAQ
                    </ModernButton>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Analytics */}
                <GlassCard className="lg:col-span-1 p-5">
                    <h2 className="text-md font-bold text-white mb-4 flex justify-between items-center">
                        <span className="flex items-center"><BarChart2 size={18} className="mr-2 text-[#7C3AED]" /> Top Searches</span>
                    </h2>
                    {chartData.length > 0 ? (
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#A78BFA', fontSize: 10 }} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0B071A', border: '1px solid #7C3AED', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-white/50 text-sm py-10 text-center">No search data yet.</p>
                    )}
                </GlassCard>

                <GlassCard className="lg:col-span-2 p-5">
                    <h2 className="text-md font-bold text-white mb-4 flex items-center">
                        <Eye size={18} className="mr-2 text-[#E879F9]" /> Most Viewed FAQs
                    </h2>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm text-white/80">
                            <thead className="bg-[#020005] text-white/50 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 border-b border-white/10 rounded-tl-lg">Question</th>
                                    <th className="px-4 py-3 border-b border-white/10">Views</th>
                                    <th className="px-4 py-3 border-b border-white/10">Rating</th>
                                    <th className="px-4 py-3 border-b border-white/10 rounded-tr-lg">Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.mostViewed.slice(0, 5).map((faq, i) => {
                                    const totalVotes = faq.upvotes + faq.downvotes;
                                    const score = totalVotes > 0 ? Math.round((faq.upvotes / totalVotes) * 100) : 0;
                                    return (
                                        <tr key={faq._id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 truncate max-w-[200px] font-medium">{faq.question}</td>
                                            <td className="px-4 py-3"><span className="text-[#E879F9] bg-[#E879F9]/10 px-2 py-1 rounded font-bold">{faq.views}</span></td>
                                            <td className="px-4 py-3 font-bold text-white">{score}%</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <span className="text-green-400 text-xs flex items-center">+{faq.upvotes}</span>
                                                    <span className="text-red-400 text-xs flex items-center">-{faq.downvotes}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* FAQ List */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-[#020005]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-md font-bold text-white flex items-center">
                        <MessageCircle size={18} className="mr-2 text-[#A78BFA]" /> All FAQs
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Filter by question or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#020005] border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead className="bg-[#020005] text-white/50 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 border-b border-white/10">Question</th>
                                <th className="px-6 py-4 border-b border-white/10">Category</th>
                                <th className="px-6 py-4 border-b border-white/10">Engagement</th>
                                <th className="px-6 py-4 border-b border-white/10">Links</th>
                                <th className="px-6 py-4 border-b border-white/10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaqs.map((faq, i) => (
                                <tr key={faq._id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 max-w-[300px] font-medium truncate">{faq.question}</td>
                                    <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded font-bold text-[10px] uppercase">{faq.category}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/40 uppercase">Views: {faq.views}</span>
                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(100, (faq.upvotes / (faq.upvotes + faq.downvotes || 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 text-xs">
                                            {faq.help_link && <span className="text-[#A78BFA] bg-[#A78BFA]/10 px-2 py-0.5 rounded">Guide</span>}
                                            {faq.demo_video_link && <span className="text-[#E879F9] bg-[#E879F9]/10 px-2 py-0.5 rounded">Video</span>}
                                            {!faq.help_link && !faq.demo_video_link && <span className="text-white/20">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openEdit(faq)} className="text-[#7C3AED] hover:text-[#E879F9] transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(faq._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFaqs.length === 0 && (
                                <tr key="no-faqs-row">
                                    <td colSpan="5" className="px-6 py-10 text-center text-white/30 italic">No FAQs matches your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0B071A] border border-[#7C3AED]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0B071A]">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#A78BFA] uppercase mb-2">Question</label>
                                <input
                                    type="text" required value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-[#020005] border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#A78BFA] uppercase mb-2">Category</label>
                                <select
                                    Required value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#020005] border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] outline-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#A78BFA] uppercase mb-2">Detailed Answer</label>
                                <textarea
                                    rows="5" required value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full bg-[#020005] border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] outline-none"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#A78BFA] uppercase mb-2">Help Guide Link (Optional)</label>
                                    <input
                                        type="url" value={formData.help_link}
                                        onChange={e => setFormData({ ...formData, help_link: e.target.value })}
                                        className="w-full bg-[#020005] border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] outline-none" placeholder="https://"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#A78BFA] uppercase mb-2">Demo Video Link (Optional)</label>
                                    <input
                                        type="url" value={formData.demo_video_link}
                                        onChange={e => setFormData({ ...formData, demo_video_link: e.target.value })}
                                        className="w-full bg-[#020005] border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] outline-none" placeholder="https://"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-white/70 hover:text-white transition-colors">Cancel</button>
                                <ModernButton type="submit"><Save size={16} className="mr-2" /> Save FAQ</ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FAQManagement;
