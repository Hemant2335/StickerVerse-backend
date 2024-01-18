const express = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ValidateAuthinput } = require("../middlewares/Middleware");
const {Authentication} = require("../middlewares/Middleware")
const nodemailer = require("nodemailer");

const router = express.Router();

// Signup Endpoint , No authentication required
router.post("/signup", ValidateAuthinput, async (req, res) => {
  try {
    const Email = req.body.Email;
    const Name = req.body.Name;
    const Password = req.body.Password;

    // Check for Existing user
    const isUser = await User.findOne({ Email: Email });
    if (isUser) {
      return res.status(400).json({
        Success: false,
        Message: "User Already exists",
      });
    }
    // Creating a Salt
    const salt = await bcrypt.genSalt(10);
    const NewPass = await bcrypt.hash(Password, salt);
    const Newuser = new User({
      Name: Name,
      Email: Email,
      Password: NewPass,
      Salt: salt,
      isAdmin: false,
    });
    Newuser.save();
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
router.post("/login", async (req, res) => {
  try {
    const Email = req.body.Email;
    const Password = req.body.Password;
    // Checking if the User Exits
    const user = await User.findOne({ Email: Email });
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
        isAdmin : user.isAdmin
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

router.get("/getuser" , Authentication , async(req , res)=>{
  try {
    const token = req.headers["auth"];
    const decode = jwt.verify(token, jwtsecret);
    const Email = decode.Email;
    const user = await User.findOne({ Email: Email });
    res.status(200).json({Check : true , User : {Name : user.Name , Email : Email , isAdmin : user.isAdmin}})
  } catch (error) {
    console.log(error);
    res.status(500).send({Check: false , msg:"Cannot Fetch User"})
  }  
  
    
})

// Email Verification links

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stickerverse7@gmail.com',
    pass: 'npzk rgzx mwki jgpy', 
  },
});

const Otpgenrator = ()=>{
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000 ;
  return otp;
}


router.post('/verifyemail' , async(req , res) =>{
  // Generate a Otp
  const otp = Otpgenrator();
  const userEmail = req.body.Email  

  // Mail options
  const mailOptions = {
    from: 'stickerverse7@gmail.com',
    to: userEmail,
    subject: 'Email Verification OTP',
    text: `Your OTP for email verification is: ${otp}`,
  };

  // Sending the Email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({Check : true , Msg : "OTP sent successfully"});
  } catch (error) {
    console.log(error);
    res.send(500).json({Check : false , Msg : "Error Sending the Otp"})
  }
})

module.exports = router;
