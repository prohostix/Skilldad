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

// Mirrors the client-side rules (Register.jsx, ResetPassword.jsx) so a weak
// password can't be set by calling the API directly, bypassing the browser form.
const PASSWORD_REQUIREMENTS = [
    { regex: /.{8,}/, message: 'Password must be at least 8 characters long.' },
    { regex: /[A-Z]/, message: 'Password must include an uppercase letter.' },
    { regex: /[0-9]/, message: 'Password must include a number.' },
    { regex: /[^A-Za-z0-9]/, message: 'Password must include a special character.' }
];

const getPasswordError = (password) => {
    if (!password) return 'Password is required.';
    for (const req of PASSWORD_REQUIREMENTS) {
        if (!req.regex.test(password)) return req.message;
    }
    return null;
};

// A real phone number is never a simple run of identical or consecutive
// digits (e.g. 1234567890, 0000000000, 9876543210) — catches placeholder
// values that would otherwise pass a plain length check.
const isSequentialOrRepeated = (digits) => {
    if (/^(\d)\1+$/.test(digits)) return true;
    let ascending = true, descending = true;
    for (let i = 1; i < digits.length; i++) {
        const prev = Number(digits[i - 1]);
        const curr = Number(digits[i]);
        if (curr !== (prev + 1) % 10) ascending = false;
        if (curr !== (prev + 9) % 10) descending = false;
    }
    return ascending || descending;
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'student', discountRate = 0, universityId } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        // This route also doubles as the endpoint admin/university/partner panels use
        // to create student accounts directly, where the phone field is optional. Only
        // enforce a required, validated phone for genuine public self-registration
        // (no auth token) — for admin-initiated creation, just sanity-check it if given.
        const isAdminInitiated = !!req.headers.authorization;
        const phoneDigits = (phone || '').replace(/^\+/, '').replace(/\D/g, '');
        // The sequential/repeated check must run on the national number alone —
        // a country code prefix (e.g. "91") breaks the digit pattern of an
        // otherwise-obvious placeholder like 9876543210.
        const isIndianWithCode = phoneDigits.startsWith('91') && phoneDigits.length === 12;
        const nationalNumber = isIndianWithCode ? phoneDigits.slice(2) : phoneDigits;

        if (!isAdminInitiated) {
            if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15) {
                return res.status(400).json({ message: 'Please provide a valid phone number.' });
            }
            if (isIndianWithCode && !/^[6-9]/.test(nationalNumber)) {
                return res.status(400).json({ message: 'Enter a valid Indian mobile number (must start with 6, 7, 8, or 9).' });
            }
            if (isSequentialOrRepeated(nationalNumber)) {
                return res.status(400).json({ message: 'Enter a real phone number — that looks like a placeholder.' });
            }
        } else if (phoneDigits && (phoneDigits.length < 7 || phoneDigits.length > 15 || isSequentialOrRepeated(nationalNumber))) {
            return res.status(400).json({ message: 'Enter a valid phone number, or leave it blank.' });
        }

        // Full password strength policy for public self-registration; admin/university/
        // partner panels creating a student account just need a non-empty password —
        // they don't currently offer the same strength UI, so don't break that flow.
        if (!isAdminInitiated) {
            const passwordError = getPasswordError(password);
            if (passwordError) {
                return res.status(400).json({ message: passwordError });
            }
        } else if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        // 1. Check if user exists
        const userExists = await query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 8);
        const newId = `user_${Date.now()}`;

        // 3. Insert into PG
        // last_login_at is set here too, since registration immediately hands back a
        // usable token — without this, a user who never visits /login separately would
        // have last_login_at stay null forever and re-trigger the first-login welcome.
        const newUser = await query(`
            INSERT INTO users (id, name, email, password, role, discount_rate, profile, university_id, is_verified, last_login_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), NOW())
            RETURNING id, name, email, role, university_id
        `, [
            newId, name, lowerEmail, hashedPassword, role, discountRate,
            JSON.stringify({ phone: phone || '' }), universityId || null
        ]);

        const user = newUser.rows[0];

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            discountRate: user.discount_rate || 0,
            isFirstLogin: true,
            token: generateToken(user.id)
        });

        // Background notification
        setImmediate(async () => {
            try {
                const notificationService = require('../services/NotificationService');
                await notificationService.send({ id: user.id, name: user.name, email: user.email, phone }, 'welcome');
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

        if (user.is_active === false) {
            if (user.role?.toLowerCase() !== 'student') {
                console.warn(`[Login] Inactive user attempted login: ${lowerEmail}`);
                return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
            } else {
                // If it's a student, check if they were deactivated by admin
                let profile = {};
                try {
                    profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : (user.profile || {});
                } catch(e) {}
                if (profile.deactivated_by_role === 'admin') {
                    console.warn(`[Login] Admin-deactivated student attempted login: ${lowerEmail}`);
                    return res.status(403).json({ message: 'Your account has been deactivated by an Administrator. Please contact support.' });
                }
            }
        }

        console.log(`[Login] Success for user: ${user.email} (Role: ${user.role})`);

        // A user who has never logged in before (last_login_at still null) is
        // shown the first-time welcome experience exactly once, right here.
        const isFirstLogin = !user.last_login_at;
        await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            partnerCode: user.partner_code,
            discountRate: user.discount_rate || 0,
            isVerified: user.is_verified,
            isFirstLogin,
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
        
        let queryStr = 'SELECT id as _id, name, email, role, profile, is_active, created_at FROM users';
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
            const baseUrl = (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost') && !process.env.CLIENT_URL.includes('127.0.0.1'))
                ? process.env.CLIENT_URL 
                : 'https://skilldad.com';
            const resetUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/reset-password/${resetToken}`;
            
            try {
                const html = emailTemplates.passwordReset(user.name, resetUrl);
                await sendEmail({
                    email: user.email,
                    subject: 'Reset Your SkillDad Password',
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

            const passwordError = getPasswordError(req.body.password);
            if (passwordError) {
                return res.status(400).json({ message: passwordError });
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

            const passwordError = getPasswordError(newPassword);
            if (passwordError) {
                return res.status(400).json({ message: passwordError });
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
    },

    updateUserStatus: async (req, res) => {
        try {
            const userId = req.params.id;
            const { is_active } = req.body;
            const requesterRole = req.user.role;
            const requesterId = req.user._id || req.user.id;

            // Only admin, partner or university can change status
            if (requesterRole !== 'admin' && requesterRole !== 'partner' && requesterRole !== 'university') {
                return res.status(403).json({ message: 'Not authorized to perform this action' });
            }

            // Partners/universities may only toggle students that belong to them
            if (requesterRole !== 'admin') {
                const targetRes = await query('SELECT role, university_id, registered_by FROM users WHERE id = $1', [userId]);
                const target = targetRes.rows[0];
                if (!target) {
                    return res.status(404).json({ message: 'User not found' });
                }

                let isOwnStudent = false;

                if (target.role?.toLowerCase() === 'student') {
                    if (requesterRole === 'university') {
                        isOwnStudent = target.university_id === requesterId || target.registered_by === requesterId;
                    } else if (requesterRole === 'partner') {
                        if (target.registered_by === requesterId) {
                            isOwnStudent = true;
                        } else {
                            // Check if they used the partner's discount code or enrolled in a course taught by the partner
                            const partnerCheckRes = await query(`
                                SELECT 1 FROM users u
                                LEFT JOIN enrollments e ON u.id = e.student_id
                                LEFT JOIN courses c ON e.course_id = c.id
                                WHERE u.id = $1 AND (
                                    u.partner_code IN (SELECT code FROM discounts WHERE partner_id = $2)
                                    OR c.instructor_id = $2
                                ) LIMIT 1
                            `, [userId, requesterId]);
                            
                            if (partnerCheckRes.rows.length > 0) {
                                isOwnStudent = true;
                            }
                        }
                    }
                }

                if (!isOwnStudent) {
                    return res.status(403).json({ message: 'Not authorized to change status for this user' });
                }
            }

            // Track who deactivated the user
            const profileRes = await query('SELECT profile FROM users WHERE id = $1', [userId]);
            let profile = profileRes.rows[0]?.profile || {};
            if (typeof profile === 'string') {
                try { profile = JSON.parse(profile); } catch(e) { profile = {}; }
            }

            // Convert string "true"/"false" to boolean
            const newStatus = is_active === 'true' || is_active === true;
            if (newStatus) {
                delete profile.deactivated_by_role;
            } else {
                profile.deactivated_by_role = requesterRole;
            }

            await query('UPDATE users SET is_active = $1, profile = $2, updated_at = NOW() WHERE id = $3', [newStatus, JSON.stringify(profile), userId]);

            res.json({ success: true, message: `User status updated to ${is_active ? 'active' : 'inactive'}` });
        } catch (error) {
            console.error('Update User Status Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};
