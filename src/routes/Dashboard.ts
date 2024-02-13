import express from "express";
import { Authentication } from "../middlewares/Middleware";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
require("dotenv").config();
const router = express.Router();
const prisma  = new PrismaClient();

cloudinary.v2.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET,
  secure: true,
});

const storage = multer.memoryStorage(); // Stores file in memory as buffer
const upload = multer({ storage: storage });

router.post("/upload", Authentication , upload.single('image'), async (req, res) => {
  try {
    // Access the uploaded file from req.file
    const fileBuffer = req.body.file.buffer;
    let Check = false;

    // Convert the buffer to a readable stream
    const readableStream = cloudinary.v2.uploader.upload_stream({ folder: 'uploads' }, (error,result) => {
      if (error) {
        console.error('Upload error:', error);
        res.status(400).send({ Check: Check, error: "Some Error Occurred" });
      } else {
        Check = true;
        const imageUrl = result?.secure_url;
        res.status(200).send({ Check: Check, status: 'Upload successful', imageUrl: imageUrl });
      }
    });

    // Write the buffer to the readable stream
    readableStream.write(fileBuffer);
    readableStream.end();

  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).send("Some Error Occurred");
  }
});

interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  type: string;
  image: string;
}


router.post("/add" , Authentication , async (req , res) =>{
  try {
    const {name ,description , price,  category , subcategory, type, image} : Product= req.body
    if(req.body.user.isAdmin === false)
    {
      return res.status(200).send({Check: false , msg:"You are not authorized to add product"})
    }
    const cat = await prisma.category.findFirst({where : {Name : subcategory}});
    const subcat = await prisma.subcategory.findFirst({where : {Name : subcategory}});
    if(!cat)
    {
       const newcat =  await prisma.category.create({data : {Name : category}}) ;
    }
    if(!subcat)
    {
      const newsubcat = await prisma.subcategory.create({data : {Name : subcategory , categoryId : cat?.id || 0}});
    }

    const product = await prisma.product.create({data : {Name: name , Description : description , Price : price , Category: category , Subcategory : subcategory , type : type , imageURL : image}}) ; 
    res.status(200).send({Check: true , msg:"Product Added Successfully"})
    
  } catch (error) {
    console.log(error);
    res.status(200).send({Check: false , msg:"Product Added Unsuccessfully"})
  }
})


// router.post("/uploadsubmit/:uid", fetchuser, async (req, res) => {
//   try {
//     let Check = false;
//     const { name, description, price, category1, genre1, photo } = req.body;
//     const stock = 1000;
//     console.log(category1, genre1)
//     const category = await Category.findOne({ name: category1 });
//     const genre = await Genre.findOne({ name: genre1 });
//     const sold = 0;
//     const { uid } = req.params;
//     const product = new Products({
//       name, description, price, category, genre, stock, sold, photo, user: uid
//     })
//     const savedProduct = await product.save();
//     Check = true;
//     res.status(200).send({Check : Check , status: 'Upload successful', savedProduct: savedProduct });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(400).send("Some Error Occurred");
//   }
// })

module.exports = router;