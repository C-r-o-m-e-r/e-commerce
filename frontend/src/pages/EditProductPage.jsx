// frontend/src/pages/EditProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getCategories } from '../api/category.js';
import ImageDropzone from '../components/ImageDropzone.jsx';
import './Form.css';
import './EditProductPage.css';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({ title: '', description: '', price: '', categoryId: '', stock: '' });
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const TITLE_MAX_LENGTH = 55;
    const DESC_MAX_LENGTH = 500;
    const TOTAL_IMAGE_LIMIT = 5;
    const PRICE_MAX_VALUE = 20000;

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const [productResponse, categoriesData] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    getCategories()
                ]);

                if (!productResponse.ok) throw new Error('Could not fetch product data.');

                const productData = await productResponse.json();
                setFormData({
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    categoryId: productData.categoryId,
                    stock: productData.stock, // Set initial stock
                });
                setExistingImages(productData.images || []);

                const flattened = [];
                const flatten = (cat, prefix = '') => {
                    flattened.push({ ...cat, name: prefix + cat.name });
                    if (cat.subcategories) {
                        cat.subcategories.forEach(sub => flatten(sub, prefix + '- '));
                    }
                };
                categoriesData.forEach(cat => flatten(cat));
                setCategories(flattened);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRemoveExistingImage = (imageUrl) => {
        setExistingImages(existingImages.filter(img => img !== imageUrl));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0 || priceValue > PRICE_MAX_VALUE) {
            setError(`Price must be a number between $0.01 and $${PRICE_MAX_VALUE}.`);
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
        data.append('existingImages', JSON.stringify(existingImages));

        newImageFiles.forEach(file => {
            data.append('images', file, file.name);
        });

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }
            navigate('/my-products');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p>Error: {error}</p>;

    const remainingSlots = TOTAL_IMAGE_LIMIT - existingImages.length;

    return (
        <div className="form-container">
            <h2>Edit Product</h2>
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
                    <label>Existing Images ({existingImages.length} / {TOTAL_IMAGE_LIMIT})</label>
                    <div className="existing-images-container">
                        {existingImages.length > 0 ? existingImages.map((imageUrl, index) => (
                            <div key={index} className="existing-image-preview">
                                <img src={imageUrl} alt="Existing product" />
                                <button type="button" className="remove-image-btn" onClick={() => handleRemoveExistingImage(imageUrl)}>×</button>
                            </div>
                        )) : <p>No existing images.</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Upload New Images</label>
                    <ImageDropzone onFilesChange={(files) => setNewImageFiles(files)} maxFiles={remainingSlots} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Product'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default EditProductPage;