// /backend/src/controllers/category.controller.js

const prisma = require('../config/prisma');

// Helper function to build a nested tree structure from a flat array of categories
const buildCategoryTree = (categories, parentId = null) => {
    const tree = [];
    const children = categories.filter(category => category.parentId === parentId);
    for (const child of children) {
        const subcategories = buildCategoryTree(categories, child.id);
        if (subcategories.length > 0) {
            child.subcategories = subcategories;
        }
        tree.push(child);
    }
    return tree;
};


// Controller to get all categories in a nested format
const getAllCategories = async (req, res) => {
    try {
        const allCategories = await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        const categoryTree = buildCategoryTree(allCategories);
        res.status(200).json(categoryTree);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- NEW: CATEGORY MANAGEMENT FUNCTIONS (ADMIN) ---

/**
 * @description Create a new category.
 */
const createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const newCategory = await prisma.category.create({
            data: {
                name,
                parentId: parentId || null,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @description Update an existing category (rename).
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name },
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Update category error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @description Delete a category.
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if any products are using this category
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            return res.status(400).json({ message: 'Cannot delete category as it is associated with products.' });
        }

        await prisma.category.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Delete category error:', error);
        // Prisma's 'onDelete: Restrict' will throw an error if the category has subcategories
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Cannot delete category as it has subcategories.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    getAllCategories,
    createCategory,     // <-- Added new function
    updateCategory,     // <-- Added new function
    deleteCategory,     // <-- Added new function
};