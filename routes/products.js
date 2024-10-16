const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/roles");
const {
  createProduct,
  getProducts,
  // getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  getNonApprovedProducts,
  getSellerProducts,
} = require("../controllers/productController");

router.post("/createProduct", auth, permit("seller"), createProduct);

router.get("/getProducts", getProducts);

router.get("/getSellerProducts", auth, permit("seller"), getSellerProducts);

router.get(
  "/getNonApprovedProducts",
  auth,
  permit("approver"),
  getNonApprovedProducts
);

router.post("/updateProductById", auth, permit("seller"), updateProduct);

router.delete("/deleteProductById", auth, permit("seller"), deleteProduct);

router.post("/approveProductById", auth, permit("approver"), approveProduct);

module.exports = router;
