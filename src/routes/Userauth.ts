import bcrypt from "bcrypt";
require("dotenv").config();
import {env} from "process";
import jwt, { Secret } from "jsonwebtoken";
import { Authentication , ValidateAuthinput } from "../middlewares/Middleware";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import {Response , Request , Router} from "express";
const prisma = new PrismaClient();
const jwtsecret : Secret = env.JWT_SECRET || "";
const router = Router();
// Signup Endpoint , No authentication required
router.post("/signup", ValidateAuthinput, async (req: Request, res : Response) => {
  try {
    const Email = req.body.Email
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
    const salt = await bcrypt.genSalt(10);
    const NewPass = await bcrypt.hash(Password, salt);
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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Success: false,
      Message: "Internal Server Error",
    });
  }
});

// Login Endpoint Requires Authentication
router.post("/login", async (req: Request, res : Response) => {
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
    const HashedPassword = await bcrypt.hash(Password, salt);
    if (HashedPassword === user.Password) {
      const token = jwt.sign(
        { Email: Email, isAdmin: user.isAdmin },
        jwtsecret
      );
      return res.status(200).json({
        Success: true,
        Message: token,
        isAdmin: user.isAdmin,
        Name: user.Name,
      });
    } else {
      return res.status(200).json({
        Success: false,
        Message: "Invalid Username or Password",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Success: false,
      Message: "Internal Server Error",
    });
  }
});

// Fetch User data

router.get("/getuser", Authentication, async (req: Request, res : Response) => {
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
  } catch (error) {
    console.log(error);
    res.status(500).send({ Check: false, msg: "Cannot Fetch User" });
  }
});

// Email Verification links

// Nodemailer configuration
const transporter = nodemailer.createTransport({
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
router.post("/adminnotify", Authentication, async (req: Request, res : Response) => {
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
  } catch (error) {
    console.log(error);
    res.send(500).json({ Check: false, Msg: "Error Sending the Notification" });
  }
});

// User order status Notification
router.post("/notifyuser", Authentication, async (req: Request, res : Response) => {
  const isAdmin = req.body.user.isAdmin;
  if (!isAdmin) {
    return res.status(401).json({ Check: false, Msg: "Not Authorized" });
  } else {
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
    } catch (error) {
      console.log(error);
      res
        .send(500)
        .json({ Check: false, Msg: "Error Sending the Notification" });
    }
  }
});

router.post("/verifyemail", async (req: Request, res : Response) => {
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
  } catch (error) {
    console.log(error);
    res.send(500).json({ Check: false, Msg: "Error Sending the Otp" });
  }
});

// Updating the Address of user

router.post("/updateaddress", Authentication, async (req: Request, res : Response) => {
  try {
    const { address1, address2, pincode, state, city } = req.body;
    const Address = `${address1} , ${address2} , ${city} , ${state} , ${pincode}`;
    const user = req.body.user;
    const updateduser = await prisma.user.update({where : {id : user.id} , data : {Address : Address}});
    res.status(200).json({ Check: true, Msg: "Address Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Check: false, Msg: "Error Updating the Address" });
  }
});

// Updating the Phone Number of user

router.post("/updatephone", Authentication, async (req: Request, res : Response) => {
  try {
    const phone  = req.body.phone as string;
    const user = req.body.user;
    const updateduser = await prisma.user.update({where : {id : user.id} , data : {Phone : phone}});
    res
      .status(200)
      .json({ Check: true, Msg: "Phone Number Updated Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ Check: false, Msg: "Error Updating the Phone Number" });
  }
});

module.exports = router;
