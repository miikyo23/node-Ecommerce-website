const express = require('express')
const router = express.Router()
const blogCatController = require('../controllers/blogCatController')
const {verifyJWT} = require('../middleware/authMiddleware')

router.post('/create-category',verifyJWT,blogCatController.createCategory)
router.put('/update-category/:id',verifyJWT,blogCatController.updateCategory)
router.delete('/delete-category/:id',verifyJWT,blogCatController.deleteCategory)
router.get('/get-category/:id',verifyJWT,blogCatController.getCategory)
router.get('/get-all-category/',verifyJWT,blogCatController.getAllCategory)
module.exports = router