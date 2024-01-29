const mongoose = require('mongoose');
const {Schema} = mongoose;

const OrderSchema = new Schema({
    user : {type : mongoose.Schema.Types.ObjectId , ref : 'user'},
    name : {type: String , required : true,},
    price : {type: Number , required : true },
    size : {type: String , required : true},
    image : {type: String , required : true},
    quantity : {type : Number , required : true},
    status : {type : String , required : true},
    type : {type : String , required : true}  
  });

  const Order = mongoose.model('order',OrderSchema);

  module.exports = Order