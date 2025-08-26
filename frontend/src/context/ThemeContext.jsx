// /frontend/src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// 1. Create and EXPORT the context so the hook can use it
export const ThemeContext = createContext();

// 2. The Provider component is the default export
export default function ThemeProvider({ children }) {
    const getThemeByTime = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= 19 || currentHour < 7) {
            return 'dark';
        }
        return 'light';
    };

    const [theme] = useState(getThemeByTime);

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);

    const value = { theme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};