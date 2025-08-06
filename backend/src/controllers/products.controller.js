// backend/src/controllers/products.controller.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

const createProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const sellerId = req.user.id;

    if (req.user.role !== 'SELLER') {
      return res.status(403).json({ message: 'Forbidden: Only sellers can create products' });
    }
    
    if (!title || !description || !price) {
      return res.status(400).json({ message: 'Product title, description, and price are required' });
    }

    const images = req.processedFiles ? req.processedFiles.map(file => `/uploads/${file}`) : [];

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        images,
        seller: {
          connect: { id: sellerId },
        },
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
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
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, existingImages } = req.body;
    const userId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }
    
    let finalImages = [];
    if (existingImages) {
        finalImages = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
    }
    
    if (req.processedFiles && req.processedFiles.length > 0) {
      const newImages = req.processedFiles.map(file => `/uploads/${file}`);
      finalImages.push(...newImages);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        images: finalImages,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
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
    
    // After deleting the DB record, delete the associated image files
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