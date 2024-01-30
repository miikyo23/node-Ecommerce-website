const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const {verifyJWT,isAdmin} = require('../middleware/authMiddleware')
const uploadController = require('../controllers/uploadController')
const {uploadPhoto,productImageResize} = require('../middleware/uploadImagies')
router.post('/create-product',verifyJWT,isAdmin, productController.createProduct)
router.get('/get-all-products',verifyJWT,isAdmin,productController.getAllProducts)
router.get('/get-product/:id',verifyJWT,isAdmin, productController.getProduct)
router.put('/update-product/:id',verifyJWT,isAdmin, productController.updateProduct)
router.delete('/delate-product/:id',verifyJWT,isAdmin, productController.delateProduct)
router.post('/add-to-wishlist',verifyJWT,productController.addToWishList)
router.put('/rating',verifyJWT,productController.rating)
router.post('/upload/:id', uploadPhoto.array('file'), uploadController.uploadImages);
router.delete('/delete/:id', uploadController.deleteImages);
  
module.exports = router