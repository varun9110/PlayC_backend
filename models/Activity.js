const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  hostEmail: String,
  city: String,
  fromTime: String,
  toTime: String,
  date: String,
  maxPlayers: Number,
  joinedPlayers: [String], // accepted
  pendingRequests: [String] // users requesting
});

module.exports = mongoose.model('Activity', activitySchema);
