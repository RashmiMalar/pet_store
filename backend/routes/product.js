const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), createProduct);
router.route('/:id')
  .get(getSingleProduct)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

module.exports = router;
