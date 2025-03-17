const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { upload } = require("../cloudinary");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const uploadMiddleware = (req, res, next) => {
      try {
        const uploadFunction = upload.single("profilePicture");
        uploadFunction(req, res, (err) => {
          if (err) {
            console.error("Upload error:", err.message);
          } else {
            next();
          }
        });
      } catch (error) {
        console.error("Upload middleware error:", error.message);

        next();
      }
    };

    await new Promise((resolve) => {
      uploadMiddleware(req, res, resolve);
    });

    const { name, email, password, role } = req.body;

    console.log("Registration attempt:", { name, email, role });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists." });

    if (!["doctor", "patient"].includes(role))
      return res.status(400).json({ error: "Invalid role specified." });

    const profilePicture = req.file ? req.file.path : null;

    user = new User({ name, email, password, role, profilePicture });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ message: "Server Error", error: error.message })
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("doctor", "name email");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000;
    await user.save();

    res.json({ 
      message: "Password reset initiated", 
      resetLink: `/reset-password?token=${resetToken}&email=${email}` 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });
    
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
