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
        
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        delete user.password; 
        
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status
        };

        next();
    } catch (_error) { // FIX: Renamed 'error' to '_error'
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
        } catch (_error) { // FIX: Renamed 'error' to '_error'
            // Ignore invalid tokens for optional auth
        }
    }

    next();
};

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
};