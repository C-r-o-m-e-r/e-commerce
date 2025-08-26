// /frontend/src/pages/AdminCategoriesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../api/category';
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../api/admin';
import { toast } from 'react-toastify';
import './AdminCategoriesPage.css';

// Recursive component to render each category and its children
const CategoryItem = ({ category, onUpdate, onDelete, onAddSubcategory }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (name.trim() === category.name) {
            setIsEditing(false);
            return;
        }
        await onUpdate(category.id, { name });
        setIsEditing(false);
    };

    return (
        <li className="category-item">
            <div className="category-info">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="edit-form">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </form>
                ) : (
                    <span>{category.name}</span>
                )}
                
                {!isEditing && (
                    <div className="category-actions">
                        <button onClick={() => onAddSubcategory(category.id)} className="btn-add-sub">Add Sub</button>
                        <button onClick={() => setIsEditing(true)} className="btn-edit">Edit</button>
                        <button onClick={() => onDelete(category.id)} className="btn-delete">Delete</button>
                    </div>
                )}
            </div>
            {category.subcategories && category.subcategories.length > 0 && (
                <ul className="subcategory-list">
                    {category.subcategories.map(sub => (
                        <CategoryItem 
                            key={sub.id} 
                            category={sub} 
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onAddSubcategory={onAddSubcategory}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};


// Main page component
const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [parentId, setParentId] = useState(null); // For adding subcategories

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (_err) { // Changed 'err' to '_err' to fix the no-unused-vars error
            setError('Failed to fetch categories.');
            toast.error('Failed to fetch categories.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await adminCreateCategory({ name: newCategoryName, parentId });
            toast.success(`Category "${newCategoryName}" created successfully.`);
            setNewCategoryName('');
            setParentId(null);
            fetchCategories(); // Refresh list
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const handleUpdate = async (categoryId, data) => {
        try {
            await adminUpdateCategory(categoryId, data);
            toast.success("Category updated successfully.");
            fetchCategories(); // Refresh list
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        }
    };
    
    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category? This may fail if it has subcategories or products.')) {
            try {
                await adminDeleteCategory(categoryId);
                toast.success("Category deleted successfully.");
                fetchCategories(); // Refresh list
            } catch (err) {
                toast.error(`Error: ${err.message}`);
            }
        }
    };

    const handleAddSubcategory = (pId) => {
        setParentId(pId);
        // Focus the input field for a better UX
        document.getElementById('new-category-input').focus();
    };

    return (
        <div className="admin-categories-page">
            <h2>Category Management</h2>

            <div className="add-category-form">
                <h3>{parentId ? 'Add New Subcategory' : 'Add New Top-Level Category'}</h3>
                <form onSubmit={handleCreate}>
                    <input
                        id="new-category-input"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        required
                    />
                    <button type="submit">Create</button>
                    {parentId && <button type="button" onClick={() => { setParentId(null); setNewCategoryName(''); }}>Cancel</button>}
                </form>
            </div>

            <div className="category-list-container">
                <h3>Existing Categories</h3>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <ul className="category-list">
                        {categories.map(cat => (
                           <CategoryItem 
                                key={cat.id} 
                                category={cat} 
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                onAddSubcategory={handleAddSubcategory}
                           />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminCategoriesPage;