const jwt = require('jsonwebtoken');
const { query } = require('../config/postgres');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // PostgreSQL query instead of User.findById
            const userRes = await query(`
                SELECT u.id, u.id as _id, u.name, u.email, u.role, u.profile, u.university_id, u.registered_by, u.is_active, b.is_active as batch_is_active
                FROM users u
                LEFT JOIN batches b ON u.batch_id = b.id
                WHERE u.id = $1
            `, [decoded.id]);
            req.user = userRes.rows[0];

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.batch_is_active === false) {
                req.user.is_active = false;
            }            console.log(`[AUTH PROTECT] Decoded ID: ${decoded.id}, User Found: ${req.user.email}, Role: ${req.user.role}`);
            return next();
        } catch (error) {
            console.error('Auth protection error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn('Auth request blocked: No token provided at', req.originalUrl);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Optional protection - populates req.user if token is present, but doesn't block if not
const optionalProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userRes = await query(`
                SELECT u.id, u.id as _id, u.name, u.email, u.role, u.profile, u.university_id, u.registered_by, u.is_active, b.is_active as batch_is_active
                FROM users u
                LEFT JOIN batches b ON u.batch_id = b.id
                WHERE u.id = $1
            `, [decoded.id]);
            req.user = userRes.rows[0];
            
            if (req.user && req.user.batch_is_active === false) {
                req.user.is_active = false;
            }

            return next();
        } catch (error) {
            console.error('Optional auth error (continuing as guest):', error.message);
            return next();
        }
    }
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({
            message: 'Not authorized as an admin'
        });
    }
};

const university = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'university') {
        next();
    } else {
        return res.status(403).json({
            message: 'Not authorized as a university'
        });
    }
};

const partner = (req, res, next) => {
    if (req.user && (req.user.role?.toLowerCase() === 'partner' || req.user.role?.toLowerCase() === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            message: 'Not authorized as a partner'
        });
    }
};

const finance = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'finance') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a finance user');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user' });
        }
        const userRole = req.user.role?.toLowerCase();
        console.log(`[AUTH DEBUG] ${req.method} ${req.originalUrl} - User: ${req.user.email}, Role: ${userRole}, Required Roles: ${roles.join(', ')}`);

        if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
            console.warn(`[AUTH DENIED] User ${req.user.email} (${userRole}) attempted to access ${req.originalUrl}. Required: ${roles.join(' or ')}`);
            return res.status(403).json({
                message: `Not authorized as ${roles.join(' or ')}`,
                debugInfo: { detectedRole: userRole, requiredRoles: roles }
            });
        }
        next();
    };
};

module.exports = { protect, optionalProtect, admin, university, partner, finance, authorize };
