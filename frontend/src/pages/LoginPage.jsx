// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext.jsx';
import './Form.css'; // <== ОСЬ КЛЮЧОВИЙ РЯДОК, ЯКОГО НЕ ВИСТАЧАЛО

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(formData);
      login(data);
    } catch (err) {
      setError(err.message || 'Невірний email або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Електронна пошта</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Немає облікового запису? <Link to="/register">Зареєструватися</Link>
      </p>
    </div>
  );
};

export default LoginPage;