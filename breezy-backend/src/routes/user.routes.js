const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

// Met à jour la biographie de l'utilisateur connecté
router.put("/profile", authMiddleware, userController.updateBio);
// Récupère la biographie de l'utilisateur connecté
router.get("/profile", authMiddleware, userController.getBio);

module.exports = router;
