const express = require('express');

const authController = require("../controllers/auth.controller");
const requireFields = require('../middlewares/requiredFields.middleware');

const router = express.Router();

router.post("/register", requireFields(['name', 'username', 'email', 'password']), authController.register);

module.exports = router;