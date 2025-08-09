// frontend/src/api/review.js

const API_URL = 'http://127.0.0.1:3000/api';

// Helper to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'An unknown server error occurred');
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
};

/**
 * Fetches all reviews for a given product ID.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Array>} A promise that resolves to an array of reviews.
 */
export const getProductReviews = async (productId) => {
    const response = await fetch(`${API_URL}/reviews/${productId}`);
    return handleResponse(response);
};

/**
 * Submits a new review for a product.
 * @param {string} productId - The ID of the product being reviewed.
 * @param {object} reviewData - The review data, e.g., { rating, comment }.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A promise that resolves to the newly created review.
 */
export const createReview = async (productId, reviewData, token) => {
    const response = await fetch(`${API_URL}/reviews/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
};