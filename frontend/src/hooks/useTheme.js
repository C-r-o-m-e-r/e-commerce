// /frontend/src/hooks/useTheme.js

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

// This hook provides easy access to the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};