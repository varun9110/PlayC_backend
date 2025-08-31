const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP, sendOTP } = require('../utils/otpSender');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register user - send OTP
router.post('/register', async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    if (!email || !password || !phone) return res.status(400).json({ message: 'All fields are required', error: "All fields required" });

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) return res.status(400).json({ message: 'User with given email or phone already exists', error: "User exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Create user but not verified yet
    user = new User({ email, password: hashedPassword, phone, otp, otpExpiry });
    await user.save();

    // Send OTP (just log for now)
    await sendOTP(phone, otp);

    res.json({ message: 'OTP sent to phone number', success: "otp created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and activate user
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user (only verified users)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'Invalid credentials or not verified' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

  res.json({
    token,
    email: user.email,
    phone: user.phone,
    role: user.role
  });
});


module.exports = router;
