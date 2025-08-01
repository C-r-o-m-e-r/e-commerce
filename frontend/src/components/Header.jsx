// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">
          Маркетплейс
        </Link>
        <div>
          <Link to="/" className="nav-link">
            Головна
          </Link>
          <Link to="/login" className="nav-link">
            Вхід
          </Link>
          <Link to="/register" className="nav-link">
            Реєстрація {/* Нове посилання */}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;