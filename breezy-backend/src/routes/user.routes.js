const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

// GET la biographie et l'avatar
router.get("/profile", authMiddleware, userController.getBio);
// PUT la biographie
router.put("/profile", authMiddleware, userController.updateBio);
// PUT l'avatar
router.put("/profile/avatar", authMiddleware, userController.uploadAvatar);

module.exports = router;
