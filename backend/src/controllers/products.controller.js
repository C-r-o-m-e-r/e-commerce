// backend/src/controllers/products.controller.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

const MAX_PRICE = 20000;

const getDescendantCategoryIds = async (categoryId) => {
    const directSubcategories = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
    });

    let allSubcategoryIds = directSubcategories.map(c => c.id);

    for (const subId of directSubcategories.map(c => c.id)) {
        const descendantIds = await getDescendantCategoryIds(subId);
        allSubcategoryIds = [...allSubcategoryIds, ...descendantIds];
    }

    return allSubcategoryIds;
};


const createProduct = async (req, res) => {
    try {
        // 1. Add `stock` to the request body
        const { title, description, price, categoryId, stock } = req.body;
        const sellerId = req.user.id;

        if (req.user.role !== 'SELLER') {
            return res.status(403).json({ message: 'Forbidden: Only sellers can create products' });
        }

        // 2. Add `stock` to the validation
        if (!title || !description || !price || !categoryId || stock === undefined) {
            return res.status(400).json({ message: 'Title, description, price, category, and stock are required' });
        }

        const priceValue = parseFloat(price);
        const stockValue = parseInt(stock, 10);

        if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
            return res.status(400).json({ message: `Price must be a number between 0.01 and ${MAX_PRICE}.` });
        }
        if (isNaN(stockValue) || stockValue < 0) {
            return res.status(400).json({ message: 'Stock must be a non-negative number.' });
        }

        const images = req.processedFiles ? req.processedFiles.map(file => `/uploads/${file}`) : [];

        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price: priceValue,
                stock: stockValue, // 3. Add stock to the created product
                images,
                seller: { connect: { id: sellerId } },
                category: { connect: { id: categoryId } },
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Add `stock` to the request body
        const { title, description, price, existingImages, categoryId, stock } = req.body;
        const userId = req.user.id;

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) { return res.status(404).json({ message: 'Product not found' }); }
        if (product.sellerId !== userId) { return res.status(403).json({ message: 'Forbidden: You can only update your own products' }); }

        const dataToUpdate = { title, description };

        if (price !== undefined) {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
                return res.status(400).json({ message: `Price must be a number between 0.01 and ${MAX_PRICE}.` });
            }
            dataToUpdate.price = priceValue;
        }

        // 2. Add logic to update stock
        if (stock !== undefined) {
            const stockValue = parseInt(stock, 10);
            if (isNaN(stockValue) || stockValue < 0) {
                return res.status(400).json({ message: 'Stock must be a non-negative number.' });
            }
            dataToUpdate.stock = stockValue;
        }

        if (categoryId) { dataToUpdate.category = { connect: { id: categoryId } }; }

        let finalImages = existingImages ? JSON.parse(existingImages) : [];
        if (req.processedFiles && req.processedFiles.length > 0) {
            const newImages = req.processedFiles.map(file => `/uploads/${file}`);
            finalImages.push(...newImages);
        }
        dataToUpdate.images = finalImages;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: dataToUpdate,
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const whereClause = {};

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category) {
            const descendantIds = await getDescendantCategoryIds(category);
            const allCategoryIds = [category, ...descendantIds];
            whereClause.categoryId = {
                in: allCategoryIds,
            };
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: { seller: { select: { id: true, email: true } } },
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const products = await prisma.product.findMany({ where: { sellerId: sellerId } });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { seller: { select: { id: true, email: true } } },
        });
        if (!product) { return res.status(404).json({ message: 'Product not found' }); }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) { return res.status(404).json({ message: 'Product not found' }); }
        if (product.sellerId !== userId) { return res.status(403).json({ message: 'Forbidden: You can only delete your own products' }); }
        if (product.images && product.images.length > 0) {
            product.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '../../', imagePath);
                if (fs.existsSync(fullPath)) { fs.unlinkSync(fullPath); }
            });
        }
        await prisma.product.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getSellerProducts,
};