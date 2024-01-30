const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter')
const {verifyJWT,isAdmin,}= require('../middleware/authMiddleware')



router.post('/register', authController.createUser);
router.post('/login', loginLimiter,authController.Login)
router.post('/login', loginLimiter,authController.adminLogin)
router.put('/modify-password',verifyJWT,authController.changePassword)
router.post('/forgot-password',authController.forgotPassword)
router.put('/reset-password/:token',authController.resetPassword)
router.get('/refresh',  authController.RefreshToken)
router.post('/logout',  authController.Logout)

module.exports = router;
