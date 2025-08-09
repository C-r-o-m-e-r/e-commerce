// backend/src/controllers/category.controller.js

const prisma = require('../config/prisma');

// Helper function to build a nested tree structure from a flat array of categories
const buildCategoryTree = (categories, parentId = null) => {
    const tree = [];

    // Get top-level categories or subcategories for a given parentId
    const children = categories.filter(category => category.parentId === parentId);

    // For each child, recursively find its own children
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
        // Fetch all categories from the database at once
        const allCategories = await prisma.category.findMany({
            orderBy: {
                name: 'asc', // Sort categories alphabetically
            },
        });

        // Build the nested tree structure from the flat list
        const categoryTree = buildCategoryTree(allCategories);

        res.status(200).json(categoryTree);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllCategories,
};