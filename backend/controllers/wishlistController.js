const Wishlist = require('../models/wishlistModel');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId }).populate('products.productId');
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, products: [] });
      await wishlist.save();
    }
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('getWishlist error:', error.message);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, name, price } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, products: [] });
    }

    const productExists = wishlist.products.some(p => p.productId.toString() === productId);
    if (productExists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push({ productId, name, price });
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('addToWishlist error:', error.message);
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(p => p.productId.toString() !== productId);
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('removeFromWishlist error:', error.message);
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};