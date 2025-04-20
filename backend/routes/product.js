const express = require('express');
const { getSingleProducts, getProducts } = require('../controllers/productController');
const router = express.Router();
router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProducts);

module.exports = router;