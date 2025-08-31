const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userEmail: String,
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy' },
  sport: String,
  courtNumber: Number,
  date: String,
  startTime: String,
  endTime: String,
  price: Number
});

module.exports = mongoose.model('Booking', bookingSchema);