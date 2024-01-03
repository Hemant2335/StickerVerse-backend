const mongoose = require("mongoose");
const {Schema} = mongoose;


const type = new Schema({
    Name : {type : String , required : true},
})

const Type = mongoose.model('type',type);

module.exports = Type;