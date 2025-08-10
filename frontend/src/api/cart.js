// frontend/src/api/cart.js

const API_URL = '/api';

export const getCart = async (token) => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cart');
    }
    return response.json();
};

export const addToCart = async (productId, quantity, token) => {
    const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
    }
    return response.json();
};

export const removeFromCart = async (itemId, token) => {
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
    }

    return;
};

// <== START: New function added
export const updateCartItemQuantity = async (itemId, quantity, token) => {
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item quantity');
    }
    return response.json();
};
// <== END: New function added