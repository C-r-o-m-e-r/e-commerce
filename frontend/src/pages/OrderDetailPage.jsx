// frontend/src/pages/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrderById } from '../api/orders.js';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token || !id) return;
            try {
                const data = await getOrderById(id, token);
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, token]);

    if (loading) return <p>Loading order details...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!order) return <p>Order not found.</p>;

    return (
        <div className="order-detail-container">
            <div className="order-detail-header">
                <h2>Order #{order.id.substring(0, 8)}</h2>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <div className="order-summary">
                <p><strong>Date Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Order Total:</strong> ${order.total.toFixed(2)}</p>
            </div>

            <h3>Items in this Order</h3>
            <div className="order-items-list">
                {order.items.map(item => (
                    <div key={item.id} className="order-item-card">
                        <div className="order-item-info">
                            <Link to={`/products/${item.productId}`}>
                                <h4>{item.title}</h4>
                            </Link>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price per item: ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="order-item-total">
                            <p>${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* --- FIX: Updated the link to point to the new account page --- */}
            <Link to="/account/orders" className="back-to-orders-link">← Back to My Orders</Link>
        </div>
    );
};

export default OrderDetailPage;