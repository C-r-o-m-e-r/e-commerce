// /frontend/src/pages/WishlistDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; // <-- 1. Import useCallback
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// API Functions
import { getWishlistById, removeItemByProductId } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';

// Styles
import './WishlistDetailPage.css';

const WishlistDetailPage = () => {
    const { id } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // --- FIX: Wrap the data fetching function in useCallback ---
    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getWishlistById(id, token);
            setWishlist(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, token]); // This function depends on id and token

    // --- FIX: Add the memoized fetchWishlist function to the dependency array ---
    useEffect(() => {
        if (token && id) {
            fetchWishlist();
        }
    }, [fetchWishlist, id, token]);

    // Handler to remove an item from the wishlist
    const handleRemoveItem = async (productId) => {
        try {
            await removeItemByProductId(productId, token);
            // Update the local state to reflect the change in the UI immediately
            setWishlist(prevWishlist => ({
                ...prevWishlist,
                items: prevWishlist.items.filter(item => item.product.id !== productId)
            }));
        } catch (err) {
            console.error('Failed to remove item:', err);
            setError('Failed to remove item from wishlist.');
        }
    };

    // Handler to add an item to the shopping cart
    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1, token);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            setError('Failed to add item to cart.');
        }
    };

    if (loading) {
        return <p>Loading wishlist...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }
    if (!wishlist) {
        return <p>Wishlist not found.</p>;
    }

    return (
        <div className="page-container">
            <h2>{wishlist.name}</h2>
            <div className="wishlist-items-list">
                {wishlist.items.length > 0 ? (
                    wishlist.items.map(item => (
                        <div key={item.id} className="wishlist-item-card">
                            <Link to={`/products/${item.product.id}`}>
                                <img
                                    src={`http://localhost:3000${item.product.images[0]}`}
                                    alt={item.product.title}
                                    className="wishlist-item-image"
                                />
                            </Link>
                            <div className="wishlist-item-info">
                                <h3>{item.product.title}</h3>
                                <p className="wishlist-item-price">${item.product.price}</p>
                            </div>
                            <div className="wishlist-item-actions">
                                <button
                                    onClick={() => handleAddToCart(item.product.id)}
                                    className="btn-add-to-cart"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => handleRemoveItem(item.product.id)}
                                    className="btn-remove-item"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>This wishlist is empty.</p>
                )}
            </div>
        </div>
    );
};

export default WishlistDetailPage;