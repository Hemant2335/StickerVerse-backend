const express = require("express");
const Order = require("../models/Orders");
const User = require("../models/User");
const {Authentication} = require("../middlewares/Middleware")

const router = express.Router();

// Route 1 : To create a order entry in user data

router.post('/addorder',Authentication, async (req, res) => {
    try {

    const { Name, Price , desc , type , img_url , Quantity , Status , } = req.body;
      const order = new Order ({
        Name, Price , desc , type , img_url , Quantity,Status , user : req.user.id 
      })
      const savedorder = await order.save()
      res.json(savedorder) ;
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");  
    }
  })