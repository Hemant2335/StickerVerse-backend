const mongoose = require("mongoose");

const MongoURI = 'mongodb+srv://doone:Doone%40456@cluster0.y2qnwob.mongodb.net/'


const ConnectToDatabase = async()=>{

    try {
        mongoose.connect(MongoURI)
        {
            console.log("Database Connected");
        }
    } catch (error) {
        console.log("Something went Wrong while connecting to Database");
        console.log(error)
    }
    
}


module.exports = ConnectToDatabase;

