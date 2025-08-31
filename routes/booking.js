const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Academy = require('../models/Academy');

router.post('/create', async (req, res) => {
  const { userEmail, academyId, sport, courtNumber, date, startTime, endTime } = req.body;

  try {
    const existingBooking = await Booking.findOne({ academyId, sport, courtNumber, date, startTime });
    if (existingBooking) return res.status(400).json({ message: 'Slot already booked' });

    const academy = await Academy.findById(academyId);
    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    const sportData = academy.sports.find(s => s.sportName === sport);
    if (!sportData) return res.status(404).json({ message: 'Sport not offered' });

    const court = sportData.pricing.find(p => p.courtNumber === courtNumber);
    const slot = court.prices.find(p => p.time === startTime);
    if (!slot) return res.status(404).json({ message: 'Invalid start time' });

    const price = slot.price;

    const newBooking = new Booking({
      userEmail,
      academyId,
      sport,
      courtNumber,
      date,
      startTime,
      endTime,
      price
    });

    await newBooking.save();
    res.json({ message: 'Booking successful', booking: newBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });
  }
});

router.post('/search', async (req, res) => {
  const { city, sport, startTime, endTime, date } = req.body;

  try {
    const academies = await Academy.find({ city });
    const bookings = await Booking.find({ date, startTime });

    const results = academies.map(academy => {
      const sportData = academy.sports.find(s => s.sportName === sport);
      if (!sportData) return null;

      const courts = sportData.pricing.map(court => {
        const isBooked = bookings.some(b =>
          b.academyId.toString() === academy._id.toString() &&
          b.sport === sport &&
          b.courtNumber === court.courtNumber
        );
        if (!isBooked) {
          return {
            courtNumber: court.courtNumber,
            price: court.prices.find(p => p.time === startTime)?.price || 0
          };
        }
        return null;
      }).filter(Boolean);

      if (courts.length > 0) {
        return {
          _id: academy._id,
          name: academy.name,
          city: academy.city,
          courts
        };
      }

      return null;
    }).filter(Boolean);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
});

router.get('/my-bookings/:userEmail', async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.params.userEmail }).populate('academyId', 'name address city');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve bookings' });
  }
});

// New route to cancel booking
router.delete('/cancel/:bookingId', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.bookingId);
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});


module.exports = router;