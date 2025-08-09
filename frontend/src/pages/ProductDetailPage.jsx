// frontend/src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addToCart } from '../api/cart.js';
import { getWishlists, createWishlist, addItemToWishlist, removeItemByProductId } from '../api/wishlist.js';
import { getProductReviews, createReview } from '../api/review.js';
import { toast } from 'react-toastify';
import StarRating from '../components/StarRating.jsx';
import './ProductDetailPage.css';

// --- SVG Icons for the wishlist button ---
const HeartIconOutline = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" /></svg>
);

const HeartIconFilled = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81-4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
);


const ProductDetailPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // --- State for Reviews ---
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    // --- State for Image Gallery & Lightbox ---
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLightboxOpen, setLightboxOpen] = useState(false);

    // --- Wishlist State ---
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [userWishlists, setUserWishlists] = useState([]);
    const [isWishlistModalOpen, setWishlistModalOpen] = useState(false);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newWishlistName, setNewWishlistName] = useState('');

    // --- Logic for Image Gallery & Lightbox (unchanged) ---
    const goToNextImage = (e) => { e.stopPropagation(); if (product && product.images.length > 0) { setSelectedImage(prevIndex => (prevIndex + 1) % product.images.length); } };
    const goToPreviousImage = (e) => { e.stopPropagation(); if (product && product.images.length > 0) { setSelectedImage(prevIndex => (prevIndex - 1 + product.images.length) % product.images.length); } };
    useEffect(() => { const handleKeyDown = (e) => { if (!isLightboxOpen) return; if (e.key === 'ArrowRight') goToNextImage(e); else if (e.key === 'ArrowLeft') goToPreviousImage(e); else if (e.key === 'Escape') setLightboxOpen(false); }; window.addEventListener('keydown', handleKeyDown); return () => { window.removeEventListener('keydown', handleKeyDown); }; }, [isLightboxOpen, selectedImage, product]);


    // --- DATA FETCHING (Now includes reviews) ---
    useEffect(() => {
        const fetchPageData = async () => {
            try {
                setLoading(true);
                // Fetch product and reviews in parallel for faster loading
                const [productResponse, reviewsResponse] = await Promise.all([
                    fetch(`http://127.0.0.1:3000/api/products/${productId}`),
                    getProductReviews(productId)
                ]);

                if (!productResponse.ok) throw new Error('Product not found');

                const productData = await productResponse.json();
                setProduct(productData);
                setReviews(reviewsResponse);

                if (user && token) {
                    const wishlistsData = await getWishlists(token);
                    setUserWishlists(wishlistsData);
                    const foundInWishlist = wishlistsData.some(list => list.items && list.items.some(item => (item.product?.id || item.productId) === productId));
                    setIsInWishlist(foundInWishlist);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [productId, user, token]);


    // --- EVENT HANDLERS (Unchanged) ---
    const handleAddToCart = async () => { if (!user) return navigate('/login'); if (!quantity || quantity < 1) return toast.warn('Please enter a valid quantity.'); try { await addToCart(product.id, quantity, token); toast.success('Product added to cart!'); } catch (err) { toast.error(err.message); console.error(err); } };
    const handleWishlistClick = () => { if (!user) return navigate('/login'); if (isInWishlist) { handleRemoveFromWishlist(); } else { handleOpenWishlistSelection(); } };
    const handleOpenWishlistSelection = () => { if (userWishlists.length === 0) { toast.info('You need to create a wishlist first.'); setWishlistModalOpen(true); return; } if (userWishlists.length === 1) { handleConfirmAdd(userWishlists[0].id); } else { setWishlistModalOpen(true); } };
    const handleRemoveFromWishlist = async () => { try { await removeItemByProductId(productId, token); setIsInWishlist(false); toast.success('Product removed from your wishlist.'); } catch (err) { toast.error(err.message); console.error(err); } };
    const handleConfirmAdd = async (wishlistId) => { setWishlistModalOpen(false); try { await addItemToWishlist(wishlistId, productId, token); setIsInWishlist(true); toast.success('Product added to your wishlist!'); } catch (err) { toast.error(err.message); console.error(err); } };
    const handleCreateWishlist = async () => { if (!newWishlistName.trim()) { return toast.warn("Please enter a name for your wishlist."); } try { await createWishlist(newWishlistName, token); setNewWishlistName(''); setCreateModalOpen(false); const wishlistsData = await getWishlists(token); setUserWishlists(wishlistsData); toast.success("Wishlist created!"); } catch (err) { toast.error(err.message); console.error(err); } };

    // --- New handler for submitting a review ---
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (newRating === 0) {
            return toast.warn('Please select a star rating.');
        }
        try {
            const newReview = await createReview(productId, { rating: newRating, comment: newComment }, token);
            // Add the new review to the top of the list instantly
            setReviews([newReview, ...reviews]);
            setNewComment('');
            setNewRating(0);
            toast.success('Thank you for your review!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Calculate average rating
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

    if (loading) return <p>Loading product...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Product not found.</p>;

    const getImageUrl = (imagePath) => `http://127.0.0.1:3000${imagePath}`;

    return (
        <>
            <div className="product-detail-container">
                <div className="product-image-section">
                    <img src={getImageUrl(product.images[0])} alt={product.title} className="main-product-image" onClick={() => product.images.length > 0 && setLightboxOpen(true)} />
                    <div className="product-thumbnails-container">
                        {product.images && product.images.map((image, index) => (
                            <img key={index} src={getImageUrl(image)} alt={`${product.title} thumbnail ${index + 1}`} className={`thumbnail-image ${selectedImage === index ? 'active' : ''}`} onClick={() => setSelectedImage(index)} />
                        ))}
                    </div>
                </div>
                <div className="product-info-section">
                    <h2>{product.title}</h2>

                    {/* --- Display Average Rating --- */}
                    {reviews.length > 0 && (
                        <div className="average-rating">
                            <StarRating rating={averageRating} />
                            <p>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</p>
                        </div>
                    )}

                    <p className="product-description">{product.description}</p>
                    <p className="product-price">${product.price}</p>
                    <div className="add-to-cart-controls">
                        <input type="number" className="quantity-input" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" />
                        <button onClick={handleAddToCart} className="add-to-cart-btn">Add to Cart</button>
                        {user && (
                            <button onClick={handleWishlistClick} className={`wishlist-btn ${isInWishlist ? 'active' : ''}`} aria-label="Toggle Wishlist">
                                {isInWishlist ? <HeartIconFilled /> : <HeartIconOutline />}
                            </button>
                        )}
                    </div>
                </div>

                {/* --- START: New Reviews Section --- */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h3>Customer Reviews</h3>
                    </div>

                    {/* Review Submission Form */}
                    {user && (
                        <form className="review-form" onSubmit={handleReviewSubmit}>
                            <h4>Write Your Review</h4>
                            <div className="form-group rating-input">
                                <label>Your Rating</label>
                                <StarRating rating={newRating} onRatingChange={setNewRating} isEditable={true} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="comment">Your Comment</label>
                                <textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts... (optional)"></textarea>
                            </div>
                            <button type="submit">Submit Review</button>
                        </form>
                    )}

                    {/* List of Existing Reviews */}
                    <div className="review-list">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-card-header">
                                        <strong>{review.user?.firstName || 'User'}</strong>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="review-card-comment">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p>No reviews yet. Be the first to write one!</p>
                        )}
                    </div>
                </div>
                {/* --- END: New Reviews Section --- */}
            </div>

            {/* Lightbox and Wishlist Modals (unchanged) */}
            {isLightboxOpen && (<div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}> <button className="lightbox-close-btn" onClick={() => setLightboxOpen(false)}><svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 -960 960 960" width="36"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button> {product.images.length > 1 && (<> <button className="lightbox-nav-btn prev" onClick={goToPreviousImage}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M400-80 0-480l400-400 56 57-343 343 343 343-56 57Z" /></svg></button> <button className="lightbox-nav-btn next" onClick={goToNextImage}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m304-82-56-57 343-343-343-343 56-57 400 400L304-82Z" /></svg></button> </>)} <img src={getImageUrl(product.images[selectedImage])} alt={product.title} className="lightbox-content" onClick={(e) => e.stopPropagation()} /> </div>)}
            {isWishlistModalOpen && (<div className="modal-overlay" onClick={() => { setWishlistModalOpen(false); setCreateModalOpen(false); }}> <div className="modal-content" onClick={(e) => e.stopPropagation()}> {!isCreateModalOpen ? (<> <h3>{userWishlists.length > 0 ? 'Choose a Wishlist' : 'Create a Wishlist'}</h3> <div className="wishlist-selection-list-container"> <div className="wishlist-selection-list"> {userWishlists.map(list => (<button key={list.id} onClick={() => handleConfirmAdd(list.id)} className="wishlist-selection-item"> {list.name} </button>))} </div> <button className="add-wishlist-btn" onClick={() => setCreateModalOpen(true)}>+</button> </div> </>) : (<> <h3>Create New Wishlist</h3> <input type="text" className="create-wishlist-input" placeholder="Wishlist Name" value={newWishlistName} onChange={(e) => setNewWishlistName(e.target.value)} autoFocus /> <button onClick={handleCreateWishlist} className="create-wishlist-button">Create</button> </>)} </div> </div>)}
        </>
    );
};

export default ProductDetailPage;
