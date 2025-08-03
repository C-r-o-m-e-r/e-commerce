// src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addToCart } from '../api/cart.js';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notification, setNotification] = useState('');
  const [quantity, setQuantity] = useState(1); // 1. State for quantity

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setNotification('Adding to cart...');
    try {
      // 2. Use the quantity from state instead of a hardcoded 1
      await addToCart(product.id, quantity, token);
      setNotification('Product added to cart!');
    } catch (err) {
      setNotification('Failed to add product. Please try again.');
      console.error(err);
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;
  
  const getImageUrl = (imagePath) => `http://127.0.0.1:3000${imagePath}`;

  return (
    <div className="product-detail-container">
      <div className="product-image-section">
        {/* Image display logic remains the same */}
        <img 
          src={product.images && product.images.length > 0 ? getImageUrl(product.images[selectedImage]) : 'https://via.placeholder.com/400'} 
          alt={product.title} 
          className="main-product-image"
        />
        <div className="product-thumbnails-container">
          {product.images && product.images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`${product.title} thumbnail ${index + 1}`}
              className={`thumbnail-image ${selectedImage === index ? 'active' : ''}`}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>
      <div className="product-info-section">
        <h2>{product.title}</h2>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price}</p>
        
        {/* 3. Add a wrapper for quantity input and button */}
        <div className="add-to-cart-controls">
          <input 
            type="number" 
            className="quantity-input"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
            max="99"
          />
          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
        
        {notification && <p className="cart-notification">{notification}</p>}
      </div>
    </div>
  );
};

export default ProductDetailPage;