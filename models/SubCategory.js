const mongoose = require("mongoose");
const {Schema} = mongoose;


const subcategory = new Schema({
    Name : {type : String , required : true},
})

const SubCategory = mongoose.model('subcategory',subcategory);

module.exports = SubCategory;