const express = require("express");
const ConnectToDatabase = require("./db");
const cors = require("cors")
const app = express();
const PORT = 5000;


// For body Parsing
app.use(express.json());
app.use(cors({
  origin: ['https://theprintfrontend.vercel.app' , "http://localhost:3000"]// Allowed domains 
}));
// Connecting to Database
ConnectToDatabase();

// Global Catches
app.use((err, req, res, next) => {
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
app.get("/" , (req, res)=>{
  res.send("Welcome to ThePrint Backend")
})


app.listen(PORT, () => {
  console.log(`The Server is Listening on Port ${PORT}`);
});
