// frontend/src/pages/SellerOrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getSellerOrders, updateOrderStatus } from '../api/seller.js';
import { toast } from 'react-toastify';
import './SellerOrdersPage.css';

const SellerOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                console.log('[DEBUG] 1. Starting to fetch seller orders...');
                setLoading(true);
                const data = await getSellerOrders(token);
                console.log('[DEBUG] 2. Received data from API:', data);
                
                // Add a check to ensure data is an array
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    // If data is not an array (e.g., null or undefined), set an empty array
                    setOrders([]);
                    console.log('[DEBUG] Data was not an array, setting empty array.');
                }

            } catch (err) {
                console.error('[DEBUG] 3. An error occurred:', err);
                setError(err.message);
                toast.error(err.message);
            } finally {
                console.log('[DEBUG] 4. Setting loading to false.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus, token);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            toast.success(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
        } catch (err) {
            toast.error(err.message);
            console.error('Failed to update order status:', err);
        }
    };

    if (user?.role !== 'SELLER') {
        return (
            <div className="page-container">
                <h2>Access Denied</h2>
                <p>This page is for sellers only.</p>
            </div>
        );
    }

    if (loading) return <p>Loading your orders...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="page-container">
            <h2>My Sales</h2>
            {orders.length > 0 ? (
                <div className="seller-orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="seller-order-card">
                            <Link to={`/seller/orders/${order.id}`} className="seller-order-link">
                                <div className="seller-order-header">
                                    <h3>Order #{order.id.substring(0, 8)}</h3>
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="seller-order-body">
                                    {order.items.map(item => (
                                        <div key={item.id} className="seller-order-item">
                                            <span>{item.quantity} x {item.title}</span>
                                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                            <div className="seller-order-footer">
                                <strong>Total: ${order.total.toFixed(2)}</strong>
                                <div className="status-updater">
                                    <label htmlFor={`status-${order.id}`}>Status:</label>
                                    <select
                                        id={`status-${order.id}`}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`status-select status-${order.status.toLowerCase()}`}
                                    >
                                        <option value="PAID">Paid</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You have no sales yet.</p>
            )}
        </div>
    );
};

export default SellerOrdersPage;