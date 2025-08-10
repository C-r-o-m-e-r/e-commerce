// frontend/src/api/seller.js

const API_URL = '/api';

// Helper to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'An unknown server error occurred');
    }
    return response.status === 204 ? null : response.json();
};

/**
 * Fetches all orders containing the current seller's products.
 * @param {string} token - The seller's authentication token.
 * @returns {Promise<Array>} A promise that resolves to an array of orders.
 */
export const getSellerOrders = async (token) => {
    const response = await fetch(`${API_URL}/seller/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

/**
 * Updates the status of a specific order.
 * @param {string} orderId - The ID of the order to update.
 * @param {string} status - The new status (e.g., 'SHIPPED').
 * @param {string} token - The seller's authentication token.
 * @returns {Promise<object>} A promise that resolves to the updated order object.
 */
export const updateOrderStatus = async (orderId, status, token) => {
    const response = await fetch(`${API_URL}/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

/**
 * Fetches all dashboard statistics for the logged-in seller.
 * @param {string} token - The seller's authentication token.
 * @returns {Promise<object>} A promise that resolves to the dashboard data.
 */
export const getDashboardStats = async (token) => {
    const response = await fetch(`${API_URL}/seller/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

/**
 * Fetches a single order by ID for the seller.
 * @param {string} orderId - The ID of the order.
 * @param {string} token - The seller's authentication token.
 * @returns {Promise<object>} A promise that resolves to the order object.
 */
export const getSellerOrderById = async (orderId, token) => {
    const response = await fetch(`${API_URL}/seller/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};