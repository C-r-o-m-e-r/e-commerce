// frontend/src/pages/MyCouponsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { getSellerCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons';
import { toast } from 'react-toastify';
import './MyCouponsPage.css';

const MyCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        expiresAt: '',
    });
    const { token } = useAuth();
    const { theme } = useTheme(); // Get the current theme

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await getSellerCoupons(token);
            setCoupons(data);
        } catch (error) {
            toast.error('Failed to fetch coupons.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCoupons();
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const targetCoupon = editingCoupon ? setEditingCoupon : setNewCoupon;
        targetCoupon(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (editingCoupon) {
            await handleUpdateCoupon();
        } else {
            await handleCreateCoupon();
        }
    };

    const handleCreateCoupon = async () => {
        try {
            await createCoupon(newCoupon, token);
            toast.success('Coupon created successfully!');
            closeModal();
            fetchCoupons();
        } catch (error) {
            toast.error(error.message || 'Failed to create coupon.');
        }
    };

    const handleUpdateCoupon = async () => {
        try {
            await updateCoupon(editingCoupon.id, {
                code: editingCoupon.code,
                expiresAt: editingCoupon.expiresAt,
                isActive: editingCoupon.isActive,
            }, token);
            toast.success('Coupon updated successfully!');
            closeModal();
            fetchCoupons();
        } catch (error) {
            toast.error(error.message || 'Failed to update coupon.');
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(couponId, token);
                toast.success('Coupon deleted.');
                fetchCoupons();
            } catch (error) {
                toast.error(error.message || 'Failed to delete coupon.');
            }
        }
    };

    const openModalForEdit = (coupon) => {
        const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '';
        setEditingCoupon({ ...coupon, expiresAt: expiresDate });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setNewCoupon({ code: '', discountType: 'PERCENTAGE', discountValue: '', expiresAt: '' });
    };

    if (loading) return <p>Loading coupons...</p>;

    const modalData = editingCoupon || newCoupon;

    return (
        <div className={`page-container ${theme}-theme`}>
            <div className="coupons-header">
                <h2>My Coupons</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-create-coupon">
                    Create New Coupon
                </button>
            </div>

            <div className="coupons-list">
                {coupons.length > 0 ? (
                    coupons.map(coupon => (
                        <div key={coupon.id} className={`coupon-card ${!coupon.isActive ? 'disabled' : ''}`}>
                            <div className="coupon-code">{coupon.code}</div>
                            <div className="coupon-details">
                                <p className="coupon-discount">
                                    {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : '$'} OFF
                                </p>
                                <p className="coupon-expiry">
                                    {coupon.expiresAt ? `Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}` : 'No expiry'}
                                </p>
                            </div>
                            <div className="coupon-actions">
                                <button onClick={() => openModalForEdit(coupon)} className="btn-action edit">✎</button>
                                <button onClick={() => handleDeleteCoupon(coupon.id)} className="btn-action delete">🗑</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You haven't created any coupons yet.</p>
                )}
            </div>

            {isModalOpen && (
                // Add the theme class to the modal overlay
                <div className={`modal-overlay ${theme}-theme`} onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingCoupon ? 'Edit Coupon' : 'Create a New Coupon'}</h3>
                        <form onSubmit={handleFormSubmit} className="coupon-form">
                            <div className="form-group">
                                <label htmlFor="code">Coupon Code</label>
                                <input type="text" name="code" value={modalData.code} onChange={handleInputChange} placeholder="e.g., SUMMER25" required disabled={!!editingCoupon} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="discountType">Discount Type</label>
                                <select name="discountType" value={modalData.discountType} onChange={handleInputChange} disabled={!!editingCoupon}>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount ($)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="discountValue">Value</label>
                                <input type="number" name="discountValue" value={modalData.discountValue} onChange={handleInputChange} placeholder="e.g., 25" required min="0" step="0.01" disabled={!!editingCoupon} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expiresAt">Expiration Date (Optional)</label>
                                <input type="date" name="expiresAt" value={modalData.expiresAt} onChange={handleInputChange} />
                            </div>
                            {editingCoupon && (
                                <div className="form-group-inline">
                                    <label htmlFor="isActive">Coupon is Active</label>
                                    <input type="checkbox" name="isActive" checked={editingCoupon.isActive} onChange={(e) => setEditingCoupon(prev => ({ ...prev, isActive: e.target.checked }))} />
                                </div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingCoupon ? 'Save Changes' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCouponsPage;