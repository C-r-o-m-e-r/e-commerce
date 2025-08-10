// frontend/src/api/user.js

const API_URL = '/api';

export const updateProfile = async (profileData, token) => {
    const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
    }
    return response.json();
};

export const changePassword = async (passwordData, token) => {
    const response = await fetch(`${API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
    }
    return response.json();
};

export const deleteAccount = async (token) => {
    const response = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
    }
    // No JSON body is expected on a successful 204 response
    return;
};