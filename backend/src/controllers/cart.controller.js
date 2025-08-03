// backend/src/controllers/cart.controller.js

const prisma = require('../config/prisma');

// Get the current user's cart
const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add an item to the cart
const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Valid productId and quantity are required.' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }, // <== BUG FIX
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Add item error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove an item from the cart
const removeItemFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: { userId: userId }
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or you do not have permission to remove it' });
        }

        await prisma.cartItem.delete({ where: { id: itemId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'A valid quantity is required.' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: userId } },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }
    
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: quantity },
      });
    }
    
    const updatedCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
};