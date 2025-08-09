// frontend/src/pages/OrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrders } from '../api/orders.js';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                const data = await getOrders(token);
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    if (loading) return <p>Loading your orders...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="page-container">
            <h2>My Orders</h2>
            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map(order => (
                        <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
                            <div className="order-card-header">
                                <h3>Order #{order.id.substring(0, 8)}</h3>
                                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                            </div>
                            <div className="order-card-body">
                                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                                <p><strong>Items:</strong> {order.items.length}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>You haven't placed any orders yet.</p>
            )}
        </div>
    );
};

export default OrdersPage;