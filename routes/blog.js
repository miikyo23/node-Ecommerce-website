const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const {verifyJWT} = require('../middleware/authMiddleware')

router.post('/create-blog',verifyJWT,blogController.createBlog)
router.put('/update-blog/:id',verifyJWT,blogController.updateBlog)
router.get('/get-all-blogs',verifyJWT,blogController.getAllBlog)
router.delete('/delete-blog/:id',verifyJWT,blogController.deleteBlog)
router.get('/get-blog/:id',verifyJWT,blogController.getBlog)
router.post('/like-dislike',verifyJWT,blogController.toggleLikeDislike)
module.exports = router