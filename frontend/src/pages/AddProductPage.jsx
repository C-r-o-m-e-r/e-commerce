// src/pages/AddProductPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ImageDropzone from '../components/ImageDropzone.jsx'; // 1. Import the new component
import './Form.css';

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [imageFiles, setImageFiles] = useState([]); // 2. New state to hold the actual files
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  if (user?.role !== 'SELLER') {
    return (
      <div className="form-container">
        <h2 style={{ color: 'red' }}>Access Denied</h2>
        <p>Only sellers can add products.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 3. New submission logic using FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    imageFiles.forEach(file => {
      data.append('images', file); // Append each file under the 'images' field name
    });

    try {
      const response = await fetch('http://127.0.0.1:3000/api/products', {
        method: 'POST',
        headers: {
          // DO NOT set Content-Type, the browser does it automatically for FormData
          'Authorization': `Bearer ${token}`,
        },
        body: data, // Send the FormData object
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding product');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Product Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* 4. Replace the old image input with the ImageDropzone component */}
        <div className="form-group">
          <label>Product Images</label>
          <ImageDropzone onFilesChange={(files) => setImageFiles(files)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AddProductPage;