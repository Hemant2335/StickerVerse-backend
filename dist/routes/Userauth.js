"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv").config();
const process_1 = require("process");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Middleware_1 = require("../middlewares/Middleware");
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client();
const prisma = new client_1.PrismaClient();
const jwtsecret = process_1.env.JWT_SECRET || "";
const router = (0, express_1.Router)();
// Signup Endpoint , No authentication required
router.post("/signup", Middleware_1.ValidateAuthinput, async (req, res) => {
    try {
        const Email = req.body.Email;
        const Name = req.body.Name;
        const Password = req.body.Password;
        // Check for Existing user
        const isUser = await prisma.user.findUnique({ where: { Email: Email } });
        if (isUser) {
            return res.status(200).json({
                Success: false,
                Message: "User Already exists",
            });
        }
        // Creating a Salt
        const salt = await bcryptjs_1.default.genSalt(10);
        const NewPass = await bcryptjs_1.default.hash(Password, salt);
        const Newuser = await prisma.user.create({
            data: {
                Name: Name,
                Email: Email,
                Password: NewPass,
                Salt: salt,
                isAdmin: false,
                Address: null,
                Phone: null,
            }
        });
        res.status(200).json({
            Success: true,
            Message: "User Created Successfully",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Success: false,
            Message: "Internal Server Error",
        });
    }
});
// Login Endpoint Requires Authentication
router.post("/login", async (req, res) => {
    try {
        const Email = req.body.Email;
        const Password = req.body.Password;
        // Checking if the User Exits
        const user = await prisma.user.findUnique({ where: { Email: Email } });
        if (!user) {
            return res.status(400).json({
                Success: false,
                Message: "User not Found",
            });
        }
        const salt = user.Salt;
        const HashedPassword = await bcryptjs_1.default.hash(Password, salt);
        if (HashedPassword === user.Password) {
            const token = jsonwebtoken_1.default.sign({ Email: Email, isAdmin: user.isAdmin }, jwtsecret);
            return res.status(200).json({
                Success: true,
                Message: token,
                isAdmin: user.isAdmin,
                Name: user.Name,
            });
        }
        else {
            return res.status(200).json({
                Success: false,
                Message: "Invalid Username or Password",
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Success: false,
            Message: "Internal Server Error",
        });
    }
});
// Fetch User data
router.get("/getuser", Middleware_1.Authentication, async (req, res) => {
    try {
        const user = req.body.user;
        res.status(200).json({
            Check: true,
            User: {
                Name: user.Name,
                Email: user.Email,
                Address: user.Address,
                Phone: user.Phone,
                isAdmin: user.isAdmin,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ Check: false, msg: "Cannot Fetch User" });
    }
});
// Email Verification links
// Nodemailer configuration
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "stickerverse7@gmail.com",
        pass: process.env.GMAIL_PASSWORD,
    },
});
const Otpgenrator = () => {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    return otp;
};
// Admin order Notification
router.post("/adminnotify", Middleware_1.Authentication, async (req, res) => {
    const { name, email } = req.body;
    const mailOptions = {
        from: "stickerverse7@gmail.com",
        to: "stickerverse7@gmail.com",
        subject: "New Order Notification",
        text: "You have a new order from " + name + " with email " + email,
    };
    // Sending the Email
    try {
        await transporter.sendMail(mailOptions);
        res
            .status(200)
            .send({ Check: true, Msg: "Notification sent successfully" });
    }
    catch (error) {
        console.log(error);
        res.send(500).json({ Check: false, Msg: "Error Sending the Notification" });
    }
});
// User order status Notification
router.post("/notifyuser", Middleware_1.Authentication, async (req, res) => {
    const isAdmin = req.body.user.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Check: false, Msg: "Not Authorized" });
    }
    else {
        const { name, status, email } = req.body;
        const mailOptions = {
            from: "stickerverse7@gmail.com",
            to: email,
            subject: "Order Status Update",
            text: "Your Order with name " + name + " has been " + status,
        };
        // Sending the Email
        try {
            await transporter.sendMail(mailOptions);
            res
                .status(200)
                .send({ Check: true, Msg: "Notification sent successfully" });
        }
        catch (error) {
            console.log(error);
            res
                .send(500)
                .json({ Check: false, Msg: "Error Sending the Notification" });
        }
    }
});
router.post("/verifyemail", async (req, res) => {
    // Generate a Otp
    const otp = Otpgenrator();
    const userEmail = req.body.Email;
    // Mail options
    const mailOptions = {
        from: "stickerverse7@gmail.com",
        to: userEmail,
        subject: "Email Verification OTP",
        text: `Your OTP for email verification is: ${otp}`,
    };
    // Sending the Email
    try {
        await transporter.sendMail(mailOptions);
        res
            .status(200)
            .send({ Check: true, Msg: "OTP sent successfully", Code: otp });
    }
    catch (error) {
        console.log(error);
        res.send(500).json({ Check: false, Msg: "Error Sending the Otp" });
    }
});
// Updating the Address of user
router.post("/updateaddress", Middleware_1.Authentication, async (req, res) => {
    try {
        const { address1, address2, pincode, state, city } = req.body;
        const Address = `${address1} , ${address2} , ${city} , ${state} , ${pincode}`;
        const user = req.body.user;
        const updateduser = await prisma.user.update({ where: { id: user.id }, data: { Address: Address } });
        res.status(200).json({ Check: true, Msg: "Address Updated Successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Check: false, Msg: "Error Updating the Address" });
    }
});
// Updating the Phone Number of user
router.post("/updatephone", Middleware_1.Authentication, async (req, res) => {
    try {
        const phone = req.body.phone;
        const user = req.body.user;
        const updateduser = await prisma.user.update({ where: { id: user.id }, data: { Phone: phone } });
        res
            .status(200)
            .json({ Check: true, Msg: "Phone Number Updated Successfully" });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ Check: false, Msg: "Error Updating the Phone Number" });
    }
});
// Google Auth Endpoint
router.post("/googlelogin", async (req, res) => {
    const { tokenId } = req.body;
    console.log(tokenId);
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: "551918395782-v17s3h8ts05grojf189484cbm816ivnr.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        const { email_verified, name, email } = payload;
        console.log(email_verified, name, email);
        if (email_verified) {
            const user = await prisma.user.findUnique({ where: { Email: email } });
            if (user) {
                const token = jsonwebtoken_1.default.sign({ Email: email, isAdmin: user.isAdmin }, jwtsecret);
                return res.status(200).json({
                    Success: true,
                    Message: token,
                    isAdmin: user.isAdmin,
                    Name: user.Name,
                });
            }
            else {
                const Newuser = await prisma.user.create({
                    data: {
                        Name: name,
                        Email: email,
                        Password: "",
                        Salt: "",
                        isAdmin: false,
                        Address: null,
                        Phone: null,
                    }
                });
                const token = jsonwebtoken_1.default.sign({ Email: email, isAdmin: Newuser.isAdmin }, jwtsecret);
                return res.status(200).json({
                    Success: true,
                    Message: token,
                    isAdmin: Newuser.isAdmin,
                    Name: Newuser.Name,
                });
            }
        }
        else {
            return res.status(400).json({
                Success: false,
                Message: "Email not verified",
            });
        }
    }
    catch (error) {
        res.status(500).json({ Success: false, Message: "Internal Server Error" });
        console.log(error);
    }
});
module.exports = router;
