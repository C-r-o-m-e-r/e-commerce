// frontend/src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the context
const ThemeContext = createContext();

// 2. Create a custom hook for easy access to the context (named export)
export const useTheme = () => useContext(ThemeContext);

// 3. Create the Provider component (now the default export)
export default function ThemeProvider({ children }) {
    // This function determines the theme based on the current hour
    const getThemeByTime = () => {
        const currentHour = new Date().getHours();

        // Dark theme from 7 PM (19) to 7 AM (6:59)
        if (currentHour >= 19 || currentHour < 7) {
            return 'dark';
        }
        return 'light'
    };

    // Initialize state with the theme based on the current time
    const [theme] = useState(getThemeByTime);

    // Effect to apply the theme class to the body
    useEffect(() => {
        document.body.className = ''; // Clear any existing theme classes
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);

    // We only need to provide the current theme value
    const value = { theme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};