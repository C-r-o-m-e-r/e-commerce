// frontend/src/api/category.js

const API_URL = '/api';

export const getCategories = async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
};