// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid generator

const AuthContext = createContext(null);

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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [guestId, setGuestId] = useState(() => localStorage.getItem('guestId')); // 1. Add guestId state
    const navigate = useNavigate();

    // 2. Effect to manage the guestId
    useEffect(() => {
        if (!user && !localStorage.getItem('guestId')) {
            // If the user is not logged in and has no guestId, create one.
            const newGuestId = uuidv4();
            localStorage.setItem('guestId', newGuestId);
            setGuestId(newGuestId);
        }
    }, [user]); // This effect runs when the user logs in or out

    const login = (authData) => {
        if (authData && authData.token && authData.user) {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('user', JSON.stringify(authData.user));
            setToken(authData.token);
            setUser(authData.user);

            // 3. Clear the guestId on successful login
            localStorage.removeItem('guestId');
            setGuestId(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);

        // 4. Create a new guestId on logout
        const newGuestId = uuidv4();
        localStorage.setItem('guestId', newGuestId);
        setGuestId(newGuestId);

        navigate('/login');
    };

    const value = {
        user,
        token,
        guestId, // 5. Expose guestId to the rest of the app
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};