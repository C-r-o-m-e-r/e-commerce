// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import './Form.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // --- START: Added Password Length Validation ---
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    // --- END: Added Password Length Validation ---

    setLoading(true);

    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.';

    try {
      await registerUser({
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="presentation"><path d="M11.998 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path><path fillRule="evenodd" d="M16.175 7.567 18 10l-1.825 2.433a9.992 9.992 0 0 1-2.855 2.575l-.232.14a6 6 0 0 1-6.175 0 35.993 35.993 0 0 0-.233-.14 9.992 9.992 0 0 1-2.855-2.575L2 10l1.825-2.433A9.992 9.992 0 0 1 6.68 4.992l.233-.14a6 6 0 0 1 6.175 0l.232.14a9.992 9.992 0 0 1 2.855 2.575zm-1.6 3.666a7.99 7.99 0 0 1-2.28 2.058l-.24.144a4 4 0 0 1-4.11 0 38.552 38.552 0 0 0-.239-.144 7.994 7.994 0 0 1-2.28-2.058L4.5 10l.925-1.233a7.992 7.992 0 0 1 2.28-2.058 37.9 37.9 0 0 0 .24-.144 4 4 0 0 1 4.11 0l.239.144a7.996 7.996 0 0 1 2.28 2.058L15.5 10l-.925 1.233z" clipRule="evenodd"></path></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="presentation"><path fillRule="evenodd" d="m16.5 18 1.5-1.5-2.876-2.876a9.99 9.99 0 0 0 1.051-1.191L18 10l-1.825-2.433a9.992 9.992 0 0 0-2.855-2.575 35.993 35.993 0 0 1-.232-.14 6 6 0 0 0-6.175 0 35.993 35.993 0 0 1-.35.211L3.5 2 2 3.5 16.5 18zm-2.79-5.79a8 8 0 0 0 .865-.977L15.5 10l-.924-1.233a7.996 7.996 0 0 0-2.281-2.058 37.22 37.22 0 0 1-.24-.144 4 4 0 0 0-4.034-.044l1.53 1.53a2 2 0 0 1 2.397 2.397l1.762 1.762z" clipRule="evenodd"></path><path d="m11.35 15.85-1.883-1.883a3.996 3.996 0 0 1-1.522-.532 38.552 38.552 0 0 0-.239-.144 7.994 7.994 0 0 1-2.28-2.058L4.5 10l.428-.571L3.5 8 2 10l1.825 2.433a9.992 9.992 0 0 0 2.855 2.575c.077.045.155.092.233.14a6 6 0 0 0 4.437.702z"></path></svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {success && (
        <p className="success-message">
          Registration successful! You can now <Link to="/login">log in</Link>.
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default RegisterPage;