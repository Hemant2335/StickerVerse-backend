const express = require("express");
const {Authentication} = require("../middlewares/Middleware")
const User = require("../models/User")
const jwtsecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const Product = require("../models/Product")
const Category = require("../models/Category")
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
    const {name , price,   image , size} = req.body
    const token = req.headers["auth"];
    const decode = jwt.verify(token, jwtsecret);
    const Email = decode.Email;
    const user = await User.findOne({ Email: Email });
    user.cart.push({Name: name , Price : price ,  imageURL : image , size : size})
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

router.get("/item/:itemid",  async (req, res) => {
  try {
    const itemid = req.params.itemid ;
    const item = await Product.findOne({ _id: itemid });
    res.status(200).json({Check : true ,Msg : "Successfully Fetched" ,item : item});
  } catch (error) {
    console.log(error);
    res.status(500).json({Check : false , Msg : "Successfully Fetched"});
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

router.get("/all/Category" , async(req ,res)=>{
  try {
    const cat = await Category.find();
    res.status(200).json({Check: true , msg:"Category fetched Succesfully" , data : cat});
  } catch (error) {
    res.status(200).send({Check: false , msg:"Internal Server Error"})
  }
})

router.get("/all/Category/:searchparam" , async(req , res) => {
  try {
    const catname = req.params.searchparam;
    const cat = await Category.find({Name : catname});
    res.status(200).json({Check: true , msg:"Category fetched Succesfully" , data : cat});
  } catch (error) {
    res.status(200).send({Check: false , msg:"Internal Server Error"})
  }
})





module.exports = router;