// frontend/src/components/ProductCardSkeleton.jsx

import React from 'react';
import './ProductCardSkeleton.css';

const ProductCardSkeleton = () => {
    return (
        <div className="product-card-skeleton">
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;