const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Boat = require('./models/boatSchema');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());





require('dotenv').config();
const mongoURI = process.env.MONGO_URL;

mongoose
  .connect(mongoURI)
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

app.post('/api/boats',async (req, res) => {
 

  try {
    const { name, capacity, amenities, features } = req.body;

    if (!name || !capacity || !amenities || amenities.length === 0) {
      return res.status(400).json({ error: 'Name, Capacity, and at least one amenity are required.' });
    }

   
    const boat = new Boat({
      name,
      capacity,
      amenities,
      features,
     
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
