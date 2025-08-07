// frontend/src/api/wishlist.js

const API_URL = 'http://127.0.0.1:3000/api';

// Helper to handle API errors consistently
const handleResponse = async (response) => {
    if (!response.ok) {
        // Try to parse error message from JSON, otherwise use a default message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'An unknown server error occurred');
    }
    // For DELETE requests, there might be no content
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export const getWishlists = async (token) => {
    const response = await fetch(`${API_URL}/wishlists`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const getWishlistById = async (id, token) => {
    const response = await fetch(`${API_URL}/wishlists/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const createWishlist = async (name, token) => {
    const response = await fetch(`${API_URL}/wishlists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
};

export const addItemToWishlist = async (wishlistId, productId, token) => {
    const response = await fetch(`${API_URL}/wishlists/${wishlistId}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
    });
    return handleResponse(response);
};

export const removeItemByProductId = async (productId, token) => {
    const response = await fetch(`${API_URL}/wishlists/items/by-product/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const deleteWishlist = async (wishlistId, token) => {
    const response = await fetch(`${API_URL}/wishlists/${wishlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const updateWishlist = async (id, name, token) => {
    const response = await fetch(`${API_URL}/wishlists/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
};