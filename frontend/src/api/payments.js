// frontend/src/api/payments.js

const API_URL = 'http://127.0.0.1:3000/api';

/**
 * Creates a new Stripe Payment Intent on the backend.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A promise that resolves to an object containing the clientSecret.
 */
export const createPaymentIntent = async (token) => {
    const response = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create payment intent');
    }

    return response.json();
};