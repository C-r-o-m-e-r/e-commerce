// src/pages/ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ProductsPage.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            const searchTerm = searchParams.get('search');
            const selectedCategory = searchParams.get('category');

            let url = new URL('http://127.0.0.1:3000/api/products');
            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }
            if (selectedCategory) {
                url.searchParams.append('category', selectedCategory);
            }

            try {
                setLoading(true);
                const response = await fetch(url);
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
    }, [searchParams]);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error}</p>;

    const searchTermValue = searchParams.get('search');

    return (
        <div className="products-container">
            <h2>{searchTermValue ? `Search Results for "${searchTermValue}"` : 'All Products'}</h2>
            <div className="products-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Link to={`/products/${product.id}`} key={product.id} className="product-card-link">
                            <div className="product-card">
                                <div className="product-card-image-container">
                                    <img
                                        src={
                                            product.images && product.images.length > 0
                                                ? `http://127.0.0.1:3000${product.images[0]}`
                                                : 'https://via.placeholder.com/300'
                                        }
                                        alt={product.title}
                                        className="product-card-image"
                                    />
                                </div>
                                <div className="product-card-content">
                                    <h3>{product.title}</h3>
                                    <p>{product.description}</p>
                                    <p className="product-price">Price: ${product.price}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No products found.</p>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;