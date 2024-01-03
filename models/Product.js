const mongoose = require("mongoose")
const {Schema} = mongoose;



const product = new Schema({
    Name : {type : String , required : true},
    Description : {type: String ,required : true},
    Price : {type : Number , required : true},
    Category : {type : String , required : true},
    Subcategory : {type : String , required : true},
    type : {type : String , required : true},
    imageURL : {type : String , required : true},
})

const Product = mongoose.model('product' , product);

module.exports = Product