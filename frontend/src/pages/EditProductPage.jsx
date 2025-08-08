// frontend/src/pages/EditProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ImageDropzone from '../components/ImageDropzone.jsx';
import './Form.css';
import './EditProductPage.css';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({ title: '', description: '', price: '' });
    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const TITLE_MAX_LENGTH = 55;
    const DESC_MAX_LENGTH = 500;
    const TOTAL_IMAGE_LIMIT = 5;
    const PRICE_MAX_VALUE = 20000;

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:3000/api/products/${id}`);
                if (!response.ok) throw new Error('Could not fetch product data.');

                const data = await response.json();
                setFormData({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                });
                setExistingImages(data.images || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
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

        // --- START: Frontend Price Validation ---
        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0 || priceValue > PRICE_MAX_VALUE) {
            setError(`Price must be a number between $0.01 and $${PRICE_MAX_VALUE}.`);
            return;
        }
        // --- END: Frontend Price Validation ---

        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('existingImages', JSON.stringify(existingImages));

        newImageFiles.forEach(file => {
            data.append('images', file, file.name);
        });

        try {
            const response = await fetch(`http://127.0.0.1:3000/api/products/${id}`, {
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

    if (loading && !formData.title) {
        return <p>Loading product details...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    const remainingSlots = TOTAL_IMAGE_LIMIT - existingImages.length;

    return (
        <div className="form-container">
            <h2>Edit Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Product Title</label>
                    <input
                        type="text" id="title" name="title"
                        value={formData.title} onChange={handleChange}
                        required maxLength={TITLE_MAX_LENGTH}
                    />
                    <small className="char-counter">{formData.title.length} / {TITLE_MAX_LENGTH}</small>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description" name="description"
                        value={formData.description} onChange={handleChange}
                        required rows="5" maxLength={DESC_MAX_LENGTH}
                    ></textarea>
                    <small className="char-counter">{formData.description.length} / {DESC_MAX_LENGTH}</small>
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number" id="price" name="price"
                        value={formData.price} onChange={handleChange}
                        required
                        min="0.01"
                        max={PRICE_MAX_VALUE}
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Existing Images ({existingImages.length} / {TOTAL_IMAGE_LIMIT})</label>
                    <div className="existing-images-container">
                        {existingImages.length > 0 ? existingImages.map((imageUrl, index) => (
                            <div key={index} className="existing-image-preview">
                                <img src={`http://127.0.0.1:3000${imageUrl}`} alt="Existing product" />
                                <button type="button" className="remove-image-btn" onClick={() => handleRemoveExistingImage(imageUrl)}>×</button>
                            </div>
                        )) : <p>No existing images.</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Upload New Images</label>
                    <ImageDropzone
                        onFilesChange={(files) => setNewImageFiles(files)}
                        maxFiles={remainingSlots}
                    />
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