import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { loadRazorpayScript, initializeRazorpay } from '../../utils/razorpay';

/**
 * RazorpayCheckout Component
 * 
 * Handles Razorpay checkout initialization and payment processing
 * 
 * @param {Object} props
 * @param {string} props.keyId - Razorpay key ID
 * @param {string} props.orderId - Razorpay order ID
 * @param {number} props.amount - Amount in rupees (will be converted to paise)
 * @param {string} props.currency - Currency code (default: INR)
 * @param {string} props.courseName - Course name for description
 * @param {string} props.customerName - Customer name
 * @param {string} props.customerEmail - Customer email
 * @param {string} props.customerPhone - Customer phone
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onFailure - Failure callback
 * @param {Function} props.onDismiss - Dismiss callback
 * @param {boolean} props.autoOpen - Auto-open checkout modal (default: true)
 */
const RazorpayCheckout = ({
    keyId,
    orderId,
    amount,
    currency = 'INR',
    courseName,
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onFailure,
    onDismiss,
    autoOpen = true,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [razorpayInstance, setRazorpayInstance] = useState(null);

    useEffect(() => {
        initializeCheckout();
    }, []);

    const initializeCheckout = async () => {
        try {
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            
            if (!loaded) {
                setError('Failed to load payment gateway. Please refresh the page.');
                setLoading(false);
                return;
            }

            // Initialize Razorpay
            const razorpay = initializeRazorpay({
                keyId,
                orderId,
                amount: amount * 100, // Convert to paise
                currency,
                name: 'SkillDad',
                description: `${courseName} - Course Enrollment`,
                customerName,
                customerEmail,
                customerPhone,
                onSuccess: (response) => {
                    if (onSuccess) {
                        onSuccess(response);
                    }
                },
                onFailure: (error) => {
                    setError(`Payment failed: ${error.error_description || 'Unknown error'}`);
                    if (onFailure) {
                        onFailure(error);
                    }
                },
                onDismiss: () => {
                    if (onDismiss) {
                        onDismiss();
                    }
                },
            });

            setRazorpayInstance(razorpay);
            setLoading(false);

            // Auto-open checkout if enabled
            if (autoOpen) {
                razorpay.open();
            }
        } catch (err) {
            setError('Failed to initialize payment gateway');
            setLoading(false);
        }
    };

    const openCheckout = () => {
        if (razorpayInstance) {
            razorpayInstance.open();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Loading payment gateway...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button
                    onClick={initializeCheckout}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!autoOpen) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                <p className="text-gray-400 text-sm mb-4">Payment gateway ready</p>
                <button
                    onClick={openCheckout}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-semibold"
                >
                    Open Payment Gateway
                </button>
            </div>
        );
    }

    return null;
};

export default RazorpayCheckout;
