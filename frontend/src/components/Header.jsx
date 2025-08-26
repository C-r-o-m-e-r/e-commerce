// /frontend/src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { getCategories } from '../api/category.js';
import Dropdown from './Dropdown.jsx';
import CategoryDropdown from './CategoryDropdown.jsx';
import SearchWithSuggestions from './SearchWithSuggestions.jsx';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch categories for the dropdown menu
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
        <header className={`header ${theme}-theme`}>
            <nav className="header-nav">
                <Link to="/" className="logo">
                    Marketplace
                </Link>

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
                            theme={theme}
                        >
                            {/* --- START: Admin Panel Section --- */}
                            {user.role === 'ADMIN' && (
                                <>
                                    <div className="dropdown-section-header">Admin Panel</div>
                                    <Link to="/admin/dashboard" className="dropdown-item">Dashboard</Link>
                                    <Link to="/admin/users" className="dropdown-item">Manage Users</Link>
                                    <Link to="/admin/products" className="dropdown-item">Manage Products</Link>
                                    <Link to="/admin/orders" className="dropdown-item">Manage Orders</Link>
                                    <Link to="/admin/categories" className="dropdown-item">Manage Categories</Link>
                                    <Link to="/admin/reviews" className="dropdown-item">Manage Reviews</Link>
                                    <Link to="/admin/coupons" className="dropdown-item">Manage Coupons</Link> {/* <-- ADDED THIS LINK */}
                                    <hr className="dropdown-divider" />
                                </>
                            )}
                            {/* --- END: Admin Panel Section --- */}

                            <Link to="/account" className="dropdown-item">Your Account</Link>
                            
                            {/* --- START: Seller Section --- */}
                            {user.role === 'SELLER' && (
                                <>
                                    <div className="dropdown-section-header">Seller Tools</div>
                                    <Link to="/seller/dashboard" className="dropdown-item">Dashboard</Link>
                                    <Link to="/seller/orders" className="dropdown-item">My Sales</Link>
                                    <Link to="/my-products" className="dropdown-item">My Products</Link>
                                    <Link to="/products/add" className="dropdown-item">Add Product</Link>
                                    <Link to="/my-coupons" className="dropdown-item">My Coupons</Link>
                                </>
                            )}
                            {/* --- END: Seller Section --- */}

                            <button onClick={handleLogout} className="dropdown-item">Logout</button>
                        </Dropdown>
                    )}

                    <Link to="/cart" className="nav-link cart-icon-link">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.67-.11-1.48-.88-1.48H5.21l-.94-2H1v2h2l3.6 7.59L3.62 17H19v-2H7l1.1-2h7.45z" />
                        </svg>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;