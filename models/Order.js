const mongoose = require('mongoose');
const {Schema} = mongoose;

const OrderSchema = new Schema({
    user : {type : mongoose.Schema.Types.ObjectId , ref : 'user'},
    Name : {type: String , required : true,},
    Price : {type: Number , required : true },
    desc : {type: String , required : true},
    type : {type: String , required : true},
    img_url : {type: String , required : true},
    Quantity : {type : Number , required : true},
    Status : {type : String , required : true}
  });

  const Order = mongoose.model('order',OrderSchema);

  module.exports = Order