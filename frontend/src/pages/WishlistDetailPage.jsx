// frontend/src/pages/WishlistDetailPage.jsx

import React, { useState, useEffect } from 'react';
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

    // Fetches the wishlist data from the API
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlistById(id, token);
            setWishlist(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch the wishlist when the component mounts or when id/token changes
    useEffect(() => {
        if (token && id) {
            fetchWishlist();
        }
    }, [id, token]);

    // Handler to remove an item from the wishlist
    const handleRemoveItem = async (productId) => {
        try {
            // Call the API to remove the item
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
            // Call the API to add the item to the cart (quantity: 1)
            await addToCart(productId, 1, token);
            // The alert has been removed as requested.
            // You can add a more subtle notification here later if you want.
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
                                    src={item.product.images[0]}
                                    alt={item.product.title}
                                    className="wishlist-item-image"
                                />
                            </Link>
                            <div className="wishlist-item-info">
                                <h3>{item.product.title}</h3>
                                <p className="wishlist-item-price">${item.product.price}</p>
                            </div>
                            <div className="wishlist-item-actions">
                                {/* Attach the correct event handlers */}
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