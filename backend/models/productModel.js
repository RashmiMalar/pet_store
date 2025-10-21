const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  seller: { type: String, required: true },
  stock: { type: Number, required: true },
  images: [
    {
      image: {
        type: Buffer,
        required: true
      }
    }
  ]
  
});

module.exports = mongoose.model('Product', productSchema);