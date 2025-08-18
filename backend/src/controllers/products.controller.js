// backend/src/controllers/products.controller.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

const MAX_PRICE = 20000;

// This helper function remains unchanged
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

// This function remains unchanged
const createProduct = async (req, res) => {
    try {
        const { title, description, price, categoryId, stock } = req.body;
        const sellerId = req.user.id;
        if (req.user.role !== 'SELLER') {
            return res.status(403).json({ message: 'Forbidden: Only sellers can create products' });
        }
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
                stock: stockValue,
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
        const { title, description, price, existingImages, categoryId, stock } = req.body;
        const user = req.user;
        
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) { return res.status(404).json({ message: 'Product not found' }); }

        if (product.sellerId !== user.id && user.role !== 'ADMIN') { 
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this product' }); 
        }

        const dataToUpdate = {};
        if (title) dataToUpdate.title = title;
        if (description) dataToUpdate.description = description;

        if (price !== undefined) {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
                return res.status(400).json({ message: `Price must be a number between 0.01 and ${MAX_PRICE}.` });
            }
            dataToUpdate.price = priceValue;
        }
        if (stock !== undefined) {
            const stockValue = parseInt(stock, 10);
            if (isNaN(stockValue) || stockValue < 0) {
                return res.status(400).json({ message: 'Stock must be a non-negative number.' });
            }
            dataToUpdate.stock = stockValue;
        }
        if (categoryId) { dataToUpdate.categoryId = categoryId; }
        
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

// This function remains unchanged
const getAllProducts = async (req, res) => {
    try {
        const { search, category, sortBy, page = 1, limit = 48, status = 'APPROVED' } = req.query;
        const whereClause = {};
        
        if (status) {
            whereClause.status = status.toUpperCase();
        }

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

        let orderByClause = {};
        switch (sortBy) {
            case 'price_asc':
                orderByClause = { price: 'asc' };
                break;
            case 'price_desc':
                orderByClause = { price: 'desc' };
                break;
            case 'newest':
            default:
                orderByClause = { createdAt: 'desc' };
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [totalProducts, products] = await prisma.$transaction([
            prisma.product.count({ where: whereClause }),
            prisma.product.findMany({
                where: whereClause,
                include: { seller: { select: { id: true, firstName: true, lastName: true } } },
                orderBy: orderByClause,
                take: parseInt(limit, 10),
                skip: skip,
            }),
        ]);

        res.status(200).json({ 
            products, 
            totalProducts, 
            totalPages: Math.ceil(totalProducts / parseInt(limit, 10)) 
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// This function remains unchanged
const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const products = await prisma.product.findMany({ 
            where: { sellerId: sellerId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// This function remains unchanged
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { 
                seller: { select: { id: true, firstName: true, lastName: true } },
                category: true 
            },
        });
        if (!product) { return res.status(404).json({ message: 'Product not found' }); }
        res.status(200).json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// This function remains unchanged
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.sellerId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this product' });
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

// This function remains unchanged
const getProductSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json([]);
        }

        const suggestions = await prisma.product.findMany({
            where: {
                title: {
                    contains: q,
                    mode: 'insensitive',
                },
                status: 'APPROVED'
            },
            take: 7,
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
            },
        });

        res.json(suggestions);
    } catch (error) {
        console.error('Get product suggestions error:', error);
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
    getProductSuggestions,
};