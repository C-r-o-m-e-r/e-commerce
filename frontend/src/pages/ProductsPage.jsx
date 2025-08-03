// src/pages/ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <== 1. Import the Link component
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="products-container">
      <h2>All Products</h2>
      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => (
            // 2. Wrap the entire card in a Link component
            <Link to={`/products/${product.id}`} key={product.id} className="product-card-link">
              <div className="product-card">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p className="product-price">Price: ${product.price}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No products available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;