// src/pages/AddProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/category.js';
import ImageDropzone from '../components/ImageDropzone.jsx';
import './Form.css';

const AddProductPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        stock: '', // Add stock to state
    });
    const [categories, setCategories] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const TITLE_MAX_LENGTH = 55;
    const DESC_MAX_LENGTH = 500;
    const PRICE_MAX_VALUE = 20000;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                const flattened = [];
                const flatten = (cat, prefix = '') => {
                    flattened.push({ ...cat, name: prefix + cat.name });
                    if (cat.subcategories) {
                        cat.subcategories.forEach(sub => flatten(sub, prefix + '- '));
                    }
                };
                data.forEach(cat => flatten(cat));
                setCategories(flattened);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    if (user?.role !== 'SELLER') {
        return (<div className="form-container"> <h2 style={{ color: 'red' }}>Access Denied</h2> <p>Only sellers can add products.</p> </div>);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value, }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0 || priceValue > PRICE_MAX_VALUE) {
            setError(`Price must be a number between $0.01 and $${PRICE_MAX_VALUE}.`);
            return;
        }
        if (imageFiles.length === 0) {
            setError('Please upload at least one image.');
            return;
        }
        if (!formData.categoryId) {
            setError('Please select a category.');
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('categoryId', formData.categoryId);
        data.append('stock', formData.stock); // Add stock to form data
        imageFiles.forEach(file => {
            data.append('images', file);
        });

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data,
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

    const TOTAL_IMAGE_LIMIT = 5;

    return (
        <div className="form-container">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Product Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required maxLength={TITLE_MAX_LENGTH} />
                    <small className="char-counter">{formData.title.length} / {TITLE_MAX_LENGTH}</small>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="5" maxLength={DESC_MAX_LENGTH}></textarea>
                    <small className="char-counter">{formData.description.length} / {DESC_MAX_LENGTH}</small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0.01" max={PRICE_MAX_VALUE} step="0.01" />
                    </div>
                    {/* --- START: New Stock Input --- */}
                    <div className="form-group">
                        <label htmlFor="stock">Quantity in Stock</label>
                        <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
                    </div>
                    {/* --- END: New Stock Input --- */}
                </div>

                <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                        <option value="" disabled>Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Product Images</label>
                    <ImageDropzone onFilesChange={(files) => setImageFiles(files)} maxFiles={TOTAL_IMAGE_LIMIT} />
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