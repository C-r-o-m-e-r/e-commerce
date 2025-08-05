const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// Controller to update a user's role (Admin action)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

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

// --- START: New functions added ---

// Update the current user's own profile (firstName, lastName)
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName },
    });

    delete updatedUser.password;
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change the current user's password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid old password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete the current user's account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional: Prevent sellers with active products from deleting their account
    if (req.user.role === 'SELLER') {
      const productCount = await prisma.product.count({ where: { sellerId: userId } });
      if (productCount > 0) {
        return res.status(400).json({ message: 'Please delete all your products before deleting your account.' });
      }
    }
    
    await prisma.user.delete({ where: { id: userId } });

    res.status(204).send(); // 204 No Content is standard for successful deletion
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- END: New functions added ---

module.exports = { 
  updateUserRole,
  updateProfile,
  changePassword,
  deleteAccount,
};