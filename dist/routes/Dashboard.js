"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Middleware_1 = require("../middlewares/Middleware");
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("cloudinary"));
require("dotenv").config();
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET,
    secure: true,
});
const storage = multer_1.default.memoryStorage(); // Stores file in memory as buffer
const upload = (0, multer_1.default)({ storage: storage });
router.post("/upload", Middleware_1.Authentication, upload.single('image'), async (req, res) => {
    try {
        // Access the uploaded file from req.file
        if (req.file === undefined) {
            return;
        }
        const fileBuffer = req.file.buffer;
        let Check = false;
        // Convert the buffer to a readable stream
        const readableStream = cloudinary_1.default.v2.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
            if (error) {
                console.error('Upload error:', error);
                res.status(400).send({ Check: Check, error: "Some Error Occurred" });
            }
            else {
                Check = true;
                const imageUrl = result === null || result === void 0 ? void 0 : result.secure_url;
                res.status(200).send({ Check: Check, status: 'Upload successful', imageUrl: imageUrl });
            }
        });
        // Write the buffer to the readable stream
        readableStream.write(fileBuffer);
        readableStream.end();
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(400).send("Some Error Occurred");
    }
});
router.post("/add", Middleware_1.Authentication, async (req, res) => {
    try {
        const { name, description, price, category, subcategory, type, image } = req.body;
        if (req.body.user.isAdmin === false) {
            return res.status(200).send({ Check: false, msg: "You are not authorized to add product" });
        }
        const cat = await prisma.category.findUnique({ where: { Name: category } });
        const subcat = await prisma.subcategory.findUnique({ where: { Name: subcategory } });
        if (!cat) {
            const newcat = await prisma.category.create({ data: { Name: category } });
            if (!subcat) {
                const newsubcat = await prisma.subcategory.create({ data: { Name: subcategory, categoryId: (newcat === null || newcat === void 0 ? void 0 : newcat.id) || 0 } });
            }
        }
        else {
            if (!subcat) {
                const newsubcat = await prisma.subcategory.create({ data: { Name: subcategory, categoryId: cat.id } });
            }
        }
        const product = await prisma.product.create({ data: { Name: name, Description: description, Price: 10, Category: category, Subcategory: subcategory, type: type, imageURL: image } });
        res.status(200).send({ Check: true, msg: "Product Added Successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(200).send({ Check: false, msg: "Product Added Unsuccessfully" });
    }
});
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
