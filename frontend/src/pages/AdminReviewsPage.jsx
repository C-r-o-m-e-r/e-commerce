// /frontend/src/pages/AdminReviewsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAllReviews, adminDeleteReview } from '../api/admin';
import { toast } from 'react-toastify';
import './AdminReviewsPage.css';

// A small helper component to display star ratings
const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>★</span>);
    }
    return <div className="star-rating">{stars}</div>;
};

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1
    });

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminGetAllReviews({ page: pagination.currentPage });
            setReviews(data.reviews);
            setPagination(prev => ({ ...prev, totalPages: data.totalPages }));
        } catch (err) {
            setError(err.message);
            toast.error("Failed to fetch reviews.");
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review permanently?')) {
            try {
                await adminDeleteReview(reviewId);
                toast.success('Review deleted successfully.');
                // Refresh the list by removing the review from state
                setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
            } catch (err) {
                toast.error(`Error deleting review: ${err.message}`);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    return (
        <div className="admin-reviews-page">
            <h2>Review Management</h2>
            <div className="table-container">
                {loading ? <p>Loading reviews...</p> : error ? <p className="error-message">{error}</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th className="comment-column">Comment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review.id}>
                                    <td><Link to={`/products/${review.product.id}`}>{review.product.title}</Link></td>
                                    <td><Link to={`/admin/users/${review.user.id}`}>{review.user.firstName}</Link></td>
                                    <td><StarRating rating={review.rating} /></td>
                                    <td className="comment-column">{review.comment}</td>
                                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleDelete(review.id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {!loading && pagination.totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                        &larr; Previous
                    </button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsPage;