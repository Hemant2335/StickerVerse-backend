const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { Authentication } = require("../middlewares/Middleware");

const router = express.Router();

// Route 1 : To create a order entry in user data

router.post("/addorder", Authentication, async (req, res) => {
  try {
    const { name, price, image, size, quantity , status , address , type} =  req.body;
    const order = new Order({
      name,
      price,
      image,
      size,
      quantity,
      status,
      type,
      address,
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

// Route 3 : To fetch All the Orders (Admin only)

router.get("/fetchallordersadmin", Authentication, async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    if(user.isAdmin){
      const orders = await Order.find();
      const data = orders.map(async (order) => {
        const userdata  = await User.findById(order.user);
        return {
          name : order.name,
          price : order.price,
          image : order.image,
          size : order.size,
          quantity : order.quantity,
          status : order.status,
          type : order.type,
          user : userdata,
          address : order.address,
        }
      });
      const response = await Promise.all(data);
      console.log(response);
      res.status(200).json(response);
    }
    else{
      res.status(401).send("Not Authorized");
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;
