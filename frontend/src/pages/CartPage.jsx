// frontend/src/pages/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getCart, removeFromCart, updateCartItemQuantity } from '../api/cart.js';
import './CartPage.css';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 1. Get both token (for users) and guestId (for guests)
    const { token, guestId } = useAuth();
    const navigate = useNavigate();

    // 2. useEffect now fetches the cart for both logged-in users and guests
    useEffect(() => {
        // We only proceed if we have an identifier (either a token for a user, or a guestId)
        if (!token && !guestId) {
            setLoading(false); // No identifier, nothing to load
            return;
        }

        const fetchCart = async () => {
            try {
                setLoading(true);
                const cartData = await getCart(token, guestId);
                setCart(cartData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [token, guestId]);

    // 3. Action handlers now pass an object with both token and guestId
    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromCart(itemId, { token, guestId });
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.filter(item => item.id !== itemId)
            }));
        } catch (err) {
            console.error('Failed to remove item:', err);
            setError('Failed to remove item. Please try again.');
        }
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (isNaN(quantity) || quantity < 0) {
            if (newQuantity === '' || quantity === 0) {
                await handleRemoveItem(itemId);
            }
            return;
        }
        try {
            const updatedCart = await updateCartItemQuantity(itemId, quantity, { token, guestId });
            setCart(updatedCart);
        } catch (err) {
            console.error('Failed to update quantity:', err);
            setError('Failed to update quantity. Please try again.');
        }
    };

    // 4. The checkout handler is now the gatekeeper
    const handleProceedToCheckout = () => {
        if (token) {
            // If user is logged in, proceed to checkout
            navigate('/checkout');
        } else {
            // If user is a guest, redirect to login
            navigate('/login');
        }
    };


    if (loading) {
        return <p>Loading your cart...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0).toFixed(2);
    };

    return (
        <div className="page-container">
            <h2>Your Shopping Cart</h2>
            {(!cart || cart.items.length === 0) ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items-list">
                        {cart.items.map(item => (
                            <div key={item.id} className="cart-item">
                                <Link to={`/products/${item.product.id}`}>
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.title}
                                        className="cart-item-image"
                                    />
                                </Link>
                                <div className="cart-item-details">
                                    <Link to={`/products/${item.product.id}`} className="cart-item-title-link">
                                        <h3>{item.product.title}</h3>
                                    </Link>

                                    <div className="quantity-controls">
                                        <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                                        <input
                                            type="number"
                                            id={`quantity-${item.id}`}
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            min="0"
                                            className="quantity-input-cart"
                                        />
                                    </div>
                                    <p className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <button onClick={() => handleRemoveItem(item.id)} className="remove-item-btn">Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3>Cart Total</h3>
                        <p className="total-price">${calculateTotal()}</p>
                        <button className="checkout-btn" onClick={handleProceedToCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;