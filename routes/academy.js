const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Academy = require('../models/Academy');
const User = require('../models/User');

// POST /admin/onboard-academy
router.post('/onboard-academy', async (req, res) => {
  try {
    const {
      name, email, phone, address, city
    } = req.body;

    // Check if academy email already exists
    const existingUser = await User.findOne({ email });

    const passwordPlain = crypto.randomBytes(6).toString('hex'); // 12-char random password
    if (!existingUser) {
      // Create random password
      const hashedPassword = await bcrypt.hash(passwordPlain, 10);
      // Create Academy User account
      const academyUser = new User({
        email,
        password: hashedPassword,
        phone,
        role: 'academy',
        isVerified: true
      });
      await academyUser.save();
    }



    // Create Academy document
    const newAcademy = new Academy({
      name,
      email,
      phone,
      address,
      city
    });
    await newAcademy.save();

    let mailOptions;
    if (!existingUser) {
      // Send email to academy
      mailOptions = {
        from: 'varun.goel.vg@gmail.com',
        to: email,
        subject: 'Your Academy Account Credentials',
        text: `Hello ${name},

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
        text: `Hello ${name},

              Your academy account has been created.

              You can log in with your exisiting username and password.

              Best regards,
              PlayC`
        };
    }

    console.log(mailOptions)

    res.json({ message: 'Academy onboarded and emailed.', mailOptions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

module.exports = router;
