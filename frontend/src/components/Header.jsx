// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getCategories } from '../api/category.js';
import Dropdown from './Dropdown.jsx';
import CategoryDropdown from './CategoryDropdown.jsx';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories for header:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        } else {
            params.delete('search');
        }
        navigate(`/products?${params.toString()}`);
    };

    return (
        <header className="header">
            <nav className="header-nav">
                <Link to="/" className="logo">
                    Marketplace
                </Link>

                <div className="search-container">
                    <CategoryDropdown categories={categories} />
                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search Marketplace..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="search-button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                        </button>
                    </form>
                </div>

                <div className="nav-links">
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    ) : (
                        <>
                            <Dropdown
                                trigger={
                                    <div className="account-trigger">
                                        <span>Hello, {user.firstName}</span>
                                        <span className="account-trigger-line2">
                                            Account & Lists
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" /></svg>
                                        </span>
                                    </div>
                                }
                            >
                                {/* --- START: SIMPLIFIED DROPDOWN --- */}
                                <Link to="/account" className="dropdown-item">Your Account</Link>
                                {/* "My Orders" and "My Wishlists" are now accessed from within the Account page */}

                                {user.role === 'SELLER' && (
                                    <>
                                        <Link to="/my-products" className="dropdown-item">My Products</Link>
                                        <Link to="/products/add" className="dropdown-item">Add Product</Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="dropdown-item">Logout</button>
                                {/* --- END: SIMPLIFIED DROPDOWN --- */}
                            </Dropdown>

                            <Link to="/cart" className="nav-link cart-icon-link">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM1 3h2.15l3.43 7.59-1.18 2.16c-.22.39-.35.83-.35 1.28 0 1.1.9 2 2 2h10v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0021 6H5.21l-.94-2H1V3z" /></svg>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;