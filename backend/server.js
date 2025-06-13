const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const ipfsRouter = require('./routes/ipfs');      // Your IPFS routes
const authRoutes = require('./routes/auth');      // Auth routes (register/login)
const adminRoutes = require('./routes/admin');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/procurement')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/ipfs', ipfsRouter);
app.use('/api/auth', authRoutes);  // All auth routes start with /api/auth
app.use('/admin', adminRoutes);


// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
