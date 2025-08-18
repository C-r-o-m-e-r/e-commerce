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
 * @description Fetches all users, with optional search and role filtering.
 * @param {object} params - The search and filter parameters.
 * @param {string} params.search - The search term for email/name.
 * @param {string} params.role - The role to filter by.
 * @returns {Promise<Array>} A list of users.
 */
export const adminGetAllUsers = async ({ search, role } = {}) => {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  if (role) {
    params.append('role', role);
  }
  const queryString = params.toString();

  const res = await fetch(`${API_URL}/users?${queryString}`, {
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
  if (res.status !== 204) {
    throw new Error('Failed to delete user');
  }
};

/**
 * @description Updates a user's status (e.g., ACTIVE, BLOCKED). Admin only.
 * @param {string} userId - The ID of the user to update.
 * @param {string} status - The new status for the user.
 * @returns {Promise<Object>} The updated user object.
 */
export const adminUpdateUserStatus = async (userId, status) => {
  const res = await fetch(`${API_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    throw new Error('Failed to update user status');
  }
  return res.json();
};

/**
 * @description Fetches a single user by their ID. Admin only.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<Object>} The detailed user object.
 */
export const adminGetUserById = async (userId) => {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user details');
  }
  return res.json();
};

// --- NEW: PRODUCT MANAGEMENT API FUNCTIONS ---

/**
 * @description Fetches all products for the admin panel, with filtering.
 * @param {object} filters - The search and filter parameters.
 * @returns {Promise<Array>} A list of products.
 */
export const adminGetAllProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const queryString = params.toString();
  const res = await fetch(`${API_URL}/products?${queryString}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

/**
 * @description Updates a product's status (PENDING, APPROVED, REJECTED).
 * @param {string} productId - The ID of the product to update.
 * @param {string} status - The new status.
 * @returns {Promise<Object>} The updated product object.
 */
export const adminUpdateProductStatus = async (productId, status) => {
  const res = await fetch(`${API_URL}/products/${productId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update product status');
  return res.json();
};

/**
 * @description Deletes a product.
 * @param {string} productId - The ID of the product to delete.
 */
export const adminDeleteProduct = async (productId) => {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (res.status !== 204) throw new Error('Failed to delete product');
};

/**
 * @description Updates product details.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - The new data for the product.
 * @returns {Promise<Object>} The updated product object.
 */
export const adminUpdateProduct = async (productId, productData) => {
    const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to update product details');
    return res.json();
};