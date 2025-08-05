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
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  // Lightbox navigation logic...
  const goToNextImage = (e) => {
    e.stopPropagation();
    setSelectedImage(prevIndex => (prevIndex + 1) % product.images.length);
  };
  const goToPreviousImage = (e) => {
    e.stopPropagation();
    setSelectedImage(prevIndex => (prevIndex - 1 + product.images.length) % product.images.length);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') goToNextImage(e);
      else if (e.key === 'ArrowLeft') goToPreviousImage(e);
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, selectedImage, product]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:3000/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
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
    
    // --- START: Added Validation ---
    if (!quantity || quantity < 1) {
      setNotification('Please enter a valid quantity.');
      setTimeout(() => setNotification(''), 3000);
      return; // Stop the function if quantity is invalid
    }
    // --- END: Added Validation ---

    setNotification('Adding to cart...');
    try {
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
    <>
      <div className="product-detail-container">
        <div className="product-image-section">
          <img 
            src={product.images && product.images.length > 0 ? getImageUrl(product.images[selectedImage]) : 'https://via.placeholder.com/400'} 
            alt={product.title} 
            className="main-product-image"
            onClick={() => setLightboxOpen(true)}
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

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close-btn" onClick={() => setLightboxOpen(false)}>×</button>
          
          {product.images.length > 1 && (
            <>
              <button className="lightbox-nav-btn prev" onClick={goToPreviousImage}>
                <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M400-80 0-480l400-400 56 57-343 343 343 343-56 57Z"/></svg>
              </button>
              <button className="lightbox-nav-btn next" onClick={goToNextImage}>
                <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m304-82-56-57 343-343-343-343 56-57 400 400L304-82Z"/></svg>
              </button>
            </>
          )}
          
          <img 
            src={getImageUrl(product.images[selectedImage])} 
            alt={product.title} 
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;