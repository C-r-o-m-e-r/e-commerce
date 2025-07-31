const prisma = require('../config/prisma');

// Create an order from the user's cart
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Calculate the total price
    const total = cart.items.reduce((acc, item) => {
      return acc + item.quantity * item.product.price;
    }, 0);

    // 3. Create the order and order items, then clear the cart in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          total,
          // Create order items from cart items
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              title: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
            items: true // Include items in the response
        }
      });

      // 4. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all orders for the current user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { buyerId: userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
  createOrder,
  getUserOrders
};