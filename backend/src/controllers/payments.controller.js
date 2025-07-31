const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');

const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== userId || order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid or processed order.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { orderId: order.id },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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
    console.log(`Webhook received: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('Webhook received for payment intent without orderId in metadata:', paymentIntent.id);
      return res.status(400).send('Error: Missing orderId in metadata.');
    }
    
    console.log(`Processing successful payment for orderId: ${orderId}`);

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
      console.log(`SUCCESS: Order ${orderId} has been updated to PAID.`);
    } catch (error) {
      console.error(`DATABASE ERROR: Failed to update order ${orderId}`, error);
    }
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};


module.exports = {
  createPaymentIntent,
  handleStripeWebhook,
};