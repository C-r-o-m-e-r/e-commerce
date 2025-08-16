// /frontend/src/api/admin.js
const API_URL = 'http://localhost:3000/api/admin'; // Base URL for admin routes

// Helper to get the token
const getToken = () => localStorage.getItem('token');

/**
 * @description Fetches statistics for the admin dashboard. Admin only.
 * @returns {Promise<Object>} An object containing dashboard stats.
 */
export const getDashboardStats = async () => {
  const res = await fetch(`${API_URL}/dashboard-stats`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return res.json();
};

/**
 * @description Fetches all users from the backend. Admin only.
 * @returns {Promise<Array>} A list of users.
 */
export const adminGetAllUsers = async () => {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return res.json();
};

/**
 * @description Updates a user's role. Admin only.
 * @param {string} userId - The ID of the user to update.
 * @param {string} role - The new role for the user.
 * @returns {Promise<Object>} The updated user object.
 */
export const adminUpdateUserRole = async (userId, role) => {
  const res = await fetch(`${API_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    throw new Error('Failed to update user role');
  }
  return res.json();
};

/**
 * @description Deletes a user. Admin only.
 * @param {string} userId - The ID of the user to delete.
 */
export const adminDeleteUser = async (userId) => {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (res.status !== 204) { // Check for 204 No Content
    throw new Error('Failed to delete user');
  }
  // No body is returned on 204, so we don't call res.json()
};