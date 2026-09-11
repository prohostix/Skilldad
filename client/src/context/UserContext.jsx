import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [rewardPoints, setRewardPoints] = useState({ total: 0, history: [] });
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

    const fetchEnrollments = async (u) => {
        if (!u?.token || u.role !== 'student') return;
        try {
            const { data } = await axios.get('/api/enrollment/my-courses', {
                headers: { Authorization: `Bearer ${u.token}` }
            });
            const courseIds = data.map(e => e.course?._id || e.course_id || e.course);
            setEnrolledCourseIds(courseIds);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        }
    };

    const refreshPoints = async (userInfoParam = null) => {
        const u = userInfoParam || user || JSON.parse(localStorage.getItem('userInfo') || 'null');
        if (!u?.token) return;

        try {
            const { data } = await axios.get('/api/referrals/my-points', {
                headers: { Authorization: `Bearer ${u.token}` }
            });
            setRewardPoints(data);
        } catch (error) {
            console.error('Error refreshing points:', error);
        }
    };

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        if (userInfo) {
            setUser(userInfo);
            refreshPoints(userInfo);
            fetchEnrollments(userInfo);
        }
    }, []);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser)); // Sync with localStorage
        if (updatedUser?.token) {
            localStorage.setItem('token', updatedUser.token);
            refreshPoints(updatedUser);
            fetchEnrollments(updatedUser);
        }
    };

    const logout = () => {
        setUser(null);
        setRewardPoints({ total: 0, history: [] });
        setEnrolledCourseIds([]);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logout, rewardPoints, refreshPoints, enrolledCourseIds, fetchEnrollments }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
