// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getCategories } from '../api/category.js';
import Dropdown from './Dropdown.jsx';
import CategoryDropdown from './CategoryDropdown.jsx';
import SearchWithSuggestions from './SearchWithSuggestions.jsx';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

    return (
        <header className="header">
            <nav className="header-nav">
                <Link to="/" className="logo">
                    Marketplace
                </Link>

                {/* We return the original container and place both components inside */}
                <div className="search-container">
                    <CategoryDropdown categories={categories} />
                    <SearchWithSuggestions />
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
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" /></svg>
                                        </span>
                                    </div>
                                }
                            >
                                <Link to="/account" className="dropdown-item">Your Account</Link>
                                {user.role === 'SELLER' && (
                                    <>
                                        <Link to="/seller/dashboard" className="dropdown-item">Dashboard</Link>
                                        <Link to="/seller/orders" className="dropdown-item">My Sales</Link>
                                        <Link to="/my-products" className="dropdown-item">My Products</Link>
                                        <Link to="/products/add" className="dropdown-item">Add Product</Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="dropdown-item">Logout</button>
                            </Dropdown>

                            <Link to="/cart" className="nav-link cart-icon-link">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM1 3h2.15l3.43 7.59-1.18 2.16c-.22.39-.35.83-.35 1.28 0 1.1.9 2 2 2h10v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0021 6H5.21l-.94-2H1V3z" /></svg>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;