const express = require('express');

const authController = require("../controllers/auth.controller");
const authMiddleware = require('../middlewares/auth.middleware');
const requireFields = require('../middlewares/requiredFields.middleware');

const router = express.Router();

router.post("/register", requireFields(['name', 'username', 'email', 'password']), authController.register);
router.post("/login", requireFields(['username', 'password']), authController.login);
router.post("/password-forget", requireFields(['username']), authController.passwordForget);
router.post("/password-reset", requireFields(['token', 'newPassword']), authController.passwordReset);
router.get("/authenticated", authMiddleware, (req, res) => {
    res.status(200).json({ message: "User authenticated successfully", user: req.user });
});

module.exports = router;