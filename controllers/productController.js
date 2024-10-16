const Product = require("../models/Product");
const cache = require("../utils/cache");

exports.createProduct = async (req, res) => {
  const { title, description, price } = req.body;
  const sellerId = req.user.id;

  if (!title || !price) {
    return res.status(400).json({ message: "Title and price are required" });
  }

  const newProduct = new Product({
    seller: sellerId,
    title,
    description,
    price,
  });

  try {
    const product = await newProduct.save();
    await cache.del("products:approved");
    res.status(201).json({ product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error", error: JSON.stringify(err) });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const cachedProducts = await cache.get("products:approved");
    if (cachedProducts) {
      return res.json({
        products: JSON.parse(cachedProducts),
        source: "cache",
      });
    }

    const products = await Product.find({ approved: true }).populate(
      "seller",
      "username"
    );
    await cache.set("products:approved", JSON.stringify(products), {
      EX: 3600,
    });

    res.json({ products, source: "database" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.query.sellerId }).sort({
      updatedAt: -1,
    });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNonApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ approved: false }).populate(
      "seller",
      "username"
    );
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findOne({
//       _id: req.params.id,
//       approved: true,
//     }).populate("seller", "username");
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json({ product });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateProduct = async (req, res) => {
  const { title, description, price, sellerId, _id } = req.body;

  try {
    let product = await Product.findById(_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.approved = false;

    await product.save();
    await cache.del("products:approved");
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const sellerId = req.body.sellerId;

  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await product.remove();
    await cache.del("products:approved");

    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId).populate(
      "seller",
      "username"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.approved) {
      return res.status(400).json({ message: "Product already approved" });
    }

    product.approved = true;
    await product.save();
    await cache.del("products:approved");

    res.json({ message: "Product approved", product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
