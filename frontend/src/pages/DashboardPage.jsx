// /frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Link поки не використовується в таблиці
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardStats } from '../api/admin.js'; // ЗМІНА: Імпорт з admin.js
// import SalesChart from '../components/SalesChart.jsx'; // ЗМІНА: Видалено, оскільки дані не готові для чарту
import './DashboardPage.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // ЗМІНА: Викликаємо функцію без токена, оскільки api/admin.js обробляє це сам
                const data = await getDashboardStats(); 
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
            <h2>Admin Dashboard</h2> {/* ЗМІНА: Заголовок */}

            <div className="stats-grid">
                {/* ЗМІНА: Картки зі статистикою для адміна */}
                <div className="stat-card">
                    <h4>Total Users</h4>
                    <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                    <h4>Total Products</h4>
                    <p>{stats.totalProducts}</p>
                </div>
                <div className="stat-card">
                    <h4>Total Sales</h4>
                    <p>${stats.totalSales.toFixed(2)}</p>
                </div>
            </div>

            {/* ЗМІНА: Секцію з "Low Stock Items" та чартом видалено, оскільки API не надає цих даних */}

            <div className="dashboard-section">
                <h3>Recent Orders</h3>
                {/* ЗМІНА: Замінено список на більш інформативну таблицю */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id.substring(0, 8)}...</td>
                                        <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                        <td>${order.totalPrice.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No recent orders.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;