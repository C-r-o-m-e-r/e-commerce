const prisma = require('../config/prisma');

// Controller to update a user's role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Expecting { "role": "SELLER" }

    // Basic validation for the role
    if (!['BUYER', 'SELLER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    delete updatedUser.password;
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateUserRole };