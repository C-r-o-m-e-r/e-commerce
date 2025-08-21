// /frontend/src/api/admin.js

const API_URL = 'http://localhost:3000/api/admin'; // Base URL for admin routes
// Base URL for category routes, as they have a different prefix
const CATEGORY_API_URL = 'http://localhost:3000/api/categories'; 

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

// --- PRODUCT MANAGEMENT API FUNCTIONS ---

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

// --- ORDER MANAGEMENT API FUNCTIONS ---

/**
 * @description Fetches all orders for the admin panel, with filtering.
 * @param {object} filters - The search and filter parameters.
 * @returns {Promise<Object>} An object containing the list of orders and pagination data.
 */
export const adminGetAllOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const queryString = params.toString();
  const res = await fetch(`${API_URL}/orders?${queryString}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

/**
 * @description Fetches a single order by ID.
 * @param {string} orderId - The ID of the order to fetch.
 * @returns {Promise<Object>} The detailed order object.
 */
export const adminGetOrderById = async (orderId) => {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch order details');
  return res.json();
};

/**
 * @description Updates an order's status.
 * @param {string} orderId - The ID of the order to update.
 * @param {string} status - The new status.
 * @returns {Promise<Object>} The updated order object.
 */
export const adminUpdateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
};

/**
 * @description Creates a Stripe refund for a given order.
 * @param {string} orderId - The ID of the order to refund.
 * @returns {Promise<Object>} The server response, including the updated order.
 */
export const adminCreateRefund = async (orderId) => {
  const res = await fetch(`${API_URL}/orders/${orderId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to process refund');
  }
  return res.json();
};


// --- CATEGORY MANAGEMENT API FUNCTIONS ---

/**
 * @description Creates a new category. Admin only.
 * @param {object} categoryData - The data for the new category (e.g., { name, parentId }).
 * @returns {Promise<Object>} The new category object.
 */
export const adminCreateCategory = async (categoryData) => {
  const res = await fetch(CATEGORY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create category');
  }
  return res.json();
};

/**
 * @description Updates a category's name. Admin only.
 * @param {string} categoryId - The ID of the category to update.
 * @param {object} categoryData - The new data (e.g., { name }).
 * @returns {Promise<Object>} The updated category object.
 */
export const adminUpdateCategory = async (categoryId, categoryData) => {
  const res = await fetch(`${CATEGORY_API_URL}/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update category');
  }
  return res.json();
};

/**
 * @description Deletes a category. Admin only.
 * @param {string} categoryId - The ID of the category to delete.
 */
export const adminDeleteCategory = async (categoryId) => {
  const res = await fetch(`${CATEGORY_API_URL}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete category');
  }
};

// --- REVIEW MANAGEMENT API FUNCTIONS ---

/**
 * @description Fetches all reviews. Admin only.
 * @param {object} filters - Pagination filters (page, limit).
 * @returns {Promise<Object>} An object with reviews and pagination data.
 */
export const adminGetAllReviews = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const res = await fetch(`${API_URL}/reviews?${queryString}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
};

/**
 * @description Deletes a review. Admin only.
 * @param {string} reviewId - The ID of the review to delete.
 */
export const adminDeleteReview = async (reviewId) => {
    const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status !== 204) throw new Error('Failed to delete review');
};

// --- NEW: COUPON MANAGEMENT API FUNCTIONS ---

/**
 * @description Fetches all coupons. Admin only.
 * @returns {Promise<Array>} A list of all coupons.
 */
export const adminGetAllCoupons = async () => {
    const res = await fetch(`${API_URL}/coupons`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
};

/**
 * @description Deletes a coupon. Admin only.
 * @param {string} couponId - The ID of the coupon to delete.
 */
export const adminDeleteCoupon = async (couponId) => {
    const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status !== 204) throw new Error('Failed to delete coupon');
};