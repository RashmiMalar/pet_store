const express = require('express');
   const { authMiddleware } = require('../controllers/orderController');
   const {
     getWishlist,
     addToWishlist,
     removeFromWishlist
   } = require('../controllers/wishlistController');

   const router = express.Router();

   console.log('[Routes] Wishlist routes registered');

   // GET /api/wishlist - Get user's wishlist
   router.get('/', authMiddleware, getWishlist);

   // POST /api/wishlist - Add product to wishlist
   router.post('/', authMiddleware, addToWishlist);

   // DELETE /api/wishlist/:productId - Remove product from wishlist
   router.delete('/:productId', authMiddleware, removeFromWishlist);

   module.exports = router;