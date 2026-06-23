const { query } = require('../config/postgres');
const crypto = require('crypto');
const RazorpayGatewayService = require('../services/payment/RazorpayGatewayService');
const sendEmail = require('../utils/sendEmail');

// Initialize Razorpay Service
let _razorpayService = null;
const getRazorpayService = () => {
    if (!_razorpayService) {
        const gatewayConfig = {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
        };
        _razorpayService = new RazorpayGatewayService(gatewayConfig);
    }
    return _razorpayService;
};

// @desc    Create a new application config for sales user
// @route   POST /api/sales/applications
// @access  Private (Sales/Admin)
const createApplicationConfig = async (req, res) => {
    try {
        const { universityName, courseName, feeAmount, universityLogo } = req.body;
        const salesId = req.user.id;

        if (!universityName || !courseName || !feeAmount) {
            return res.status(400).json({ message: 'University name, course name, and fee amount are required' });
        }

        const id = `app_${crypto.randomBytes(8).toString('hex')}`;

        const result = await query(`
            INSERT INTO sales_applications (id, sales_id, university_name, course_name, university_logo, fee_amount, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *
        `, [id, salesId, universityName, courseName, universityLogo || null, feeAmount]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating application config:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all application configurations created by this sales user
// @route   GET /api/sales/applications
// @access  Private (Sales/Admin)
const getSalesApplications = async (req, res) => {
    try {
        const salesId = req.user.id;
        const result = await query(
            'SELECT * FROM sales_applications WHERE sales_id = $1 ORDER BY created_at DESC',
            [salesId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sales applications:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get details of an application configuration (Public)
// @route   GET /api/sales/applications/:id
// @access  Public
const getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM sales_applications WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application link not found or expired' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload University Logo
// @route   POST /api/sales/upload-logo
// @access  Private (Sales/Admin)
const uploadUniversityLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit student details and initiate Razorpay order (Public)
// @route   POST /api/sales/applications/:id/submit
// @access  Public
const submitStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentName, fatherName, studentAddress, studentEmail, studentPhone, studentDob } = req.body;

        if (!studentName || !fatherName || !studentAddress || !studentEmail || !studentPhone || !studentDob) {
            return res.status(400).json({ message: 'All student details are required' });
        }

        // Fetch application details to get course, university, and fee
        const appRes = await query('SELECT * FROM sales_applications WHERE id = $1', [id]);
        if (appRes.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }
        const appData = appRes.rows[0];

        const razorpayService = getRazorpayService();
        const txnId = `TXN_SALES_${Date.now()}`;

        // Create order on Razorpay
        const orderData = await razorpayService.createOrder({
            transactionId: txnId,
            amount: Math.round(appData.fee_amount * 100), // Convert to paise
            currency: 'INR',
            customerName: studentName,
            customerEmail: studentEmail,
            customerPhone: studentPhone,
            productInfo: `${appData.course_name} Application Fee - ${appData.university_name}`,
            courseId: 'sales_direct',
            studentId: 'sales_direct_student',
            gstAmount: 0
        });

        // Update sales application with student details, dob and order_id
        await query(`
            UPDATE sales_applications
            SET student_name = $1, father_name = $2, student_address = $3,
                student_email = $4, student_phone = $5, razorpay_order_id = $6,
                student_dob = $7, updated_at = NOW()
            WHERE id = $8
        `, [studentName, fatherName, studentAddress, studentEmail, studentPhone, orderData.orderId, studentDob, id]);

        res.json({
            success: true,
            orderId: orderData.orderId,
            keyId: razorpayService.getPublishableKey(),
            amount: appData.fee_amount,
            currency: 'INR',
            universityName: appData.university_name,
            courseName: appData.course_name,
            studentName,
            studentEmail,
            studentPhone,
            studentDob
        });
    } catch (error) {
        console.error('Error submitting student details & initiating order:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify signature, update status to paid, and send email (Public)
// @route   POST /api/sales/applications/:id/confirm-payment
// @access  Public
const confirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment signature details' });
        }

        const razorpayService = getRazorpayService();
        const isSignatureValid = razorpayService.verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });

        if (!isSignatureValid) {
            return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
        }

        // Fetch application details
        const appRes = await query('SELECT * FROM sales_applications WHERE id = $1', [id]);
        if (appRes.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }
        const appData = appRes.rows[0];

        // Update application
        await query(`
            UPDATE sales_applications
            SET status = 'paid', razorpay_payment_id = $1, updated_at = NOW()
            WHERE id = $2
        `, [razorpay_payment_id, id]);

        // Send confirmation email to student
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; border-bottom: 2px solid #5C3BFF; padding-bottom: 10px; margin-bottom: 20px;">
                    <h2 style="color: #333;">Admission Application Confirmation</h2>
                    <p style="font-size: 16px; color: #5C3BFF; font-weight: bold; margin: 5px 0;">${appData.university_name}</p>
                </div>
                <p>Dear <strong>${appData.student_name}</strong>,</p>
                <p>Congratulations! We have successfully received your admission application fee payment. Below are your application details:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Course Preferred:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.course_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">University:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.university_name}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Fee Paid:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">INR ${parseFloat(appData.fee_amount).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Student DOB:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.student_dob || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Father's Name:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.father_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone Number:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.student_phone}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Address:</td>
                        <td style="padding: 10px; border: 1px solid #eee;">${appData.student_address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Payment ID:</td>
                        <td style="padding: 10px; border: 1px solid #eee; font-family: monospace;">${razorpay_payment_id}</td>
                    </tr>
                </table>

                <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
                    <p>Powered by SkillDad &copy; ${new Date().getFullYear()}</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: appData.student_email,
                subject: `Application & Payment Successful - ${appData.university_name}`,
                html: emailHtml,
                message: `Thank you for your application fee payment of INR ${appData.fee_amount} for ${appData.course_name} at ${appData.university_name}.`
            });
        } catch (emailErr) {
            console.error('Email delivery failure:', emailErr.message);
        }

        res.json({ success: true, message: 'Payment confirmed and email sent successfully.' });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createApplicationConfig,
    getSalesApplications,
    getApplicationDetails,
    uploadUniversityLogo,
    submitStudentDetails,
    confirmPayment
};
