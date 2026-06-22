import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Calendar, Loader2, AlertCircle, Pencil } from 'lucide-react';
import axios from 'axios';
import GlassCard from './GlassCard';
import ModernButton from './ModernButton';

const BatchManagement = ({ courseId }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddBatch, setShowAddBatch] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');
    const [editingBatch, setEditingBatch] = useState(null);
    const [editBatchName, setEditBatchName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, [courseId]);

    const fetchBatches = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get(`/api/batches/course/${courseId}`, config);
            setBatches(data);
        } catch (err) {
            console.error('Error fetching batches:', err);
            setError('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        if (!newBatchName.trim()) return;

        setActionLoading(true);
        setError(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post('/api/batches', {
                courseId,
                name: newBatchName
            }, config);
            
            setNewBatchName('');
            setShowAddBatch(false);
            fetchBatches();
        } catch (err) {
            console.error('Error creating batch:', err);
            setError(err.response?.data?.message || 'Failed to create batch');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        if (!editBatchName.trim()) return;

        setActionLoading(true);
        setError(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`/api/batches/${editingBatch.id}`, {
                name: editBatchName
            }, config);
            
            setEditingBatch(null);
            setEditBatchName('');
            fetchBatches();
        } catch (err) {
            console.error('Error updating batch:', err);
            setError(err.response?.data?.message || 'Failed to update batch');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm('Are you sure you want to delete this batch? This will affect students assigned to it.')) {
            return;
        }

        setActionLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.delete(`/api/batches/${batchId}`, config);
            fetchBatches();
        } catch (err) {
            console.error('Error deleting batch:', err);
            setError('Failed to delete batch');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-primary" size={24} />
                        Course Batches
                    </h2>
                    <p className="text-white/40 text-sm">Manage student groups for this course</p>
                </div>
                <ModernButton 
                    onClick={() => setShowAddBatch(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Batch
                </ModernButton>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {showAddBatch && (
                <GlassCard className="p-6 border-primary/30">
                    <form onSubmit={handleCreateBatch} className="space-y-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-2 font-medium">Batch Name</label>
                            <input
                                type="text"
                                value={newBatchName}
                                onChange={(e) => setNewBatchName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                                placeholder="e.g., Morning Batch - May 2024"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <ModernButton 
                                type="submit" 
                                disabled={actionLoading}
                                className="flex-1"
                            >
                                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Batch'}
                            </ModernButton>
                            <ModernButton 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setShowAddBatch(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </ModernButton>
                        </div>
                    </form>
                </GlassCard>
            )}

            {editingBatch && (
                <GlassCard className="p-6 border-yellow-500/30">
                    <form onSubmit={handleUpdateBatch} className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-bold">Edit Batch</h3>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">ID: {editingBatch.id}</div>
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm mb-2 font-medium">Batch Name</label>
                            <input
                                type="text"
                                value={editBatchName}
                                onChange={(e) => setEditBatchName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all"
                                placeholder="e.g., Morning Batch - May 2024"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <ModernButton 
                                type="submit" 
                                disabled={actionLoading}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            >
                                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Update Batch'}
                            </ModernButton>
                            <ModernButton 
                                type="button" 
                                variant="secondary" 
                                onClick={() => {
                                    setEditingBatch(null);
                                    setEditBatchName('');
                                }}
                                disabled={actionLoading}
                            >
                                Cancel
                            </ModernButton>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.length > 0 ? (
                    batches.map((batch) => (
                        <GlassCard key={batch.id} className="p-5 group hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                        {batch.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Calendar size={14} />
                                        Created: {new Date(batch.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingBatch(batch);
                                            setEditBatchName(batch.name);
                                            setShowAddBatch(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2 text-white/20 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
                                        title="Edit Batch"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBatch(batch.id)}
                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        title="Delete Batch"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </div>
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                    ID: {batch.id}
                                </div>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Users className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-white/60 font-medium">No batches created yet</h3>
                        <p className="text-white/40 text-sm mt-1">
                            Create batches to group students and schedule separate exams/sessions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchManagement;
