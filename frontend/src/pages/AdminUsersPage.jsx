// /frontend/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAllUsers, adminUpdateUserRole, adminDeleteUser, adminUpdateUserStatus } from '../api/admin';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch users when component mounts or when filters change
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: debouncedSearchTerm, role: roleFilter };
      const fetchedUsers = await adminGetAllUsers(params);
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler for changing a user's role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await adminUpdateUserRole(userId, newRole);
      setUsers(users.map(user => user.id === userId ? { ...user, role: updatedUser.role } : user));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Error updating user role.');
    }
  };

  // Handler for changing a user's status
  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const updatedUser = await adminUpdateUserStatus(userId, newStatus);
      setUsers(users.map(user => user.id === userId ? { ...user, status: updatedUser.status } : user));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating user status.');
    }
  };

  // Handler for deleting a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminDeleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Error deleting user.');
      }
    }
  };

  return (
    <div className="admin-users-page">
      <h2>User Management</h2>
      
      {/* --- ADDED: Filter and Search Controls --- */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="">All Roles</option>
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div>Loading users...</div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map(user => (
                <tr key={user.id} className={user.status === 'BLOCKED' ? 'blocked-user' : ''}>
                  <td>
                    {/* ADDED: Link to user details page */}
                    <Link to={`/admin/users/${user.id}`} className="user-details-link">
                      {user.email}
                    </Link>
                  </td>
                  <td>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.status === 'BLOCKED'}
                    >
                      <option value="BUYER">BUYER</option>
                      <option value="SELLER">SELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>{user.status}</span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleStatusChange(user.id, user.status)}
                      className={user.status === 'ACTIVE' ? 'block-btn' : 'unblock-btn'}
                    >
                      {user.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;