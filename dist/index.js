"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 5000;
// For body Parsing
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['https://onlystickerverse.vercel.app/', "http://localhost:3000"] // Allowed domains 
}));
// Global Catches
app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
        return res.status(500).send("Internal Error Occured");
    }
    next();
});
//Endpoints
app.use("/users", require("./routes/Userauth"));
app.use("/dashboard", require("./routes/Dashboard"));
app.use("/products", require("./routes/Product"));
app.use("/payment", require("./routes/Payment"));
app.use("/order", require("./routes/Order"));
app.get("/", (req, res) => {
    res.send("Welcome to ThePrint Backend");
});
app.listen(PORT, () => {
    console.log(`The Server is Listening on Port ${PORT}`);
});
