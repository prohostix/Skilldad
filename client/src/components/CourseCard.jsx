import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star,
    Clock,
    PlayCircle,
    ArrowRight
} from 'lucide-react';

import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleEnroll = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login', { state: { from: `/course/${course._id}` } });
            return;
        }

        navigate(`/dashboard/payment/${course._id}`);
    };

    return (
        <GlassCard
            lowBlur={true}
            className="group overflow-hidden !p-0 h-full flex flex-col hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 gpu-accelerated"
        >
            {/* Thumbnail Section */}
            <div
                className="relative aspect-video w-full overflow-hidden bg-white/5 cursor-pointer"
                onClick={() => navigate(`/course/${course._id}`)}
            >
                <img
                    src={course.thumbnail || `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-20"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-21"></div>

                {/* Badge */}
                <div className="absolute top-2 left-2 z-30">
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg">
                        {course.category}
                    </span>
                </div>

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100 transform transition-transform z-30">
                    <div className="w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/40 backdrop-blur-sm">
                        <PlayCircle size={24} />
                    </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white z-30">
                    <div className="flex items-center space-x-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold">4.8</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-80">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">12h</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col text-left">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary overflow-hidden border border-primary/20">
                        {(course.instructorName || course.instructor?.name || 'I')[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.05em] text-white/60 truncate">
                            {course.instructorName || course.instructor?.name || 'Technical Instructor'}
                        </span>
                        {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                            <span className="text-[8px] font-black uppercase tracking-[0.05em] text-primary/80 truncate mt-0.5">
                                {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                            </span>
                        )}
                    </div>
                </div>

                <h3
                    className="text-base font-black text-white font-space mb-2 line-clamp-2 leading-[1.3] cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/course/${course._id}`)}
                >
                    {course.title}
                </h3>

                <p className="text-xs font-inter text-white/50 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {course.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Protocol Fee</span>
                        <span className="text-sm font-black text-white">₹{course.price || '0.00'}</span>
                    </div>

                    <ModernButton
                        onClick={handleEnroll}
                        className="!px-4 !py-2 font-black uppercase tracking-widest text-[8px] group/btn shadow-glow-purple"
                    >
                        <span className="mr-1">Enroll</span> <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </ModernButton>
                </div>

            </div>
        </GlassCard>
    );
};

export default CourseCard;
