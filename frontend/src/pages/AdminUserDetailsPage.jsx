import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetUserById } from '../api/admin';
import './AdminUserDetailsPage.css'; // We'll create this CSS file next

const AdminUserDetailsPage = () => {
  const { userId } = useParams(); // Get the user ID from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await adminGetUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="user-details-page">
      <Link to="/admin/users" className="back-link">&larr; Back to User List</Link>
      <h2>User Details</h2>

      <div className="details-grid">
        <div className="details-card">
          <h3>Profile Information</h3>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> <span className={`status-badge status-${user.status}`}>{user.status}</span></p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="details-card">
          <h3>Recent Orders ({user.orders.length})</h3>
          {user.orders.length > 0 ? (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id.substring(0, 8)}...</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                <td>${order.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <p>This user has no orders.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;