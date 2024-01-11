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



module.exports = router;