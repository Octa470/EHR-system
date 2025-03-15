const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];

      if (!token) return res.status(401).json({ error: "Access denied." });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: "Unauthorized Access." });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ error: "Server Error.", message: error.message });
    }
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server Error.", message: error.message });
  }
};

module.exports = { verifyRole, authMiddleware };