import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { Calendar, Clock, Video, FileText, Tag, Link, Info, Sparkles, Target } from 'lucide-react';

const ScheduleClass = () => {
    const navigate = useNavigate();
    const [universities, setUniversities] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        topic: '',
        startTime: '',
        duration: 60,
        meetingLink: '',
        description: '',
        category: 'General',
        universityId: '',
        instructor: '',
        courseId: ''
    });

    React.useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            navigate('/login');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // Fetch courses for the university (use admin endpoint to get instructor's own courses)
        axios.get('/api/courses/admin', config)
            .then(res => {
                const data = res.data;
                if (Array.isArray(data)) {
                    setCourses(data);
                } else if (data.courses && Array.isArray(data.courses)) {
                    setCourses(data.courses);
                } else {
                    console.warn('Unexpected courses response format:', data);
                    setCourses([]);
                }
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                setCourses([]);
            });

        if (userInfo && userInfo.role === 'admin') {
            axios.get('/api/admin/universities', config)
                .then(res => setUniversities(res.data))
                .catch(err => console.error('Error fetching universities:', err));

            // Also fetch instructors (for now just all non-students)
            axios.get('/api/admin/users/all', config)
                .then(res => {
                    const nonStudents = res.data.users.filter(u => u.role !== 'student');
                    setInstructors(nonStudents);
                })
                .catch(err => console.error('Error fetching instructors:', err));
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const dataToPost = {
                ...formData,
                timezone,
                // Robust local-to-UTC conversion: parse T-string manually to ensure local-first interpretation
                startTime: (() => {
                    if (!formData.startTime) return '';
                    const [d, t] = formData.startTime.split('T');
                    const [y, m, day] = d.split('-').map(Number);
                    const [hour, minute] = t.split(':').map(Number);
                    // new Date(y, m-1, d, h, m) is always LOCAL
                    const localDate = new Date(y, m - 1, day, hour, minute);
                    return isNaN(localDate.getTime()) ? '' : localDate.toISOString();
                })()
            };

            console.log('[ScheduleClass] Submitting session data:', { ...dataToPost, topic: dataToPost.topic });
            await axios.post('/api/sessions', dataToPost, config);
            alert('Class Scheduled Successfully!');
            if (userInfo.role === 'admin') navigate('/admin/dashboard');
            else if (userInfo.role === 'university') navigate('/university/dashboard');
        } catch (error) {
            alert('Error scheduling class: ' + (error.response?.data?.message || error.message));
        }
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300 placeholder:text-white/30";
    const labelClasses = "block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center">
                <DashboardHeading title="Host a Live Session" />
                <p className="text-white/50 mt-2 max-w-xl mx-auto">Create an engaging learning environment. Fill in the details below to schedule your upcoming class.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-6 space-y-6 border-primary/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Session Details</h3>
                            </div>

                            <div>
                                <label className={labelClasses}>Session Topic</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                                        <Target size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="topic"
                                        required
                                        value={formData.topic}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-12 text-lg font-bold`}
                                        placeholder="e.g. Mastering Advanced React Patterns"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Meeting Link</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                                        <Link size={20} />
                                    </div>
                                    <input
                                        type="url"
                                        name="meetingLink"
                                        required
                                        value={formData.meetingLink}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-12`}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Description & Agenda</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="What will students learn in this session?"
                                ></textarea>
                            </div>
                        </GlassCard>

                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <ModernButton type="submit" className="flex-2 justify-center py-4 bg-primary hover:bg-primary/90 text-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] min-w-[300px]">
                                <Video size={22} className="mr-3" />
                                Go Live & Notify Students
                            </ModernButton>
                            <ModernButton
                                type="button"
                                variant="secondary"
                                className="flex-1 justify-center py-4 text-lg"
                                onClick={() => navigate('/university/live-sessions')}
                            >
                                Discard
                            </ModernButton>
                        </div>
                    </div>

                    {/* Secondary Settings & Preview */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Clock size={18} />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Timing & Track</h3>
                            </div>

                            <div>
                                <label className={labelClasses}>Start Time</label>
                                <div className="relative group">
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        required
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Duration</label>
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className={`${inputClasses} appearance-none cursor-pointer`}
                                    >
                                        <option value={30} className="bg-black text-white">30m</option>
                                        <option value={60} className="bg-black text-white">1h</option>
                                        <option value={90} className="bg-black text-white">1.5h</option>
                                        <option value={120} className="bg-black text-white">2h</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={`${inputClasses} appearance-none cursor-pointer`}
                                    >
                                        <option value="General" className="bg-black text-white">General</option>
                                        <option value="Dev" className="bg-black text-white">Dev</option>
                                        <option value="AI" className="bg-black text-white">AI</option>
                                        <option value="Design" className="bg-black text-white">Design</option>
                                    </select>
                                </div>
                            </div>

                            {/* Course Selection */}
                            <div>
                                <label className={labelClasses}>Course (Optional)</label>
                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleChange}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="" className="bg-black text-white italic">All Students (University-wide)</option>
                                    {courses.length > 0 ? (
                                        courses.map(c => (
                                            <option key={c._id} value={c._id} className="bg-black text-white">
                                                {c.title}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled className="bg-black text-white/50">No courses available</option>
                                    )}
                                </select>
                                <p className="text-xs text-white/30 mt-2 ml-1">
                                    {courses.length > 0
                                        ? 'Select a course to only notify enrolled students'
                                        : 'No courses found. Session will be university-wide.'}
                                </p>
                            </div>

                            {JSON.parse(localStorage.getItem('userInfo'))?.role === 'admin' && (
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <label className={labelClasses}>Target University (Auto-Enroll)</label>
                                        <select
                                            name="universityId"
                                            value={formData.universityId}
                                            onChange={handleChange}
                                            className={`${inputClasses} appearance-none cursor-pointer`}
                                        >
                                            <option value="" className="bg-black text-white italic">None - Manual Only</option>
                                            {universities.map(u => (
                                                <option key={u._id} value={u._id} className="bg-black text-white">
                                                    {u.profile?.universityName || u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Assigned Instructor</label>
                                        <select
                                            name="instructor"
                                            value={formData.instructor}
                                            onChange={handleChange}
                                            className={`${inputClasses} appearance-none cursor-pointer`}
                                        >
                                            <option value="" className="bg-black text-white italic">Select Instructor</option>
                                            {instructors.map(i => (
                                                <option key={i._id} value={i._id} className="bg-black text-white">
                                                    {i.profile?.universityName || i.name} ({i.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Live Preview Card */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Live Preview</h3>
                            <GlassCard className="p-5 border-primary/30 bg-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-1">
                                    <Sparkles size={12} className="text-primary animate-pulse" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded">
                                            {formData.category}
                                        </span>
                                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                            {formData.duration} Min
                                        </span>
                                    </div>
                                    <h4 className="font-extrabold text-white text-base leading-tight">
                                        {formData.topic || 'Your Session Title Here'}
                                    </h4>
                                    <div className="pt-2 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
                                            <Calendar size={12} className="text-primary" />
                                            {formData.startTime ? new Date(formData.startTime).toLocaleDateString() : 'Set Date'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
                                            <Clock size={12} className="text-primary" />
                                            {formData.startTime ? new Date(formData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set Time'}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
                            <Sparkles size={20} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                <span className="text-amber-500/80 font-bold">Pro Tip:</span> Sessions scheduled mid-week usually get 40% higher attendance rates.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ScheduleClass;
