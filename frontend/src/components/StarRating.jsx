// frontend/src/components/StarRating.jsx

import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, onRatingChange, isEditable = false }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className={`star-rating ${isEditable ? 'editable' : ''}`}>
            {stars.map((star) => (
                <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => isEditable && onRatingChange(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;