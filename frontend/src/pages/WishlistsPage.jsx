// frontend/src/pages/WishlistsPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; // <-- 1. Import useCallback
import { useAuth } from '../hooks/useAuth.js';
import { getWishlists, createWishlist, deleteWishlist, updateWishlist } from '../api/wishlist.js';
import { Link } from 'react-router-dom';
import './WishlistsPage.css';

const WishlistsPage = () => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWishlistName, setNewWishlistName] = useState('');

    const [editingWishlistId, setEditingWishlistId] = useState(null);
    const [editingWishlistName, setEditingWishlistName] = useState('');

    // --- FIX: Wrap the data fetching function in useCallback ---
    const fetchWishlists = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getWishlists(token);
            setWishlists(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]); // This function depends on the token

    // --- FIX: Add the memoized fetchWishlists function to the dependency array ---
    useEffect(() => {
        if (token) {
            fetchWishlists();
        }
    }, [fetchWishlists, token]); // Now the dependencies are correct

    const handleCreateWishlist = async (e) => {
        e.preventDefault();
        if (!newWishlistName.trim()) return;
        try {
            await createWishlist(newWishlistName, token);
            setNewWishlistName('');
            setIsModalOpen(false);
            fetchWishlists();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteWishlist = async (wishlistId) => {
        if (window.confirm('Are you sure you want to delete this wishlist?')) {
            try {
                await deleteWishlist(wishlistId, token);
                fetchWishlists();
            } catch (err) {
                setError(err.message);
            }
        }
    };
    
    const handleRenameClick = (wishlist) => {
        setEditingWishlistId(wishlist.id);
        setEditingWishlistName(wishlist.name);
    };

    const handleCancelRename = () => {
        setEditingWishlistId(null);
        setEditingWishlistName('');
    };

    const handleSaveRename = async (wishlistId) => {
        if (!editingWishlistName.trim()) return;
        try {
            await updateWishlist(wishlistId, editingWishlistName, token);
            setEditingWishlistId(null);
            setEditingWishlistName('');
            fetchWishlists();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading your wishlists...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="page-container">
            <div className="wishlists-header">
                <h2>My Wishlists</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-create-wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                </button>
            </div>

            <div className="wishlists-grid">
                {wishlists.length > 0 ? (
                    wishlists.map(wishlist => (
                        <div key={wishlist.id} className="wishlist-card-wrapper">
                            {editingWishlistId === wishlist.id ? (
                                <div className="wishlist-edit-form">
                                    <input
                                        type="text"
                                        value={editingWishlistName}
                                        onChange={(e) => setEditingWishlistName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="wishlist-edit-actions">
                                        <button onClick={handleCancelRename} className="btn-secondary">Cancel</button>
                                        <button onClick={() => handleSaveRename(wishlist.id)} className="btn-primary">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link to={`/wishlists/${wishlist.id}`} className="wishlist-card">
                                        <h3>{wishlist.name}</h3>
                                        <p>{wishlist._count.items} items</p>
                                    </Link>
                                    <div className="wishlist-card-actions">
                                        <button
                                            onClick={() => handleRenameClick(wishlist)}
                                            className="btn-wishlist-action rename"
                                            aria-label="Rename wishlist"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWishlist(wishlist.id)}
                                            className="btn-wishlist-action delete"
                                            aria-label="Delete wishlist"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>You haven't created any wishlists yet.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Wishlist</h3>
                        <form onSubmit={handleCreateWishlist}>
                            <div className="form-group">
                                <label htmlFor="wishlistName">Wishlist Name</label>
                                <input
                                    type="text" id="wishlistName"
                                    value={newWishlistName} onChange={(e) => setNewWishlistName(e.target.value)}
                                    required autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistsPage;