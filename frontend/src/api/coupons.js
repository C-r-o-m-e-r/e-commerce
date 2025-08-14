// frontend/src/api/coupons.js

const API_URL = '/api/coupons';

export const getSellerCoupons = async (token) => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return response.json();
};

export const createCoupon = async (couponData, token) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create coupon');
    }
    return response.json();
};

export const updateCoupon = async (couponId, couponData, token) => {
    const response = await fetch(`${API_URL}/${couponId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update coupon');
    }
    return response.json();
};

export const deleteCoupon = async (couponId, token) => {
    const response = await fetch(`${API_URL}/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete coupon');
    }
    // No JSON body on 204 response
    return;
};