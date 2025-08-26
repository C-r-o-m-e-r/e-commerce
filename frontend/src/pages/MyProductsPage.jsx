// /frontend/src/pages/MyProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './MyProductsPage.css';

const MyProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'SELLER') {
            navigate('/');
            return;
        }

        const fetchMyProducts = async () => {
            try {
                const response = await fetch('/api/products/seller/my-products', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch your products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchMyProducts();
        }
    }, [token, user, navigate]);

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(products.filter(p => p.id !== productId));
            toast.success("Product deleted successfully.");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    if (loading) {
        return <p>Loading your products...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="my-products-page">
            <div className="page-header">
                <h2>My Products</h2>
                <Link to="/products/add" className="btn-add-new">+ Add New Product</Link>
            </div>
            
            {/* --- Replaced card list with a detailed table --- */}
            <div className="table-container">
                {products.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Date Added</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img 
                                            src={`http://localhost:3000${product.images[0]}`} 
                                            alt={product.title} 
                                            className="product-thumbnail" 
                                        />
                                    </td>
                                    <td>{product.title}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <span className={`status-badge status-${product.status}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <Link to={`/products/edit/${product.id}`} className="btn btn-edit">Edit</Link>
                                        <button onClick={() => handleDelete(product.id)} className="btn btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-products-message">
                        <p>You haven't added any products yet.</p>
                        <Link to="/products/add" className="btn-add-new">Add your first product</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProductsPage;