const express = require("express");
const {Authentication} = require("../middlewares/Middleware")
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")
const Product = require("../models/Product")
require("dotenv").config();
const CircularJSON = require("circular-json");
const router = express.Router();


router.get("/:searchparam", Authentication, async (req, res) => {
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






module.exports = router;