const mongoose = require("mongoose");
const {Schema} = mongoose;


const admin = new Schema({
    Name : {type : String , required : true},
    Email : {type : String , required : true},
    Password : {type : String , required : true},
    Salt : {type : String , required : true},
    isAdmin : {type : Boolean , required : true}
})

const Admin = mongoose.model('admin' , admin);

module.exports = Admin;