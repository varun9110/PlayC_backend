const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Academy = require('../models/Academy');
const User = require('../models/User');
const { capitalizeWords } = require('../utils/helperFunctions');

// POST /admin/onboard-academy
/**
 * @swagger
 * /admin/onboard-academy:
 *   post:
 *     summary: Onboard a new academy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 format: phone
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Academy onboarded successfully
 *       400:
 *         description: Bad request
 */
router.post('/onboard-academy', async (req, res) => {
  try {
    const {
      name, email, phone, address, city
    } = req.body;

    // Check if academy email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    const passwordPlain = crypto.randomBytes(6).toString('hex'); // 12-char random password
    if (!existingUser) {
      // Create random password
      const hashedPassword = await bcrypt.hash(passwordPlain, 10);
      // Create Academy User account
      const academyUser = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: 'academy',
        isVerified: true
      });
      await academyUser.save();
    }



    // Create Academy document
    const newAcademy = new Academy({
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      phone: phone.toLowerCase(),
      address: address.toLowerCase(),
      city: city.toLowerCase()
    });
    await newAcademy.save();

    let mailOptions;
    if (!existingUser) {
      // Send email to academy
      mailOptions = {
        from: 'varun.goel.vg@gmail.com',
        to: email,
        subject: 'Your Academy Account Credentials',
        text: `Hello ${capitalizeWords(name)},

              Your academy account has been created.

              You can log in with the following credentials:

              Email: ${email}
              Password: ${passwordPlain}

              Please change your password after logging in.

              Best regards,
              PlayC`
        };
    } else {
      mailOptions = {
        from: 'varun.goel.vg@gmail.com',
        to: email,
        subject: 'Your Academy was created',
        text: `Hello ${capitalizeWords(name)},

              Your academy account has been created.

              You can log in with your exisiting username and password.

              Best regards,
              PlayC`
        };
    }

    console.log(mailOptions)

    res.json({ message: 'Academy onboarded and emailed.', mailOptions, success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/configure', async (req, res) => {
  const { email, sports } = req.body;

  try {
    const academy = await Academy.findOne({ email });

    if (!academy) {
      return res.json({ message: 'Academy could not be found' });
    }

    academy.sports = sports;
    await academy.save();

    res.json({ message: 'Academy updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});


router.get("/getDetails", async (req, res) => {
  const { email, sports } = req.query;
  try {
    const academy = await Academy.findOne({ email });
    res.status(200).json({academy, success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});



router.get("/locations", async (req, res) => {
  try {
    // Get distinct cities
    const cities = await Academy.distinct("city");

    // If you also want unique addresses (per city)
    const addresses = await Academy.aggregate([
      {
        $group: {
          _id: { city: "$city", address: "$address" }
        }
      },
      {
        $project: {
          _id: 0,
          city: "$_id.city",
          address: "$_id.address"
        }
      }
    ]);

    res.status(200).json({
      uniqueCities: cities,
      uniqueLocations: addresses,
    });
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET unique sports list for a city
router.get("/sports/:city", async (req, res) => {
  try {
    const { city } = req.params;

    const academies = await Academy.find({ city: city.toLowerCase() }).select("sports.sportName");
    if (!academies.length) {
      return res.status(404).json({ message: "No sports found for this city" });
    }

    // Flatten and get unique sports
    const sportsSet = new Set();
    academies.forEach((academy) => {
      academy.sports.forEach((sport) => {
        sportsSet.add(sport.sportName);
      });
    });

    res.json({ sports: [...sportsSet] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
