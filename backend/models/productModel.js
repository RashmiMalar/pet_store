const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name:String,
  price:String,
  description:String,
  images:[
    {
      image:String 
    }
  ],
  category:String,
  seller:String,
  stock:Number,
  createdAt: Date
});
const productModel = mongoose.model('Product',productSchema);
module.exports = productModel;
