const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

// --- LOGIN Route ---
router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }
  
    // Find user by username AND email (both must match)
    const user = await User.findOne({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
    });
  
    if (!user) return res.status(401).json({ error: 'Invalid username/email or password' });
  
    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid username/email or password' });
  
    const payload = {
      userId: user._id,
      role: user.role,
      blockchainAddresses: user.blockchainAddresses,
    };
  
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
  

// --- REGISTER Route ---
// backend/routes/auth.js

router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
      }
  
      // Check if user exists (by username or email)
      const existing = await User.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() }
        ]
      });
      if (existing) return res.status(400).json({ message: 'User with that username or email already exists.' });
  
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
  
      // Create user with default role 'pending' and no blockchain addresses
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        role: 'pending',
        blockchainAddresses: [],
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully and pending approval.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  

module.exports = router;
