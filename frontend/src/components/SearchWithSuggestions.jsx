// frontend/src/components/SearchWithSuggestions.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SearchWithSuggestions.css';

const SearchWithSuggestions = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Debounced effect for fetching suggestions
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const response = await fetch(`/api/products/suggestions?q=${query}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    // Effect to handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSuggestions([]);
        navigate(`/products?search=${query.trim()}`);
    };

    const handleSuggestionClick = () => {
        setSuggestions([]);
        setQuery('');
    };

    // --- START: INLINE STYLES FOR THE FIX ---
    // These styles will override any conflicting CSS
    const suggestionsListStyle = {
        marginTop: '8px',       // The space you wanted
        borderRadius: '8px',    // Rounded corners on all sides
        border: '1px solid #8c9eff', // The violet border
    };
    // --- END: INLINE STYLES FOR THE FIX ---

    return (
        <div className="search-wrapper" ref={searchRef}>
            <form className="search-form-new" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input-new"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                />
                <button type="submit" className="search-button-new">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                </button>
            </form>

            {suggestions.length > 0 && (
                <div
                    className="suggestions-list-new"
                    style={suggestionsListStyle} // Apply inline styles here
                >
                    {suggestions.map(suggestion => (
                        <Link to={`/products/${suggestion.id}`} key={suggestion.id} className="suggestion-item-new" onClick={handleSuggestionClick}>
                            <img
                                src={suggestion.images && suggestion.images.length > 0 ? suggestion.images[0] : 'https://via.placeholder.com/50'}
                                alt={suggestion.title}
                                className="suggestion-image-new"
                                referrerPolicy="no-referrer"
                            />
                            <div className="suggestion-details-new">
                                <span className="suggestion-title-new">{suggestion.title}</span>
                                <span className="suggestion-price-new">${suggestion.price}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchWithSuggestions;