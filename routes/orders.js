const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/roles");
const {
  createOrder,
  getOrdersForBuyer,
  approveOrder,
  getPendingOrders,
} = require("../controllers/orderController");

router.post("/createOrder", auth, permit("buyer"), createOrder);

router.get("/getBuyerOrders", auth, permit("buyer"), getOrdersForBuyer);

router.get("/getSellerPendingOrders", auth, permit("seller"), getPendingOrders);

router.post("/approveOrder", auth, permit("seller"), approveOrder);

module.exports = router;
