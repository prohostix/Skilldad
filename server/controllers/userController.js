const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/postgres');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const socketService = require('../services/SocketService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'student', discountRate = 0 } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        // 1. Check if user exists
        const userExists = await query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 8);
        const newId = `user_${Date.now()}`;

        // 3. Insert into PG
        const newUser = await query(`
            INSERT INTO users (id, name, email, password, role, discount_rate, profile, is_verified, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
            RETURNING id, name, email, role
        `, [
            newId, name, lowerEmail, hashedPassword, role, discountRate,
            JSON.stringify({ phone: phone || '' })
        ]);

        const user = newUser.rows[0];

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            discountRate: user.discount_rate || 0,
            token: generateToken(user.id)
        });

        // Background notification
        setImmediate(async () => {
            try {
                const notificationService = require('../services/NotificationService');
                await notificationService.send({ name: user.name, email: user.email, phone }, 'welcome');
            } catch (err) {
                console.error('Welcome notification failed:', err.message);
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        console.log(`[Login] Attempt for email: ${lowerEmail}`);

        const userRes = await query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
        const user = userRes.rows[0];

        if (!user) {
            console.warn(`[Login] User not found for email: ${lowerEmail}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`[Login] Password mismatch for email: ${lowerEmail}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`[Login] Success for user: ${user.email} (Role: ${user.role})`);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            partnerCode: user.partner_code,
            discountRate: user.discount_rate || 0,
            isVerified: user.is_verified,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
const getMe = async (req, res) => {
    try {
        const userRes = await query('SELECT id, name, email, role, profile, partner_code, is_verified as "isVerified", discount_rate as "discountRate" FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            partnerCode: user.partner_code,
            discountRate: user.discountRate || 0,
            profile: user.profile,
            isVerified: user.isVerified
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, bio, profile } = req.body;
        const userId = req.user.id;

        const updated = await query(`
            UPDATE users 
            SET name = COALESCE($1, name), 
                email = COALESCE($2, email), 
                bio = COALESCE($3, bio), 
                profile = COALESCE($4, profile),
                updated_at = NOW()
            WHERE id = $5
            RETURNING id, name, email, role, bio, profile
        `, [name, email ? email.toLowerCase() : null, bio, profile ? JSON.stringify(profile) : null, userId]);

        const user = updated.rows[0];
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            discountRate: user.discount_rate || 0,
            bio: user.bio,
            profile: user.profile,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin)
const getUsers = async (req, res) => {
    try {
        const { role, universityId, partnerId } = req.query;
        const requesterRole = req.user.role?.toLowerCase();
        const requesterId = req.user._id || req.user.id;
        
        let usersRes;
        
        let queryStr = 'SELECT id as _id, name, email, role, profile, created_at FROM users';
        let queryParams = [];
        let whereClauses = [];

        // Security: If not admin, restrict visibility
        if (requesterRole !== 'admin') {
            if (requesterRole === 'university') {
                // Universities can see students they've registered or students associated with them
                whereClauses.push(`(role = 'student' AND (university_id = $${queryParams.length + 1} OR registered_by = $${queryParams.length + 1}))`);
                queryParams.push(requesterId);
            } else if (requesterRole === 'partner') {
                // Partners can ONLY see students they have specifically registered
                whereClauses.push(`(role = 'student' AND registered_by = $${queryParams.length + 1})`);
                queryParams.push(requesterId);
            } else {
                // Other users see nothing by default
                whereClauses.push('1 = 0');
            }
        } else {
            // Admin can use filters normally
            if (role) {
                whereClauses.push(`role = $${queryParams.length + 1}`);
                queryParams.push(role);
            }
            const pId = partnerId || req.query.registeredBy;
            if (universityId) {
                whereClauses.push(`university_id = $${queryParams.length + 1}`);
                queryParams.push(universityId);
            } else if (pId) {
                whereClauses.push(`registered_by = $${queryParams.length + 1}`);
                queryParams.push(pId);
            }
        }

        if (whereClauses.length > 0) {
            queryStr += ' WHERE ' + whereClauses.join(' AND ');
        }

        queryStr += ' ORDER BY created_at DESC';
        usersRes = await query(queryStr, queryParams);

        // Add enrollment data for students
        const users = usersRes.rows;
        if (role === 'student' || !role) {
            const enrollmentsRes = await query(`
                SELECT e.student_id, e.course_id, c.title as course_title, e.batch_id, b.name as batch_name
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN batches b ON e.batch_id = b.id
            `);
            
            const studentEnrollments = {};
            enrollmentsRes.rows.forEach(r => {
                if (!studentEnrollments[r.student_id]) {
                    studentEnrollments[r.student_id] = [];
                }
                studentEnrollments[r.student_id].push({
                    courseId: r.course_id,
                    courseTitle: r.course_title,
                    batchId: r.batch_id,
                    batchName: r.batch_name
                });
            });

            const enriched = users.map(u => ({
                ...u,
                enrollmentCount: studentEnrollments[u._id]?.length || 0,
                enrollments: studentEnrollments[u._id] || [],
                courses: (studentEnrollments[u._id] || []).map(en => en.courseTitle),
                course: studentEnrollments[u._id]?.[0]?.courseTitle || 'No Enrollment'
            }));
            return res.json(enriched);
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    updateProfile,
    // @desc    Forgot Password
    // @route   POST /api/users/forgotpassword
    // @access  Public
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const lowerEmail = email.toLowerCase().trim();

            const userRes = await query('SELECT id, name, email FROM users WHERE email = $1', [lowerEmail]);
            const user = userRes.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'No account associated with this email address' });
            }

            // 1. Generate Reset Token
            const resetToken = crypto.randomBytes(20).toString('hex');

            // 2. Hash and set to user
            const hashedToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // 3. Set Expire (10 minutes)
            const expire = Date.now() + 10 * 60 * 1000;

            await query(`
                UPDATE users 
                SET reset_password_token = $1, reset_password_expire = $2, updated_at = NOW()
                WHERE id = $3
            `, [hashedToken, expire, user.id]);

            // 4. Send Email
            const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
            
            try {
                const html = emailTemplates.passwordReset(user.name, resetUrl);
                await sendEmail({
                    email: user.email,
                    subject: 'SkillDad: Password Recovery Protocol',
                    html: html
                });

                res.json({ success: true, message: 'Recovery link dispatched to your inbox' });
            } catch (err) {
                console.error('Email Dispatch Error:', err.message);
                // Clear reset fields if email fails
                await query('UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = $1', [user.id]);
                return res.status(500).json({ message: 'Failed to dispatch recovery email. Please try again later.' });
            }

        } catch (error) {
            console.error('Forgot Password Error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // @desc    Reset Password
    // @route   PUT /api/users/resetpassword/:resettoken
    // @access  Public
    resetPassword: async (req, res) => {
        try {
            const hashedToken = crypto
                .createHash('sha256')
                .update(req.params.resettoken)
                .digest('hex');

            const userRes = await query(`
                SELECT id, name, email, role 
                FROM users 
                WHERE reset_password_token = $1 AND reset_password_expire > $2
            `, [hashedToken, Date.now()]);

            const user = userRes.rows[0];

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired recovery link' });
            }

            // Set new password
            const hashedPassword = await bcrypt.hash(req.body.password, 8);

            await query(`
                UPDATE users 
                SET password = $1, 
                    reset_password_token = NULL, 
                    reset_password_expire = NULL, 
                    updated_at = NOW() 
                WHERE id = $2
            `, [hashedPassword, user.id]);

            res.json({
                success: true,
                message: 'Password recalibrated successfully',
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Reset Password Error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // @desc    Update Password (Authenticated)
    // @route   PUT /api/users/password
    // @access  Private
    updatePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const userRes = await query('SELECT password FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password mismatch' });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 8);
            await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);

            res.json({ success: true, message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    uploadProfileImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            let userId = req.user.id;


            // Allow admin to upload for someone else
            if (req.user.role === 'admin' && req.body.targetUserId) {
                userId = req.body.targetUserId;
                console.log(`[Admin Upload] Admin ${req.user.id} uploading for target ${userId}`);
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            // Fetch current profile to merge
            const userRes = await query('SELECT profile FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) {
                return res.status(404).json({ message: 'Target user not found' });
            }


            const currentProfile = userRes.rows[0]?.profile || {};

            // Update profile JSON
            const updatedProfile = {
                ...currentProfile,
                profileImage: imageUrl
            };

            // Update BOTH column and JSON for maximum compatibility
            await query('UPDATE users SET profile_image = $1, profile = $2, updated_at = NOW() WHERE id = $3',

                [imageUrl, JSON.stringify(updatedProfile), userId]);

            res.json({
                success: true,
                message: 'Profile image uploaded',
                imageUrl
            });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    uploadCoverImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            let userId = req.user.id;

            // Allow admin to upload for someone else
            if (req.user.role === 'admin' && req.body.targetUserId) {
                userId = req.body.targetUserId;
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            const userRes = await query('SELECT profile FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) {
                return res.status(404).json({ message: 'Target user not found' });
            }

            const currentProfile = userRes.rows[0]?.profile || {};
            const updatedProfile = { ...currentProfile, coverImage: imageUrl };

            await query('UPDATE users SET profile = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(updatedProfile), userId]);

            res.json({ success: true, message: 'Cover image uploaded', imageUrl });
        } catch (error) {
            console.error('Cover Upload Error:', error);
            res.status(500).json({ message: error.message });
        }

    }
};
