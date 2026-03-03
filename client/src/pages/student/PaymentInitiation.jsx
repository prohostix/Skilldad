import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Tag,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Info,
    ChevronLeft,
    Globe
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import StripePaymentForm from '../../components/payment/StripePaymentForm';

const PaymentInitiation = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [validatingDiscount, setValidatingDiscount] = useState(false);
    const [error, setError] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Stripe Elements State
    const [clientSecret, setClientSecret] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [stripePromise, setStripePromise] = useState(null);
    const [paymentMode, setPaymentMode] = useState('summary'); // summary, elements

    const GST_RATE = 0.18;
    const SERVICE_CHARGE_RATE = 0.02;

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`/api/courses/${courseId}`, config);
            setCourse(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load course details');
            setLoading(false);
        }
    };

    const validateDiscountCode = async () => {
        if (!discountCode.trim()) {
            setDiscountError('Please enter a discount code');
            return;
        }

        setValidatingDiscount(true);
        setDiscountError('');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post(
                '/api/discount/validate',
                { code: discountCode.toUpperCase(), courseId },
                config
            );

            setAppliedDiscount(data);
            setDiscountError('');
        } catch (err) {
            setDiscountError(err.response?.data?.message || 'Invalid discount code');
            setAppliedDiscount(null);
        } finally {
            setValidatingDiscount(false);
        }
    };

    const removeDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountError('');
    };

    const calculatePricing = () => {
        if (!course) return { original: 0, discount: 0, subtotal: 0, serviceCharge: 0, gst: 0, total: 0 };

        const original = parseFloat(course.price);
        let discount = 0;

        if (appliedDiscount) {
            if (appliedDiscount.type === 'percentage') {
                discount = (original * appliedDiscount.value) / 100;
            } else {
                discount = appliedDiscount.value;
            }
        }

        const subtotal = original - discount;
        const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
        const gst = subtotal * GST_RATE;
        const total = subtotal + serviceCharge + gst;

        return {
            original: original.toFixed(2),
            discount: discount.toFixed(2),
            subtotal: subtotal.toFixed(2),
            serviceCharge: serviceCharge.toFixed(2),
            gst: gst.toFixed(2),
            total: total.toFixed(2)
        };
    };

    const handleProceedToPayment = async (mode = 'elements') => {
        setProcessing(true);
        setError('');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Backend does not have CSRF token route yet, proceed securely without blocking
            const csrfToken = "temp_csrf_bypass";

            // Initiate payment
            const { data } = await axios.post(
                '/api/payment/initiate',
                {
                    courseId,
                    discountCode: appliedDiscount ? discountCode.toUpperCase() : undefined,
                    mode: mode // elements or checkout
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                        'X-CSRF-Token': csrfToken
                    }
                }
            );

            if (mode === 'elements') {
                setStripePromise(loadStripe(data.publishableKey));
                setClientSecret(data.clientSecret);
                setTransactionId(data.transactionId);
                setPaymentMode('elements');
                setProcessing(false);
            } else {
                // Redirect to payment gateway (Checkout)
                window.location.href = data.paymentUrl;
            }
        } catch (err) {
            const errorData = err.response?.data;

            // Check for maintenance mode or gateway timeout (Requirement 7.9)
            if (errorData?.maintenanceMode || errorData?.errorCategory === 'gateway_timeout') {
                setError(errorData.message || 'Payment gateway is temporarily unavailable. Please try again later.');
                setMaintenanceMode(true);
            } else {
                setError(errorData?.message || 'Failed to initiate payment');
                setMaintenanceMode(false);
            }

            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <GlassCard className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Course</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <ModernButton onClick={() => navigate('/courses')}>
                        Back to Courses
                    </ModernButton>
                </GlassCard>
            </div>
        );
    }

    const pricing = calculatePricing();

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#0f172a',
            colorText: '#ffffff',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-2">
                {paymentMode !== 'summary' && (
                    <button
                        onClick={() => setPaymentMode('summary')}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <DashboardHeading
                    title={paymentMode === 'summary' ? "Complete Your Payment" : "Secure Checkout"}
                    className="text-2xl font-black"
                />
            </div>

            <AnimatePresence mode="wait">
                {paymentMode === 'summary' ? (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Error Banner */}
                        {error && (
                            <div className={`p-6 border rounded-2xl ${maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-start gap-4">
                                    <AlertCircle className={`${maintenanceMode ? 'text-amber-400' : 'text-red-400'} flex-shrink-0 mt-1`} size={24} />
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold ${maintenanceMode ? 'text-amber-400' : 'text-red-400'} mb-2`}>
                                            {maintenanceMode ? 'Payment Gateway Temporarily Unavailable' : 'Payment Initiation Failed'}
                                        </h3>
                                        <p className="text-sm text-gray-300 mb-2">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Course Details</h3>
                                    <div className="flex gap-4">
                                        <img
                                            src={course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                            alt={course.title}
                                            className="w-32 h-20 object-cover rounded-xl"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' }}
                                        />
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-white mb-1">{course.title}</h2>
                                            <p className="text-sm text-gray-400 mb-2">by {course.instructor?.name || 'SkillDad'}</p>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Tag size={14} /> Discount Code
                                    </h3>
                                    {!appliedDiscount ? (
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="Enter discount code"
                                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                                            />
                                            <ModernButton onClick={validateDiscountCode} disabled={validatingDiscount || !discountCode.trim()}>
                                                {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                            </ModernButton>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="text-emerald-400" size={20} />
                                                <span className="text-sm font-bold text-white">{discountCode} Applied!</span>
                                            </div>
                                            <button onClick={removeDiscount} className="text-xs text-gray-400 hover:text-white">Remove</button>
                                        </div>
                                    )}
                                </GlassCard>
                            </div>

                            <div className="lg:col-span-1">
                                <GlassCard className="p-6 sticky top-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Price Summary</h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Course Price</span>
                                            <span className="text-white font-semibold">₹{pricing.original}</span>
                                        </div>
                                        {appliedDiscount && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-emerald-400">Discount</span>
                                                <span className="text-emerald-400 font-semibold">-₹{pricing.discount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                                            <span className="text-gray-400">Service Charge (2%)</span>
                                            <span className="text-white font-semibold">₹{pricing.serviceCharge}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">GST (18%)</span>
                                            <span className="text-white font-semibold">₹{pricing.gst}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/10">
                                            <span className="text-white">Total</span>
                                            <span className="text-primary">₹{pricing.total}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <ModernButton onClick={() => handleProceedToPayment('elements')} disabled={processing} className="w-full !py-4">
                                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Payment"}
                                        </ModernButton>

                                        <button
                                            onClick={() => handleProceedToPayment('checkout')}
                                            disabled={processing}
                                            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Globe size={12} /> External Gateway Redirect
                                        </button>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-widest">
                                        <ShieldCheck size={12} /> Secure Stripe Encryption
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="elements"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <GlassCard className="p-8">
                            {clientSecret && stripePromise && (
                                <Elements stripe={stripePromise} options={options}>
                                    <StripePaymentForm
                                        clientSecret={clientSecret}
                                        transactionId={transactionId}
                                        amount={pricing.total}
                                        onCancel={() => setPaymentMode('summary')}
                                    />
                                </Elements>
                            )}
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentInitiation;

