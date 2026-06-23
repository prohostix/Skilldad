import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    Home, 
    Users, 
    CheckCircle, 
    AlertCircle, 
    CreditCard, 
    Loader2 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import RazorpayCheckout from '../../components/payment/RazorpayCheckout';
import logoImg from '../../assets/logo.png';

const StudentApply = () => {
    const { id } = useParams();
    const [appConfig, setAppConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checkoutDetails, setCheckoutDetails] = useState(null);

    // Form inputs
    const [studentName, setStudentName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [studentDob, setStudentDob] = useState('');
    const [studentAddress, setStudentAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Payment States
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/sales/applications/${id}`);
            setAppConfig(data);
            if (data.status === 'paid') {
                setPaymentVerified(true);
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError(err.response?.data?.message || 'Invalid or expired application link');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!studentName || !fatherName || !studentEmail || !studentPhone || !studentAddress || !studentDob) {
            setError('Please fill in all details');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const payload = {
                studentName,
                fatherName,
                studentEmail,
                studentPhone,
                studentAddress,
                studentDob
            };
            const { data } = await axios.post(`/api/sales/applications/${id}/submit`, payload);
            setCheckoutDetails(data);
        } catch (err) {
            console.error('Error submitting application details:', err);
            setError(err.response?.data?.message || 'Failed to submit application details');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSuccess = async (response) => {
        try {
            setVerifyingPayment(true);
            const confirmPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
            };
            await axios.post(`/api/sales/applications/${id}/confirm-payment`, confirmPayload);
            setPaymentVerified(true);
            setCheckoutDetails(null);
        } catch (err) {
            console.error('Payment confirmation error:', err);
            setError('Payment verification failed. Please contact support.');
        } finally {
            setVerifyingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !checkoutDetails && !paymentVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
                <GlassCard className="p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Application Error</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <ModernButton onClick={fetchApplicationDetails} className="w-full">
                        Retry Loading Page
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    if (paymentVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
                <GlassCard className="p-8 max-w-md w-full text-center border-emerald-500/20">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                    <p className="text-white/70 mb-2">Dear {studentName || appConfig?.student_name}, your admission fee payment of <strong>INR {parseFloat(appConfig?.fee_amount).toLocaleString()}</strong> was successful.</p>
                    <p className="text-xs text-white/50 mb-6">A confirmation email has been dispatched to {studentEmail || appConfig?.student_email}.</p>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-left text-xs space-y-1 mb-6 text-white/70">
                        <div><strong className="text-white">University:</strong> {appConfig?.university_name}</div>
                        <div><strong className="text-white">Preferred Course:</strong> {appConfig?.course_name}</div>
                        <div><strong className="text-white">Date of Birth:</strong> {studentDob || appConfig?.student_dob || 'N/A'}</div>
                        {appConfig?.razorpay_payment_id && <div><strong className="text-white">Receipt Ref:</strong> {appConfig.razorpay_payment_id}</div>}
                    </div>
                    <ModernButton onClick={() => window.close()} className="w-full">
                        Close Window
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white selection:bg-primary selection:text-white">
            {/* Custom Header with logos */}
            <header className="w-full py-4 px-6 border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* SkillDad Logo */}
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="SkillDad Logo" className="h-8 md:h-10 object-contain" />
                        <span className="w-[1px] h-6 bg-white/20 hidden md:block"></span>
                        <span className="text-xs font-bold tracking-widest text-primary uppercase hidden md:block">Admission Portal</span>
                    </div>

                    {/* University Logo */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40 hidden sm:block">Affiliated Partner:</span>
                        {appConfig?.university_logo ? (
                            <img src={appConfig.university_logo} alt="University Logo" className="h-8 md:h-10 max-w-[120px] object-contain rounded-md" />
                        ) : (
                            <span className="text-sm font-bold text-white/80">{appConfig?.university_name}</span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Application Area */}
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="max-w-xl w-full">
                    {checkoutDetails ? (
                        /* Razorpay Integration Component Screen */
                        <GlassCard className="p-8 text-center space-y-6">
                            <CreditCard className="w-16 h-16 text-primary mx-auto animate-pulse" />
                            <h2 className="text-xl font-bold text-white">Initiate Secure Payment</h2>
                            <p className="text-white/60 text-sm">
                                You are paying <strong>₹{parseFloat(checkoutDetails.amount).toLocaleString()}</strong> for <strong>{checkoutDetails.courseName}</strong> at <strong>{checkoutDetails.universityName}</strong>.
                            </p>
                            {verifyingPayment ? (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                    <p className="text-gray-400 text-sm">Verifying payment with bank servers...</p>
                                </div>
                            ) : (
                                <RazorpayCheckout
                                    keyId={checkoutDetails.keyId}
                                    orderId={checkoutDetails.orderId}
                                    amount={checkoutDetails.amount}
                                    courseName={checkoutDetails.courseName}
                                    customerName={checkoutDetails.studentName}
                                    customerEmail={checkoutDetails.studentEmail}
                                    customerPhone={checkoutDetails.studentPhone}
                                    onSuccess={handlePaymentSuccess}
                                    onFailure={(err) => setError(err.error_description || 'Payment Failed')}
                                    onDismiss={() => setCheckoutDetails(null)}
                                    autoOpen={true}
                                />
                            )}
                        </GlassCard>
                    ) : (
                        /* Student Application Form */
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GlassCard className="p-8 relative">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-white">Student Admission Form</h1>
                                    <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-black">
                                        For: {appConfig?.course_name}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold mt-3">
                                        Total Admission Fee: ₹{parseFloat(appConfig?.fee_amount).toLocaleString()}
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-white/70 mb-2">Student Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                            <input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                value={studentName}
                                                onChange={(e) => setStudentName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-white/70 mb-2">Father's Name *</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Robert Doe"
                                                    value={fatherName}
                                                    onChange={(e) => setFatherName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-white/70 mb-2">Date of Birth *</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={studentDob}
                                                    onChange={(e) => setStudentDob(e.target.value)}
                                                    className="w-full px-4 py-[7px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                                    style={{ colorScheme: 'dark' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-white/70 mb-2">Email Address *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={studentEmail}
                                                    onChange={(e) => setStudentEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-white/70 mb-2">Phone Number *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                                <input
                                                    type="tel"
                                                    placeholder="e.g. +91 9876543210"
                                                    value={studentPhone}
                                                    onChange={(e) => setStudentPhone(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-white/70 mb-2">Residential Address *</label>
                                        <div className="relative">
                                            <Home className="absolute left-3 top-3 text-white/40" size={16} />
                                            <textarea
                                                placeholder="Enter full permanent address"
                                                value={studentAddress}
                                                onChange={(e) => setStudentAddress(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <ModernButton type="submit" disabled={submitting} className="w-full mt-4">
                                        {submitting ? 'Processing...' : 'Next: Proceed to Payment'}
                                    </ModernButton>
                                </form>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-white/30 border-t border-white/5">
                Powered by SkillDad Admissions System. &copy; {new Date().getFullYear()} All Rights Reserved.
            </footer>
        </div>
    );
};

export default StudentApply;
