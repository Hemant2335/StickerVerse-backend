const express = require("express");
const {Authentication} = require("../middlewares/Middleware")
const User = require("../models/User")
const jwtsecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const Product = require("../models/Product")
require("dotenv").config();
const router = express.Router();


router.get("/:searchparam",  async (req, res) => {
    try {
      const type = req.params.searchparam;
      console.log(type);
      const data = await Product.find({ type: type });
      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(500).send("Product can't be fetched right now");
    }
  });


router.post("/item/addtocart" , Authentication , async (req  ,res)=>{
  try {
    const {name , price,   image} = req.body
    const token = req.headers["auth"];
    const decode = jwt.verify(token, jwtsecret);
    const Email = decode.Email;
    const user = await User.findOne({ Email: Email });
    user.cart.push({Name: name , Price : price ,  imageURL : image})
    await user.save();
    res.status(200).send({Check: true , msg:"Added to Cart Successfully"})
  } catch (error) {
    console.log(error);
    res.status(200).send({Check: false , msg:"Cannot Added to Cart "})
  }
})

router.get("/item/cart",  async (req, res) => {
  try {
    const token = req.headers["auth"];
    const decode = jwt.verify(token, jwtsecret);
    const Email = decode.Email;
    const user = await User.findOne({ Email: Email });
    const cart = user.cart;
    res.status(200).send(cart);
  } catch (error) {
    console.log(error);
    res.status(500).send("Cart can't be fetched right now");
  }
});

router.post("/item/deleteitem" , Authentication , async (req  ,res)=>{
  try {
    const {id} = req.body
    const token = req.headers["auth"];
    const decode = jwt.verify(token, jwtsecret);
    const Email = decode.Email;
    const user = await User.findOne({ Email: Email });
    const cart = user.cart;
    cart.splice(cart.findIndex(item => item.id === id), 1);
    await user.save();
    res.status(200).send({Check: true , msg:"Item removed Successfully"})
  } catch (error) {
    console.log(error);
    res.status(200).send({Check: false , msg:"Item removed UnSuccessfully"})
  }
})





module.exports = router;