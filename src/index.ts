import express from "express";
import cors from "cors";
import {Response , Request , NextFunction} from "express";
const app = express();
const PORT = 5000;

// For body Parsing
app.use(express.json());
app.use(cors({
  origin: ['https://onlystickerverse.vercel.app' , "http://localhost:3000"]// Allowed domains 
}));

// Global Catches
app.use((err:Error, req : Request, res : Response, next : NextFunction) => {
  if (err) {
    console.log(err);
    return res.status(500).send("Internal Error Occured");
  }
  next();
});

//Endpoints

app.use("/users" , require("./routes/Userauth"))
app.use("/dashboard" , require("./routes/Dashboard"))
app.use("/products" , require("./routes/Product"))
app.use("/payment" , require("./routes/Payment"))
app.use("/order" , require("./routes/Order"))
app.get("/" , (req : Request, res : Response)=>{
  res.send("Welcome to ThePrint Backend")
})


app.listen(PORT, () => {
  console.log(`The Server is Listening on Port ${PORT}`);
});
