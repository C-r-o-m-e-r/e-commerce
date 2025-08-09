// frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { useAuth } from '../context/AuthContext.jsx';
import { createPaymentIntent } from '../api/payments.js';
import CheckoutForm from '../components/CheckoutForm.jsx';
import './CheckoutPage.css';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        const fetchPaymentIntent = async () => {
            try {
                const data = await createPaymentIntent(token);
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Error fetching payment intent:", error);
                // Handle the error appropriately, maybe show a message to the user
            }
        };

        if (token) {
            fetchPaymentIntent();
        }
    }, [token]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#646cff',
            colorBackground: '#1a1a1a',
            colorText: '#ffffff',
            colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px',
        }
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="page-container">
            <div className="checkout-container">
                <h2>Checkout</h2>
                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;