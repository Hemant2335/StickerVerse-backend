const mongoose = require("mongoose");
const {Schema} = mongoose;

const user = new Schema({
    Name : {type : String , required : true},
    Email : {type : String , required : true},
    Password : {type : String , required : true},
    Salt : {type : String , required : true},
    isAdmin : {type : Boolean , required : true},
    Address : {type : String , required : false},
    Phone : {type : Number , required : false}
})

const User = mongoose.model('user',user);

module.exports = User;