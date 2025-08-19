import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../api/admin';
import { toast } from 'react-toastify';
import './AdminOrdersPage.css'; // We will create this file next

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filtering and pagination
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0
    });

    // Function to fetch orders
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                status: statusFilter,
                page: pagination.currentPage
            };
            if (!filters.status) delete filters.status; // Don't send empty status

            const data = await adminGetAllOrders(filters);
            setOrders(data.orders);
            setPagination(prev => ({ ...prev, totalPages: data.totalPages, totalOrders: data.totalOrders }));
        } catch (err) {
            setError(err.message);
            toast.error("Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, pagination.currentPage]);

    // Fetch orders when component mounts or filters/page change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handler for changing an order's status
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const updatedOrder = await adminUpdateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: updatedOrder.status } : o));
            toast.success(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update order status.");
            console.error(err);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    return (
        <div className="admin-orders-page">
            <h2>Order Management</h2>

            <div className="filters-container">
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); handlePageChange(1); }} 
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="table-container">
                {loading ? <p>Loading orders...</p> : error ? <p className="error-message">{error}</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Buyer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <Link to={`/admin/orders/${order.id}`} className="order-details-link">
                                            {order.id.substring(0, 8)}...
                                        </Link>
                                    </td>
                                    <td>{order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Guest'}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>${order.total.toFixed(2)}</td>
                                    <td>
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`status-select status-${order.status}`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Paid</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                        &larr; Previous
                    </button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;