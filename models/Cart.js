const mongoose = require('mongoose');
const {Schema} = mongoose;

const CartSchema = new Schema({
    user : {type : mongoose.Schema.Types.ObjectId , ref : 'user'},
    name : {type: String , required : true,},
    price : {type: Number , required : true },
    size : {type: String , required : true},
    image : {type: String , required : true},
    quantity : {type : Number , required : true},
    type : {type : String , required : true}
})

const Cart = mongoose.model('cart' , CartSchema);
module.exports = Cart;