// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext.jsx';
import './Form.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // 1. Get the guestId and login function from the context
    const { login, guestId } = useAuth();
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
        setLoading(true);
        setError(null);
        try {
            // 2. Pass the guestId along with the form data to the login function
            const data = await loginUser({ ...formData, guestId });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
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
                    <label htmlFor="password">Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 20 20"><path d="M11.998 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path><path fillRule="evenodd" d="M16.175 7.567 18 10l-1.825 2.433a9.992 9.992 0 0 1-2.855 2.575l-.232.14a6 6 0 0 1-6.175 0 35.993 35.993 0 0 0-.233-.14 9.992 9.992 0 0 1-2.855-2.575L2 10l1.825-2.433A9.992 9.992 0 0 1 6.68 4.992l.233-.14a6 6 0 0 1 6.175 0l.232.14a9.992 9.992 0 0 1 2.855 2.575zm-1.6 3.666a7.99 7.99 0 0 1-2.28 2.058l-.24.144a4 4 0 0 1-4.11 0 38.552 38.552 0 0 0-.239-.144 7.994 7.994 0 0 1-2.28-2.058L4.5 10l.925-1.233a7.992 7.992 0 0 1 2.28-2.058 37.9 37.9 0 0 0 .24-.144 4 4 0 0 1 4.11 0l.239.144a7.996 7.996 0 0 1 2.28 2.058L15.5 10l-.925 1.233z"></path></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20"><path fillRule="evenodd" d="m16.5 18 1.5-1.5-2.876-2.876a9.99 9.99 0 0 0 1.051-1.191L18 10l-1.825-2.433a9.992 9.992 0 0 0-2.855-2.575 35.993 35.993 0 0 1-.232-.14 6 6 0 0 0-6.175 0 35.993 35.993 0 0 1-.35.211L3.5 2 2 3.5 16.5 18zm-2.79-5.79a8 8 0 0 0 .865-.977L15.5 10l-.924-1.233a7.996 7.996 0 0 0-2.281-2.058 37.22 37.22 0 0 1-.24-.144 4 4 0 0 0-4.034-.044l1.53 1.53a2 2 0 0 1 2.397 2.397l1.762 1.762z"></path><path d="m11.35 15.85-1.883-1.883a3.996 3.996 0 0 1-1.522-.532 38.552 38.552 0 0 0-.239-.144 7.994 7.994 0 0 1-2.28-2.058L4.5 10l.428-.571L3.5 8 2 10l1.825 2.433a9.992 9.992 0 0 0 2.855 2.575c.077.045.155.092.233.14a6 6 0 0 0 4.437.702z"></path></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default LoginPage;