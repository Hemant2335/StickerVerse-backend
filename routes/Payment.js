const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
require("dotenv").config();
const { Authentication } = require("../middlewares/Middleware");

// Create an instance of Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_API_ID,
  key_secret: process.env.RAZOR_PAY_API_SECRET,
});

// Generate Invoice route

router.post("/invoice",Authentication,async (req, res) => {
  const { items ,email , name, address } = req.body;
  try {
    const options = {
      type: "invoice",
      description: `Invoice for the month of January 2020`,
      customer: {
        name: name,
        contact: 9000090000,
        email: email,
        billing_address: {
          line1: address.split(",")[0],
          line2: address.split(",")[1],
          zipcode: address.split(",")[4],
          city: address.split(",")[2],
          state: address.split(",")[3],
          country: "in",
        },
        shipping_address: {
          line1: address.split(",")[0],
          line2: address.split(",")[1],
          zipcode: address.split(",")[4],
          city: address.split(",")[2],
          state: address.split(",")[3],
          country: "in",
        },
      },
      line_items: items,
      sms_notify: 1,
      email_notify: 1,
      currency: "INR",
    };
    const response = await razorpay.invoices.create(options);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invoice failed" });
  }
});

// Payment route
router.post("/checkout", Authentication, async (req, res) => {
  try {
    const options = {
      amount: 20, // Payment amount in paise or cents
      currency: "INR", // Currency code
      receipt: "order_receipt", // Your unique order ID or receipt
      payment_capture: 1, // Auto-capture payments
    };

    const response = await razorpay.orders.create(options);

    res.json({
      id: response.id,
      amount: response.amount,
      currency: response.currency,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Payment failed" });
  }
});

module.exports = router;
