import React, { useState } from 'react';
import { registerUser } from '../api/auth'; // Імпортуємо функцію

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    try {
      await registerUser(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Реєстрація</h2>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Роль</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="BUYER">Покупець</option>
            <option value="SELLER">Продавець</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
      </form>
      {success && <p className="success-message">Реєстрація успішна!</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default RegisterPage;