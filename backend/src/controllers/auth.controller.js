// backend/src/controllers/auth.controller.js

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mergeCarts } = require('./cart.controller');

const register = async (req, res) => {
    try {
        // 1. Get the guestId from the request body
        const { email, password, firstName, lastName, role, guestId } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'BUYER',
            },
        });

        await prisma.wishlist.create({
            data: {
                name: 'My Wishlist',
                userId: newUser.id,
            },
        });

        // --- START: MERGE GUEST CART ON REGISTRATION ---
        if (guestId) {
            try {
                await mergeCarts(newUser.id, guestId);
            } catch (mergeError) {
                console.error('Failed to merge carts on registration:', mergeError);
            }
        }
        // --- END: MERGE GUEST CART ON REGISTRATION ---

        // --- START: AUTOMATIC LOGIN AFTER REGISTRATION ---
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            message: 'User created and logged in successfully',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                createdAt: newUser.createdAt
            },
        });
        // --- END: AUTOMATIC LOGIN ---

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, guestId } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (guestId) {
            try {
                await mergeCarts(user.id, guestId);
            } catch (mergeError) {
                console.error('Failed to merge carts on login:', mergeError);
            }
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    register,
    login,
    getMe,
};