// backend/src/controllers/payments.controller.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');

// This function now creates an order and clears the cart.
// It will be called ONLY by the Stripe webhook after a successful payment.
const fulfillOrder = async (session) => {
    const userId = session.metadata.userId;
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });

    if (cart && cart.items.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                // 1. Create the Order from the cart details
                await tx.order.create({
                    data: {
                        buyerId: userId,
                        total: cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
                        status: 'PAID', // The order is immediately marked as PAID
                        items: {
                            create: cart.items.map((item) => ({
                                productId: item.productId,
                                title: item.product.title,
                                price: item.product.price,
                                quantity: item.quantity,
                            })),
                        },
                    },
                });

                // 2. Clear the user's cart
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });
            });
            console.log(`SUCCESS: Order created for user ${userId} and cart cleared.`);
        } catch (error) {
            console.error(`DATABASE ERROR during order fulfillment for user ${userId}:`, error);
        }
    }
};


const createPaymentIntent = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cannot create payment for an empty cart.' });
        }

        const total = cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Amount in cents
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                // We store the userId to create the order later in the webhook
                userId: userId
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Payment Intent creation error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`Webhook received: PaymentIntent ${paymentIntent.id} succeeded.`);

        // Fulfill the order (create order in DB, clear cart)
        await fulfillOrder(paymentIntent);
    }

    res.json({ received: true });
};


module.exports = {
    createPaymentIntent,
    handleStripeWebhook,
};