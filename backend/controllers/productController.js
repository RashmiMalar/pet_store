const Product = require('../models/productModel');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.json(products); // Return products as an array
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Unable to fetch the data' });
  }
};

// controllers/productController.js

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, description, seller, stock } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is missing' });
    }

    const imageBuffer = req.file.buffer;

    if (!name || !category || !price || !description || !seller || !stock) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newProduct = new Product({
      name,
      category,
      price: parseFloat(price),
      description,
      seller,
      stock: parseInt(stock),
      images: [{ image: imageBuffer }]  // ✅ store raw buffer
    });

    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct, message: 'Product added successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, seller, stock } = req.body;

    const updateData = {
      name,
      category,
      price,
      description,
      seller,
      stock,
    };

    // If new image file is uploaded, update the image buffer
    if (req.file) {
      updateData.images = [{ image: req.file.buffer }];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateStocks = async (req, res) => {
  const { items } = req.body; // Expecting [{ productId, quantity }]

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      product.stock -= item.quantity;
      if (product.stock < 0) product.stock = 0;

      await product.save();
    }

    res.status(200).json({ message: 'Stocks updated successfully' });
  } catch (error) {
    console.error('Error updating stocks:', error);
    res.status(500).json({ message: 'Failed to update stocks', error: error.message });
  }
};