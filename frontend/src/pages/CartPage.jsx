// frontend/src/pages/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getCart, removeFromCart, updateCartItemQuantity, applyCoupon } from '../api/cart.js';
import { toast } from 'react-toastify';
import './CartPage.css';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const { token, guestId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token && !guestId) {
            setLoading(false);
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

    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromCart(itemId, { token, guestId });
            // Re-fetch the entire cart to ensure totals and discounts are accurate
            const updatedCart = await getCart(token, guestId);
            setCart(updatedCart);
            toast.success("Item removed from cart.");
        } catch (err) {
            console.error('Failed to remove item:', err);
            toast.error('Failed to remove item. Please try again.');
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
            toast.error('Failed to update quantity. Please try again.');
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) {
            return toast.warn("Please enter a coupon code.");
        }
        try {
            const updatedCart = await applyCoupon(couponCode, { token, guestId });
            setCart(updatedCart);
            toast.success("Coupon applied successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to apply coupon.");
        }
    };

    const handleProceedToCheckout = () => {
        if (token) {
            navigate('/checkout');
        } else {
            navigate('/login');
        }
    };

    if (loading) return <p>Loading your cart...</p>;
    if (error) return <p>Error: {error}</p>;

    const subtotal = cart ? cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : 0;

    let discount = 0;
    if (cart && cart.appliedCoupon) {
        if (cart.appliedCoupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * cart.appliedCoupon.discountValue) / 100;
        } else { // FIXED
            discount = cart.appliedCoupon.discountValue;
        }
    }

    const total = subtotal - discount;

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
                                    <img src={item.product.images[0]} alt={item.product.title} className="cart-item-image" />
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
                        <h3>Cart Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {cart.appliedCoupon && (
                            <div className="summary-row discount">
                                <span>Discount ({cart.appliedCoupon.code})</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <strong>Total</strong>
                            <strong>${total > 0 ? total.toFixed(2) : '0.00'}</strong>
                        </div>

                        <form className="coupon-form" onSubmit={handleApplyCoupon}>
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Enter Coupon Code"
                                className="coupon-input"
                            />
                            <button type="submit" className="coupon-btn">Apply</button>
                        </form>

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