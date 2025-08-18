// /backend/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- FIX: Ensure the complete user object, including role from token, is used ---
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        // The database object is the most up-to-date source of user info
        delete user.password; 
        
        // Create the req.user object for controllers to use
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role, // Ensure role from DB is passed
            status: user.status // Also pass the status
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

            if (user) {
                delete user.password;
                req.user = user;
            }
        } catch (error) {
            // Ignore invalid tokens for optional auth
        }
    }

    next();
};
// --- END: NEW OPTIONAL AUTH MIDDLEWARE ---


// Export both middlewares
module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
};