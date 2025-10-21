const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Update this path based on the actual file name/location
const User = require('../models/userModel'); // Try userModel.js, user.js, etc.

// Middleware to authenticate requests using x-user-id
const authMiddleware = async (req, res, next) => {
  const userId = req.header('x-user-id');
  console.log('authMiddleware: x-user-id =', userId); // Debug log
  if (!userId) {
    return res.status(401).json({ message: 'No user ID provided' });
  }

  try {
    // Verify user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user ID' });
    }
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json({ message: 'Invalid user ID' });
  }
};

// Register and Login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Get user profile by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user can only access their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to access this user' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile by ID
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Ensure the user can only update their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;