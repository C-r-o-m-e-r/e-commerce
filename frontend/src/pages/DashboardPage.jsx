// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardStats } from '../api/seller.js';
import SalesChart from '../components/SalesChart.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats(token);
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!stats) return <p>No statistics available.</p>;

    return (
        <div className="page-container dashboard-container">
            <h2>Seller Dashboard</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Total Revenue</h4>
                    <p>${stats.totalRevenue}</p>
                </div>
                <div className="stat-card">
                    <h4>Total Sales</h4>
                    <p>{stats.salesCount}</p>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>Sales Overview</h3>
                <div className="chart-container">
                    <SalesChart orders={stats.recentOrders} />
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h3>Low Stock Items</h3>
                    <div className="dashboard-list">
                        {stats.lowStockProducts.length > 0 ? (
                            stats.lowStockProducts.map(product => (
                                <Link to={`/products/edit/${product.id}`} key={product.id} className="list-item">
                                    <span>{product.title}</span>
                                    <span className="low-stock-count">{product.stock} left</span>
                                </Link>
                            ))
                        ) : <p>No products are low on stock.</p>}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h3>Recent Orders</h3>
                    <div className="dashboard-list">
                        {stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map(order => (
                                <Link to={`/seller/orders/${order.id}`} key={order.id} className="list-item">
                                    <span>Order #{order.id.substring(0, 8)}</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </Link>
                            ))
                        ) : <p>No recent orders.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;