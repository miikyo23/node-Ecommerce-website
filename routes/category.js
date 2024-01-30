const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const {verifyJWT} = require('../middleware/authMiddleware')

router.post('/create-category',verifyJWT,categoryController.createCategory)
router.put('/update-category/:id',verifyJWT,categoryController.updateCategory)
router.delete('/delete-category/:id',verifyJWT,categoryController.deleteCategory)
router.get('/get-category/:id',verifyJWT,categoryController.getCategory)
router.get('/get-all-category/',verifyJWT,categoryController.getAllCategory)
module.exports = router