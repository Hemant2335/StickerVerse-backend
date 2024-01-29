const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { Authentication } = require("../middlewares/Middleware");

const router = express.Router();

// Route 1 : To create a order entry in user data

router.post("/addorder", Authentication, async (req, res) => {
  try {
    const { name, price, image, size, quantity , status } =  req.body;
    const order = new Order({
      name,
      price,
      image,
      size,
      quantity,
      status,
      user: req.user.id,
    });
    const savedorder = await order.save();
    res.json(savedorder);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2 : TO fetch the user specific data

router.get("/fetchallorders", Authentication, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
