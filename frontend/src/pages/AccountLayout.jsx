// frontend/src/pages/AccountLayout.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AccountLayout.css';

const AccountLayout = () => {
    return (
        <div className="page-container">
            <h2>Your Account</h2>
            <div className="account-layout">
                <nav className="account-sidebar">
                    <NavLink to="/account/profile">My Profile</NavLink>
                    <NavLink to="/account/orders">My Orders</NavLink>
                    <NavLink to="/account/wishlists">My Wishlists</NavLink>
                </nav>
                <main className="account-content">
                    <Outlet /> {/* This is where the nested page content will be rendered */}
                </main>
            </div>
        </div>
    );
};

export default AccountLayout;