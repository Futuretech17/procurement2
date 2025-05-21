const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const ipfsRouter = require('./api/ipfs'); // Import the IPFS route

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());  // This will allow all origins, which is useful in development

app.use(bodyParser.json());
app.use('/api/ipfs', ipfsRouter); // API route for IPFS uploads

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
