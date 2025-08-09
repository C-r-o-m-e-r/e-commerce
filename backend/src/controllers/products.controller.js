// backend/src/controllers/products.controller.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

const MAX_PRICE = 20000;

const createProduct = async (req, res) => {
    try {
        // Add categoryId to the destructured body
        const { title, description, price, categoryId } = req.body;
        const sellerId = req.user.id;

        if (req.user.role !== 'SELLER') {
            return res.status(403).json({ message: 'Forbidden: Only sellers can create products' });
        }

        // Add categoryId to the validation
        if (!title || !description || !price || !categoryId) {
            return res.status(400).json({ message: 'Title, description, price, and category are required' });
        }

        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
            return res.status(400).json({ message: `Price must be a number between 0.01 and ${MAX_PRICE}.` });
        }

        const images = req.processedFiles ? req.processedFiles.map(file => `/uploads/${file}`) : [];

        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price: priceValue,
                images,
                seller: { connect: { id: sellerId } },
                category: { connect: { id: categoryId } }, // Connect to the category
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
        // Add categoryId to the destructured body
        const { title, description, price, existingImages, categoryId } = req.body;
        const userId = req.user.id;

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
        }

        const dataToUpdate = { title, description };

        if (price !== undefined) {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
                return res.status(400).json({ message: `Price must be a number between 0.01 and ${MAX_PRICE}.` });
            }
            dataToUpdate.price = priceValue;
        }

        // Add categoryId to the data to be updated
        if (categoryId) {
            dataToUpdate.category = { connect: { id: categoryId } };
        }

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
        const { search, category } = req.query; // Add category to query params
        const whereClause = {};

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // If a category is provided, filter by it
        if (category) {
            whereClause.categoryId = category;
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


// --- Other functions (getSellerProducts, getProductById, deleteProduct) remain unchanged ---
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
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
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

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own products' });
        }

        if (product.images && product.images.length > 0) {
            product.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '../../', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
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