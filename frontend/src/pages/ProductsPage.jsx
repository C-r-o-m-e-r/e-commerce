// src/pages/ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js'; // 1. Import useAuth
import { addToCart } from '../api/cart.js'; // 2. Import addToCart API function
import { toast } from 'react-toastify'; // For notifications
import Dropdown from '../components/Dropdown.jsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.jsx';
import './ProductsPage.css';

// ... (Pagination component remains the same)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
    const { token, guestId } = useAuth(); // 3. Get token and guestId

    const PRODUCTS_PER_PAGE = 48;

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
    ];

    useEffect(() => {
        // ... (fetchProducts useEffect remains the same)
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

    // ... (handleSortChange and handlePageChange remain the same)
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

    // 4. New handler for the Add to Cart button
    const handleAddToCart = async (e, productId) => {
        e.preventDefault(); // This is crucial to stop the Link from navigating
        e.stopPropagation(); // Stop the event from bubbling up further
        try {
            await addToCart(productId, 1, { token, guestId });
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.message || "Failed to add to cart.");
        }
    };


    if (error) return <p>Error: {error}</p>;

    const searchTermValue = searchParams.get('search');
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentSortValue = searchParams.get('sortBy') || 'newest';
    const selectedOption = sortOptions.find(option => option.value === currentSortValue);

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>{searchTermValue ? `Search Results for "${searchTermValue}"` : 'All Products'}</h2>
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
                {loading ? (
                    Array.from({ length: 12 }).map((_, index) => ( // Show 12 skeletons for initial load
                        <ProductCardSkeleton key={index} />
                    ))
                ) : products.length > 0 ? (
                    products.map((product) => (
                        // The Link now wraps the card, but the button will have its own click handler
                        <Link to={`/products/${product.id}`} key={product.id} className="product-card-link">
                            <div className="product-card">
                                <div className="product-card-image-container">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                                        alt={product.title}
                                        className="product-card-image"
                                        referrerPolicy="no-referrer"
                                    />
                                    {/* 5. Add the "Add to Cart" button here */}
                                    <button className="add-to-cart-hover-btn" onClick={(e) => handleAddToCart(e, product.id)}>
                                        Add to Cart
                                    </button>
                                </div>
                                <div className="product-card-content">
                                    <h3>{product.title}</h3>
                                    <p>{product.description}</p>
                                    <p className="product-price">Price: ${product.price.toLocaleString('en-US')}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No products found.</p>
                )}
            </div>

            {totalPages > 1 && !loading && (
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