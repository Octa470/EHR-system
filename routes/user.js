const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Add these imports at the top of your user.js file
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Assuming you're using Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Replace your existing route with:
router.post(
  "/change-profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to cloudinary (or your preferred storage)
      const result = await cloudinary.uploader
        .upload_stream(
          {
            folder: "profile_pictures",
          },
          async (error, result) => {
            if (error) {
              return res.status(500).json({ message: "Error uploading file" });
            }

            // Update user with new profile picture URL
            const user = await User.findById(req.user.id);
            if (!user)
              return res.status(404).json({ message: "User not found." });

            user.profilePicture = result.secure_url;
            await user.save();

            res.json({
              message: "Profile picture updated successfully.",
              url: result.secure_url,
            });
          }
        )
        .end(req.file.buffer);
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

router.patch("/change-email", authMiddleware, async (req, res) => {
  const { newEmail, password } = req.body;
  if (!newEmail || !password) {
    return res
      .status(400)
      .json({ message: "New email and password are required." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password." });

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists)
      return res.status(400).json({ message: "Email already in use." });

    user.email = newEmail;
    await user.save();
    res.json({ message: "Email updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/change-name", authMiddleware, async (req, res) => {
  const { newName } = req.body;
  if (!newName)
    return res.status(400).json({ message: "New name is required." });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.name = newName;
    await user.save();
    res.json({ message: "Name updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new passwords are required." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect old password." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
