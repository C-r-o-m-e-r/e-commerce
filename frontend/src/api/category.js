// frontend/src/api/category.js

const API_URL = 'http://127.0.0.1:3000/api';

export const getCategories = async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
};