// /frontend/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { adminGetAllUsers, adminUpdateUserRole, adminDeleteUser } from '../api/admin';
import './AdminUsersPage.css'; // We will create this file for styles

const AdminUsersPage = () => {
  // State for storing the list of users, loading status, and errors
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await adminGetAllUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Handler for changing a user's role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await adminUpdateUserRole(userId, newRole);
      // Update the user in the local state to reflect the change immediately
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Error updating user role.');
    }
  };

  // Handler for deleting a user
  const handleDeleteUser = async (userId) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminDeleteUser(userId);
        // Remove the user from the local state
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Error deleting user.');
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-users-page">
      <h2>User Management</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.firstName || 'N/A'}</td>
                <td>{user.lastName || 'N/A'}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;