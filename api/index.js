const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Boat = require('./models/boatSchema');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

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
  console.log('Uploaded File:', req.file); // This is the file data

  try {
    const { name, capacity, amenities, features } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : ''; // Get the URL of the uploaded image

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
