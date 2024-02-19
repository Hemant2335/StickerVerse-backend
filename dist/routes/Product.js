"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Middleware_1 = require("../middlewares/Middleware");
const client_1 = require("@prisma/client");
require("dotenv").config();
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/:searchparam", async (req, res) => {
    try {
        const type = req.params.searchparam;
        console.log(type);
        const data = await prisma.product.findMany({ where: { type: type } });
        console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Product can't be fetched right now");
    }
});
router.post("/item/addtocart", Middleware_1.Authentication, async (req, res) => {
    try {
        const { name, price, image, size, quantity, type } = req.body;
        const user = req.body.user.id;
        const item = await prisma.cart.findFirst({ where: { name: name, size: size, userId: user } });
        if (item) {
            const itemq = await prisma.cart.update({ where: { id: item.id }, data: { quantity: item.quantity + quantity } });
            return res
                .status(200)
                .send({ Check: true, msg: "Added to Cart Successfully" });
        }
        else {
            const cart = await prisma.cart.create({ data: {
                    userId: user,
                    type: type,
                    name: name,
                    price: price,
                    image: image,
                    size: size,
                    quantity: quantity,
                } });
            res.status(200).send({ Check: true, msg: "Added to Cart Successfully" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(200).send({ Check: false, msg: "Cannot Added to Cart " });
    }
});
router.get("/item/cart", Middleware_1.Authentication, async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({ where: { userId: req.body.user.id } });
        console.log(cart);
        res.status(200).send(cart);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Cart can't be fetched right now");
    }
});
router.get("/item/:itemid", async (req, res) => {
    try {
        const itemid = parseInt(req.params.itemid);
        const item = await prisma.product.findFirst({ where: { id: itemid } });
        res
            .status(200)
            .json({ Check: true, Msg: "Successfully Fetched", item: item });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Check: false, Msg: "Successfully Fetched here" });
    }
});
router.post("/item/deleteitem", Middleware_1.Authentication, async (req, res) => {
    try {
        const { id } = req.body;
        const user = req.body.user.id;
        const result = await prisma.cart.delete({ where: { userId: user, id: id } });
        if (result) {
            // Item removed successfullynpm
            res.status(200).send({ Check: true, msg: "Item removed Successfully" });
        }
        else {
            // Item not found or already removed
            res
                .status(200)
                .send({ Check: false, msg: "Item not found or already removed" });
        }
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(200).send({ Check: false, msg: "Internal Server Error" });
    }
});
router.get("/all/filter", async (req, res) => {
    try {
        const catname = req.query.category;
        const Subcatname = req.query.subcategory;
        const type = req.query.type;
        const query = {
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
        const cat = await prisma.product.findMany({ where: query });
        res
            .status(200)
            .json({ Check: true, msg: "Category fetched Succesfully", data: cat });
    }
    catch (error) {
        res.status(200).send({ Check: false, msg: "Internal Server Error" });
    }
});
router.get("/all/SubCategory/:searchparam", async (req, res) => {
    try {
        const catname = req.params.searchparam;
        const cat = await prisma.product.findFirst({ where: { Subcategory: catname } });
        res
            .status(200)
            .json({ Check: true, msg: "SubCategory fetched Succesfully", data: cat });
    }
    catch (error) {
        res.status(200).send({ Check: false, msg: "Internal Server Error" });
    }
});
module.exports = router;
