// frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { createPaymentIntent } from '../api/payments.js';
import CheckoutForm from '../components/CheckoutForm.jsx';
import './CheckoutPage.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const { token } = useAuth();
    const { theme } = useTheme();

    useEffect(() => {
        const fetchPaymentIntent = async () => {
            try {
                const data = await createPaymentIntent(token);
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Error fetching payment intent:", error);
            }
        };

        if (token) {
            fetchPaymentIntent();
        }
    }, [token]);

    // Define theme-specific variables for the Stripe Element
    const stripeThemeVariables = theme === 'dark'
        ? {
            // Dark Theme Variables
                    colorPrimary: '#646cff',
                    colorBackground: '#1a1a1a',
                    colorText: '#ffffff',
                    colorDanger: '#df1b41',
        }
        : {
            // Light Theme Variables
            colorPrimary: '#5A67D8',
            colorBackground: '#ffffff',
            colorText: '#212529',
            colorTextSecondary: '#6c757d',
            colorTextPlaceholder: '#6c757d',
            borderColor: '#DEE2E6',
        };

    const appearance = {
        theme: 'stripe', // Use 'stripe' as a base and override it
        variables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
            ...stripeThemeVariables // Spread in our theme-specific colors
        },
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