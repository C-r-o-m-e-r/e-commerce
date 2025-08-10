// frontend/src/api/orders.js

const API_URL = '/api';

// Helper to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'An unknown server error occurred');
    }
    return response.json();
};

/**
 * Fetches all orders for the logged-in user.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} A promise that resolves to an array of orders.
 */
export const getOrders = async (token) => {
    const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

/**
 * Fetches a single order by its ID.
 * @param {string} id - The ID of the order.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A promise that resolves to the order object.
 */
export const getOrderById = async (id, token) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};