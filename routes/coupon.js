const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const {verifyJWT,isAdmin} = require('../middleware/authMiddleware')
const router = express.Router();

router.post("/", verifyJWT, isAdmin, createCoupon);
router.get("/", verifyJWT, isAdmin, getAllCoupons);
router.get("/:id", verifyJWT, isAdmin, getAllCoupons);
router.put("/:id", verifyJWT, isAdmin, updateCoupon);
router.delete("/:id", verifyJWT, isAdmin, deleteCoupon);

module.exports = router;