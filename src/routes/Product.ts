import express from "express";
import { Authentication } from "../middlewares/Middleware";
import { PrismaClient } from "@prisma/client";
require("dotenv").config();
const router = express.Router();
const prisma = new PrismaClient();

router.get("/:searchparam", async (req, res) => {
  try {
    const type = req.params.searchparam;
    console.log(type);
    const data = await prisma.product.findMany({where : {type : type}}) ;
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Product can't be fetched right now");
  }
});

router.post("/item/addtocart", Authentication, async (req, res) => {
  try {
    const { name, price, image, size, quantity, type } = req.body;
    const user = req.body.user.id;
    const item = await prisma.cart.findFirst( {where : {name : name , size : size , userId : user}}) ;
    if (item) {
      const itemq = await prisma.cart.update({where : {id : item.id} , data : {quantity : item.quantity + quantity}}) ;
      return res
        .status(200)
        .send({ Check: true, msg: "Added to Cart Successfully" });
    } else {
      const cart = await prisma.cart.create({data : {
        userId: user,
        type: type,
        name: name,
        price: price,
        image: image,
        size: size,
        quantity: quantity,
      }})
      res.status(200).send({ Check: true, msg: "Added to Cart Successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ Check: false, msg: "Cannot Added to Cart " });
  }
});

router.get("/item/cart", Authentication, async (req, res) => {
  try {
    const cart = await prisma.cart.findMany({where : {userId : req.body.user.id}}) ;
    console.log(cart);
    res.status(200).send(cart);
  } catch (error) {
    console.log(error);
    res.status(500).send("Cart can't be fetched right now");
  }
});

router.get("/item/:itemid", async (req, res) => {
  try {
    const itemid = parseInt(req.params.itemid);
    const item = await prisma.product.findFirst({where : {id : itemid}}) ;
    res
      .status(200)
      .json({ Check: true, Msg: "Successfully Fetched", item: item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Check: false, Msg: "Successfully Fetched here" });
  }
});

router.post("/item/deleteitem", Authentication, async (req, res) => {
  try {
    const { id } = req.body;
    const user = req.body.user.id;
    const result = await prisma.cart.delete({where : {userId : user ,  id : id}}) ;
    
    if (result) {
      // Item removed successfullynpm
      res.status(200).send({ Check: true, msg: "Item removed Successfully" });
    } else {
      // Item not found or already removed
      res
        .status(200)
        .send({ Check: false, msg: "Item not found or already removed" });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ Check: false, msg: "Item removed UnSuccessfully" });
  }
});

router.get("/all/Category", async (req, res) => {
  try {
    const cat = await prisma.category.findMany(); 
    res
      .status(200)
      .json({ Check: true, msg: "Category fetched Succesfully", data: cat });
  } catch (error) {
    res.status(200).send({ Check: false, msg: "Internal Server Error" });
  }
});

interface query{
  Category : string,
  Subcategory : string,
  type : string,
}

router.get("/all/filter", async (req, res) => {
  try {
    const catname = req.query.category as string;
    const Subcatname = req.query.subcategory as string;
    const type = req.query.type as string;
    const query : query = {
      Category: "",
      Subcategory: "",
      type: ""
    };
    if (catname) {
      query.Category = catname;
    }
    if (Subcatname) {
      query.Subcategory = Subcatname;
    }
    if (type) {
      query.type = type;
    }
    console.log(query);
    const cat = await prisma.product.findMany({where : query}) ;
    res
      .status(200)
      .json({ Check: true, msg: "Category fetched Succesfully", data: cat });
  } catch (error) {
    res.status(200).send({ Check: false, msg: "Internal Server Error" });
  }
});

router.get("/all/SubCategory/:searchparam", async (req, res) => {
  try {
    const catname = req.params.searchparam;
    const cat = await prisma.product.findFirst({where : {Subcategory : catname}}) ;
    res
      .status(200)
      .json({ Check: true, msg: "SubCategory fetched Succesfully", data: cat });
  } catch (error) {
    res.status(200).send({ Check: false, msg: "Internal Server Error" });
  }
});

module.exports = router;
