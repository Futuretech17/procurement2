// api/ipfs.js
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data'); // Make sure you're importing form-data
require('dotenv').config();

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage }).single('file'); // Single file upload

// IPFS Upload Endpoint
router.post('/upload', upload, async (req, res) => {
  try {
    // Ensure file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Pinata API settings
    const pinataJwt = process.env.PINATA_JWT; // Use JWT instead of API keys
    const pinataUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    // Prepare the FormData and headers
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);

    // Send the form with the correct headers
    const response = await axios.post(pinataUrl, form, {
      headers: {
        ...form.getHeaders(), // Automatically handle the boundary
        Authorization: `Bearer ${pinataJwt}`, // Use JWT for the authorization header
      },
    });

    const ipfsHash = response.data.IpfsHash; // Get the IPFS hash
    res.json({ ipfsHash });
  } catch (err) {
    console.error("IPFS Upload Error: ", err);
    res.status(500).json({ message: "Error uploading file to IPFS" });
  }
});

module.exports = router;
