const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Boat = require('./models/boatSchema');
const bodyParser = require('body-parser');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const storage = multer.memoryStorage(); // Use memory storage instead of diskStorage
const upload = multer({ storage: storage });

require('dotenv').config();
const mongoURI = process.env.MONGO_URL;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/boats', async (req, res) => {
  try {
    const boats = await Boat.find();
    res.status(200).json(boats);
  } catch (err) {
    console.error('Error in /api/boats GET route:', err);
    res.status(500).json({ error: 'Failed to fetch boats' });
  }
});

app.post('/api/boats', upload.single('photo'), async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);

  try {
    const { name, capacity, amenities, features } = req.body;

    if (!name || !capacity || !amenities || amenities.length === 0) {
      return res.status(400).json({ error: 'Name, Capacity, and at least one amenity are required.' });
    }

    // Upload the file to S3
    const fileContent = req.file.buffer;
    const fileName = Date.now() + path.extname(req.file.originalname);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // your bucket name
      Key: fileName,
      Body: fileContent,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // To make the file publicly accessible
    };

    // Upload file to S3
    const data = await s3.upload(params).promise();
    const photoUrl = data.Location; // URL of the uploaded image

    // Save the boat details to the database
    const boat = new Boat({
      name,
      capacity,
      amenities,
      features,
      photo: photoUrl, // Save the S3 URL of the uploaded image
    });

    await boat.save();
    res.status(201).json({ message: 'Boat added successfully!' });
  } catch (err) {
    console.error('Error in /api/boats route:', err);
    res.status(500).json({ error: 'Failed to add boat' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
