import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Upload, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/media';

const CARDS = [
    { id: 'skill_courses', label: 'Skill Courses', fallback: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600' },
    { id: 'skill_integrated_diploma', label: 'Skill Integrated Diploma Programmes', fallback: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600' },
    { id: 'wbl', label: 'WBL (Work Based Learning)', fallback: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces,top&w=600&h=375&q=80' },
    { id: 'study_abroad', label: 'Study Abroad', fallback: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600' }
];

const CatalogCardSettings = () => {
    const { showToast } = useToast();
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get('/api/catalog-cards');
            setImages(data || {});
        } catch {
            showToast('Failed to load category card images', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async (id, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingId(id);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`/api/catalog-cards/${id}/upload`, formData, config);
            await fetchImages();
            showToast('Card image updated successfully', 'success');
        } catch {
            showToast('Failed to upload image', 'error');
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <DashboardHeading title="Catalog Cards" />
                <p className="text-sm text-white/50 mt-1">
                    Manage the cover image shown on each of the 4 category cards on the course catalog page.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {CARDS.map((card) => {
                        const currentSrc = images[card.id] ? getMediaUrl(images[card.id]) : card.fallback;
                        const isUploading = uploadingId === card.id;
                        return (
                            <GlassCard key={card.id} className="!p-3" noHover>
                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900">
                                    <img
                                        src={currentSrc}
                                        alt={card.label}
                                        className="w-full h-full object-cover"
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 size={24} className="animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-white mb-3 leading-snug">{card.label}</h3>
                                <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/15 hover:bg-primary/25 text-primary rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                                    <Upload size={13} />
                                    <span>Change Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploading}
                                        onChange={(e) => handleUpload(card.id, e.target.files[0])}
                                    />
                                </label>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CatalogCardSettings;
