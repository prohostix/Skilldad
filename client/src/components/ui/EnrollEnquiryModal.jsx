import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, User, Mail, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import ModernButton from './ModernButton';

const EnrollEnquiryModal = ({ course, onClose }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const universityName = course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || '';

    const [formData, setFormData] = useState({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Please fill in your name, email and phone number.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await axios.post('/api/enquiries', {
                ...formData,
                courseId: course._id,
                courseName: course.title,
                universityName
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-black/95 backdrop-blur-xl rounded-[24px] p-6 border-2 border-primary/20 shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    <X size={16} />
                </button>

                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white font-inter mb-2">Thank you, {formData.name.split(' ')[0]}!</h3>
                            <p className="text-sm text-white/60 font-inter leading-relaxed mb-6">
                                Our counsellor will contact you soon to help you get enrolled in <span className="text-primary font-semibold">{course.title}</span>
                                {universityName && <> at <span className="text-primary font-semibold">{universityName}</span></>}.
                            </p>
                            <ModernButton onClick={onClose} className="w-full">
                                Close
                            </ModernButton>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 className="text-base font-semibold text-white font-inter mb-1">Enroll in this course</h3>
                            <p className="text-xs text-white/50 font-inter mb-6">
                                {course.title}
                                {universityName && <span className="text-primary"> · {universityName}</span>}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-white/30" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-white/30" size={16} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 text-white/30" size={16} />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-3.5 text-white/30" size={16} />
                                    <textarea
                                        rows="3"
                                        placeholder="Anything you'd like us to know? (optional)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary transition-all resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-red-400 font-inter">{error}</p>
                                )}

                                <ModernButton type="submit" disabled={submitting} className="w-full !py-3">
                                    {submitting ? 'Submitting...' : 'Submit Enquiry'}
                                </ModernButton>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>,
        document.body
    );
};

export default EnrollEnquiryModal;
