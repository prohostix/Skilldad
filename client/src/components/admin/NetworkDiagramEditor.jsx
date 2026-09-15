import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Upload, Trash2, RotateCcw, Save, Image as ImageIcon,
    Check, X, Search, ChevronRight, ExternalLink, RefreshCw
} from 'lucide-react';
import {
    DEFAULT_DIAGRAM_NODES,
    DIAGRAM_ICON_MAP,
    AVAILABLE_ICON_NAMES
} from '../../utils/networkDiagramConfig';
import { getMediaUrl } from '../../utils/media';
import { useToast } from '../../context/ToastContext';

const PRESET_BG_COLORS = [
    { label: 'White', value: '#ffffff' },
    { label: 'Deep Purple', value: '#2E1065' },
    { label: 'Transparent', value: 'transparent' },
    { label: 'Dark Navy', value: '#0f172a' },
    { label: 'Black', value: '#000000' }
];

const NetworkDiagramEditor = ({ landingCmsData, onUpdate }) => {
    const { showToast } = useToast();
    const [nodesState, setNodesState] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploadingNodeId, setUploadingNodeId] = useState(null);
    const [iconModalNodeId, setIconModalNodeId] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const fileInputRefs = useRef({});

    // Initialize node configurations from landing CMS data or defaults
    useEffect(() => {
        const customNodes = landingCmsData?.network_diagram?.nodes || {};
        const state = {};
        DEFAULT_DIAGRAM_NODES.forEach((defNode) => {
            const custom = customNodes[defNode.id] || {};
            state[defNode.id] = {
                id: defNode.id,
                label: custom.label !== undefined ? custom.label : defNode.label,
                iconName: custom.iconName || defNode.iconName,
                image: custom.image !== undefined ? custom.image : (defNode.image || ''),
                imageFit: custom.imageFit || defNode.imageFit || 'cover',
                imageBg: custom.imageBg !== undefined ? custom.imageBg : (defNode.imageBg || '')
            };
        });
        setNodesState(state);
    }, [landingCmsData]);

    const handleFieldChange = (nodeId, field, value) => {
        setNodesState(prev => ({
            ...prev,
            [nodeId]: {
                ...prev[nodeId],
                [field]: value
            }
        }));
    };

    const handleFileUpload = async (nodeId, file) => {
        if (!file) return;
        try {
            setUploadingNodeId(nodeId);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post('/api/upload/media', formData, {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data?.url) {
                handleFieldChange(nodeId, 'image', res.data.url);
                showToast(`Image uploaded for ${nodesState[nodeId]?.label || nodeId}!`, 'success');
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            showToast('Image upload failed. Please try a valid JPG, PNG, WebP or SVG.', 'error');
        } finally {
            setUploadingNodeId(null);
        }
    };

    const handleResetNode = (nodeId) => {
        const def = DEFAULT_DIAGRAM_NODES.find(n => n.id === nodeId);
        if (!def) return;
        setNodesState(prev => ({
            ...prev,
            [nodeId]: {
                id: def.id,
                label: def.label,
                iconName: def.iconName,
                image: def.image || '',
                imageFit: def.imageFit || 'cover',
                imageBg: def.imageBg || ''
            }
        }));
        showToast(`Reset ${def.label} to default`, 'info');
    };

    const handleResetAll = () => {
        if (!window.confirm('Reset all network diagram nodes to the factory defaults?')) return;
        const resetState = {};
        DEFAULT_DIAGRAM_NODES.forEach((def) => {
            resetState[def.id] = {
                id: def.id,
                label: def.label,
                iconName: def.iconName,
                image: def.image || '',
                imageFit: def.imageFit || 'cover',
                imageBg: def.imageBg || ''
            };
        });
        setNodesState(resetState);
        showToast('All nodes reset to defaults. Click "Save Changes" to apply.', 'info');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onUpdate('landing_page', 'network_diagram', { nodes: nodesState });
            showToast('Network diagram updated successfully! Changes are live on the homepage.', 'success');
        } catch (error) {
            console.error('Failed to save diagram settings:', error);
            showToast('Failed to save network diagram settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filteredIconNames = AVAILABLE_ICON_NAMES.filter(name =>
        name.toLowerCase().includes(iconSearch.toLowerCase().trim())
    );

    const activeModalNode = iconModalNodeId ? nodesState[iconModalNodeId] : null;

    return (
        <div className="space-y-6 text-left my-2">
            {/* Header Card */}
            <div className="p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0c1b] shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 bg-primary/15 text-primary border-primary/30 shadow-md">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white font-jakarta">
                                    Hero Network Diagram Icons & Images
                                </h3>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                    ● 8 Nodes Configurable
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-white/60 mt-1 max-w-2xl leading-relaxed font-medium">
                                Customize the animated network diagram in the homepage hero banner. You can replace default icons with <span className="text-purple-700 dark:text-purple-300 font-bold">custom images/photos</span> (e.g. university crests, company logos, certificates, job icons), edit node labels, and adjust image framing.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button
                            type="button"
                            onClick={handleResetAll}
                            disabled={saving}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 font-inter"
                            title="Reset all nodes to default"
                        >
                            <RotateCcw size={13} />
                            <span>Reset All</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 md:flex-initial px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 font-inter"
                        >
                            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <ImageIcon size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Image & Photo Support</h4>
                            <p className="text-[11px] text-gray-500 dark:text-white/40">Upload transparent logos or photo badges.</p>
                        </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Vector Fallback</h4>
                            <p className="text-[11px] text-gray-500 dark:text-white/40">Lucide icons auto-fallback if no image is set.</p>
                        </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <ExternalLink size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Instant Live Sync</h4>
                            <p className="text-[11px] text-gray-500 dark:text-white/40">Updates reflect immediately on homepage.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {DEFAULT_DIAGRAM_NODES.map((defNode) => {
                    const node = nodesState[defNode.id] || {
                        id: defNode.id,
                        label: defNode.label,
                        iconName: defNode.iconName,
                        image: defNode.image || '',
                        imageFit: defNode.imageFit || 'cover',
                        imageBg: defNode.imageBg || ''
                    };

                    const IconComp = DIAGRAM_ICON_MAP[node.iconName] || Sparkles;
                    const resolvedImg = node.image
                        ? (typeof node.image === 'string' && (node.image.startsWith('http') || node.image.startsWith('data:') || node.image.startsWith('/assets') || node.image.startsWith('/src'))
                            ? node.image
                            : getMediaUrl(node.image))
                        : null;

                    const isUploading = uploadingNodeId === defNode.id;
                    const isRoot = defNode.isRoot;

                    return (
                        <div
                            key={defNode.id}
                            className={`p-5 md:p-6 rounded-3xl border transition-all duration-300 relative shadow-sm ${
                                isRoot
                                    ? 'border-purple-300 dark:border-primary/50 bg-purple-50/50 dark:bg-primary/[0.04]'
                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0c1b] hover:border-purple-300 dark:hover:border-white/20'
                            }`}
                        >
                            {/* Card Top Row: Node Header & Live Preview */}
                            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    {/* Live Node Circle Preview */}
                                    <div className="relative shrink-0 flex flex-col items-center">
                                        <div
                                            className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center overflow-hidden shadow-md transition-all"
                                            style={{
                                                background: resolvedImg
                                                    ? (node.imageBg || (node.imageFit === 'contain' ? '#ffffff' : 'transparent'))
                                                    : 'radial-gradient(circle at 38% 32%, #C026FF 0%, #4C1D95 100%)',
                                                boxShadow: isRoot ? '0 0 16px rgba(192, 38, 255, 0.45)' : '0 0 10px rgba(147, 51, 234, 0.3)'
                                            }}
                                        >
                                            {resolvedImg ? (
                                                <img
                                                    src={resolvedImg}
                                                    alt={node.label}
                                                    className="w-full h-full"
                                                    style={{ objectFit: node.imageFit || 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <IconComp size={24} className="text-white" strokeWidth={2.2} />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold mt-1.5 tracking-wider uppercase">
                                            {node.label || defNode.label}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                                                {defNode.label}
                                            </h4>
                                            {isRoot && (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 dark:bg-primary/30 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-primary/40">
                                                    Central Hub
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5">
                                            {defNode.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                resolvedImg
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                                                    : 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                                            }`}>
                                                {resolvedImg ? '● Custom Image Active' : `● Icon: ${node.iconName}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleResetNode(defNode.id)}
                                    className="p-2 text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all shrink-0"
                                    title={`Reset ${defNode.label} to default`}
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>

                            {/* Node Configuration Form */}
                            <div className="pt-4 space-y-4">
                                {/* Label input */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-white/70 uppercase tracking-wider mb-1.5">
                                        Display Label
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs focus:border-primary focus:bg-white dark:focus:bg-white/10 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
                                        value={node.label || ''}
                                        placeholder={defNode.label}
                                        onChange={(e) => handleFieldChange(defNode.id, 'label', e.target.value)}
                                    />
                                </div>

                                {/* Image Upload & Image URL */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[11px] font-bold text-gray-700 dark:text-white/70 uppercase tracking-wider">
                                            Node Image (Replaces Icon)
                                        </label>
                                        {resolvedImg && (
                                            <button
                                                type="button"
                                                onClick={() => handleFieldChange(defNode.id, 'image', '')}
                                                className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 size={11} /> Remove Image (Use Icon)
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs focus:border-primary focus:bg-white dark:focus:bg-white/10 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
                                            placeholder="Image URL or upload 👉"
                                            value={node.image || ''}
                                            onChange={(e) => handleFieldChange(defNode.id, 'image', e.target.value)}
                                        />

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            ref={el => fileInputRefs.current[defNode.id] = el}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(defNode.id, file);
                                            }}
                                        />

                                        <button
                                            type="button"
                                            disabled={isUploading}
                                            onClick={() => fileInputRefs.current[defNode.id]?.click()}
                                            className="px-4 py-2.5 bg-purple-100 hover:bg-primary text-purple-800 hover:text-white dark:bg-primary/20 dark:hover:bg-primary dark:text-primary dark:hover:text-white border border-purple-300 dark:border-primary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40 shadow-sm"
                                        >
                                            <Upload size={13} />
                                            <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-white/40 mt-1">
                                        Accepts PNG, JPG, WebP, SVG. Transparent background recommended for logos.
                                    </p>
                                </div>

                                {/* Image Styling: Fit & Background (visible when image is set) */}
                                {resolvedImg && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                        {/* Image Fit */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 dark:text-white/60 uppercase tracking-wider mb-1.5">
                                                Image Fit
                                            </label>
                                            <div className="flex gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldChange(defNode.id, 'imageFit', 'cover')}
                                                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                                        node.imageFit === 'cover'
                                                            ? 'bg-primary text-white border border-primary shadow-sm'
                                                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10'
                                                    }`}
                                                >
                                                    Cover (Fill)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldChange(defNode.id, 'imageFit', 'contain')}
                                                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                                        node.imageFit === 'contain'
                                                            ? 'bg-primary text-white border border-primary shadow-sm'
                                                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10'
                                                    }`}
                                                >
                                                    Contain (Fit)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Background Color */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 dark:text-white/60 uppercase tracking-wider mb-1.5">
                                                Circle Background
                                            </label>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {PRESET_BG_COLORS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => handleFieldChange(defNode.id, 'imageBg', c.value)}
                                                        className={`w-6 h-6 rounded-md border text-[9px] flex items-center justify-center transition-all ${
                                                            (node.imageBg === c.value || (!node.imageBg && c.value === '#ffffff' && node.imageFit === 'contain'))
                                                                ? 'ring-2 ring-primary border-primary'
                                                                : 'border-gray-300 dark:border-white/20 hover:border-gray-400'
                                                        }`}
                                                        style={{ background: c.value === 'transparent' ? 'repeating-conic-gradient(#bbb 0% 25%, #eee 0% 50%) 50% / 8px 8px' : c.value }}
                                                        title={c.label}
                                                    >
                                                        {(node.imageBg === c.value) && (
                                                            <Check size={11} className={c.value === '#ffffff' ? 'text-black' : 'text-white'} />
                                                        )}
                                                    </button>
                                                ))}
                                                <input
                                                    type="text"
                                                    value={node.imageBg || ''}
                                                    placeholder="#fff"
                                                    onChange={(e) => handleFieldChange(defNode.id, 'imageBg', e.target.value)}
                                                    className="w-16 px-1.5 py-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md text-[11px] text-gray-900 dark:text-white outline-none focus:border-primary text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fallback Vector Icon Selector Trigger */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-white/70 uppercase tracking-wider mb-1.5">
                                        Fallback Vector Icon {resolvedImg && '(Active if image fails or is removed)'}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIconSearch('');
                                            setIconModalNodeId(defNode.id);
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs flex items-center justify-between transition-all group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                                                <IconComp size={15} />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{node.iconName}</span>
                                        </div>
                                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                            Change Icon <ChevronRight size={13} />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Save Bar */}
            <div className="flex justify-end pt-4 pb-8">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{saving ? 'Saving Changes...' : 'Save All Diagram Changes'}</span>
                </button>
            </div>

            {/* Clean, Full-Feature Icon Picker Modal (Fixes the black blurred dropdown issue) */}
            <AnimatePresence>
                {iconModalNodeId && activeModalNode && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIconModalNodeId(null)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="relative w-full max-w-xl bg-white dark:bg-[#120e24] border border-gray-200 dark:border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[85vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white font-jakarta">
                                        Select Icon for "{activeModalNode.label || iconModalNodeId}"
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                                        Choose a vector icon from the collection below.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIconModalNodeId(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="pt-4 pb-3">
                                <div className="relative">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search icons (e.g. Landmark, Award, Book, Bot...)"
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs focus:border-primary focus:bg-white dark:focus:bg-white/10 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Icons Grid */}
                            <div className="flex-1 overflow-y-auto py-2 pr-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                {filteredIconNames.map((iconName) => {
                                    const PreviewIcon = DIAGRAM_ICON_MAP[iconName];
                                    const isSelected = activeModalNode.iconName === iconName;

                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => {
                                                handleFieldChange(iconModalNodeId, 'iconName', iconName);
                                                setIconModalNodeId(null);
                                                showToast(`Selected icon: ${iconName}`, 'success');
                                            }}
                                            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center ${
                                                isSelected
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                                                    : 'bg-gray-50 hover:bg-purple-50 dark:bg-white/[0.03] dark:hover:bg-white/10 border-gray-200 dark:border-white/10 text-gray-700 hover:text-primary dark:text-white/70 dark:hover:text-white'
                                            }`}
                                        >
                                            <PreviewIcon size={22} className={isSelected ? 'text-white' : 'text-primary'} />
                                            <span className="text-[11px] font-bold truncate max-w-full">
                                                {iconName}
                                            </span>
                                        </button>
                                    );
                                })}

                                {filteredIconNames.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-xs text-gray-400 dark:text-white/40">
                                        No icons matching "{iconSearch}"
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-xs text-gray-500 dark:text-white/50">
                                <span>Currently: <strong className="text-gray-900 dark:text-white">{activeModalNode.iconName}</strong></span>
                                <button
                                    type="button"
                                    onClick={() => setIconModalNodeId(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NetworkDiagramEditor;
