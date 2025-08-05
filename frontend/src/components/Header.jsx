// src/components/Header.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Dropdown from './Dropdown.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm.trim()}`);
    }
  };

  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">
          Marketplace
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="search-input-header"
            placeholder="Search Marketplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </button>
        </form>

        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          ) : (
            <>
              <Dropdown 
                trigger={
                  <div className="account-trigger">
                    <span>Hello, {user.firstName}</span>
                    <span className="account-trigger-line2">
                      Account & Lists
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/></svg>
                    </span>
                  </div>
                }
              >
                {/* --- START: Added "Your Account" Link --- */}
                <Link to="/account" className="dropdown-item">Your Account</Link>
                {/* --- END: Added "Your Account" Link --- */}

                {user.role === 'SELLER' && (
                  <>
                    <Link to="/my-products" className="dropdown-item">My Products</Link>
                    <Link to="/products/add" className="dropdown-item">Add Product</Link>
                  </>
                )}
                <button onClick={handleLogout} className="dropdown-item">Logout</button>
              </Dropdown>

              <Link to="/cart" className="nav-link cart-icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM1 3h2.15l3.43 7.59-1.18 2.16c-.22.39-.35.83-.35 1.28 0 1.1.9 2 2 2h10v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0021 6H5.21l-.94-2H1V3z"/></svg>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;