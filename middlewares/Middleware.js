const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const User = require("../models/User");
const zod = require("zod");

// Zod Schema

const Schema = zod.object({
  Name: zod.string(),
  Email: zod.string().email(),
  Password: zod.string().min(8),
});

const Authentication = async (req, res, next) => {
  try {
    const token = req.headers["auth"];
    if (!token) {
      return res.send("Insufficient Permission");
    }
    const decode = jwt.verify(token, jwtsecret);
    if (!decode) {
      return res.send("Invalid token");
    } else {
      const Email = decode.Email;
      const user = await User.findOne({ Email: Email });
      if (!user) {
        return res.send("Invalid token");
      } else {
        req.user = user;
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Authentication");
  }
};

const ValidateAuthinput = (req, res, next) => {
  try {
    const Email = req.body.Email;
    const Name = req.body.Name;
    const Password = req.body.Password;

    // Validating the Input
    const respose = Schema.safeParse({
      Email: Email,
      Name: Name,
      Password: Password,
    });
    if (!respose.success) {
      return res.status(400).json({
        Success: false,
        Message: "Invalid Input",
      });;
    }
    else
    {
        next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Success: false,
      Message: "Error in Authentication",
    });
  }
};

module.exports = {Authentication , ValidateAuthinput};
