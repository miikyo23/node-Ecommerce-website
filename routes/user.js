const express = require('express');
const router = express.Router();
const {verifyJWT,isAdmin}= require('../middleware/authMiddleware')
const userController = require('../controllers/userController');

router.get('/all-users',verifyJWT,isAdmin, userController.getallUser)
router.get('/:id', verifyJWT,isAdmin, userController.getaUser)
router.delete('/:id',verifyJWT, userController.deleteaUser)
router.put('/:id', verifyJWT, userController.updatedUser)
router.put('/block-user/:id',verifyJWT,isAdmin,userController.blockUser)
router.put('/unblock-user/:id',verifyJWT,isAdmin,userController.unblockUser)
router.post('/cart/',verifyJWT,userController.userCart)
router.delete('empty-cart',verifyJWT,userController.emptyCart)
router.get('/get-user-cart/', verifyJWT, userController.getUserCart)
router.put('/adress/', verifyJWT, userController.saveAddress)
router.get('/wishlist', verifyJWT, userController.getWishlist)


module.exports = router;