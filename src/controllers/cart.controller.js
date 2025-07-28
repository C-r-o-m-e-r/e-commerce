const prisma = require('../config/prisma');

// Get the current user's cart
const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true, // Include product details in each cart item
          },
        },
      },
    });

    // If user has no cart, create one
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

    // Find user's cart (or create it)
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if the item is already in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // If item exists, update its quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // If item does not exist, create a new cart item
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

        // Find the cart item and verify it belongs to the user's cart
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

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
};