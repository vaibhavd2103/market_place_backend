const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = new User({ username, password, role });

  try {
    const user = await newUser.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          user: {
            id: payload.user.id,
            role: payload.user.role,
            username,
          },
          token,
        });
      }
    );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error", error: JSON.stringify(err) });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.json({
          user: {
            id: payload.user.id,
            role: payload.user.role,
            username,
          },
          token,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// exports.me = async (req, res) => {
//   try {
//     if (req.user) res.send(req.user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
