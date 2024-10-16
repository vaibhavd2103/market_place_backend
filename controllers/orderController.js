const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  const { productId, quantity, sellerId, buyerId } = req.body;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required" });
  }
  if (!buyerId) {
    return res.status(400).json({ message: "BuyerId required!" });
  }

  try {
    const product = await Product.findOne({ _id: productId, approved: true });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not approved" });
    }

    const newOrder = new Order({
      buyer: buyerId,
      product: productId,
      quantity,
      sellerId,
    });

    const order = await newOrder.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrdersForBuyer = async (req, res) => {
  const buyerId = req.query.buyerId;

  try {
    const orders = await Order.find({ buyer: buyerId })
      .populate("product", "title price")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingOrders = async (req, res) => {
  const sellerId = req.query.sellerId;

  try {
    const products = await Product.find({ seller: sellerId }).select("_id");
    const productIds = products.map((p) => p._id);

    const orders = await Order.find({
      product: { $in: productIds },
      status: "pending",
    })
      .populate("buyer", "username")
      .populate("product", "title price")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveOrder = async (req, res) => {
  const sellerId = req.body.sellerId;
  const orderId = req.body.orderId;

  try {
    const order = await Order.findById(orderId).populate("product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.product;
    if (product.seller.toString() !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to approve this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: `Order already ${order.status}` });
    }

    order.status = "approved";
    await order.save();
    res.json({ message: "Order approved", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
