// frontend/src/api/cart.js

const API_URL = '/api';

// Helper function to create the correct headers
const createAuthHeaders = (token, guestId) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else if (guestId) {
        headers['x-guest-id'] = guestId;
    }
    return headers;
};

export const getCart = async (token, guestId) => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: createAuthHeaders(token, guestId),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch cart');
    }
    return response.json();
};

export const addToCart = async (productId, quantity, { token, guestId }) => {
    const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: createAuthHeaders(token, guestId),
        body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
    }
    return response.json();
};

export const removeFromCart = async (itemId, { token, guestId }) => {
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token, guestId),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
    }
    return;
};

export const updateCartItemQuantity = async (itemId, quantity, { token, guestId }) => {
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: createAuthHeaders(token, guestId),
        body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item quantity');
    }
    return response.json();
};

export const applyCoupon = async (couponCode, { token, guestId }) => {
    const response = await fetch(`${API_URL}/cart/apply-coupon`, {
        method: 'POST',
        headers: createAuthHeaders(token, guestId),
        body: JSON.stringify({ couponCode }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply coupon');
    }
    return response.json();
};
