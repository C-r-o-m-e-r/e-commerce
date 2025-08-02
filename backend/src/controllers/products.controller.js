// backend/src/controllers/products.controller.js

const prisma = require('../config/prisma');

const createProduct = async (req, res) => {
  try {
    const { title, description, price, images } = req.body; // <== ЗМІНЕНО 'name' на 'title'
    const sellerId = req.user.id;

    if (req.user.role !== 'SELLER') {
      return res.status(403).json({ message: 'Forbidden: Only sellers can create products' });
    }
    
    // <== ЗМІНЕНО 'name' на 'title' у перевірці
    if (!title || !description || !price) {
      return res.status(400).json({ message: 'Product title, description, and price are required' });
    }

    const newProduct = await prisma.product.create({
      data: {
        title, // <== ЗМІНЕНО 'name' на 'title'
        description,
        price,
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
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, firstName: true } } },
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
    const { title, description, price, images } = req.body; // <== ЗМІНЕНО 'name' на 'title'
    const userId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title, description, price, images }, // <== ЗМІНЕНО 'name' на 'title'
    });

    res.status(200).json(updatedProduct);
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

    await prisma.product.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};