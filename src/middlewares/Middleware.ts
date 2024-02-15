import jwt, { Secret } from "jsonwebtoken";
import { env } from "process";
const jwtsecret : Secret = env.JWT_SECRET || "";
import zod from "zod";
import {Response , Request  , NextFunction} from "express";
import { PrismaClient } from "@prisma/client";
const prisma  = new PrismaClient();

// Zod Schema

const Schema = zod.object({
  Name: zod.string(),
  Email: zod.string().email(),
  Password: zod.string().min(8),
});

const Authentication = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.send("Insufficient Permission");
    }
    const decode = jwt.verify(token, jwtsecret) as jwt.JwtPayload;
    if (!decode) {
      return res.send("Invalid token");
    } else {
      const Email = decode.Email;
      const user = await prisma.user.findUnique({where : {Email : Email}});
      if (!user) {
        return res.send("Invalid token");
      } else {
        req.body.user = user;
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Authentication");
  }
};

const ValidateAuthinput = (req : Request, res : Response, next : NextFunction) => {
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

export { Authentication, ValidateAuthinput };
