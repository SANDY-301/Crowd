require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Location = require('./models/Location');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Did you forget to add your MONGODB_URI in the .env file?');
  });

// ─── API ROUTES ─────────────────────────────────────────────────────────────

// 1. Root route for checking server status
app.get('/', (req, res) => {
  res.send('CrowdMap Live Backend is Running!');
});

// 2. Update User Location (Upsert)
app.post('/api/location', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upsert: Update if exists, Insert if it doesn't
    const updatedLocation = await Location.findOneAndUpdate(
      { userId },
      { latitude, longitude, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updatedLocation });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get All Live Crowds
app.get('/api/crowds', async (req, res) => {
  try {
    // 15 mins ago (we also have a TTL index in MongoDB doing this automatically)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    const activeUsers = await Location.find({
      lastUpdated: { $gte: fifteenMinsAgo }
    }).lean();

    // To prevent sending exact user IDs to everyone for privacy, we strip the IDs
    // and just send anonymous coordinates
    const anonymousCrowd = activeUsers.map(user => ({
      id: user._id.toString(), // Database ID, not user ID
      latitude: user.latitude,
      longitude: user.longitude,
      lastUpdated: user.lastUpdated
    }));

    res.status(200).json({ success: true, count: anonymousCrowd.length, data: anonymousCrowd });
  } catch (error) {
    console.error('Error fetching crowds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── START SERVER ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
