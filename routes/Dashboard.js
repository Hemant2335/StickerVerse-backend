const express = require("express");
const {Authentication} = require("../middlewares/Middleware")
const multer = require('multer');
const cloudinary = require('cloudinary');
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")
const Product = require("../models/Product")
// const Products = require("../models/Products");
// const Category = require("../models/Category");
// const Genre = require("../models/Genre");
require("dotenv").config();
const router = express.Router();

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
    const fileBuffer = req.file.buffer;
    let Check = false;

    // Convert the buffer to a readable stream
    const readableStream = cloudinary.v2.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
      if (error) {
        console.error('Upload error:', error);
        res.status(400).send({ Check: Check, error: "Some Error Occurred" });
      } else {
        Check = true;
        const imageUrl = result.secure_url;
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


router.post("/add" , Authentication , async (req , res) =>{
  try {
    const {name ,description , price,  category , subcategory, type, image} = req.body

    const cat = await Category.findOne({Name : category});
    const subcat = await SubCategory.findOne({Name : subcategory});
    if(!cat)
    {
       const newcat =  new Category({Name : category});
       await newcat.save();
    }
    if(!subcat)
    {
      const newsubcat = new SubCategory({Name : subcategory});
      await newsubcat.save();   
      const cate = await Category.findOne({Name : category});
      cate.subcategory.push({objectid : newsubcat.id , Name : newsubcat.Name})
      await cate.save();
    }

    const product = new Product({Name: name , Description : description , Price : price , Category: category , Subcategory : subcategory , type : type , imageURL : image})
    product.save();    
    res.status(200).send("Product Added Successfully")
    
  } catch (error) {
    console.log(error);
    res.send(`Nishant`);
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