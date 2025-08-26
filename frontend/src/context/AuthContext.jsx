// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid generator

// The context itself is not exported directly anymore.
const AuthContext = createContext(null);

// The custom hook remains a named export.
// Import it like this: import { useAuth } from './context/AuthContext';
export const useAuth = () => {
    return useContext(AuthContext);
};

// The provider component is now the default export.
// Import it like this: import AuthProvider from './context/AuthContext';
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [guestId, setGuestId] = useState(() => localStorage.getItem('guestId'));
    const navigate = useNavigate();

    useEffect(() => {
        // If the user is not logged in and has no guestId, create one.
        if (!user && !localStorage.getItem('guestId')) {
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

            // Clear the guestId on successful login
            localStorage.removeItem('guestId');
            setGuestId(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);

        // Create a new guestId on logout
        const newGuestId = uuidv4();
        localStorage.setItem('guestId', newGuestId);
        setGuestId(newGuestId);

        navigate('/login');
    };

    const value = {
        user,
        token,
        guestId, // Expose guestId to the rest of the app
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This helper function remains internal to the module.
const getInitialUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        // Check for 'undefined' string as well, which can sometimes be stored.
        if (storedUser && storedUser !== 'undefined') {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    return null;
};