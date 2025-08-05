// backend/src/controllers/auth.controller.js

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    // 1. Get the new fields from the request body
    const { email, password, firstName, lastName, role } = req.body;

    // 2. Update validation to include the new fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Add the new fields to the create operation
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'BUYER',
      },
    });
    
    // 4. Update the response to include the new fields
    res.status(201).json({
      message: 'User created successfully',
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName, 
        role: newUser.role, 
        createdAt: newUser.createdAt 
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
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
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // 5. Also add the new fields to the login response
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