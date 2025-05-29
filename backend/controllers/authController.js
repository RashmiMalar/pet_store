const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores.' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return res.status(400).json({
      message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    });
  }

  try {
    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id,
      user: { name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - email not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials - wrong password' });
    }

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};