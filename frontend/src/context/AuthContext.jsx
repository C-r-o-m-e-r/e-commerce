// /frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// 1. Create and EXPORT the context so the hook can use it
export const AuthContext = createContext(null);

const getInitialUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    return null;
};

// 2. The AuthProvider is the only component exported
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [guestId, setGuestId] = useState(() => localStorage.getItem('guestId'));
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && !localStorage.getItem('guestId')) {
            const newGuestId = uuidv4();
            localStorage.setItem('guestId', newGuestId);
            setGuestId(newGuestId);
        }
    }, [user]);

    const login = (authData) => {
        if (authData && authData.token && authData.user) {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('user', JSON.stringify(authData.user));
            setToken(authData.token);
            setUser(authData.user);
            localStorage.removeItem('guestId');
            setGuestId(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        const newGuestId = uuidv4();
        localStorage.setItem('guestId', newGuestId);
        setGuestId(newGuestId);
        navigate('/login');
    };

    const value = {
        user,
        token,
        guestId,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};