const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path if needed

async function seedAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/procurement');

    const username = 'admin';
    const email = 'admin@example.com';
    const plainPassword = 'AdminPass123';

    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      await mongoose.connection.close();
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const adminUser = new User({
      username,
      email,
      passwordHash,
      role: 'admin',
      blockchainAddresses: []
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

seedAdminUser();
