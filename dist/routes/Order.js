"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Middleware_1 = require("../middlewares/Middleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Route 1 : To create a order entry in user data
router.post("/addorder", Middleware_1.Authentication, async (req, res) => {
    try {
        const { name, price, image, size, quantity, status, address, type } = req.body;
        const order = await prisma.order.create({ data: {
                name,
                price,
                image,
                size,
                quantity,
                status,
                type,
                address,
                userId: req.body.user.id,
            } });
        res.json(order);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});
// Route 2 : TO fetch the user specific data
router.get("/fetchallorders", Middleware_1.Authentication, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ where: { userId: req.body.user.id } });
        res.json(orders);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/fetchallordersadmin", Middleware_1.Authentication, async (req, res) => {
    try {
        const user = req.body.user;
        console.log(user);
        if (user.isAdmin) {
            const orders = await prisma.order.findMany();
            const data = orders.map(async (order) => {
                const userdata = await prisma.user.findUnique({ where: { id: order.userId } });
                return {
                    _id: order.id,
                    name: order.name,
                    price: order.price,
                    image: order.image,
                    size: order.size,
                    quantity: order.quantity,
                    status: order.status,
                    type: order.type,
                    user: userdata,
                    address: order.address,
                };
            });
            const response = await Promise.all(data);
            console.log(response);
            res.status(200).json(response);
        }
        else {
            res.status(401).send("Not Authorized");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});
// Route 4 : To update the status of the order
router.put("/updatestatus/:id", Middleware_1.Authentication, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!req.body.user.isAdmin) {
        return res.status(401).send("Not Authorized");
    }
    else {
        try {
            const { status } = req.body;
            const order = await prisma.order.findUnique({ where: { id: id } });
            if (order) {
                const updateorder = await prisma.order.update({ where: { id: id }, data: { status: status } });
                res.status(200).json({ Check: true, Msg: "Successfully Fetched" });
            }
            else {
                res.status(404).send("Order not found");
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    }
});
module.exports = router;
