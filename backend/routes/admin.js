const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authAdmin = require('../middleware/authAdmin');

// PUT /admin/approve-user/:userId
router.put('/approve-user/:userId', authAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validate role is allowed (not 'pending', only valid approved roles)
  const validRoles = ['procurement', 'approver', 'auditor'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    // Find user by ID and update their role
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'pending') {
      return res.status(400).json({ message: 'User is already approved' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User approved as ${role}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ You need to add this GET endpoint
router.get('/pending-users', authAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: 'pending' });
    res.json({ users: pendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
