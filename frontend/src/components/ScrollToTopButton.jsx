// frontend/src/components/ScrollToTopButton.jsx

import React, { useState, useEffect } from 'react';
import './ScrollToTopButton.css';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // This function will be called when the user scrolls
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // This function will scroll the window to the top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // for a smooth scrolling animation
        });
    };

    useEffect(() => {
        // Add the scroll event listener when the component mounts
        window.addEventListener('scroll', toggleVisibility);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="scroll-to-top">
            {isVisible && (
                <button onClick={scrollToTop} className="scroll-to-top-button">
                    &#8679; {/* This is an arrow up character */}
                </button>
            )}
        </div>
    );
};

export default ScrollToTopButton;