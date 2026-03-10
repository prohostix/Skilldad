/**
 * Razorpay Utility Functions
 * 
 * Handles loading and initializing Razorpay checkout
 */

/**
 * Load Razorpay checkout script dynamically
 * @returns {Promise<boolean>} - Resolves to true when script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout
 * @param {Object} options - Razorpay checkout options
 * @param {string} options.keyId - Razorpay key ID
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Order description
 * @param {string} options.customerName - Customer name
 * @param {string} options.customerEmail - Customer email
 * @param {string} options.customerPhone - Customer phone
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 * @param {Function} options.onDismiss - Dismiss callback
 * @returns {Object} - Razorpay instance
 */
export const initializeRazorpay = (options) => {
  const {
    keyId,
    orderId,
    amount,
    currency = 'INR',
    name = 'SkillDad',
    description,
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onFailure,
    onDismiss,
  } = options;

  const razorpayOptions = {
    key: keyId,
    amount: amount,
    currency: currency,
    name: name,
    description: description,
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    theme: {
      color: '#7c3aed', // Primary color
    },
    handler: function (response) {
      // Payment successful
      if (onSuccess) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      }
    },
    modal: {
      ondismiss: function () {
        // User closed the checkout modal
        if (onDismiss) {
          onDismiss();
        }
      },
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);

  // Handle payment failure
  razorpay.on('payment.failed', function (response) {
    if (onFailure) {
      onFailure({
        error_code: response.error.code,
        error_description: response.error.description,
        error_source: response.error.source,
        error_step: response.error.step,
        error_reason: response.error.reason,
        order_id: response.error.metadata.order_id,
        payment_id: response.error.metadata.payment_id,
      });
    }
  });

  return razorpay;
};
