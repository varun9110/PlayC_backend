const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Academy = require('../models/Academy');
const { isTimeOverlap, timeToMinutes, calculatePrice } = require('../utils/helperFunctions');

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
  const { city, sport, date } = req.body;

  if (!city || !sport || !date) {
      return res.status(400).json({ message: "City and sport are required" });
    }

  try {
    // Find academies in the city that have the sport
    const academies = await Academy.find({
      city: city.toLowerCase(),
      "sports.sportName": sport
    });

    res.status(200).json({ academies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
});

// API: Get available courts
router.post('/check-availability', async (req, res) => {
   try {
    const { academyId, sport, date, startTime, duration } = req.body;

    const academy = await Academy.findById(academyId);
    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    const sportData = academy.sports.find((s) => s.sportName === sport);
    if (!sportData) return res.status(404).json({ message: 'Sport not found in this academy' });

    const courts = [];
    const requestedStart = timeToMinutes(startTime);
    const requestedEnd = requestedStart + duration;
    const academyStart = timeToMinutes(sportData.startTime);
    const academyEnd = timeToMinutes(sportData.endTime);

    for (let i = 1; i <= sportData.numberOfCourts; i++) {
      // Check if requested time is within court operating hours
      if (requestedStart < academyStart || requestedEnd > academyEnd) {
        courts.push({ courtNumber: i, available: false, price: 0 });
        continue;
      }

      // Find existing bookings for this court
      const bookings = await Booking.find({
        academyId,
        sport,
        courtNumber: i,
        date,
      });

      // Check if any booking overlaps
      let available = true;
      for (let b of bookings) {
        const bookingStart = timeToMinutes(b.startTime);
        const bookingEnd = timeToMinutes(b.endTime);
        if (isTimeOverlap(requestedStart, requestedEnd, bookingStart, bookingEnd)) {
          available = false;
          break;
        }
      }

      // Calculate price for the requested duration
      let price = 0;
      if (available) {
        const courtPricing = sportData.pricing.find((p) => p.courtNumber === i);
        if (courtPricing) {
          price = calculatePrice(courtPricing.prices, startTime, duration);
        }
      }

      courts.push({ courtNumber: i, available, price });
    }

    res.json({ courts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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