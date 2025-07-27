// This middleware checks if the user has the required role

const checkRole = (role) => {
  return (req, res, next) => {
    // We assume authMiddleware has already run and attached the user
    if (req.user && req.user.role === role) {
      next(); // User has the required role, proceed
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }
  };
};

module.exports = checkRole;