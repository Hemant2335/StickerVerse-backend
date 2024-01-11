const mongoose = require("mongoose");
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

const user = new Schema({
    Name : {type : String , required : true},
    Email : {type : String , required : true},
    Password : {type : String , required : true},
    Salt : {type : String , required : true},
    isAdmin : {type : Boolean , required : true},
    cart : [product]
})

const User = mongoose.model('user',user);

module.exports = User;