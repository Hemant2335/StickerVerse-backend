const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
require("dotenv").config();
const {Authentication} = require("../middlewares/Middleware")

// Create an instance of Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_API_ID,
  key_secret: process.env.RAZOR_PAY_API_SECRET
});

// Payment route
router.post('/checkout',Authentication ,async (req, res) => {
  try {
    const options = {
      amount: 20, // Payment amount in paise or cents
      currency: 'INR', // Currency code
      receipt: 'order_receipt', // Your unique order ID or receipt
      payment_capture: 1 // Auto-capture payments
    };

    const response = await razorpay.orders.create(options);

    res.json({
      id: response.id,
      amount: response.amount,
      currency: response.currency
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Payment failed' });
  }
});

module.exports = router;