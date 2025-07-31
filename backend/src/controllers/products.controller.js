const prisma = require('../config/prisma');

// Controller to create a new product
const createProduct = async (req, res) => {
  try {
    const { title, description, price, images } = req.body;
    // The authenticated user's ID is available from req.user
    const sellerId = req.user.id;

    // For now, we'll assume the user is a SELLER.
    // Later we can add a role check here.

    const newProduct = await prisma.product.create({
      data: {
        title,
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

// Controller to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      // Optionally, include seller info
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

// --- NEW --- Get a single product by its ID
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

// --- NEW --- Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, images } = req.body;
    const userId = req.user.id;

    // First, find the product to ensure it exists and belongs to the user
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check
    if (product.sellerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title, description, price, images },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- NEW --- Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check
    if (product.sellerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own products' });
    }

    await prisma.product.delete({ where: { id } });

    res.status(204).send(); // 204 No Content is standard for successful deletion
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