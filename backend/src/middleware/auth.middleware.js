// frontend/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// This is your original, strict middleware. It remains unchanged.
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        delete user.password;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// --- START: NEW OPTIONAL AUTH MIDDLEWARE ---
// This middleware checks for a user, but doesn't fail if one isn't found.
const optionalAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

            if (user) {
                delete user.password;
                req.user = user; // Attach user to the request if token is valid
            }
        } catch (error) {
            // If token is invalid or expired, we just ignore it and proceed as a guest.
            // req.user will remain undefined.
        }
    }

    next(); // Always proceed to the next step, whether a user was found or not.
};
// --- END: NEW OPTIONAL AUTH MIDDLEWARE ---


// Export both middlewares
module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
};