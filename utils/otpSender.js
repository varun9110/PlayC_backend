function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  async function sendOTP(phone, otp) {
    // Here you would integrate SMS provider like Twilio
    console.log(`Sending OTP ${otp} to phone: ${phone}`);
  }
  
  module.exports = { generateOTP, sendOTP };
  