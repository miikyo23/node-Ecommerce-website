const express = require('express')
const router = express.Router()
const brandController = require('../controllers/brandController')
const {verifyJWT} = require('../middleware/authMiddleware')

router.post('/create-brand',verifyJWT,brandController.createBrand)
router.put('/update-brand/:id',verifyJWT,brandController.updateBrand)
router.delete('/delete-brand/:id',verifyJWT,brandController.deleteBrand)
router.get('/get-brand/:id',verifyJWT,brandController.getBrand)
router.get('/get-all-brand/',verifyJWT,brandController.getAllBrand)
module.exports = router