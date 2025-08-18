import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAllProducts, adminUpdateProductStatus, adminDeleteProduct } from '../api/admin';
import { getCategories } from '../api/category';
import './AdminProductsPage.css';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        categoryId: ''
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timerId);
    }, [filters.search]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = {
                search: debouncedSearch,
                status: filters.status,
                categoryId: filters.categoryId
            };
            Object.keys(queryParams).forEach(key => {
                if (!queryParams[key]) {
                    delete queryParams[key];
                }
            });
            const data = await adminGetAllProducts(queryParams);
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.status, filters.categoryId]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
                fetchProducts();
            } catch (err) {
                setError("Failed to load initial data.");
            }
        };
        loadInitialData();
    }, [fetchProducts]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (productId, status) => {
        try {
            const updatedProduct = await adminUpdateProductStatus(productId, status);
            setProducts(products.map(p => p.id === productId ? { ...p, status: updatedProduct.status } : p));
        } catch (err) {
            alert(`Error updating status: ${err.message}`);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product permanently?')) {
            try {
                await adminDeleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (err) {
                alert(`Error deleting product: ${err.message}`);
            }
        }
    };

    return (
        <div className="admin-products-page">
            <h2>Product Management</h2>

            <div className="filters-container">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by product title..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="search-input"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>

            <div className="table-container">
                {loading && <p>Loading products...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Seller</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td><img src={`http://localhost:3000${product.images[0]}`} alt={product.title} className="product-thumbnail" /></td>
                                    <td>{product.title}</td>
                                    <td>{product.seller ? `${product.seller.firstName} ${product.seller.lastName}` : 'N/A'}</td>
                                    <td>{product.category.name}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td><span className={`status-badge status-${product.status}`}>{product.status}</span></td>
                                    <td className="actions-cell">
                                        {product.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleStatusChange(product.id, 'APPROVED')} className="approve-btn">Approve</button>
                                                <button onClick={() => handleStatusChange(product.id, 'REJECTED')} className="reject-btn">Reject</button>
                                            </>
                                        )}
                                        {/* --- FIX: Changed the link to point to the shared seller/admin edit page --- */}
                                        <Link to={`/products/edit/${product.id}`} className="edit-btn">Edit</Link>
                                        <button onClick={() => handleDelete(product.id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminProductsPage;