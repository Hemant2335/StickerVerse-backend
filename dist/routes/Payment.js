"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Razorpay = require("razorpay");
require("dotenv").config();
const Middleware_1 = require("../middlewares/Middleware");
// Create an instance of Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_API_ID,
    key_secret: process.env.RAZOR_PAY_API_SECRET,
});
// Send the Invoice through Email
router.get("/invoice/:id", Middleware_1.Authentication, async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`https://api.razorpay.com/v1/invoices/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Basic ${process.env.RAZOR_PAY_API_Auth}` || ""
            }
        });
        const data = await response.json();
        res.status(200).json({ Success: true, url: data.short_url });
    }
    catch (error) {
        res.send("Cannot able to send Reciept");
    }
});
// Generate Payment route
router.post("/invoice", Middleware_1.Authentication, async (req, res) => {
    const { items, email, name, address, phone } = req.body;
    console.log(items);
    try {
        const options = {
            type: "invoice",
            description: `Invoice for the month of January 2020`,
            customer: {
                name: name,
                contact: phone,
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
            sms_notify: 0,
            email_notify: 0,
            currency: "INR",
        };
        const response = await razorpay.invoices.create(options);
        res.json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Invoice failed" });
    }
});
// Payment route
router.post("/checkout", Middleware_1.Authentication, async (req, res) => {
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Payment failed" });
    }
});
module.exports = router;
