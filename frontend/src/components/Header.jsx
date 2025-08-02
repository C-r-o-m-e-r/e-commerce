// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Log current user state for debugging
  console.log('User state in Header:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">
          Marketplace
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Products
          </Link>
          {user?.role === 'SELLER' && (
            <Link to="/products/add" className="nav-link">
              Add Product
            </Link>
          )}
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
              <span className="nav-link">Welcome, {user.email}!</span>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;