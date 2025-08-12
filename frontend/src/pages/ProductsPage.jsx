// src/pages/ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Dropdown from '../components/Dropdown.jsx'; // 1. Import your custom Dropdown component
import './ProductsPage.css';

// Component for Pagination Controls
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // ... this component remains unchanged
    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    return (
        <div className="pagination-container">
            <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
                &laquo; Prev
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => handlePageClick(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ))}
            <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
                Next &raquo;
            </button>
        </div>
    );
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const PRODUCTS_PER_PAGE = 48;

    // 2. Define sort options as an array of objects
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            const searchTerm = searchParams.get('search');
            const selectedCategory = searchParams.get('category');
            const sortBy = searchParams.get('sortBy');
            const page = searchParams.get('page') || '1';

            let url = new URL('/api/products', window.location.origin);
            if (searchTerm) url.searchParams.append('search', searchTerm);
            if (selectedCategory) url.searchParams.append('category', selectedCategory);
            if (sortBy) url.searchParams.append('sortBy', sortBy);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', PRODUCTS_PER_PAGE);

            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch products');

                const data = await response.json();
                setProducts(data.products);
                setTotalProducts(data.totalProducts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    // 3. Update the handler to accept a value directly
    const handleSortChange = (newSortBy) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('sortBy', newSortBy);
        newSearchParams.set('page', '1');
        setSearchParams(newSearchParams);
    };

    const handlePageChange = (newPage) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', newPage);
        setSearchParams(newSearchParams);
    };

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error}</p>;

    const searchTermValue = searchParams.get('search');
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // 4. Find the currently selected option object to display its label
    const currentSortValue = searchParams.get('sortBy') || 'newest';
    const selectedOption = sortOptions.find(option => option.value === currentSortValue);

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>{searchTermValue ? `Search Results for "${searchTermValue}"` : 'All Products'}</h2>

                {/* 5. Replace <select> with your <Dropdown> component */}
                <div className="sort-container">
                    <label>Sort by: </label>
                    <Dropdown
                        trigger={
                            <div className="dropdown-trigger-button">
                                <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
                                <span className="dropdown-arrow"></span>
                            </div>
                        }
                    >
                        <ul className="dropdown-options">
                            {sortOptions.map(option => (
                                <li key={option.value} onClick={() => handleSortChange(option.value)}>
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </Dropdown>
                </div>
            </div>

            <div className="products-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Link to={`/products/${product.id}`} key={product.id} className="product-card-link">
                            <div className="product-card">
                                <div className="product-card-image-container">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                                        alt={product.title}
                                        className="product-card-image"
                                        referrerPolicy="no-referrer"
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

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ProductsPage;