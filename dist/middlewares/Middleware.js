"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateAuthinput = exports.Authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = require("process");
const jwtsecret = process_1.env.JWT_SECRET || "";
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Zod Schema
const Schema = zod_1.default.object({
    Name: zod_1.default.string(),
    Email: zod_1.default.string().email(),
    Password: zod_1.default.string().min(8),
});
const Authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.send("Insufficient Permission");
        }
        const decode = jsonwebtoken_1.default.verify(token, jwtsecret);
        if (!decode) {
            return res.send("Invalid token");
        }
        else {
            const Email = decode.Email;
            const user = await prisma.user.findUnique({ where: { Email: Email } });
            if (!user) {
                return res.send("Invalid token");
            }
            else {
                req.body.user = user;
                next();
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in Authentication");
    }
};
exports.Authentication = Authentication;
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
            });
            ;
        }
        else {
            next();
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            Success: false,
            Message: "Error in Authentication",
        });
    }
};
exports.ValidateAuthinput = ValidateAuthinput;
