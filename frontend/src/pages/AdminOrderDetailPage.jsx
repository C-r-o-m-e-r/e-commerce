// /frontend/src/pages/AdminOrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetOrderById, adminCreateRefund } from '../api/admin';
import { toast } from 'react-toastify';
import './AdminOrderDetailPage.css';

const AdminOrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefunding, setIsRefunding] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const data = await adminGetOrderById(orderId);
                setOrder(data);
            } catch (err) {
                setError(err.message);
                toast.error("Failed to fetch order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleRefund = async () => {
        if (window.confirm('Are you sure you want to refund this order? This action is irreversible.')) {
            try {
                setIsRefunding(true);
                const response = await adminCreateRefund(orderId);
                setOrder(response.order); // Update the order state with the new 'REFUNDED' status
                toast.success("Refund processed successfully!");
            } catch (err) {
                toast.error(`Refund failed: ${err.message}`);
            } finally {
                setIsRefunding(false);
            }
        }
    };

    if (loading) return <p>Loading order details...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!order) return <p>Order not found.</p>;

    const canBeRefunded = (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPED') && order.paymentIntentId;

    return (
        <div className="admin-order-details-page">
            <Link to="/admin/orders" className="back-link">&larr; Back to Orders</Link>
            <h2>Order Details</h2>
            
            <div className="details-layout">
                <div className="order-main-details">
                    <div className="details-card">
                        <h3>Order Summary</h3>
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Payment ID:</strong> {order.paymentIntentId || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span className={`status-badge status-${order.status}`}>{order.status}</span></p>
                        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    </div>

                    <div className="details-card">
                        <h3>Buyer Information</h3>
                        <p><strong>Name:</strong> {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Guest'}</p>
                        <p><strong>Email:</strong> {order.buyer ? order.buyer.email : 'N/A'}</p>
                    </div>

                    <div className="details-card">
                        <h3>Actions</h3>
                        {canBeRefunded && (
                            <button onClick={handleRefund} disabled={isRefunding} className="btn-refund">
                                {isRefunding ? 'Refunding...' : 'Issue Full Refund'}
                            </button>
                        )}
                        {order.status === 'REFUNDED' && (
                            <p className="refunded-message">This order has been successfully refunded.</p>
                        )}
                        {!order.paymentIntentId && (
                            <p className="refunded-message">Refund not available (no payment ID found).</p>
                        )}
                    </div>
                </div>

                <div className="order-items-details">
                    <div className="details-card">
                        <h3>Items in Order ({order.items.length})</h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="item-product-info">
                                                    <img src={`http://localhost:3000${item.product?.images[0]}`} alt={item.title} className="product-thumbnail"/>
                                                    <span>{item.title}</span>
                                                </div>
                                            </td>
                                            <td>x {item.quantity}</td>
                                            <td>${item.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;