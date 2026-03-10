import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const rawUserInfo = localStorage.getItem('userInfo');
    let userInfo = null;
    try {
        userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;
    } catch {
        // corrupt data — force re-login
    }

    if (!userInfo || !userInfo.token) {
        return <Navigate to="/login" replace />;
    }

    // Case-insensitive role match so 'Admin', 'ADMIN', 'admin' all work
    const userRole = (userInfo.role || '').toLowerCase();
    const allowed = allowedRoles?.map(r => r.toLowerCase()) || [];

    if (allowedRoles && !allowed.includes(userRole)) {
        // Redirect to the right home for this user's role
        const roleHome = {
            admin: '/admin/dashboard',
            university: '/university/dashboard',
            partner: '/partner/dashboard',
            finance: '/finance/dashboard',
            student: '/dashboard',
        };
        return <Navigate to={roleHome[userRole] || '/dashboard'} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
