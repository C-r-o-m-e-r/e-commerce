// /frontend/src/pages/AdminCouponsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { adminGetAllCoupons, adminDeleteCoupon } from '../api/admin';
import { toast } from 'react-toastify';
import './AdminCouponsPage.css';

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminGetAllCoupons();
            setCoupons(data);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to fetch coupons.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleDelete = async (couponId) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await adminDeleteCoupon(couponId);
                setCoupons(prevCoupons => prevCoupons.filter(c => c.id !== couponId));
                toast.success('Coupon deleted successfully.');
            } catch (err) {
                toast.error(`Error deleting coupon: ${err.message}`);
            }
        }
    };

    const formatDiscount = (type, value) => {
        if (type === 'PERCENTAGE') {
            return `${value}%`;
        }
        return `$${value.toFixed(2)}`;
    };

    return (
        <div className="admin-coupons-page">
            <h2>Coupon Management</h2>
            <div className="table-container">
                {loading ? <p>Loading coupons...</p> : error ? <p className="error-message">{error}</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Seller</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className="coupon-code">{coupon.code}</td>
                                    <td>{formatDiscount(coupon.discountType, coupon.discountValue)}</td>
                                    <td>{coupon.seller ? `${coupon.seller.firstName} ${coupon.seller.lastName}` : 'N/A'}</td>
                                    <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <span className={`status-badge status-${coupon.isActive ? 'ACTIVE' : 'INACTIVE'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(coupon.id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminCouponsPage;