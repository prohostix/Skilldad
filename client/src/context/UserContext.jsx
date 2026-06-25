import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [rewardPoints, setRewardPoints] = useState({ total: 0, history: [] });

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
        }
    }, []);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser)); // Sync with localStorage
        if (updatedUser?.token) {
            localStorage.setItem('token', updatedUser.token);
            refreshPoints(updatedUser);
        }
    };

    const logout = () => {
        setUser(null);
        setRewardPoints({ total: 0, history: [] });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logout, rewardPoints, refreshPoints }}>
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
