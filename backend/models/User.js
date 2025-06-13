const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true }, // ✅ Added email field
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['pending', 'procurement', 'approver', 'auditor', 'admin'], // <-- Added 'admin' here
    default: 'pending',
    required: true
  },
  blockchainAddresses: {
    type: [String],
    default: [], // Store lowercase Ethereum addresses
  }
});

// Password verification method
userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
