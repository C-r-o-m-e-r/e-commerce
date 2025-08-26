// /frontend/src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// This hook provides easy access to the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};