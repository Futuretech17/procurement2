// /backend/routes/ipfs.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const data = new FormData();
    data.append('file', file.buffer, file.originalname);

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    res.json({ ipfsHash: pinataRes.data.IpfsHash });
  } catch (err) {
    console.error("IPFS upload failed:", err);
    res.status(500).json({ error: 'Failed to upload file to IPFS' });
  }
});

module.exports = router;
