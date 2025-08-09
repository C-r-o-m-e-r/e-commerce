// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile, changePassword, deleteAccount } from '../api/user.js';
// The CSS is now handled by AccountLayout.css

const ProfilePage = () => {
    const { user, token, logout, login } = useAuth();

    const [name, setName] = useState('');
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const displayName = user.lastName && user.lastName !== '.'
                ? `${user.firstName} ${user.lastName}`
                : user.firstName;
            setName(displayName);
        }
    }, [user]);

    // --- THIS FUNCTION WAS MISSING ---
    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };
    // --- END OF FIX ---

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '.';
            const updatedUser = await updateProfile({ firstName, lastName }, token);
            login({ user: updatedUser, token });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
            return;
        }
        try {
            await changePassword(passwordData, token);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ oldPassword: '', newPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount(token);
            logout();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            setDeleteModalOpen(false);
        }
    };

    if (!user) {
        return <p>Loading account details...</p>;
    }

    return (
        <div>
            {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

            <div className="account-grid">
                <div className="account-card">
                    <h3>Update Profile</h3>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={user.email} disabled />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Your Name</label>
                            <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <button type="submit">Save Changes</button>
                    </form>
                </div>

                <div className="account-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="oldPassword">Old Password</label>
                            <input type="password" id="oldPassword" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                        </div>
                        <button type="submit">Change Password</button>
                    </form>
                </div>

                <div className="account-card danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Deleting your account is permanent and cannot be undone.</p>
                    <button type="button" className="delete-btn" onClick={() => setDeleteModalOpen(true)}>Delete My Account</button>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Are you sure?</h3>
                        <p>This action cannot be undone. All your data, including orders and products, will be permanently deleted.</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                            <button type="button" className="delete-btn" onClick={handleDeleteAccount}>Yes, Delete My Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
