const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // Each user has one active location
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    expires: 900 // MongoDB TTL index: Automatically deletes the document after 900 seconds (15 minutes) of inactivity
  }
});

// Update the 'lastUpdated' field automatically before saving
locationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Location', locationSchema);
