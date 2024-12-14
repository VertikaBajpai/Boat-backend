const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Boat = require('./models/boatSchema');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only image files are allowed');
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
});

app.use('/uploads', express.static('uploads')); // Serve static files from uploads folder

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
    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    if (!name || !capacity || !amenities || amenities.length === 0) {
      return res.status(400).json({ error: 'Name, Capacity, and at least one amenity are required.' });
    }

    const boat = new Boat({
      name,
      capacity,
      amenities,
      features,
      photo,
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
