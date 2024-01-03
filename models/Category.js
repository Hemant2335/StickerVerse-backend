const mongoose = require("mongoose");
const {Schema} = mongoose;

const subcatSchema = new Schema({
    objectid: { type: Schema.Types.ObjectId, ref: 'subcategory', required: true },
    Name: { type: String, required: true }
});

const category = new Schema({
    Name : {type : String , required : true},
    subcategory : [subcatSchema]
})

const Category = mongoose.model('category',category);

module.exports = Category;