// /backend/routes/ipfs.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data'); // ✅ Required for Node.js
const router = express.Router();
require('dotenv').config();

// Use memory storage so we can access file.buffer
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = new FormData();
    data.append('file', file.buffer, file.originalname); // ✅ Pass buffer and filename

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    res.json({ ipfsHash: pinataRes.data.IpfsHash });
  } catch (err) {
    console.error("IPFS upload failed:", err.message);
    res.status(500).json({ error: 'Failed to upload file to IPFS' });
  }
});

module.exports = router;
