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
          
          {/* Link to Cart for any logged-in user */}
          {user && ( // <== CHANGED: Now shows for any logged-in user
            <Link to="/cart" className="nav-link">
              Cart
            </Link>
          )}

          {/* Links for Sellers */}
          {user?.role === 'SELLER' && (
            <>
              <Link to="/my-products" className="nav-link">
                My Products
              </Link>
              <Link to="/products/add" className="nav-link">
                Add Product
              </Link>
            </>
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
              <span className="nav-link user-email">Welcome, {user.email}!</span>
              <button onClick={handleLogout} className="button-logout">Logout</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;