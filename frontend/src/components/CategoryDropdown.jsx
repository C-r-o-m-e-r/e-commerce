// frontend/src/components/CategoryDropdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// We don't need to import its own CSS anymore, it's in Header.css

const CategoryMenuItem = ({ category, closeDropdown }) => {
    const navigate = useNavigate();

    // This handler navigates to the selected category page and closes the dropdown
    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
        closeDropdown();
    };

    return (
        <li>
            <a href={`/products?category=${category.id}`} onClick={(e) => { e.preventDefault(); handleCategoryClick(category.id); }}>
                {category.name}
            </a>
            {category.subcategories && category.subcategories.length > 0 && (
                <ul className="dropdown-submenu">
                    {category.subcategories.map(sub => (
                        <CategoryMenuItem key={sub.id} category={sub} closeDropdown={closeDropdown} />
                    ))}
                </ul>
            )}
        </li>
    );
};

const CategoryDropdown = ({ categories }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // This effect handles clicking outside of the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]); // Re-run the effect if `isOpen` changes

    const handleAllProductsClick = () => {
        setIsOpen(false);
        navigate('/products');
    }

    const closeDropdown = () => setIsOpen(false);

    return (
        <div className="category-dropdown" ref={dropdownRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="category-dropdown-toggle">
                <span>Categories</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                    <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
                </svg>
            </button>
            {isOpen && (
                <div className="category-dropdown-menu">
                    <ul>
                        <li><a href="/products" onClick={(e) => { e.preventDefault(); handleAllProductsClick(); }}>All Products</a></li>
                        {categories.map(category => (
                            <CategoryMenuItem key={category.id} category={category} closeDropdown={closeDropdown} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;